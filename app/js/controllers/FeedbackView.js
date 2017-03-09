// Provide the UI class
dojo.provide("app.controllers.FeedbackView");

dojo.require("dojox.mobile.Button");
dojo.require("dojox.mobile.TextArea");
dojo.require("dojox.mobile.RadioButton");
// Declare the class;  inherits from View
dojo.declare("app.controllers.FeedbackView",[dojox.mobile.View,app.controllers._ViewMixin],{
	data: "",
	parentId: "",
	
	// When the widgets have started....
	startup: function() {
		this.initHeader("Make This App Better"); // Mohit: 01/18/2012 Call header function
		var makeThisAppBetter = new dojox.mobile.ContentPane({
			href: './app/views/makeThisAppBetter.html',
		});
		this.addChild(makeThisAppBetter);
		dojo.connect(makeThisAppBetter, "onLoad", this, dojo.hitch(this, "setupButtonHandlers"));		
	},
	// Mohit: 01/18/2012 create header
	initHeader: function(title) {
		var heading = new dojox.mobile.Heading({
			label: 'Feedback',
			fixed: "top",
			back: "Back",
			moveTo: this.parentId,
			id: this.id + "_header"
		});

		this.addChild(heading);
	},
	setupButtonHandlers: function(){
		dojo.connect(this.getWidget('submitFeedback'), "onClick", this, dojo.hitch(this, "submitFeedback"));
	},
	submitFeedback:function(){
		if(this.getWidget('nextFeature').checked){ 
			alert("Next Featur: "+this.getWidget('nextFeature').value+"\n Any Thing Else: "+this.getWidget('anyThingElse').value);
		}
		if(this.getWidget('nextFeature1').checked){ 
			alert("Next Featur: "+this.getWidget('nextFeature1').value+"\n Any Thing Else: "+this.getWidget('anyThingElse').value);
		}
		if(this.getWidget('nextFeature2').checked){ 
			alert("Next Featur: "+this.getWidget('nextFeature2').value+"\n Any Thing Else: "+this.getWidget('anyThingElse').value);
		}
	},
	//something went wrong when loading in our temlpate file
	errorHandler: function(){
		console.log('error loading data!')
	}
});