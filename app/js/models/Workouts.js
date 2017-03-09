dojo.provide('app.models.Workouts');

dojo.require('dojo.store.Memory');

(function() {
	
	if (!localStorage){
		throw Error("LocalStorage not available on this device");
	}
	
	var store;
	var uniqueId;

	app.models.Workouts = {
	  load : function() {
	    if (store) { return store.data; }
	
	    return dojo.xhrGet({
	      url : './app/resources/data/schemas/workouts.json',
	      handleAs : 'json',
	      load : function(data) {
	        store = new dojo.store.Memory({ data : data });
	      }
	    });
	  },
	  getWorkouts: function(date) {
		//console.log(store);
		return store.data[date];
	  },	
	//not used currently but allows us to load pre-existing meals to pre-populate a meal screen(maybe for a demo?)
	loadFromJSON : function(date) {
	  if (store) { return store.data; }

	  return dojo.xhrGet({
	    url : './app/resources/data/workouts.json',
	    handleAs : 'json',
	    load : function(data) {
			store = new dojo.store.Memory();
			store.setData(data[date]);	
			//setup our uniqueId counter
			var storeCount = store.data.length;
			uniqueId = (store.data[storeCount-1].id + 1);
	    }
	  });
	},
	//load meals from localstorage
	load: function(date) {
	 // 	if (store) { return store.data; }
				
		//daily meal storage id's are based on a "meals" id + date string
		var id = "workouts_" + date;
		var storedData = dojo.fromJson(localStorage.getItem(id));
		
		//create a data store object based off of the local storage object
		store = new dojo.store.Memory();

		if (storedData){
			store.setData(storedData);	
			
			//setup our uniqueId counter
			var storeCount = store.data.length;
			uniqueId = (store.data[storeCount-1].id + 1);
		} else {
			uniqueId = 0;
		}
		console.log(store)
	},
	//return a particular workout item
	getWorkout: function(id) {
		return store.get(id);
	},
	getAllWorkouts: function() {						
		return store.query();  //return all meals
	},
	//get a new & unique id for a new meal
	getNewId: function(){                       
		return uniqueId++; //increment our unqiueId
	},
	//mohit: 1/9/2012 Get date form local storage
	/*getStoreDate:function(){
		return localStorage.getItem('date');
	},*/
	//add a new meal
	add: function(object){
		store.add(object);  //add the object to our memory store
	},
	//replace a meal (ie edit a meal)
	replace: function(id, object){
		var options = {id:id, overwrite:true};
		store.put(object,options)
	},
	//remove a meal
	remove: function(id){
		store.remove(id); //remove the object from our memory store
	},
	//save our meal list
	save: function(date) { // Mohit: 1/20/2012 remove cycle to function argument
		app.models.DashboardData.saveData(date,"workout",store.query());	 // Mohit: 1/20/2012 remove cycle to function argument 
		
		//create the id & save today's meals to localstorage
		var id = "workouts_" + date;
		localStorage.setItem(id,dojo.toJson(store.query()));
	}	
};

}());