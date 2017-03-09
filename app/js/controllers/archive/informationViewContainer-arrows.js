// Provide the UI class
dojo.provide("app.InformationViewContainer");
 
// Declare the class;  inherits from View & ViewMixin
dojo.declare("app.InformationViewContainer",[dojox.mobile.View,app._ViewMixin],{	 
	infoViews: [],
	backButton: false, //should this view have a back button (only if coming from a previous screen)
	parentId: "",
    startup: function() {
		this.infoViews = [];
        this.initUi();
    },
	initUi: function() {
		//fake json data - this should come from a .json file
		var views = [{heading:"Info 1",data:this.data},{heading:"Info 2",data:"yyy"},{heading:"Info 3",data:"blah"}];
		
		//create the header & give it the first item's heading
		// ==== App Header has to be at the top position ====
		this.initHeader(views[0].heading);

		//create the info views
		for (var i=0;i<views.length;i++){
			var view = new app.InformationView({
				heading: views[i].heading,
				pageNumber: i,
				data: views[i].data
			});

			//unneeded in 1.7
		//	if (views[i].pageNumber == "0"){
		//		view.selected = true;
		//	}

			this.addChild(view);
			view.startup();

			this.infoViews.push({id:view.id, heading:view.heading, pageNumber:view.pageNumber});	
		}
				
		//create the footer
		// ==== App Footer has to be at the last position ====
		this.initFooter();

		// ==== Initialize each view when the dom is ready ====
		this.infoViews.forEach (function(item){
			var view = dijit.byId(item.id);
			view.findAppBars();
			view.resize();
		})
	},
	initHeader: function(title) {
			var heading = new dojox.mobile.Heading({
				label: title,
				fixed: "top",
				id: "infoViewHeader"
			});

			this.addChild(heading);
			
			if (this.backButton){
				var back = new dojox.mobile.ToolBarButton({
					label: "Back"
				});
				heading.addChild(back);
				dojo.connect(back, "onClick", this, this.handleBack);	
			}
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
					this.destroyRecursive(); //careful - make sure not destroying something we shouldn't
					dijit.byId(this.parentId).show(); //show this view (the dashboard view we left off with) - otherwise we don't have proper focus for left/right transitions
				}
			)
		);		
	},
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
	},
	data: "The 17 Day Diet is designed to help you lose weight rapidly and healthfully, with visible results in just 7 days. In fact, you can expect to lose between 10 to 15 pounds in the first 17 days. On the 17 Day Diet, you will eat mostly lean proteins, vegetables, low-sugar fruits, probiotics, and friendly fats. Gradually you will add a greater selection of foods, including natural carbs. Eventually you will even be able to enjoy alcohol and your favorite foods again, though in moderation. You won’t just be losing weight, you’ll be moving away from refined, processed foods to cleaner foods that are friendly to your digestion system."
});