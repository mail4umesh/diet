dojo.provide("app.controllers.GuidelinesView");

dojo.require("app.models.Guidelines");

// Declare the class;  inherits from View
dojo.declare("app.controllers.GuidelinesView",[dojox.mobile.View,app.controllers._ViewMixin],{
	parentId: "",
	guidelinesData: app.models.Guidelines, //prepare our model
	data: [],
	cycle: null,
	// When the widgets have started....
	startup: function() {
		dojo.when(this.guidelinesData.load(), dojo.hitch(this,function() {
			this.data = this.workoutData.getCycleGuidelines(this.date);
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

		//First create the regular list of excercise items
		var list = new dojox.mobile.RoundRectList({
			id: this.id + "_WorkoutList"
		});
		view.addChild(list);
								
		//create each of the list items
		var i = 0;
		this.data.forEach (dojo.hitch(this,function(item){
			var listItem = new dojox.mobile.ListItem({
				id: this.id + "_ListItem_" + i,   //lame but dojo gives our list items new ids every time this screen is reloaded & so we don't have 0 based indexes in that case...so we id things ourselves
				label: item.label,
				rightText: item.duration + " Minutes",
			});
			list.addChild(listItem);
			dojo.connect(listItem.domNode, "onclick", this, dojo.hitch(this, "clickHandler"));
							
			i++; //incr our counter
		}))
		
		var addItem = new dojox.mobile.ListItem({
			id: this.id + "_AddButton",
			label: "Add",
			style: "color:gray;",
			icon: "./app/app/resources/images/addDark.png"
		});
		list.addChild(addItem);
		dojo.connect(addItem.domNode, "onclick", this, dojo.hitch(this, "addHandler"));
			
		//Next we create a copy of our list but with delete icons for when we put the list in edit mode
		//Todo: Another lame workaround, but was faster than figuring out how to add/remove the delete icon...which would be a
		//much cleaner solution
		var editList = new dojox.mobile.RoundRectList({
			id: this.id + "_WorkoutEditList" //we give this list an id of _WorkoutEditList_ to identify it as an edit list
		});
		view.addChild(editList);
		
		//create each of the list items - make sure this list is an exact copy of the one above, except for the id's
		i = 0;
		this.data.forEach (dojo.hitch(this,function(item){
			var listItem = new dojox.mobile.ListItem({
				id: this.id + "_ListEditItem_" + i,   //we give these items the _ListEditItem_ extension to identify edit items
				icon:"mblDomButtonRedCircleMinus",
				label: item.label,
				rightText: item.duration + " Minutes",
			});
			editList.addChild(listItem);
			
			//no item click handler here, only a click handler for the delete icon
			dojo.connect(listItem.iconNode, "onclick", listItem, function(e){
									//remove the item from the edit list & the regular list
									list.removeChild(dijit.byId(this.id.replace("_ListEditItem_", "_ListItem_")));
									editList.removeChild(this);
									e.stopPropagation();
								});
							
			i++; //incr our counter
		}))
		//don't display this edit list
		dojo.style(editList.domNode, "display", "none");
		
		//still need this even for custom headers
		view.findAppBars();
		view.resize();
	},
	//create our header
	initHeader: function(title) {
		var heading = new dojox.mobile.ContentPane({
			href: './app/views/viewHeader.html',
		});

		this.addChild(heading);
		dojo.connect(heading, "onLoad", this, dojo.hitch(this, "setupHeadingHandlers"));
		
		
		var editButton = new dojox.mobile.ToolBarButton({
			style: "float:right;margin-top:-40px",
			btnClass: "mblDomButton",
			label: "Edit",
			id: this.id + "_Edit_Button"
		});
		dojo.connect(editButton, "onClick", this, this.editList);
		this.addChild(editButton);
	},
	setupHeadingHandlers: function(){
		//this is a really sloppy way to give unique ids.... should use templating for this in future
		dojo.byId('back').id = 'back_' + this.id;
		dojo.connect(dojo.byId('back_'+this.id), "onclick", this, this.handleBack);
		dojo.byId('title').id = 'title_' + this.id;
		dojo.byId('title_'+this.id).innerHTML = "Excercise";
	},
	clickHandler: function(event){
		var itemId = this.findId(event.target);
		var index = itemId.substring(itemId.indexOf("ListItem_")+9);
		this.selectedExcercise = index;
		
		var view = new app.controllers.ExcerciseListView({
			backButton: true,
			parentId: this.id,
			header: "Excercises",
			cycle: this.cycle,
			excercise: this.data[index].label,
			onEdit: dojo.hitch(this,this.editWorkout)
		});
		dojo.body().appendChild(view.domNode);
			
		view.startup();
		this.performTransition(view.id,1,"slide",null);
	},	
	addHandler: function(event){
		var view = new app.controllers.ExcerciseListView({
			backButton: true,
			parentId: this.id,
			header: "Excercises",
			cycle: this.cycle,
			onAdd: dojo.hitch(this,this.addWorkout)
		});
		dojo.body().appendChild(view.domNode);
			
		view.startup();
		this.performTransition(view.id,1,"slide",null);
	},	
	handleBack: function(){
		this.performTransition("dashboard",-1,"flip", //transition back to the main dashboard view
			dojo.hitch(this,
				function(){
					this.destroyRecursive(); //careful - make sure not destroying something we shouldn't
					dijit.byId(this.parentId).show(); //show this view (the dashboard view we left off with) - otherwise we don't have proper focus for left/right transitions
				}
			)
		);		
	},
	//This is our edit mode function. Basically just displays the edit or regular list - never both at the same time.
	editList: function(){
		if (this.editMode == true){
			this.editMode = false;
       		dojo.style(dijit.byId(this.id + "_WorkoutEditList").domNode, "display", "none");
       		dojo.style(dijit.byId(this.id + "_WorkoutList").domNode, "display", "block");
			dijit.byId(this.id + "_Edit_Button").domNode.innerHTML = "Edit";
		} else {
			this.editMode = true;
	       	dojo.style(dijit.byId(this.id + "_WorkoutList").domNode, "display", "none");
       		dojo.style(dijit.byId(this.id + "_WorkoutEditList").domNode, "display", "block");
			dijit.byId(this.id + "_Edit_Button").domNode.innerHTML = "Done";
		}
	},
	addWorkout: function(workout){
			var list = dijit.byId(this.id + "_WorkoutList");
			var editList = dijit.byId(this.id + "_WorkoutEditList");
			
			//remove the add button & destroy it
			list.removeChild(dijit.byId(this.id + "_AddButton"));
			dijit.byId(this.id + "_AddButton").destroyRecursive();
				
			//add the item to our main list	
			var listItem = new dojox.mobile.ListItem({
				id: this.id + "_ListItem_" + this.data.length,
				label: workout.excercise,
				rightText: workout.duration + " Minutes",
			});
			list.addChild(listItem);
			dojo.connect(listItem.domNode, "onclick", this, dojo.hitch(this, "clickHandler"));
			
			//re-add the add button
			var addItem = new dojox.mobile.ListItem({
				id: this.id + "_AddButton",
				label: "Add",
				style: "color:gray;",
				icon: "./app/resources/images/addDark.png"
			});
			list.addChild(addItem);
			dojo.connect(addItem.domNode, "onclick", this, dojo.hitch(this, "addHandler"));

			//add the item to our edit list
			var editListItem = new dojox.mobile.ListItem({
				id: this.id + "_ListEditItem_" + this.data.length,
				icon:"mblDomButtonRedCircleMinus",
				label: workout.excercise,
				rightText: workout.duration + " Minutes"
			});
			editList.addChild(editListItem);
			
			dojo.connect(editListItem.iconNode, "onclick", editListItem, function(e){
									//remove the item from the edit list & the regular list
									list.removeChild(dijit.byId(this.id.replace("_ListEditItem_", "_ListItem_")));
									editList.removeChild(this);
									e.stopPropagation();
								});
								
			
			//add the new workout to our dataset
			this.data.push({label:workout.excercise,
							duration:workout.duration});
	},
	editWorkout: function(workout){
		var list = dijit.byId(this.id + "_WorkoutList");
		var editList = dijit.byId(this.id + "_WorkoutEditList");

		//update our lists
		dijit.byId(this.id + "_ListItem_" + this.selectedExcercise).set('label',workout.excercise);
		dijit.byId(this.id + "_ListItem_" + this.selectedExcercise).set('rightText',workout.duration + " Minutes");
		
		dijit.byId(this.id + "_ListEditItem_" + this.selectedExcercise).set('label',workout.excercise);
		dijit.byId(this.id + "_ListEditItem_" + this.selectedExcercise).set('rightText',workout.duration + " Minutes");
				
		//update our dataset
		this.data[this.selectedExcercise] = {label:workout.excercise,
						duration:workout.duration};
		this.selectedExcercise = null;
	},
	errorHandler: function(){
		console.log('error loading data!')
	}
});