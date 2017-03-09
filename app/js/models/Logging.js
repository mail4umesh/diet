// JavaScript Documentdojo.provide('app.models.Logging');
dojo.require("app.models.DashboardData");
dojo.require('dojo.store.Memory');

(function() {
	if (!localStorage){
		throw Error("LocalStorage not available on this device");
	}
	
	var store;
	app.models.Logging = {
		
	//load log from localstorage
	load: function(date) {
	  	//if (store) { return store.data; }
		
		var id = "Log_"+date;
		
		var storedData = dojo.fromJson(localStorage.getItem(id));
			
		//create a data store object based off of the local storage object
		store = new dojo.store.Memory();
		
		if (storedData){
			store.setData(storedData);	
		} else {
			store.put({
				id:0,
				"weight":"___",
				"h20":[0,0,0,0,0,0,0,0]
			})			
		}
	},
	getGlasses: function() {
		return store.get(0)['h20'];
	},
	getGlass: function(index){
		var log = store.get(0);
		h20 = log['h20'];
		return h20[index];	
	},
	fillGlass: function(index) {					
		this.updateGlass(index,1);
	},
	emptyGlass: function(index) {					
		this.updateGlass(index,0);
	},
	updateGlass: function(index, state){
		//get the log data
		var log = store.get(0);
		h20 = log['h20']

		//now set the glass state and update the store
		var options = {id:0, overwrite:true};
		h20[index] = state;
		log['h20'] = h20;
		store.put(log,options)		
	},
	getWeight: function(){
		return store.get(0)['weight'];		
	},
	updateWeight: function(weight){
		//get the log data & set the weight
		var log = store.get(0);
		log['weight'] = weight;

		//now update the store
		var options = {id:0, overwrite:true};
		store.put(log,options)				
	},
	
	//save our meal list
	save: function(date,cycle) { // Mohit:1/17/2012 pass the cycle to function argument
		app.models.DashboardData.saveData(date,"logging",store.query()[0]); // Mohit: 1/20/2012 remove cycle to function argument
		
		//create the id & save today's logging to localstorage
		var id = "Log_"+date;
		localStorage.setItem(id,dojo.toJson(store.query()));
	},
	
	
	//mohit: 11/9/2012 Get date form local storage
	getPreviousWeight:function(date){ // Mohit:1/17/2012 pass the cycle to function argument
		var arrArray = date.split("-");
		var date = new Date(new Date(arrArray[2],arrArray[0], arrArray[1]-1));
		var lastdate = date.getMonth() + "-" + date.getDate() + "-" + date.getFullYear();
		var newWeight = "";
		
		var currentphase = app.models.DashboardData.getCurrentPhase();  // Mohit: 1/21/2012 call the get current phase function as per Steven suggestions
		
		var allDashboardData = dojo.fromJson(localStorage.getItem("dash_"+currentphase))[1]; // Mohit:1/17/2012 get the data from localstorage on the bases of cucrrent cycle
		allDashboardData.forEach (dojo.hitch(this,function(item,i){
			if(item.date==lastdate){
				newWeight = allDashboardData[i].weight;
			}
	   }));
		if(newWeight!=''){
			return newWeight;
		}else{
			return "222.0"	;
		}
	}
};

}());