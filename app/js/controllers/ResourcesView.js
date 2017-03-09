// Provide the UI class
dojo.provide("app.controllers.ResourcesView");

dojo.require("app.controllers.DietInfoListView");
dojo.require("app.controllers.SettingsView");
dojo.require("app.controllers.FeedbackView");
 
// Declare the class;  inherits from View
dojo.declare("app.controllers.ResourcesView",[dojox.mobile.View,app.controllers._ViewMixin],{
	data: "",
	parentId: "",
	// When the widgets have started....
	startup: function() {
		this.inherited(arguments);
		
		this.initHeader();
		
		var view = new dojox.mobile.View({});
		this.addChild(view)
		view.startup();

		var list = new dojox.mobile.EdgeToEdgeList({});
		view.addChild(list);
		
		var listItems = [{id:"17DayDiet",label:"The 17 Day Diet"},{id:"settings",label:"Settings"},
						 {id:"makeAppBetter",label:"Make This App Better!"},{id:"support",label:"Support"}]
								
		//create each of the list items
		listItems.forEach (dojo.hitch(this,function(item){ 
			var listItem = new dojox.mobile.ListItem({
				id: this.id + item.id,
				label: item.label,
			});
			view.addChild(listItem);
			dojo.connect(listItem.domNode, "onclick", this, dojo.hitch(this, "clickHandler"));
		}))
	},
	//create our header
	initHeader: function() {
		var heading = new dojox.mobile.Heading({
			label: 'Resources',
			fixed: "top",
			id: this.id + "_header",
			back: "Back",
			moveTo: 'Super-Hack-fakeId-UseBelow'
		});

		this.addChild(heading);
		dojo.connect(heading, "onClick", this, this.handleBack);	//add the real click handler here - nasty hack
		/*
		var back = new dojox.mobile.ToolBarButton({
			label: "Back"
		});
		heading.addChild(back);
		dojo.connect(back, "onClick", this, this.handleBack);
				
		//or could try removing class name from a toolbarbutton & then adding arrow button class to it
		heading.domNode.className = 
		   document.getElementById("MyElement").className.replace
		      ( /(?:^|\s)MyClass(?!\S)/ , '' )
		
		document.getElementById("MyElement").className += " MyClass";
		*/
	},
	clickHandler: function(event){
		var view;
		var itemId = this.findId(event.target);
		
		switch (itemId){
			case this.id+"17DayDiet": {
				// ==== 17 Day Diet Info Viewer ====
				view = new app.controllers.DietInfoListView({
					backButton: true,
					parentId: this.id
				});
				dojo.body().appendChild(view.domNode);	
			};
			break;
			case  this.id+"settings": { // Mohit:1/18/2012 if user click on resource setting the action for it
				view = new app.controllers.SettingsView({
					backButton: true,
					parentId: this.id
				});
				dojo.body().appendChild(view.domNode);
			};
			break;
			case  this.id+"makeAppBetter": { // Mohit:1/18/2012 if user click on resource feedback the action for it
				view = new app.controllers.FeedbackView({
					backButton: true,
					parentId: this.id
				});
				dojo.body().appendChild(view.domNode);
			};
			break;
			case  this.id+"support": {
			};
			break;
		}
				
		view.startup();
		this.performTransition(view.id,1,"slide",null);
	},
	handleBack: function(){
		var v = dojox.mobile.currentView
		v.performTransition("dashboard",-1,"slide",
			dojo.hitch(this,
				function(){
					setTimeout(dojo.hitch(this,this.destroyRecursive),1000);
					dijit.byId(this.parentId).show();
				}
			)
		);		
	},
	//something went wrong when loading in our temlpate file
	errorHandler: function(){
		console.log('error loading data!')
	}
});