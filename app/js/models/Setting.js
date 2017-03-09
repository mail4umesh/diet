// JavaScript Documentdojo.provide('app.models.Logging');

dojo.require('dojo.store.Memory');

(function() {
	if (!localStorage){
		throw Error("LocalStorage not available on this device");
	}
	
	var store;
	app.models.Setting = {
		
	//load setting from localstorage
	load: function(date) {
	  //	if (store) { return store.data; }
		var id = "Setting";
		
		var storedData = dojo.fromJson(localStorage.getItem(id));
			
		//create a data store object based off of the local storage object
		store = new dojo.store.Memory();
		
		if (storedData){
			store.setData(storedData);	
		} else {
			store.put({
				id:0,
				"gender":"Female",
				"height":"___",
				"frame":"___",
				"age":"___",
				"goal":"___",
				"started":false
			})			
		}
	},
	//Mohit: 01/14/2012 validate the entries.  
	validateItem: function() {
		var log = store.get(0);
		var errorMessage = new Array()
		if(log['height']=="___"){
			errorMessage[0]= 'Please enter your height.';             // if user has not selected the height the show error message
		}
		if(log['goal']=="___"){
			errorMessage[2]= 'Please enter your goal weight.';               // if user has not selected the weight the show error message
		}		
		if(log['frame']=="___"){
			errorMessage[3]= 'Please enter your bone structure.';               // if user has not selected the weight the show error message
		}		
		if(log['age']=="___"){
			errorMessage[4]= 'Please enter your age.';                    // if user has not selected the age the show error message
		}
		if(errorMessage[0]!='' || errorMessage[1]!='' || errorMessage[2]!=''){
			return errorMessage
		}else{
			return false;
		}
	},
	setGender: function(gender){
		var log = store.get(0);
		log['gender'] = gender;
		
		var options = {id:0, overwrite:true};
		store.put(log,options)	
	},
	setHeight: function(height){
		var log = store.get(0);
		log['height'] = height;
		
		var options = {id:0, overwrite:true};
		store.put(log,options)	
	},
	setGoalWeight: function(weight){
		var log = store.get(0);
		log['goal'] = weight;
		
		var options = {id:0, overwrite:true};
		store.put(log,options)	
	},	
	setAge: function(age){
		var log = store.get(0);
		log['age'] = age;
		
		var options = {id:0, overwrite:true};
		store.put(log,options)	
	},
	setFrame: function(frame){
		var settings = store.get(0);
		settings['frame'] = frame;

		var options = {id:0, overwrite:true};
		store.put(settings,options)	
	},
	getHeight: function(){
		var settings = store.get(0);
		return settings['height'];
	},
	getGender: function(){
		var settings = store.get(0);
		return settings['gender'];		
	},
	getFrame: function(){
		var settings = store.get(0);
		return settings['frame'];		
	},
	getGoalWeight: function(){
		var settings = store.get(0);
		return settings['goal'];		
	},
	//save our meal list
	save: function() {
		var id = "Setting";
		localStorage.setItem(id,dojo.toJson(store.query()));
	},
	start:function(){
		var settings = store.get(0);
		settings["started"] = true;

		var options = {id:0, overwrite:true};
		store.put(settings,options)	
		this.save()	
	},
	started:function(){
		var settings = store.get(0);
		return settings["started"];
	},
	getData: function(){ // Mohit:1/18/2012 function to fatch the stored data in storage
		return store.get(0);		
	}
};

}());