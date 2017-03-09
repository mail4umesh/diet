dojo.require('dojo.store.Memory');
dojo.require("app.models.DashboardData");

(function() {
	if (!localStorage){
		throw Error("LocalStorage not available on this device");
	}
	
	app.models.Statistics = {
		
	
	//get weight from localstorage
	getWeigth: function() { // Mohit: 1/20/2012 call current phase function
		
		var weight = "";
		var currentphase = app.models.DashboardData.getCurrentPhase();  // Mohit: 1/21/2012 call the get current phase function as per Steven
		
		var allDashboardData = dojo.fromJson(localStorage.getItem("dash_"+currentphase))[1]; // Mohit: 1/17/2012 get the data from localstorgae on the bases of cycle
		
		allDashboardData.forEach (dojo.hitch(this,function(item){
			if(item.weight!=''){
				weight += item.weight+",";
			}
		}));
		
		return weight;
	}
};

}());