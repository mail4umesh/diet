dojo.provide("app.controllers.CycleOverview");

dojo.require("app.controllers.InformationView");

dojo.require("dojox.mobile.SwapView") 
dojo.require("dojox.mobile.PageIndicator") 
dojo.require("app.models.DietContent");

dojo.declare("app.controllers.CycleOverview",[dojox.mobile.View,app.controllers._ViewMixin],{	 
	infoViews: [], //holds info about each of the pages - used if for displaying page specific info
	backButton: false, //should this view have a back button (only if coming from a previous screen)
	doneButton: false, //should this view have a done button
	doneCallback: null, //used when done button is pressed
	parentId: "", //parent view id
	data: null,
	cycle: null,
	dietData: app.models.DietContent,
    startup: function() {
		dojo.when(this.dietData.load(), dojo.hitch(this,function() {
			this.data = this.dietData.getSection("Cycle " + this.cycle);
			this.infoViews = [];
			this.initUi(this.data);
		}));
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
		this.initPageIndicator(); //there's a problem with page footer when destroying the view & recreating. Should report a bug, but first do an isolated test and a static template test
		
		//foooter seems to be fine - but take note of first view focus issue. Might need to use this since pageindicator is having probs on destroy
		// ==== App Footer has to be at the last position ====
		//this.initFooter();

		//doesn't seem to have any effect here(with pageindicator) but typically when you fix a bar to the bottom this is used
		//(works with swap and scrollview)
		// ==== Initialize each view when the dom is ready ====
		this.infoViews.forEach (function(item){
			var view = dijit.byId(item.id);
			view.findAppBars();
			view.resize();
		})
	},
	initHeader: function(title) {
		var heading;
		
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
			
			if (this.doneButton){
				var done = new dojox.mobile.ToolBarButton({
					label: "Done",
					style: "float:right"
				});
				heading.addChild(done);
				dojo.connect(done, "onClick", this, this.doneCallback);	
			}			
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
	//these are for arrows on footer
	moveLeft: function() {
		//check that it's not the first item & then move to the previous view
		var v = dojox.mobile.currentView;
		var viewCount = this.infoViews.length;
		if (v.id != this.infoViews[0].id){
			for (var i=0;i<viewCount;i++){
				if (v.id == this.infoViews[i].id){
					v.performTransition(this.infoViews[(i-1)].id,-1,"slide",null);
					//refresh the header label
					var header = dijit.byId("infoViewHeader");
					header.set("label", this.infoViews[(i-1)].heading);
					//refresh the footer label
					var footer = dijit.byId("infoViewFooter");
					footer.set("label", "Page " + (i));
					break;	
				}
			}
		}	
	},
	moveRight: function() {
		//check that it's not the last item & then move to the next view
		var v = dojox.mobile.currentView;
		
		//the view focus isn't set where we want it on first view, 
		//use v = dijit.byId('dojox_mobile_SwapView_0')
		
		var viewCount = this.infoViews.length;
		if (v.id != this.infoViews[viewCount-1].id){
			for (var i=0;i<viewCount;i++){
				if (v.id == this.infoViews[i].id){
					v.performTransition(this.infoViews[(i + 1)].id,1,"slide",null);
					//refresh the header label
					var header = dijit.byId("infoViewHeader");
					header.set("label", this.infoViews[(i+1)].heading);
					//refresh the footer label
					var footer = dijit.byId("infoViewFooter");
					footer.set("label", "Page " + (i+2));
					break;	
				}
			}
		}
	}
});