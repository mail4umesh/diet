// Provide the UI class
dojo.provide("app.controllers.DietInfoListView");

dojo.require("app.models.DietContent") 

dojo.declare("app.controllers.DietInfoListView",[dojox.mobile.View,app.controllers._ViewMixin],{
	data: "",
	parentId: "",
	data: app.models.DietContent, //prepare our model
	startup: function() {
		dojo.when(this.data.load(), dojo.hitch(this,function() {
	    	this.initUi();
		}));		
	},
	// When the widgets have started....
	initUi: function() {
	//	this.inherited(arguments);
		
		this.initHeader();
		
		var view = new dojox.mobile.View({});
		this.addChild(view)
		view.startup();

		var list = new dojox.mobile.EdgeToEdgeList({});
		view.addChild(list);
								
		//create each of the list items
		this.data.getSections().forEach(dojo.hitch(this,function(item){
			var listItem = new dojox.mobile.ListItem({
				id: this.id + item,
				label: item,
			});
			view.addChild(listItem);
			dojo.connect(listItem.domNode, "onclick", this, dojo.hitch(this, "clickHandler"));
		}))
	},
	//create our header
	initHeader: function() {
		var heading = new dojox.mobile.Heading({
			label: '17 Day Diet',
			fixed: "top",
			id: this.id + "_header"
		});

		this.addChild(heading);
					
		//make sure the back button goes to the right place
		heading.set('back','Back')
		heading.set('moveTo',this.parentId)			

	},
	clickHandler: function(event){
		var itemId = this.findId(event.target);
		var sectionName = itemId.replace(this.id,"");
	
		var view = new app.controllers.InformationViewContainer({
			backButton: true,
			doneButton: false,
			parentId: this.id
		});
		
		dojo.body().appendChild(view.domNode);

		view.startup(this.data.getSection(sectionName));
		this.performTransition(view.id,1,"slide",null);
	},
	//something went wrong when loading in our temlpate file
	errorHandler: function(){
		console.log('error loading data!')
	}
});