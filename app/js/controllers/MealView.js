dojo.provide("app.controllers.MealView");

dojo.require("app.controllers.FoodCategoriesView")
dojo.require("app.controllers.InformationViewContainer");
dojo.require("app.models.DietContent");
dojo.require("app.models.Meals");

dojo.require("app.models.FoodCategories")

dojo.declare("app.controllers.MealView",[dojox.mobile.View,app.controllers._ViewMixin],{
	parentId: "",
	mealData: app.models.Meals, //prepare our model,
	dietData: app.models.DietContent, //prepare our model
	foodCategories: app.models.FoodCategories,
	date: "12-21-11", //passed in date
	cycle: "1", //passed in date
	selectedItem: null,
	selectedMeal: null,
	footerClickHandler: null,
	editMode: false,
	store: null,
	startup: function() {
		this.mealData.load(this.date);
		
		dojo.when(this.foodCategories.loadFromJSON(), dojo.hitch(this,function() {
			    this.initUi();	
		 }));			
	},
	initUi: function() {
		this.initHeader();
		var view = new dojox.mobile.ScrollableView({});
		this.addChild(view)
		view.startup();
		
		this.createList(view, false); //build the list
		this.createList(view, true);	//build the edit version (has delete button on items)			
		
		this.initFooter();
		
		//still need this even for custom headers
		view.findAppBars();
		view.resize();
	},	
	initHeader: function() {
		var heading = new dojox.mobile.Heading({
			label: "Meals",
			fixed: "top",
			back: "Back",
			moveTo: 'Super-Hack-fakeId-UseBelow'
		});

		this.addChild(heading);
		dojo.connect(heading, "onClick", this, this.handleBack);	//add the real click handler here - nasty hack			
		
		var edit = new dojox.mobile.ToolBarButton({
			id: this.id + "_Edit_Button",
			label: "Edit",
			style: "float:right;"
		});
		heading.addChild(edit);
		dojo.connect(edit, "onClick", this, this.editList);
		
		var heading2 = new dojox.mobile.Heading({
		//	label: "Cycle " + this.cycle, // Mohit: 1/17/2012 modify the cycle label as par our current process
			label: '<button>' + "Cycle " + this.cycle + '</button>',
			fixed: "top",
		});
		this.addChild(heading2);		
		
		
	//	var poo = new dojox.mobile.ToolBarButton({
	//		label: "poo",
	//		style: "margin-left:50px;"
	//	});
	//	heading2.addChild(poo);
//		dojo.connect(guidelines, "onClick", this, this.showGuidelines);
		
		var guidelines = new dojox.mobile.ToolBarButton({
			label: "Guidelines",
			style: "float:right;"
		});
	/*
		var guidelines = new dojox.mobile.ContentPane({
			content: '<button style="float:right;">hi</button>',
		});
		*/
		
		heading2.addChild(guidelines);
		dojo.connect(guidelines, "onClick", this, this.showGuidelines);
	},
	initFooter: function(){
		var servingRequirements = new dojox.mobile.ContentPane({
			href: './app/views/servingRequirements.html',
		});
		this.addChild(servingRequirements);
		
		dojo.connect(servingRequirements, "onLoad", this, dojo.hitch(this, "updateFoodCategory")); // Mohit: 01/16/2012 call the update on load of serving requirement
		
		var bottomBar = new dojox.mobile.Heading({
			label: "Show Serving Needs",
			fixed: "bottom",
			id: this.id + "mealViewFooter"
		});
		this.addChild(bottomBar);
		bottomBar.startup();
		//use the header's(bottomBar) dom's node's click event
		this.footerClickHandler = dojo.connect(bottomBar.domNode, "onclick", this, dojo.hitch(this, "showServingRequirements"));
	},
	/*
	Create our list: 
		1) view - parent view to insert into
		3) edit - Bool to determine if this is our edit mode list
	*/
	createList: function(view, edit) {
		var editId = "";
		if (edit){
			editId = "Edit";
		}
		
		//use this to contain our list so we can easily hide/show it
		var listView = new dojox.mobile.View({
			id: this.id + "_" + editId + "List"
		})
		view.addChild(listView)
		listView.startup();

		//build a sectioned list for each meal
		['Breakfast','Lunch','Dinner','Snack'].forEach(dojo.hitch(this,function(meal){
			var mealList = new dojox.mobile.RoundRectCategory({
				label: meal
			});
			listView.addChild(mealList);
	
			var list = new dojox.mobile.RoundRectList({
				id: this.id + "_Meal" + editId + "List_" + meal
			});
			listView.addChild(list);			
		
			this.mealData.getMealsByMealTime(meal).forEach(dojo.hitch(this,function(item){
				var listItem = new dojox.mobile.ListItem({
					id: this.id + "_" + meal + "_List" + editId + "Item_" + item.id,   //lame but dojo gives our list items new ids every time this screen is reloaded & so we don't have 0 based indexes in that case...so we id things ourselves
					label: this.formatListItemData(item),
					rightText: item.food.category
				});
			
				//add the delete icon
				if (edit){
					listItem.icon = "mblDomButtonRedCircleMinus";
				}
			
				list.addChild(listItem); //add the item before setting up the event handler
				
				if (edit) {
					dojo.connect(listItem.iconNode, "onclick", listItem, dojo.hitch(this,function(e){
						this.mealData.remove(listItem.id.substr(listItem.id.lastIndexOf("_") + 1));
						this.mealData.save(this.date); // Mohit: 1/20/2012 remove cycle to function argument
						this.updateFoodCategory() // Mohit: 01/16/2012 call the updateupdateFoodCategory when data save into localstorage
					
						//get the non-edit list
						var ogList = dijit.byId(list.id.replace("_MealEditList_", "_MealList_"));
						//remove the item from the list
						ogList.removeChild(dijit.byId(listItem.id.replace("_ListEditItem_", "_ListItem_")));
						//remove the item from the edit list
						list.removeChild(listItem);
						e.stopPropagation();
						}));										
				} else {
					dojo.connect(listItem.domNode, "onclick", this, dojo.hitch(this, "clickHandler"));
				}
			}))

			var addItem = new dojox.mobile.ListItem({
				id: this.id + "_" + meal + "_" + editId + "AddButton",
				label: "Add",
				style: "color:gray;",
				icon: "./app/resources/images/addDark.png"				
			});
			list.addChild(addItem);
			dojo.connect(addItem.domNode, "onclick", this, dojo.hitch(this, "addHandler"));
		}))
		
		if (edit){
			//don't display the edit list
			dojo.style(listView.domNode, "display", "none");
		}
	},
	deleteHandler: function(event){
		console.log(event);
	},
	//This is our edit mode function. Basically just displays the edit or regular list - never both at the same time.
	editList: function(){
		if (this.editMode == true){
			this.editMode = false;
       		dojo.style(dijit.byId(this.id + "_EditList").domNode, "display", "none");
       		dojo.style(dijit.byId(this.id + "_List").domNode, "display", "block");
			dijit.byId(this.id + "_Edit_Button").domNode.innerHTML = "Edit";
		} else {
			this.editMode = true;
	       	dojo.style(dijit.byId(this.id + "_List").domNode, "display", "none");
       		dojo.style(dijit.byId(this.id + "_EditList").domNode, "display", "block");
			dijit.byId(this.id + "_Edit_Button").domNode.innerHTML = "Done";
		}
	},	
	showGuidelines: function(){	
		// load the page data
		//may need a loading screen - test on device!
		dojo.when(this.dietData.load(), dojo.hitch(this,function() {
			var data = this.dietData.getSection("Cycle " + this.cycle); //non-extractable way to build the name...
			var view = new app.controllers.InformationViewContainer({
				backButton: true,
				parentId: this.id
			});
			dojo.body().appendChild(view.domNode);

			view.startup(data);
			this.performTransition(view.id,1,"slide",null);
	    }));
	},
	showServingRequirements: function(){
		this.getWidget('servingRequirements').show();		
		var footer = dijit.byId(this.id + 'mealViewFooter')
		footer.set('label','Hide');

		dojo.disconnect(this.footerClickHandler);
		this.footerClickHandler = dojo.connect(footer.domNode, "onclick", this, dojo.hitch(this, "hideServingRequirements"));				

	},
	hideServingRequirements: function(){
		this.getWidget('servingRequirements').hide();
		var footer = dijit.byId(this.id + 'mealViewFooter')
		footer.set('label','Show Serving Needs');
		
		dojo.disconnect(this.footerClickHandler);
		this.footerClickHandler = dojo.connect(footer.domNode, "onclick", this, dojo.hitch(this, "showServingRequirements"));				
	},
	handleBack: function(){
		var v = dojox.mobile.currentView
		v.performTransition("dashboard",-1,"fade",
			dojo.hitch(this,
				function(){
					this.destroyRecursive();
					dijit.byId(this.parentId).show();
					dijit.byId(this.parentId).updateView(); //Mohit: 1/16/2012 Call the updateView Function when back button is pressed
				}
			)
		);
	},
	clickHandler: function(event){
		var itemId = this.findId(event.target);
		var index = itemId.substring(itemId.lastIndexOf("_") + 1);
		this.selectedFoodItem = index;
		this.selectedMeal = this.findMeal(itemId);
		
		var view = new app.controllers.FoodCategoriesView({
			backButton: true,
			parentId: this.id,
			header: "Foods",
			cycle: "cycle1",
		//	food: this.data[index].label,
			onEdit: dojo.hitch(this,this.editMeal)
		});
		dojo.body().appendChild(view.domNode);
			
		view.startup();
		this.performTransition(view.id,1,"slide",null);
	},
	addHandler: function(event){
		var itemId = this.findId(event.target);
		this.selectedMeal = this.findMeal(itemId);
		
		var view = new app.controllers.FoodCategoriesView({
			backButton: true,
			parentId: this.id,
			header: "Foods",
			cycle: "cycle1",
			onAdd: dojo.hitch(this,this.addMeal)
		});
		dojo.body().appendChild(view.domNode);

		view.startup();
		this.performTransition(view.id,1,"slide",null);
	},	
	editMeal: function(foodItem){
		//update the item
		var editedItem = {
			id: this.selectedFoodItem,
			food: {
				name: foodItem.food,
				category: foodItem.category
			},
			servings: foodItem.servings,
			mealTime: this.selectedMeal
		}
		this.mealData.replace(this.selectedFoodItem, editedItem);
		this.mealData.save(this.date); // Mohit: 1/20/2012 remove cycle to function argument
		this.updateFoodCategory() // Mohit: 01/16/2012 call the updateupdateFoodCategory when data save into localstorage
		
		//update the list
		dijit.byId(this.id + "_" + this.selectedMeal + "_ListItem_" + this.selectedFoodItem).set('label',this.formatListItemData(editedItem));
		dijit.byId(this.id + "_" + this.selectedMeal + "_ListItem_" + this.selectedFoodItem).set('rightText',editedItem.food.category);
		
		//update the edit list
		dijit.byId(this.id + "_" + this.selectedMeal + "_ListEditItem_" + this.selectedFoodItem).set('label',this.formatListItemData(editedItem));
		dijit.byId(this.id + "_" + this.selectedMeal + "_ListEditItem_" + this.selectedFoodItem).set('rightText',editedItem.food.category);	
	},
	addMeal: function(foodItem){
		//create the new meal item
		var newItem = {
			id: this.mealData.getNewId(),
			food: {
				name: foodItem.food,
				category: foodItem.category
			},
			servings: foodItem.servings,
			mealTime: this.selectedMeal
		}
		//add the meal to today's meals in the memory store & then save/update today's meals to localstorage
		this.mealData.add(newItem);
		this.mealData.save(this.date); // Mohit: 1/20/2012 remove cycle to function argument
		this.updateFoodCategory() // Mohit: 01/16/2012 call the updateupdateFoodCategory when data save into localstorage
		
		//add the item to our lists
		this.addItemToList(newItem, false);
		this.addItemToList(newItem, true);		
	},	
	addItemToList: function(item, edit){
		//if this is for the edit list then we add an "Edit" identifier to the list id's
		var editId = "";
		if (edit){
			editId = "Edit";
		}
		
		var list = dijit.byId(this.id + "_Meal" + editId + "List_" + this.selectedMeal);
		
		//remove the add button & destroy it
		list.removeChild(dijit.byId(this.id + "_" + this.selectedMeal + "_" + editId + "AddButton"));
		dijit.byId(this.id + "_" + this.selectedMeal + "_" + editId + "AddButton").destroyRecursive();
		
		//add the item to our main list	
		var listItem = new dojox.mobile.ListItem({
			id: this.id + "_" + this.selectedMeal + "_List" + editId + "Item_" + item.id,
			label: this.formatListItemData(item),
			rightText: item.food.category
		});
		
		//add the delete icon
		if (edit){
			listItem.icon = "mblDomButtonRedCircleMinus";
		}
		
		list.addChild(listItem); //add the item before setting up the event handler
			
		if (edit) {
			dojo.connect(listItem.iconNode, "onclick", listItem, dojo.hitch(this,function(e){
					this.mealData.remove(listItem.id.substr(listItem.id.lastIndexOf("_") + 1));
					this.mealData.save(this.date); // Mohit: 1/20/2012 remove cycle to function argument
					this.updateFoodCategory() // Mohit: 01/16/2012 call the updateupdateFoodCategory when data save into localstorage
					
					//get the non-edit list
					var ogList = dijit.byId(list.id.replace("_MealEditList_", "_MealList_"));
					//remove the item from the list
					ogList.removeChild(dijit.byId(listItem.id.replace("_ListEditItem_", "_ListItem_")));
					//remove the item from the edit list
					list.removeChild(listItem);
					e.stopPropagation();
				}));
		} else {
			dojo.connect(listItem.domNode, "onclick", this, dojo.hitch(this, "clickHandler"));
		}
			
		//re-add the add button
		var addItem = new dojox.mobile.ListItem({
			id: this.id + "_" + this.selectedMeal + "_" + editId + "AddButton",
			label: "Add",
			style: "color:gray;",
			icon: "./app/resources/images/addDark.png"
		});
		list.addChild(addItem);
		dojo.connect(addItem.domNode, "onclick", this, dojo.hitch(this, "addHandler"));		
	},
	//something went wrong when loading in our temlpate file
	errorHandler: function(){
		console.log('error loading data!')
	},
	formatListItemData: function(item){
		return '<div style="border:0px solid black;	line-height: 17px;"><div style="border:0px solid red;padding-top:8px;">' + item.food.name + '</div>   ' + '<div style="font-size:.6em;color:gray;text-align:left;border:0px solid gray;">' + item.servings + (this.multipleServings(item.servings) ? " Servings" : " Serving") + '</div></div>';
	},
	findMeal: function(id){
		if (id.indexOf('Breakfast') !== -1){
			return 'Breakfast';	
		} else if (id.indexOf('Lunch') !== -1){
			return 'Lunch';	
		} else if (id.indexOf('Dinner') !== -1){
			return 'Dinner';	
		} else if (id.indexOf('Snack') !== -1){
			return 'Snack';	
		}
	},
	multipleServings: function(servings){
		//if the serving size is 1 or less then return false
		if ((servings == "1/2") || (servings == "1")){
			return false;
		} else {
			return true;
		}
	},
	
	// Mohit: 01/16/2012 function to Update the category Serving 
	updateFoodCategory: function (){
		var category 	= "";
		var recommended = "";
		var total 		= 0;
		var today 		= "";
		var tTotal 		= 0;
		
		var allCategory  = this.foodCategories.getCategoriesByCycle(this.cycle); // Mohit: 1/20/2012 remove cycle to function argument
		
		allCategory.forEach(dojo.hitch(this,function(item){ 
			var todayTotal = 0;
			category += "<br />"+item.name;
			recommended += "<br />"+item.servings;
			
			if ((item.servings.indexOf("Unlimited") == -1) && (item.servings.indexOf("Moderation") == -1)){
				var servings = item.servings.replace(" Max","");
				total += parseInt(item.servings);

				this.mealData.getAllMeals().forEach(dojo.hitch(this,function(item1){ 
					if(item1.food.category == item.name){
						var serve = item1.servings.split(" ");
						if(item1.servings=='1/2' || serve[1]=='1/2'){
							if(serve[0]!='1/2'){
								todayTotal += parseFloat(serve[0]);  
							}
							todayTotal += 0.5;
						}else{
							todayTotal += parseFloat(item1.servings);
						}

					}
				}));
				today += "<br />"+todayTotal;
				tTotal += parseFloat(todayTotal);				
			} else {
				this.mealData.getAllMeals().forEach(dojo.hitch(this,function(item1){ 
					if(item1.food.category == item.name){
						var serve = item1.servings.split(" ");
						if(item1.servings=='1/2' || serve[1]=='1/2'){
							if(serve[0]!='1/2'){
								todayTotal += parseFloat(serve[0]);  
							}
							todayTotal += 0.5;
						}else{
							todayTotal += parseFloat(item1.servings);
						}

					}
				}));
				today += "<br />"+'N/A';
			}
		}));
		
		category += "<br /><b>Total</b>";
		recommended += "<br /><b>"+total+"</b>";
		today += "<br /><b>"+tTotal+"</b>";
		
		dojo.byId('${food-recommended}').innerHTML = recommended;
		dojo.byId('${food-category}').innerHTML = category;
		dojo.byId('${food-today}').innerHTML = today;
	}
});