dojo.provide("app.controllers.DashboardViewContainer");

dojo.require("app.controllers.DashboardView");
dojo.require("app.controllers.ResourcesView");
dojo.require("app.models.DashboardData");
//dojo.require("app.models.Guidelines");
dojo.require("app.controllers.DietInfoListView");

// Declare the class;  inherits from View & ViewMixin
dojo.declare("app.controllers.DashboardViewContainer",[dojox.mobile.View,app.controllers._ViewMixin],{	
	dashViews: [], //data for our dashboard views (one for each day of the cycle)
	days: [], //dashboard view data
	dashboardData: app.models.DashboardData, //our model data
	guidelinesData: app.models.Guidelines, 
	currentDay: "", //day of cycle that matches today's date
	cycle:1,
	startup: function() {
		this.dashViews = [];  // Mohit:1/17/2012 set the dashViews array empty when new cycle is created 
		//get our data
		this.dashboardData.load(this.cycle); //mohit: 1/9/2012 featch data  from localstorage
		this.initUi();
    },
	initUi: function() {
		this.findCurrentDay();
		
		//create the header
		// ==== App Header has to be at the top position ====
		this.initHeader();

		//create the dash views
		this.dashboardData.getDashboardData().forEach (dojo.hitch(this,function(item,i){
			var view = new app.controllers.DashboardView({
				heading: this.formatDate(item.date),
				date: item.date,
				cycle: item.cycle,
				day: i+1,
				
				// Mohit: 1/24/2012 remove the content. as we have set unique ID
				
				/*menuState:item.meals.input + " / " + item.meals.required, 
				excerciseState:item.exercise.input + " / " + item.exercise.required,
				weightLoss:this.formatWeight(item.weight),
				waterLog:this.formatH20(item.h20)*/
				
			});
			this.addChild(view);
			view.startup();
			this.dashViews.push({id:view.id, heading:view.heading, cycle:view.cycle, day:view.day, date:view.date});							   
		}))
				
		//create the footer
		// ==== App Footer has to be at the last position ====
		this.initFooter();
		// ==== Initialize each view when the dom is ready ====
		this.dashViews.forEach (function(item){
			var view = dijit.byId(item.id);
			view.resize();
		})
		
	},
	//create our header
	initHeader: function() {
		var heading = new dojox.mobile.ContentPane({
			href: './app/views/dashboardHeader.html',
			id: 'dashboardHeader'  //give it an id so we can refer to it in css
		});

		this.addChild(heading);
		dojo.connect(heading, "onLoad", this, dojo.hitch(this, "setupHeadingHandlers")); //can't connect event handlers until dom is ready(templated loaded)
	},
	setupHeadingHandlers: function(){
		dojo.connect(dojo.byId('next'), "onclick", this, this.moveRight);
		dojo.connect(dojo.byId('previous'), "onclick", this, this.moveLeft);
		
		dojo.byId('cycleNum').innerHTML = this.dashViews[this.currentDay].cycle;
		dojo.byId('dayNum').innerHTML = this.dashViews[this.currentDay].day;		
		dojo.byId('date').innerHTML = this.dashViews[this.currentDay].heading;		
		
		this.showCurrentDay();
	},
	//create our footer
	initFooter: function(){
		var footer = new dojox.mobile.ContentPane({
			content: '<h3>Resources</h3>', //no template this time
			id: "dashViewFooter"											
		});

		this.addChild(footer);
		
		//connect event handlers now (dom is ready since we don't async load data)
		dojo.connect(dojo.byId('dashViewFooter'), "onclick", this, this.resources);
	},	
	resources: function(){
			var view = new app.controllers.ResourcesView({
				parentId: dojox.mobile.currentView.id,
			});
			dojo.body().appendChild(view.domNode);
			view.startup();

			setTimeout(dojo.hitch(this, "doTran"), 1,[view.id]); //needs to be async since dom isn't yet ready with new
	},
	doTran: function(args) {
			//do the transition
			var v = dijit.byId("dashboard");
			v.performTransition(args[0],1,"slide",null);
	},
	moveLeft: function() {
		//check that it's not the first item & then move to the previous view
		var v = dojox.mobile.currentView;
		var viewCount = this.dashViews.length;
		if (v.id != this.dashViews[0].id){
			for (var i=0;i<viewCount;i++){
				if (v.id == this.dashViews[i].id){
					v.performTransition(this.dashViews[(i-1)].id,-1,"slide",null);
					dojo.byId('cycleNum').innerHTML = this.dashViews[(i-1)].cycle;
					dojo.byId('dayNum').innerHTML = this.dashViews[(i-1)].day;					
					dojo.byId('date').innerHTML = this.dashViews[(i-1)].heading;
				}
			}
		}	
	},
	moveRight: function() {
		//check that it's not the last item & then move to the next view
		var v = dojox.mobile.currentView;
		var viewCount = this.dashViews.length;
		
		if (v.id != this.dashViews[viewCount-1].id){
			for (var i=0;i<viewCount;i++){
				if (v.id == this.dashViews[i].id){
					v.performTransition(this.dashViews[(i + 1)].id,1,"slide",null);
					dojo.byId('cycleNum').innerHTML = this.dashViews[(i+1)].cycle;					
					dojo.byId('dayNum').innerHTML = this.dashViews[(i+1)].day;										
					dojo.byId('date').innerHTML = this.dashViews[(i+1)].heading;
				}
			}
		}else{ // Mohit:1/17/2012 if user click on last day next button than this section is executed it is use to load the new cycle dashboard
			//if(this.cycle<=4){
				/*dojo.when(this.guidelinesData.load(), dojo.hitch(this,function() {
					var data = this.guidelinesData.getCycleGuidelines(this.cycle+1);
					var view = new app.controllers.CycleOverview({
						backButton: true,
						doneButton: true,
						doneCallback: dojo.hitch(this,function(){			// show dashboard
							this.showDashboard(view,this.cycle+1);
						}),
						parentId: this.id
					});
					dojo.body().appendChild(view.domNode);
		
					view.startup(data);
					this.performTransition(view.id,1,"slide",null);	
				}));*/
				view = new app.controllers.DietInfoListView({  //Mohit: 1/20/2012  display the diet overview
					parentId: this.id
				});
				dojo.body().appendChild(view.domNode);
				view.startup();
				this.performTransition(view.id,1,"slide",null);
			//}
		}
		
		
	},
	//transition to todays date
	showCurrentDay: function(){
		//if we're on the first day then leave it alone
		if (this.currentDay == 0)
			return;
		
		var v = dojox.mobile.currentView;
		v.performTransition(this.dashViews[(this.currentDay)].id,1,"none",null);
	},
	formatDate: function(day){
		var dateArray = ["January","February","March","April","May","June","July","August","September",
		"October","November","December"]
		var dayComps = day.split('-');
		return (dateArray[dayComps[0]] + " " + dayComps[1] + "<br>" + dayComps[2]);
	},
	
	//Find the date today and find which day of our cycle matches
	findCurrentDay: function(){
	//	var date = new Date();
	//	var currentDate = date.getMonth() + "-" + date.getDate() + "-" + date.getFullYear()
		var currentDate = this.dashboardData.getCurrentDate();
		this.dashboardData.getDashboardData().forEach (dojo.hitch(this,function(item,i){
			if (item.date == currentDate){
				this.currentDay = i;
			}
		} ))
		if(this.currentDay==''){
			this.currentDay = 0;
		}
	}
});