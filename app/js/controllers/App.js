dojo.provide("app.controllers.App");

dojo.require("app.controllers.DashboardViewContainer");
dojo.require("app.controllers.WelcomeView");
 
app.controllers.App = {
    //store: null,
    //query: dojo.config.flickrRequest || {},
 	settings: app.models.Setting,
	view: null,
    init: function() {
        // proceed directly with startup
        this.startup();
    },
    startup: function() {
        // create the data store
    //    var flickrStore = this.store = new dojox.data.FlickrRestStore();
		this.settings.load();
        this.initUi();
    },
    initUi: function() {
		if(!this.settings.started()){ //have they started yet?
			this.createWelcomeView();                   				//If not then we know they have not gone through the settings screen properly and we should display the welcome screen. If there is settings data then we should display the dashboard screen.
		} else {
			this.createDashboardView();
		}
    },
	createDashboardView: function() {
		this.view = new app.controllers.DashboardViewContainer({
			id: "dashboard"														// Mohit: 1/19/2012 remove the cycle an cycle var
		});
		dojo.body().appendChild(this.view.domNode);
		this.view.startup();
	},
	createWelcomeView: function() {		
		this.view = new app.controllers.WelcomeView({
			id: "welcome"
		});
		dojo.body().appendChild(this.view.domNode);
		this.view.startup();
	}
};