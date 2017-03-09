dojo.provide('app.models.Information');

(function() {

app.models.Information = {
  checkSetting:function(){  // Mohit: 1/20/2012 check setting in localstorage
		return dojo.fromJson(localStorage.getItem("Setting"));
	},
};

}());