dojo.provide('app.models.Guidelines');

dojo.require('dojo.store.Memory');

(function() {

var store;

app.models.Guidelines = {
  load : function() {
    if (store) { return store.data; }
	
    return dojo.xhrGet({
      url : './app/resources/data/guidelines.json',
      handleAs : 'json',
      load : function(data) {
        store = new dojo.store.Memory({ data : data });
      }
    });
  },
  getGuidelines: function() {
	//console.log(store);
	return store.data;
  },
  getCycleGuidelines : function(cycle) {
	return store.data["cycle"+cycle];
  }
};

}());