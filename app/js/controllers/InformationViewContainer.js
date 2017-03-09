dojo.provide("app.controllers.InformationViewContainer");

dojo.require("app.controllers.InformationView");

dojo.require("app.models.Setting") // Mohit :1/22/2012 include setting model

dojo.require("dojox.mobile.SwapView") 
dojo.require("dojox.mobile.PageIndicator") 

dojo.declare("app.controllers.InformationViewContainer",[dojox.mobile.View,app.controllers._ViewMixin],{	 
	infoViews: [], //holds info about each of the pages - used if for displaying page specific info
	backButton: false, //should this view have a back button (only if coming from a previous screen)
	doneButton: false, //should this view have a done button
	parentId: "", //parent view id
	settingData: app.models.Setting, 
	data: null,
    startup: function(data) {
			this.infoViews = [];
		    this.initUi(data);	
    },
	initUi: function(data) {	
		//create the header & give it the first item's heading
		// ==== App Header has to be at the top position ====
		this.initHeader(data[0].title);

		//create the info views
		for (var i=0;i<data.length;i++){
			//first add the swap view
			var swapView = new dojox.mobile.SwapView({});
			this.addChild(swapView);
						
			//now add the scrollable view
			var scrollView = new app.controllers.InformationView({
				heading: data[i].title,
				data: data[i].content
			});

			swapView.addChild(scrollView);
			
			//must be started in this order
			scrollView.startup();
			swapView.startup();

			this.infoViews.push({id:swapView.id, heading:scrollView.heading});	
		}
		
		
		//create the footer
		this.initPageIndicator();
		
		this.infoViews.forEach (function(item){
			var view = dijit.byId(item.id);
			view.findAppBars();
			view.resize();
		})
	},
	initHeader: function(title) {
			var heading;
			
			//Magic fix - something around removing custom header caused the page indicator to start working properly!(ie no more vertical page jumping)
			if (this.backButton){
				var heading = new dojox.mobile.Heading({
					label: title,
					fixed: "top",
					back: "Back",
					moveTo: this.parentId,
					id: this.id + "infoViewHeader"
				});
			} else {
				var heading = new dojox.mobile.Heading({
					label: title,
					fixed: "top",
					id: this.id + "infoViewHeader"
				});				
			}

			this.addChild(heading);			
	},		
	initPageIndicator: function(){
		//for some reason with programmatic swap view this is being pushed below the view
		//todo - test in isolation
		var pageIndicator = new dojox.mobile.PageIndicator({
			fixed:"bottom",
			style:"margin-top:0px;background-color:gray;" //ghetto fix for the fixed bottom issue
		});
		this.addChild(pageIndicator);
		pageIndicator.startup();
	},
	initFooter: function(){
		var bottomBar = new dojox.mobile.Heading({
			label: "Page 1",
			fixed: "bottom",
			id: "infoViewFooter"
		});
		this.addChild(bottomBar);
		
		var leftButton = new dojox.mobile.ToolBarButton({
			style: "float:left",
			btnClass: "mblDomButton",
			icon: "./app/resources/images/leftArrow.png"
		});
		dojo.connect(leftButton, "onClick", this, this.moveLeft);
		bottomBar.addChild(leftButton);
		
		var rightButton = new dojox.mobile.ToolBarButton({
			style: "float:right",
			btnClass: "mblDomButton",
			icon: "./app/resources/images/rightArrow.png"
		});
		dojo.connect(rightButton, "onClick", this, this.moveRight);
		bottomBar.addChild(rightButton);		
	},
	/*
	handleBack: function() {
		this.performTransition(this.parentId,-1,"slide", //transition back to the main dashboard view
			dojo.hitch(this,
				function(){
					setTimeout(dojo.hitch(this,this.destroyRecursive),500); //this takes care of probs with below
					//see bug found here - http://dojo-toolkit.33424.n3.nabble.com/Safely-clearing-and-rebuilding-a-View-td3566058.html
					//this.destroyRecursive(); //this should work but gives an error currently cause of bug above
					dijit.byId(this.parentId).show(); //show this view (the dashboard view we left off with) - otherwise we don't have proper focus for left/right transitions
				}
			)
		);		
	},
	*/
});