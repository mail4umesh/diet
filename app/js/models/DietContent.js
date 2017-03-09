dojo.provide('app.models.DietContent');

dojo.require('dojo.store.Memory');

(function() {

var store;

app.models.DietContent = {
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
  getSections: function(){
	var sectionArray = [];
	for (name in store.data){
		sectionArray.push(name)
	}
	return sectionArray;
  },
};

}());