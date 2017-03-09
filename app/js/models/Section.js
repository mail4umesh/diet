dojo.provide('app.models.Section');

dojo.require('dojo.store.Memory');

(function() {

var store;

app.models.Section = {
  load : function() {
    if (store) { return store.data; }
	
    return dojo.xhrGet({
      url : './app/resources/data/diet.json',
      handleAs : 'json',
      load : function(data) {
        store = new dojo.store.Memory({ data : data });
      }
    });
  },
  getSection: function(section) {
	//console.log(store);
	return store.data[section];
  },
  getPerson : function(id) {
	console.log(store);
    //return new app.models.Person(store.get(id));
  },

  getPeople : function() {
    return dojo.map(store.data, function(p) {
      //return new app.models.Person(p);
    });
  },

  setPhase : function() {  //Mohit: 1/20/2012  create new function to set new phase
	var cycle = 1;  
	if(localStorage.getItem("currentPhase")){ 									// Mohit: 1/20/2012 check the currentpahse that is in localstorage
		cycle = dojo.fromJson(localStorage.getItem("currentPhase")).key+1; 	// Mohit: 1/20/2012 increase the pahse 
	}
   	localStorage.setItem("currentPhase",dojo.toJson({key:cycle}));  // Mohit: 1/20/2012 update the data in loaclstorage	
  }
};

}());