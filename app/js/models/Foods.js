dojo.provide('app.models.Foods');

dojo.require('dojo.store.Memory');

(function() {

var store;

app.models.Foods = {
  load : function() {
    if (store) { return store.data; }
	
    return dojo.xhrGet({
      url : './app/resources/data/foods.json',
      handleAs : 'json',
      load : function(data) {
        store = new dojo.store.Memory({ data : data });
      }
    });
  },
  getCategories: function(cycle) {
	//console.log(store);
	return store.data[cycle];
  },
  getFoods: function(cycle,category) {
	//console.log(store);
	return store.data[cycle][0][category];
  }
};

}());