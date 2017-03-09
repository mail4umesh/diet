// Provide the UI class
dojo.provide("app.controllers.DashboardView");
 	
dojo.require("app.controllers.MealView");
dojo.require("app.controllers.ExcerciseView");
dojo.require("app.controllers.StatisticsView");
dojo.require("app.controllers.LoggingView");
dojo.require("app.models.DashboardData");
	
// Dependencies here
dojo.require("dojo.DeferredList");
dojo.require("dojo.io.script");
 
// Require localization for time
dojo.require("dojo.i18n");
dojo.requireLocalization("dojo.cldr", "gregorian", "", "");
 
// Declare the class;  inherits from View
dojo.declare("app.controllers.DashboardView",[dojox.mobile.View,app.controllers._ViewMixin],{
	dashboardData: app.models.DashboardData, //our model data
	data: "",
	menuState:"",
	excerciseState:"",
	weightLoss:"",
	waterLog:"",
	date:"",
	cycle:"",         // Mohit: 1/17/2012 create varible to get the current cycle
	// When the widgets have started....
	startup: function() {
		this.inherited(arguments);
		
		//grab our template data for the view - this is our ghetto templating system, should abstract this to the _ViewMixin class
		dojo.xhr.get({
			url: "./app/views/dashboardView.html",
			handleAs: "text",
			load: dojo.hitch(this, "loadData"),
			error: dojo.hitch(this, "errorHandler")
		});
	},
	loadData: function(data){
		//create our content pane by substituting values in our loaded template data
		////creating a unique id manually so we can add related/known unique id's to our templated data - otherwise an issue with duplicate id's 
		////on each dashboard view...although perhaps shouldn't be creating multiples anyways...
		var info = new dojox.mobile.ContentPane({
			id: this.id + "cp",
			content: this.substitute(data, {menuId: this.id+"menu",
											excerciseId: this.id+"excercise",
											statsId: this.id+"stats",
											loggingId: this.id+"logging",
											cycle: this.cycle,     						
											menuBalancedId: this.id+"menuBalanced",                   // Mohit: 1/24/2012  make each id unique 
											excerciseBalancedId: this.id+"excerciseBalanced",
											weightLoggingId: this.id+"weightLogging",
											waterLoggingId: this.id+"waterLogging",
											})
		});
		this.addChild(info);
		
		//hook up all the click handlers
		dojo.connect(dojo.byId(this.id+"menu"), "onclick", this, this.menuClicked);
		dojo.connect(dojo.byId(this.id+"excercise"), "onclick", this, this.excerciseClicked);
		dojo.connect(dojo.byId(this.id+"stats"), "onclick", this, this.statsClicked);
		dojo.connect(dojo.byId(this.id+"logging"), "onclick", this, this.loggingClicked);
		
		this.updateView(); // Mohit: 1/24/2012 Call the updateView to assign the values when dashboard is loaded
	},
	//something went wrong when loading in our temlpate file
	errorHandler: function(){
		console.log('error loading data!')
	},
	menuClicked: function(data) {
		
		
		var view = new app.controllers.MealView({
			parentId: this.id,
			date:this.date,
			cycle:this.cycle // Mohit: 1/17/2012 pass cycle to the meal controller
		});
//		alert(dojo.byId('date').innerHTML);
		dojo.body().appendChild(view.domNode);
		view.startup();
		setTimeout(dojo.hitch(this, "doTran"), 1,[view.id]); //needs to be async since dom isn't yet ready with new view
	},
	excerciseClicked: function() {
		var view = new app.controllers.ExcerciseView({
			parentId: this.id,
			date:this.date,
			cycle:this.cycle  // Mohit: 1/17/2012 pass cycle to the excercise controller
		});
		dojo.body().appendChild(view.domNode);
		view.startup();

		setTimeout(dojo.hitch(this, "doTran"), 1,[view.id]); //needs to be async since dom isn't yet ready with new view
	},
	statsClicked: function() {
		var view = new app.controllers.StatisticsView({
			parentId: this.id,
			date:this.date,
			cycle:this.cycle   // Mohit: 1/17/2012 pass cycle to the stats controller
		});
		dojo.body().appendChild(view.domNode);
		view.startup();

		setTimeout(dojo.hitch(this, "doTran"), 1,[view.id]); //needs to be async since dom isn't yet ready with new view
	},
	loggingClicked: function() {
		var view = new app.controllers.LoggingView({
			parentId: this.id,
			date:this.date,
			cycle:this.cycle    // Mohit: 1/17/2012 pass cycle to the logging controller
		});
		dojo.body().appendChild(view.domNode);
		view.startup();

		setTimeout(dojo.hitch(this, "doTran"), 1,[view.id]); //needs to be async since dom isn't yet ready with new view
	},
	doTran: function(args) {
			//do the transition
			var v = dijit.byId("dashboard");
			v.performTransition(args[0],1,"fade",null);
	},
	
	updateView: function(){ //Mohit: 1/14/2012 Function to update the view when view loaded and back button pressed
	
		var newDashBoardData = this.dashboardData.getDashboardByDate(this.date); //Mohit: 1/24/2012 use dojo.byId to grab the node & update it's innerHTML value rather than the direct substitution we're using now
		dojo.byId(this.id+"menuBalanced").innerHTML 		= newDashBoardData.meals;
		dojo.byId(this.id+"excerciseBalanced").innerHTML 	= newDashBoardData.exercise;
		dojo.byId(this.id+"weightLogging").innerHTML 		= newDashBoardData.weight;
		dojo.byId(this.id+"waterLogging").innerHTML 		= newDashBoardData.h20;
			
	}
	
	
});