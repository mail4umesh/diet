// Provide the UI class
dojo.provide("app.controllers.FoodListView");

dojo.require("app.controllers._ViewMixin");
dojo.require("app.models.Foods");
dojo.require("dojox.mobile.Overlay");
dojo.require("dojox.mobile.SpinWheel");
dojo.require("dojox.mobile.SpinWheelSlot");
 
// Declare the class;  inherits from View
dojo.declare("app.controllers.FoodListView",[dojox.mobile.View,app.controllers._ViewMixin],{
	parentId: "",
	foodData: app.models.Foods, //prepare our model
	cycle: "",
	category: "",
	data: [],
	onAdd: null,
	onEdit: null,
	selectedFood: null,
	startup: function() {
		dojo.when(this.foodData.load(), dojo.hitch(this,function() {
			this.data = this.foodData.getFoods(this.cycle,this.category);
		    this.initUi();	
	    }));
	},
	initUi: function() {
		this.inherited(arguments);
		
		this.initHeader();
		
		var view = new dojox.mobile.ScrollableView({});
		this.addChild(view)
		view.startup();

		var cycle = new dojox.mobile.RoundRectCategory({
			label: this.cycle
		});
		view.addChild(cycle);
			
		var list = new dojox.mobile.RoundRectList({
			id: this.id + "_FoodList"
		});
		view.addChild(list);

		var i = 0;
		this.data.forEach (dojo.hitch(this,function(item){
				var listItem = new dojox.mobile.ListItem({
					id: this.id + "_ListItem_" + i,   //lame but dojo gives our list items new ids every time this screen is reloaded & so we don't have 0 based indexes in that case...so we id things ourselves
					label: item.food
				});
				list.addChild(listItem);
				dojo.connect(listItem.domNode, "onclick", this, dojo.hitch(this, "clickHandler"));
				i++;
		}))
			
		var servingPicker = new dojox.mobile.ContentPane({
			href: './app/views/servingSpinner.html',
		});
		this.addChild(servingPicker);
		dojo.connect(servingPicker, "onLoad", this, dojo.hitch(this, "setupPickerHandlers"));
		
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
	setupPickerHandlers: function(){
		//connect the spinner's done & cancel buttons
		dojo.connect(this.getWidget('SpinnerDoneButton'), "onClick", this, dojo.hitch(this, "onDone"));		
		dojo.connect(this.getWidget('SpinnerCancelButton'), "onClick", this, dojo.hitch(this, 
			function(){
				this.getWidget('servingPicker').hide();	
			}));
	},
	clickHandler: function(event){
		var itemId = this.findId(event.target);
		var index = itemId.substring(itemId.indexOf("ListItem_")+9);
		this.selectedFood = this.data[index].food;
		
		this.getWidget('servingPickerHeader').set('label',this.data[index].servings);
		this.getWidget('servingPicker').show();
	},	
	onDone: function(){
		this.getWidget('servingPicker').hide();		
		
		var value = this.getWidget('servingSlot').getValue();
		var servings = value.substring(0,value.indexOf(' serving'))
		var foodItem = {"food":this.selectedFood,"servings":servings};
		this.onAdd ? this.onAdd(this,foodItem) : this.onEdit(this,foodItem);
	},	
	handleBack: function(){
		this.performTransition(this.parentId,-1,"slide",
			dojo.hitch(this,
				function(){
					this.destroyRecursive();
					dijit.byId(this.parentId).show();
				}
			)
		);		
	},
	errorHandler: function(){
		console.log('error loading data!')
	}
});