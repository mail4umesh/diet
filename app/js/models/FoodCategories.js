dojo.provide('app.models.FoodCategories');

dojo.require('dojo.store.Memory');

(function() {
	
	if (!localStorage){
		throw Error("LocalStorage not available on this device");
	}
	
	var store;

	app.models.FoodCategories = {
		//not used currently but allows us to load pre-existing meals to pre-populate a meal screen(maybe for a demo?)
		loadFromJSON : function() {
		  if (store) { return store.data; }

		  return dojo.xhrGet({
		    url : './app/resources/data/foodCategories.json',
		    handleAs : 'json',
		    load : function(data) {
		        store = new dojo.store.Memory({ data : data });
		    }
		  });
		},
		//return all of the current store's categories by cycle
		getCategoriesByCycle: function(cycle){
			return store.data["cycle"+cycle];
		}
};

}());