// Provide the UI class
dojo.provide("app.controllers.ExcerciseListView");
dojo.require("app.models.Excercises")
 
// Declare the class;  inherits from View
dojo.declare("app.controllers.ExcerciseListView",[dojox.mobile.View,app.controllers._ViewMixin],{
	parentId: "",
	excerciseData: app.models.Excercises, //prepare our model
	cycle: "", //passed in cycle
	data: [],
	onAdd: null,
	onEdit: null,
	selectedExcercise: null,
	// When the widgets have started....
	startup: function() {
		dojo.when(this.excerciseData.load(), dojo.hitch(this,function() {
			this.data = this.excerciseData.getExcercises(this.cycle);
		    this.initUi();	
	    }));
	},
	initUi: function() {
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
			id: this.id + "_ExcerciseList"
		});
		view.addChild(list);
								
		//create each of the list items
		var i = 0;
		this.data.forEach (dojo.hitch(this,function(item){
			var listItem = new dojox.mobile.ListItem({
				id: this.id + "_ListItem_" + i,   //lame but dojo gives our list items new ids every time this screen is reloaded & so we don't have 0 based indexes in that case...so we id things ourselves
				label: item.label
			});
			list.addChild(listItem);
			dojo.connect(listItem.domNode, "onclick", this, dojo.hitch(this, "clickHandler"));
							
			i++; //incr our counter
		}))
		
		/*
		var addItem = new dojox.mobile.ListItem({
			label: "Add",
			icon:"mblDomButtonBluePlus"
		});
		list.addChild(addItem);
		dojo.connect(addItem.domNode, "onclick", this, dojo.hitch(this, "addHandler"));
		*/
		
		var servingPicker = new dojox.mobile.ContentPane({
			href: './app/views/durationPicker.html',
		});
		this.addChild(servingPicker);
		dojo.connect(servingPicker, "onLoad", this, dojo.hitch(this, "setupPickerHandlers"));
		
		//still need this even for custom headers
		view.findAppBars();
		view.resize();
	},
	//create our header
	initHeader: function(title) {
		var heading = new dojox.mobile.Heading({
			label: 'Exercises',
			fixed: "top",
			back: "Back",
			moveTo: this.parentId,
			id: this.id + "_header"
		});

		this.addChild(heading);		
	},
	setupPickerHandlers: function(){
		//connect the spinner's done & cancel buttons
		dojo.connect(this.getWidget('durationSpinnerDoneButton'), "onClick", this, dojo.hitch(this, "onDone"));		
		dojo.connect(this.getWidget('durationSpinnerCancelButton'), "onClick", this, dojo.hitch(this, 
			function(){
				this.getWidget('durationPicker').hide();	
			}));
	},	
	clickHandler: function(event){
		var itemId = this.findId(event.target);
		var index = itemId.substring(itemId.indexOf("ListItem_")+9);
		
		this.selectedExcercise = this.data[index].label;
		this.getWidget('durationPicker').show();
	},		
	onDone: function(){
		this.getWidget('durationPicker').hide();		
		
		var value = this.getWidget('durationSlot').getValue();
		var minutes = value.substring(0,value.indexOf(' Minutes'))
		this.onAdd ? this.addExcercise(minutes) : this.editExcercise(minutes);
	},
	addHandler: function(event){
		console.log('add')
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
	addExcercise: function(duration){
		this.performTransition(this.parentId,-1,"slide",
			dojo.hitch(this,
				function(){
					this.destroyRecursive(); //careful - make sure not destroying something we shouldn't
					this.onAdd({excercise:this.selectedExcercise,duration:duration})
					dijit.byId(this.parentId).show(); //show this view (the dashboard view we left off with) - otherwise we don't have proper focus for left/right transitions
				}
			)
		);
	},
	editExcercise: function(duration){
		this.performTransition(this.parentId,-1,"slide",
			dojo.hitch(this,
				function(){
					this.destroyRecursive(); //careful - make sure not destroying something we shouldn't
					this.onEdit({excercise:this.selectedExcercise,duration:duration})
					dijit.byId(this.parentId).show(); //show this view (the dashboard view we left off with) - otherwise we don't have proper focus for left/right transitions
				}
			)
		);
	}
});