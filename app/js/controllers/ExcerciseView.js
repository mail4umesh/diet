// Provide the UI class
dojo.provide("app.controllers.ExcerciseView");
dojo.require("app.models.Workouts")
dojo.require("app.controllers.ExcerciseListView")
 
// Declare the class;  inherits from View
dojo.declare("app.controllers.ExcerciseView",[dojox.mobile.View,app.controllers._ViewMixin],{
	parentId: "",
	workoutData: app.models.Workouts, //prepare our model
	date: "12-21-2011", //passed in date
	cycle: 1,
	editMode: "false",
	// When the widgets have started....
	startup: function() {
		//this.date = this.workoutData.getStoreDate(); // mohit: 1/9/2012 get date from the localstorage
		this.workoutData.load(this.date);
		this.initUi();	
	},
	initUi: function() {
		this.initHeader();
		
		var view = new dojox.mobile.ScrollableView({});
		this.addChild(view)
		view.startup();

		var cycle = new dojox.mobile.RoundRectCategory({
			label: "Cycle "+this.cycle  // Mohit: 1/17/2012 modify the cycle label as par our current process
		});
		view.addChild(cycle);

		//First create the regular list of excercise items
		var list = new dojox.mobile.RoundRectList({
			id: this.id + "_WorkoutList"
		});
		view.addChild(list);
								
		//create each of the list items
		this.workoutData.getAllWorkouts().forEach (dojo.hitch(this,function(item){
			var listItem = new dojox.mobile.ListItem({
				id: this.id + "_ListItem_" + item.id,   //lame but dojo gives our list items new ids every time this screen is reloaded & so we don't have 0 based indexes in that case...so we id things ourselves
				label: item.exercise,
				rightText: item.duration + " Minutes",
			});
			list.addChild(listItem);
			dojo.connect(listItem.domNode, "onclick", this, dojo.hitch(this, "clickHandler"));
		}))
		
		var addItem = new dojox.mobile.ListItem({
			id: this.id + "_AddButton",
			label: "Add",
			style: "color:gray;",
			icon: "./app/resources/images/addDark.png"
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
		this.workoutData.getAllWorkouts().forEach (dojo.hitch(this,function(item){
			var listItem = new dojox.mobile.ListItem({
				id: this.id + "_ListEditItem_" + item.id,   //we give these items the _ListEditItem_ extension to identify edit items
				icon:"mblDomButtonRedCircleMinus",
				label: item.exercise,
				rightText: item.duration + " Minutes",
			});
			editList.addChild(listItem);
			
			dojo.connect(listItem.iconNode, "onclick", listItem, dojo.hitch(this,function(e){
					this.workoutData.remove(listItem.id.substr(listItem.id.lastIndexOf("_") + 1));
					this.workoutData.save(this.date); // Mohit: 1/20/2012 remove cycle to function argument

					//get the non-edit list
					var ogList = dijit.byId(editList.id.replace("_ListEditItem_", "_ListItem_"));
					//remove the item from the list
					ogList.removeChild(dijit.byId(listItem.id.replace("_ListEditItem_", "_ListItem_")));
					//remove the item from the edit list
					editList.removeChild(listItem);
					e.stopPropagation();
				}));
		}))
		//don't display this edit list
		dojo.style(editList.domNode, "display", "none");
		
		//still need this even for custom headers
		view.findAppBars();
		view.resize();
	},
	//create our header
	initHeader: function(title) {
		var heading = new dojox.mobile.Heading({
			label: 'Exercise',
			fixed: "top",
			id: this.id + "_header",
			back: "Back",
			moveTo: 'Super-Hack-fakeId-UseBelow'
		});

		this.addChild(heading);
		dojo.connect(heading, "onClick", this, this.handleBack);	//add the real click handler here - nasty hack

		var editButton = new dojox.mobile.ToolBarButton({
			style: "float:right;",
			label: "Edit",
			id: this.id + "_Edit_Button"
		});
		dojo.connect(editButton, "onClick", this, this.editList);
		heading.addChild(editButton);
	},
	clickHandler: function(event){
		var itemId = this.findId(event.target);
		var index = itemId.substring(itemId.indexOf("ListItem_")+9);
		this.selectedExcercise = index;

		var view = new app.controllers.ExcerciseListView({
			backButton: true,
			parentId: this.id,
			header: "Excercises",
			cycle: "Cycle "+this.cycle, // Mohit: 1/17/2012 modify the cycle as par our current process
			excercise:this.workoutData.getWorkout(index).exercise,
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
			cycle: "Cycle "+this.cycle, // Mohit: 1/17/2012 modify the cycle as par our current process
			onAdd: dojo.hitch(this,this.addWorkout)
		});
		dojo.body().appendChild(view.domNode);
			
		view.startup();
		this.performTransition(view.id,1,"slide",null);
	},	
	handleBack: function(){
		this.performTransition("dashboard",-1,"fade", //transition back to the main dashboard view
			dojo.hitch(this,
				function(){
					this.destroyRecursive(); //careful - make sure not destroying something we shouldn't
					dijit.byId(this.parentId).show(); //show this view (the dashboard view we left off with) - otherwise we don't have proper focus for left/right transitions
					dijit.byId(this.parentId).updateView(); //Mohit: 1/16/2012 Call the updateView Function when back button is pressed
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
		//create the new meal item
		var newItem = {
			id: this.workoutData.getNewId(),
			exercise: workout.excercise,
			duration: workout.duration
		}
		//add the meal to today's meals in the memory store & then save/update today's meals to localstorage
		this.workoutData.add(newItem);
		this.workoutData.save(this.date);  // Mohit: 1/20/2012 remove cycle to function argument
				
		var list = dijit.byId(this.id + "_WorkoutList");
		var editList = dijit.byId(this.id + "_WorkoutEditList");
		
		//remove the add button & destroy it
		list.removeChild(dijit.byId(this.id + "_AddButton"));
		dijit.byId(this.id + "_AddButton").destroyRecursive();
			
		//add the item to our main list	
		var listItem = new dojox.mobile.ListItem({
			id: this.id + "_ListItem_" + newItem.id,
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
			id: this.id + "_ListEditItem_" + newItem.id,
			icon:"mblDomButtonRedCircleMinus",
			label: workout.excercise,
			rightText: workout.duration + " Minutes"
		});
		editList.addChild(editListItem);

		dojo.connect(editListItem.iconNode, "onclick", editListItem, dojo.hitch(this,function(e){
				this.workoutData.remove(editListItem.id.substr(editListItem.id.lastIndexOf("_") + 1));
				this.workoutData.save(this.date);  // Mohit: 1/20/2012 remove cycle to function argument
			
				//get the non-edit list
				var ogList = dijit.byId(editList.id.replace("_ListEditItem_", "_ListItem_"));
				//remove the item from the list
				ogList.removeChild(dijit.byId(editListItem.id.replace("_ListEditItem_", "_ListItem_")));
				//remove the item from the edit list
				editList.removeChild(editListItem);
				e.stopPropagation();
			}));
	},
	editWorkout: function(workout){
		//update the item
		var editedItem = {
			id: this.selectedExcercise,
			exercise: workout.excercise,
			duration: workout.duration
		}
		this.workoutData.replace(this.selectedExcercise, editedItem);
		this.workoutData.save(this.date); // Mohit: 1/20/2012 remove cycle to function argument
		
		var list = dijit.byId(this.id + "_WorkoutList");
		var editList = dijit.byId(this.id + "_WorkoutEditList");

		//update our lists
		dijit.byId(this.id + "_ListItem_" + this.selectedExcercise).set('label',workout.excercise);
		dijit.byId(this.id + "_ListItem_" + this.selectedExcercise).set('rightText',workout.duration + " Minutes");
		
		dijit.byId(this.id + "_ListEditItem_" + this.selectedExcercise).set('label',workout.excercise);
		dijit.byId(this.id + "_ListEditItem_" + this.selectedExcercise).set('rightText',workout.duration + " Minutes");
		
		this.selectedExcercise = null;
	},
	errorHandler: function(){
		console.log('error loading data!')
	}
});