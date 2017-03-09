// Provide the UI class
dojo.provide("app.controllers.InformationView");
 
// Declare the class;  inherits from ScrollableView
dojo.declare("app.controllers.InformationView",[dojox.mobile.ScrollableView,app.controllers._ViewMixin],{
	data: "",
	day: "",
	
	// Icon for loading...
//	iconLoading: dojo.moduleUrl("information", "resources/images/loading.gif"),
 	
	// When the widgets have started....
	startup: function() {
		// Retain functionality of startup in dojox.mobile.ScrollableView
		this.inherited(arguments);
		
		var info = new dojox.mobile.RoundRect({
			innerHTML: this.data
		});
		this.addChild(info);
	}
});