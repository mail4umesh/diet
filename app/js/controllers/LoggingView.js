dojo.provide("app.controllers.LoggingView");
dojo.require("app.models.Logging")

dojo.declare("app.controllers.LoggingView",[dojox.mobile.ScrollableView,app.controllers._ViewMixin],{
	parentId: "",
	loggingData: app.models.Logging, //prepare our model
	date: "", //passed in date
	cycle: 1,
	startup: function() {
		this.loggingData.load(this.date);
	    this.initUi();			
	},
	initUi: function() {
		this.initHeader();
		
		var view = new dojox.mobile.ScrollableView({});
		this.addChild(view)
		view.startup();
		
	 	var roundRect = new dojox.mobile.RoundRect({
			id: this.id + '_Weight',
			innerHTML: "Current Weight: " + this.loggingData.getWeight()
		})
	 	view.addChild(roundRect);
		dojo.connect(roundRect.domNode, "onclick", this, dojo.hitch(this, "showWeightPicker"));
				
		var content2 = new dojox.mobile.ContentPane({
			content: '8 glasses (8 oz) of water per day.',
			style:"text-align:center;padding:10px;font-size:1.2em"
		});
		view.addChild(content2);
		
		var h20 = new dojox.mobile.ContentPane({
			href: './app/views/h20.html',
		});
		view.addChild(h20);
		dojo.connect(h20, "onLoad", this, dojo.hitch(this, "setupH20Handlers"));
		
		var servingPicker = new dojox.mobile.ContentPane({
			href: './app/views/weightPicker.html',
		});
		this.addChild(servingPicker);
		dojo.connect(servingPicker, "onLoad", this, dojo.hitch(this, "setupPickerHandlers"));		
		
	},
	showWeightPicker: function(){
		var weight = this.loggingData.getWeight();
		if (weight == "___"){
			weight = this.loggingData.getPreviousWeight(this.date,this.cycle); // Mohit: 1/20/2012 remove cycle to function argument
		}
		weightArray = weight.split("");
		this.getWidget('weightHundredsSlot').setValue(weightArray[0]);
		this.getWidget('weightTensSlot').setValue(weightArray[1]);
		this.getWidget('weightOnesSlot').setValue(weightArray[2]);
		this.getWidget('weightDecSlot').setValue(weightArray[3]+weightArray[4]);
		
		this.getWidget('weightPicker').show();
	},
		
	setupPickerHandlers: function(){
		//connect the spinner's done & cancel buttons
		dojo.connect(this.getWidget('weightPickerDoneButton'), "onClick", this, dojo.hitch(this, "onDone"));		
		dojo.connect(this.getWidget('weightPickerCancelButton'), "onClick", this, dojo.hitch(this, 
			function(){
				this.getWidget('weightPicker').hide();	
			}));
		
	},	
	onDone: function(){
		this.getWidget('weightPicker').hide();		

		var hundreds = this.getWidget('weightHundredsSlot').getValue();
		var tens = this.getWidget('weightTensSlot').getValue();
		var ones = this.getWidget('weightOnesSlot').getValue();
		var decimal = this.getWidget('weightDecSlot').getValue();			
		
		weight = hundreds + tens + ones + decimal; //make a string
		dijit.byId(this.id + '_Weight').set('innerHTML',"Current Weight:  " + weight);

		this.loggingData.updateWeight(weight)
		this.loggingData.save(this.date); // Mohit: 1/20/2012 remove cycle to function argument
	},
	
	setupH20Handlers: function(){
		//on iOS we use the touch event since otherwise we get two clicks when tapping on the glasses..not certain why here
		var	userAgent = navigator.userAgent;
		var onEvent = 'onclick';
		if (userAgent.indexOf("iPhone") != -1 || userAgent.indexOf("iPod") != -1 
			|| userAgent.indexOf("iPad") != -1){
				onEvent = 'ontouchstart';		
		}
		
		var i=0;
		this.loggingData.getGlasses().forEach(dojo.hitch(this,function(item){
			if (item == 1){
					dojo.connect(dojo.byId('${glass'+ i +'}'), onEvent, this, this.glassFill);
					dojo.byId('${glass'+ i +'}').innerHTML = '<div style="height:50px;text-align:center;"><img src="./app/resources/images/glass.png" width="20" height="45" style="margin-left:30px"></div>'	
			} else {		
					dojo.connect(dojo.byId('${glass'+ i +'}'), onEvent, this, this.glassFill);
					dojo.byId('${glass'+ i +'}').innerHTML = '<div style="height:50px;text-align:center;"><img src="./app/resources/images/emptyGlass.png" width="20" height="45" style="margin-left:30px"></div>'
			}			
			i++;
		}))
				
		
	},
	glassFill: function(e){	
		var itemId = this.findId(e.target);
		var index = itemId.substring(7,8);
		
		if (this.loggingData.getGlass(index) == 0) {
			this.loggingData.fillGlass(index);			
			dojo.byId(itemId).innerHTML = '<div style="height:50px;text-align:center;"><img src="./app/resources/images/glass.png" width="20" height="45" style="margin-left:30px"></div>'	
		} else {
			this.loggingData.emptyGlass(index);
			dojo.byId(itemId).innerHTML = '<div style="height:50px;text-align:center;"><img src="./app/resources/images/emptyGlass.png" width="20" height="45" style="margin-left:30px"></div>'
		}

		this.loggingData.save(this.date); // Mohit: 1/20/2012 remove cycle to function argument
	},
	initHeader: function(title) {
		var heading = new dojox.mobile.Heading({
			label: 'Logging',
			fixed: "top",
			id: this.id + "_header",
			back: "Back",
			moveTo: 'Super-Hack-fakeId-UseBelow'
		});

		this.addChild(heading);
		dojo.connect(heading, "onClick", this, this.handleBack);	//add the real click handler here - nasty hack
	},
	handleBack: function(){
		var v = dojox.mobile.currentView
		v.performTransition("dashboard",-1,"fade",
			dojo.hitch(this,
				function(){
					this.destroyRecursive();
					dijit.byId(this.parentId).show();
					dijit.byId(this.parentId).updateView(); //Mohit: 1/16/2012 Call the updateView Function when back button is pressed
				}
			)
		);
	},
	//something went wrong when loading in our temlpate file
	errorHandler: function(){
		console.log('error loading data!')
	}
});