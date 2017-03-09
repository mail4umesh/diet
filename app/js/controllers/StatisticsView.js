// Provide the UI class
dojo.provide("app.controllers.StatisticsView");

dojo.require("app.models.Statistics") 	// Include module of statistics to load data
dojo.require("dojox.charting.Chart");	// Include chart clss to create a class
dojo.require("dojox.charting.axis2d.Default");
dojo.require("dojox.charting.plot2d.Default");


// Declare the class;  inherits from View
dojo.declare("app.controllers.StatisticsView",[dojox.mobile.ScrollableView,app.controllers._ViewMixin],{
	data: "",
	parentId: "",
	statisticsData: app.models.Statistics,
	cycle:1,
	// When the widgets have started....
	startup: function() {
		this.inherited(arguments);
		
		this.initHeader();
			
		//create the view, add it on the same level as the dash, then transition it in (async)
		//move this to a new class
		var view = new dojox.mobile.ScrollableView({});
		this.addChild(view);
		var info = new dojox.mobile.RoundRect({
			innerHTML: "<div id='statechart' ></div>"  // mohit: 11/1/12 Give paading to graph div
		});
		view.addChild(info);
		
		var weigth = this.statisticsData.getWeigth(); // Mohit: 1/17/2012 pass cycle to function argument
	
		/*** Mohit: 1/10/12 Chart creation and assigning ***/
		makeCharts = function(){
			//alert(weigth);
			var chart1 = new dojox.charting.Chart("statechart");
			chart1.addPlot("default", { markers: true, Line:true,enableCache: true,  tension:3,fill: "lightblue", shadows: {dx: 2, dy: 2, dw: 2}});
			chart1.addAxis("x",  {labels: [{value: 1, text: "Day 1"}, {value: 2, text: "Day 2"},
										  {value: 3, text: "Day 3"}, {value: 4, text: "Day 4"},
										  {value: 5, text: "Day 5"}, {value: 6, text: "Day 6"},
										  {value: 7, text: "Day 7"}, {value: 8, text: "Day 8"},
										  {value: 9, text: "Day 9"}, {value: 10, text: "Day 10"},
										  {value: 11, text: "Day 11"}, {value: 12, text: "Day 12"},
										  {value: 13, text: "Day 13"}, {value: 14, text: "Day 14"},
										  {value: 15, text: "Day 15"}, {value: 16, text: "Day 16"},{value: 17, text: "Day 17"}]
								  });

			chart1.addAxis("y", {fixUpper: "major", fixLower:"minor",vertical: true, labels: [{value: 50, text: "50"}, {value: 100, text: "100"},
										  {value: 150, text: "150"}, {value: 200, text: "200"},
										  {value: 250, text: "250"}, {value: 300, text: "300"},
										  {value: 350, text: "350"}, {value: 400, text: "400"},
										  {value: 400, text: "450"}, {value: 500, text: "500"},
										  {value: 550, text: "550"}, {value: 600, text: "600"},
										  {value: 650, text: "650"}, {value: 700, text: "700"},
										  {value: 750, text: "750"}, {value: 800, text: "800"}, {value: 900, text: "900"}]
								  });
			var weight1 = "";
			var newweight = weigth.split(",");
			
			chart1.addSeries("Series 1", [parseFloat(newweight[0]),parseFloat(newweight[1]),parseFloat(newweight[2]),
											parseFloat(newweight[3]),parseFloat(newweight[4]),parseFloat(newweight[5]),
											parseFloat(newweight[6]),parseFloat(newweight[7]),parseFloat(newweight[8]),
											parseFloat(newweight[9]),parseFloat(newweight[10]),parseFloat(newweight[11]),
											parseFloat(newweight[12]),parseFloat(newweight[13]),parseFloat(newweight[14]),
											parseFloat(newweight[15]),parseFloat(newweight[16])
											]);
			
			chart1.render();
		 
		};
		 
		dojo.addOnLoad(makeCharts);

		/*** End Of Chart Section ***/
		
	},
	//create our header
	initHeader: function(title) {
		var heading = new dojox.mobile.Heading({
			label: 'Statistics',
			fixed: "top",
			id: this.id + "_header",
			back: "Back",
			moveTo: 'Super-Hack-fakeId-UseBelow'
		});

		this.addChild(heading);
		dojo.connect(heading, "onClick", this, this.handleBack);	//add the real click handler here - nasty hack

	},
	handleBack: function(){
		var v = dojox.mobile.currentView
		v.performTransition("dashboard",-1,"fade",
			dojo.hitch(this,
				function(){
					this.destroyRecursive();
					dijit.byId(this.parentId).show();
				}
			)
		);		
	},
	//something went wrong when loading in our temlpate file
	errorHandler: function(){
		console.log('error loading data!')
	}
});