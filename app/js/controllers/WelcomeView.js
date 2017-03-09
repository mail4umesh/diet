// Provide the UI class
dojo.provide("app.controllers.WelcomeView");

dojo.require("app.controllers.DietInfoListView");
dojo.require("app.controllers.SettingsView");
dojo.require("dojox.mobile.Button"); 

// Declare the class;  inherits from View
dojo.declare("app.controllers.WelcomeView",[dojox.mobile.View,app.controllers._ViewMixin],{
	data: "",
	parentId: "",
	// When the widgets have started....
	startup: function() {
		this.inherited(arguments);
		
		var view = new dojox.mobile.View({});
		this.addChild(view)
		view.startup();
		
		
		var welcome = new dojox.mobile.ContentPane({
			href: './app/views/welcome.html',
		});
		this.addChild(welcome);
		dojo.connect(welcome, "onLoad", this, dojo.hitch(this, "setupButtonHandlers"));		
	},
	//create our header
	initHeader: function(title) {
		var heading = new dojox.mobile.ContentPane({
			href: './app/views/viewHeader.html',
		});

		this.addChild(heading);
		dojo.connect(heading, "onLoad", this, dojo.hitch(this, "setupHeadingHandlers"));
	},
	setupButtonHandlers: function(){
		dojo.connect(this.getWidget('learn'), "onClick", this, dojo.hitch(this, "clickHandler"));
		dojo.connect(this.getWidget('start'), "onClick", this, dojo.hitch(this, "clickHandler"));
	},
	clickHandler: function(event){
		var view;
		var button = event.srcElement.innerHTML;
		
		switch (button){
			case "Learn More": {
				// ==== 17 Day Diet Info Viewer ====
				view = new app.controllers.DietInfoListView({
					backButton: true,
					parentId: this.id
				});
				dojo.body().appendChild(view.domNode);	
			};
			break;
			case  "Get Started": {
				// ==== 17 Day Diet Info Viewer ====
				view = new app.controllers.SettingsView({
					backButton: true,
					parentId: this.id
				});
				dojo.body().appendChild(view.domNode);
			};
			break;
		}
				
		view.startup();
		this.performTransition(view.id,1,"slide",null);
	},
	//something went wrong when loading in our temlpate file
	errorHandler: function(){
		console.log('error loading data!')
	}
});