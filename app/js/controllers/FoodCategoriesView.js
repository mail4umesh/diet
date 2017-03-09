// Provide the UI class
dojo.provide("app.controllers.FoodCategoriesView");

dojo.require("app.controllers._ViewMixin");
dojo.require("app.models.Foods")
dojo.require("app.controllers.FoodListView")

dojo.declare("app.controllers.FoodCategoriesView",[dojox.mobile.View,app.controllers._ViewMixin],{
	parentId: "",
	foodData: app.models.Foods, //prepare our model
	cycle: "", //passed in cycle
	data: [],
	onAdd: null,
	onEdit: null,
	selectedFood: null,
	startup: function() {
		dojo.when(this.foodData.load(), dojo.hitch(this,function() {
			this.data = this.foodData.getCategories(this.cycle);
		    this.initUi();	
	    }));
	},
	initUi: function() {
	//	this.inherited(arguments);
		
		this.initHeader();
		
		var view = new dojox.mobile.ScrollableView({});
		this.addChild(view)
		view.startup();

		var cycle = new dojox.mobile.RoundRectCategory({
			label: this.cycle
		});
		view.addChild(cycle);
			
		var list = new dojox.mobile.RoundRectList({
			id: this.id + "_FoodCategoryList"
		});
		view.addChild(list);
			
		var i = 0;
		for (var key in this.data[0]) {
				var listItem = new dojox.mobile.ListItem({
					id: this.id + "_ListItem_" + i,   //lame but dojo gives our list items new ids every time this screen is reloaded & so we don't have 0 based indexes in that case...so we id things ourselves
					label: key
				});
				list.addChild(listItem);
				dojo.connect(listItem.domNode, "onclick", this, dojo.hitch(this, "clickHandler"));
				i++;
		}
		
		//still need this even for custom headers
		view.findAppBars();
		view.resize();
	},
	initHeader: function(title) {
		var heading = new dojox.mobile.Heading({
			label: 'Foods',
			fixed: "top",
			back: "Back",
			moveTo: this.parentId,
			id: this.id + "_header"
		});

		this.addChild(heading);
	},
	clickHandler: function(event){
		var itemId = this.findId(event.target);
		var index = itemId.substring(itemId.indexOf("ListItem_")+9);
		 this.selectedCategory = this.findCategory(index);
		var view = new app.controllers.FoodListView({
			backButton: true,
			parentId: this.id,
		//	header: this.selectedExcercise,
			cycle: this.cycle,
			category: this.selectedCategory,
			onEdit: this.onEdit ? dojo.hitch(this,this.editFoodChoice) : null,
			onAdd: this.onAdd ? dojo.hitch(this,this.addFoodChoice) : null
		});
		dojo.body().appendChild(view.domNode);
			
		view.startup();
		this.performTransition(view.id,1,"slide",null);
	},	
	findCategory: function(index){
		var i = 0;
		var category = "";
		for (var key in this.data[0]) {
			if (i==index){
				category = key;
				break;
			}
			i++;
		}	
		return category;
	},
	handleBack: function(){
		this.performTransition(this.parentId,-1,"slide",
			dojo.hitch(this,
				function(){
					this.destroyRecursive(); //careful - make sure not destroying something we shouldn't
					dijit.byId(this.parentId).show(); //show this view (the dashboard view we left off with) - otherwise we don't have proper focus for left/right transitions
				}
			)
		);		
	},
	errorHandler: function(){
		console.log('error loading data!')
	},
	addFoodChoice: function(foodListView, foodItem){
		foodListView.performTransition(this.parentId,-1,"slide",
			dojo.hitch(this,
				function(){
					foodListView.destroyRecursive(); //make sure you do this as well - we add the detail view to the main body dom node so the next destroyRecursive call doesn't handle it
					this.destroyRecursive();
					//add selected category
					foodItem.category = this.selectedCategory;
					this.onAdd(foodItem)
					dijit.byId(this.parentId).show();
				}
			)
		);
	},
	editFoodChoice: function(foodListView, foodItem){
		foodListView.performTransition(this.parentId,-1,"slide",
			dojo.hitch(this,
				function(){
					foodListView.destroyRecursive(); //make sure you do this as well - we add the detail view to the main body dom node so the next destroyRecursive call doesn't handle it
					this.destroyRecursive();
					foodItem.category = this.selectedCategory;
					this.onEdit(foodItem)
					dijit.byId(this.parentId).show();
				}
			)
		);
	}
});