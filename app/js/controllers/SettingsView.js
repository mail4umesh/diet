// Provide the UI class
dojo.provide("app.controllers.SettingsView");

dojo.require("dojox.mobile.Button"); 
dojo.require("dojox.mobile.Opener"); 

dojo.require("app.controllers.CycleOverview");
dojo.require("app.models.Setting");
dojo.require("app.controllers.DashboardViewContainer");
dojo.require("dojox.form.DropDownSelect");

// Declare the class;  inherits from View
dojo.declare("app.controllers.SettingsView",[dojox.mobile.View,app.controllers._ViewMixin],{
	parentId: "",
	settingData: app.models.Setting,
	goalPick: false, //we reuse the picker for goal & weight so need to know which one picker is used for
	// When the widgets have started....
	startup: function() {
		var welcome = new dojox.mobile.ContentPane({
			href: './app/views/settings.html',
		});
		this.addChild(welcome);
		dojo.connect(welcome, "onLoad", this, dojo.hitch(this, "setupButtonHandlers"));		
	},
	setupButtonHandlers: function(){
		//grab our view header & hack the back button to use our back button function
		var heading = this.getWidget('settings_header');
		heading.set('moveTo','fakeId-Use-handleBack-Function');
		dojo.connect(heading, "onClick", this, this.handleBack);
				
		//check to see if they've already started
		if(this.settingData.started()){
			//hide the get started button & show the reset button
			this.getWidget('getStarted').set("style","display:none;");
			dojo.connect(this.getWidget('reset'), "onClick", this, dojo.hitch(this, function(){this.getWidget('actionSheet').show()}));	
			dojo.connect(this.getWidget('doReset'), "onClick", this, dojo.hitch(this, "reset"));	
			dojo.connect(this.getWidget('cancelReset'), "onClick", this, dojo.hitch(this, function(){this.getWidget('actionSheet').hide()}));									
			this.calculateGoalWeight();
		}else{
			//hide the reset button & show the get started button
			this.getWidget('reset').set("style","display:none;");			
			dojo.connect(this.getWidget('getStarted'), "onClick", this, dojo.hitch(this, "startDiet"));
		}
					
		//set the select fields to saved values
		dojo.byId('height').value = this.settingData.getData().height;							
		dojo.byId('frame').value = this.settingData.getData().frame;			
		dojo.byId('age').value = this.settingData.getData().age;
		dojo.byId('goal').value = this.settingData.getData().goal;
		
		//Mohit:01-02-2012 Assign Value to slectbox display section Start Here
		if(this.settingData.getData().height=="___"){
			dojo.byId('heighttext').innerHTML = "Height";
		}else{
			dojo.byId('heighttext').innerHTML = (this.settingData.getData().height.replace("-","'"))+'"';
		}
		if(this.settingData.getData().frame=="___"){
			dojo.byId('frametext').innerHTML = "Bone Structure";
		}else{		
			dojo.byId('frametext').innerHTML = this.settingData.getData().frame;			
		}
		if(this.settingData.getData().age=="___"){
			dojo.byId('agetext').innerHTML = "Age";
		}else{		
			dojo.byId('agetext').innerHTML = this.settingData.getData().age;
		}
		if(this.settingData.getData().goal=="___"){
			dojo.byId('goaltext').innerHTML = "Goal Weight";
		}else{		
			dojo.byId('goaltext').innerHTML = this.settingData.getData().goal+" lbs";		
		}
		//Mohit:01-02-2012 Assign Value to slectbox display section ends here
		

		if(this.settingData.getData().gender=='Male'){									
			this.getWidget('gender').set('value',"off");								
		}else{																			
			this.getWidget('gender').set('value',"on");									
		}			
					
		//hook up our event handlers for all the fields
		dojo.connect(this.getWidget('gender'), "onStateChanged", this, dojo.hitch(this, "switchStateHandler"));
		
		dojo.connect(this.getWidget('goal').domNode, "onclick", this, dojo.hitch(this, "changeHandler"));		
		dojo.connect(dojo.byId('height').domNode, "onchange", this, dojo.hitch(this, "changeHandler"));
		dojo.connect(dojo.byId('frame').domNode, "onchange", this, dojo.hitch(this, "changeHandler"));
		dojo.connect(dojo.byId('age').domNode, "onchange", this, dojo.hitch(this, "changeHandler"));								
				
		dojo.connect(this.getWidget('errorCloseButton'), "onClick", this, dojo.hitch(this, function(){
					this.getWidget('errorDisplay').hide()}));
	},
	changeHandler: function(event){
		var value = event.srcElement.value
		var id = event.srcElement.id;
		switch (id){
			case  "age": {
				dojo.byId('agetext').innerHTML = value; //Mohit:01-02-2012 Assign value to age slectbox display section
				this.settingData.setAge(value);
			};
			break;
			case  "height": {
				dojo.byId('heighttext').innerHTML = (value.replace("-","'"))+'"'; //Mohit:01-02-2012 Assign  height value to slectbox display section
				this.settingData.setHeight(value);
			};
			break;
			case  "frame": {
				dojo.byId('frametext').innerHTML = value; //Mohit:01-02-2012 Assign frame value to slectbox display section
				this.settingData.setFrame(value);
			};
			break;		
			case  "goal": {
				dojo.byId('goaltext').innerHTML = value+" lbs"; //Mohit:01-02-2012 Assign goal value to slectbox display section
				this.settingData.setGoalWeight(value);
			};
			break;						
		}
		this.settingData.save();
		this.calculateGoalWeight();
	},	
	startDiet: function(){
		var validateSetting = this.settingData.validateItem();  // Mohit: 01/14/2012  check validation for elements
		if(!validateSetting || validateSetting==false || validateSetting==""){ // Mohit: 01/14/2012  Action if data is valid
			var view = new app.controllers.CycleOverview({
				backButton: true,
				doneButton: true,
				cycle: 1,
				doneCallback: dojo.hitch(this,function(){				// show dashboard
					this.showDashboard(view);
				}),
				parentId: this.id
			});
			dojo.body().appendChild(view.domNode);
			view.startup();
			this.performTransition(view.id,1,"slide",null);				
		}else{ // Mohit: 01/14/2012  Action if validation fails then show error message
			
			var content = "";
			validateSetting.forEach(dojo.hitch(this,function(item,i){
				content += 	item+"<br />";
			}));
			this.getWidget('errorMessage').set('content',content);
			this.getWidget('errorDisplay').show();
			
			//dojo.connect(this.getWidget('agePickerDoneButton'), "onClick", this, dojo.hitch(this, "onDone"));
			/*if(dijit.byId("errorDialog")){
				dijit.byId("errorDialog").destroyRecursive();
			}
			errorDialog = new dijit.Dialog({
				id: "errorDialog",
				title: "Error",
				content: "",
				style: "width: 300px;  background:#FFF; "
			});
			
			var content = "";
			validateSetting.forEach(dojo.hitch(this,function(item,i){                    // mohit commented . I checked with errorDialog also
				content += 	item+"<br />";
			}));
			errorDialog.set("content", content);

			dijit.byId("errorDialog").show();*/
		}
	},
	switchStateHandler: function(state){
		switch (state){
			case  "off": {
				this.settingData.setGender('Male');   // Mohit: 01/14/2012 set gender to storage
			};
			break;			
			case  "on": {
				this.settingData.setGender('Female');   // Mohit: 01/14/2012 set gender to storage
			};
			break;
		}
		this.calculateGoalWeight();		
		this.settingData.save();
	},
	showDashboard: function(oldView){
		this.settingData.start(); //save the data here - ie only after they've fully acknowledged they want to start!
		var view = new app.controllers.DashboardViewContainer({
			id: "dashboard",
			cycle: 1
		});
		dojo.body().appendChild(view.domNode);
		view.startup();
		oldView.performTransition(view.id,1,"slide",null);			
	},
	handleBack: function(){
		this.performTransition(this.parentId,-1,"slide",
			dojo.hitch(this,
				function(){
					this.destroyRecursive(); //careful - make sure not destroying something we shouldn't
					dijit.byId(this.parentId).show(); //show this view (the dashboard view we left off with) - otherwise we don't have proper focus for left/right transitions
				}
			)
		);		
	},	
	//something went wrong when loading in our temlpate file
	errorHandler: function(){
		console.log('error loading data!')
	},
	//calculate the 'ideal' recommended weight
	calculateGoalWeight: function(){
		var height = this.settingData.getHeight().split('-');
		if (height == "___") return;
		var feet = height[0];
		var inches = height[1];
		
		var frame = this.settingData.getFrame();
		if (frame == "___") return;						

		if (this.settingData.getGender() == "Female"){
			var idealWeight = 100 + (feet-5)*12*5 + inches*5;
			
			if (frame == "small"){
				idealWeight = idealWeight - idealWeight*0.15
			} else if (frame == "large"){
				idealWeight = idealWeight + idealWeight*0.15;
			}
		} else {
			var idealWeight = 110 + (feet-5)*12*6 + inches*6;
			
			if (frame == "small"){
				idealWeight = idealWeight - idealWeight*0.15
			} else if (frame == "large"){
				idealWeight = idealWeight + idealWeight*0.15;
			}			
		}
					
		idealWeight = Math.round(idealWeight);
		this.getWidget('goal_recommendation').set('innerHTML',"Recommended goal weight - " + idealWeight + " lbs");		
	},
	reset: function(){
		localStorage.clear();
		this.getWidget('actionSheet').hide();
		window.location.reload();
	}
});