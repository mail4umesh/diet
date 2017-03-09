dojo.provide('app.models.Excercises');

dojo.require('dojo.store.Memory');

(function() {

var store;

app.models.Excercises = {
  load : function() {
    if (store) { return store.data; }

    return dojo.xhrGet({
      url : './app/resources/data/excercises.json',
      handleAs : 'json',
      load : function(data) {
        store = new dojo.store.Memory({ data : data });
      }
    });
  },
  getExcercises: function(cycle) { // Mohit: 1/17/2012 pass cycle to function argument
	return store.data[cycle]; // Mohit: 1/17/2012 fatch the data on the bases of cycle
  }
};

}());