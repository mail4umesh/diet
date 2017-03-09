dojo.provide('app.models.DashboardData');

dojo.require('dojo.store.Memory');

(function() {

var store;
var phase; // create phase varibale according to client suggestion

app.models.DashboardData = {
  load: function(cycle) { // Mohit: 1/17/2012 pass cycle to function argument
	  //	if (store) { return store.data; }
	  	if(localStorage.getItem("currentPhase")){   //mohit: 1/21/2012 check current phase in localstorage
			phase = dojo.fromJson(localStorage.getItem("currentPhase")).key; //mohit: 1/21/2012 assign current phase value to phase variable
		}
		var newuser = "dash_"+phase;  // Mohit: 1/21/2012 replace getCurrent Function with phase variable
		
		if(!localStorage.getItem(newuser)){   //mohit: 1/8/2012:check to see if there is a dashboardData model to be loaded (ie something in localstorage) & if not then use the function above to create default data
			this.getInitialData(cycle);
		}
		
		var storedData = dojo.fromJson(localStorage.getItem(newuser));
		
		//create a data store object based off of the local storage object
		store = new dojo.store.Memory();
		
		//this.setStoreDate(this.getCurrentDate()); // mohit: 1/9/2012
		
		if (storedData){
			store.setData(storedData);	
		} 
		console.log(store)
	},
	
  	getDashboardData: function() {        // mohit : 1/8/2012 : passing cycle in getDashboardData
 		return store.data[1];
  	},
	
 	// Get The inital data when user open it first time
  
  	getInitialData: function(varcycle) {                 // mohit : function which would be populate 17 days of empty dashboard data and stores it in localstorage
	  	var startingData = new Array();
		var date = new Date();
		var startval = (varcycle*17)-17;  // Mohit: 1/17/2012 set loop starting value on the basses of current cycle
		var endval = (varcycle*17);       // Mohit: 1/17/2012 set loop ending value on the basses of current cycle
		var j = 0;
	  	for(var i=startval;i<endval;i++){
			var ndate = new Date(new Date(date.getFullYear(),date.getMonth(), date.getDate() + i));
			var nextDate = ndate.getMonth() + "-" + ndate.getDate() + "-" + ndate.getFullYear();
		  	startingData[j] = {cycle: varcycle,date: nextDate,meals : {input: "0",required: "6" },exercise: {input: "0",required: "17"	},h20: "0",weight: "___"}; //mohit: populate the # 6 for meals and exercise
			j++;
	  	}
		localStorage.setItem("dash_"+phase,dojo.toJson({1:startingData}));      // Mohit: 1/21/2012 replace getCurrent Function with phase variable
	
  	},
  
  	// mohit: 1/09/2012 Get the current data
  	getCurrentDate:function(){
	  	var date = new Date();
		var currentDate = date.getMonth() + "-" + date.getDate() + "-" + date.getFullYear();
		return currentDate;
  	},
	
	
	/*** Mohit: 1/16/2012 save data into localstorage  ***/
	saveData:function(date,object,value){ // //Mohit: 1/20/2012 remove cycle to function argument
		
		// Mohit: 1/17/2012 get the data from localstorage on the bases of current cycle
		var allDashboardData = dojo.fromJson(localStorage.getItem("dash_"+phase))[1]; // Mohit: 1/21/2012 replace getCurrent Function with phase variable
		
		allDashboardData.forEach (dojo.hitch(this,function(item,i){
			if(item.date==date){								// Mohit: 1/16/2012 check the current date data
				switch (object){
					case  "logging": {    						// Mohit: 1/16/2012 call case to save the logging data
						var glass = 0;
						var glassh = value.h20;
						for(var j=0;j<8;j++){
							if(glassh[j]==0){
								glass += 0;
							}else{
								glass += 1;
							}
						}
						allDashboardData[i].weight = value.weight;
						allDashboardData[i].h20 = glass;
					};
					break;
					case  "workout": { 							// Mohit: 1/16/2012 call case to save the excercises data
						var duration = 0;
						value.forEach(function(item1){
						  duration += parseInt(item1.duration);
						})
						allDashboardData[i].exercise.input = duration;
					};
					break;
					case  "meal": { 							// Mohit: 1/16/2012 call case to save the meal data
						var servings = 0;
						value.forEach(function(item1){
						var serve = item1.servings.split(" ");
						  if(item1.servings=='1/2' || serve[1]=='1/2'){		// Mohit: 1/16/2012 check if the half meal is serving like 1 1/2, 2 1/2 or 3 1/2  soon
							  if(serve[0]!='1/2'){
								servings += parseFloat(serve[0]);  
							  }
							  servings += 0.5;
						  }else{
							  servings += parseFloat(item1.servings);
						  }
						  
						})
						allDashboardData[i].meals.input = servings;
					};
					break;
				}
			}
		}));
		
		// Mohit: 1/17/2012 set data in localstorgae on the bases of current cycle
		localStorage.setItem("dash_"+phase,dojo.toJson({1:allDashboardData}));  // Mohit: 1/21/2012 replace getCurrent Function with phase variable
	},
  
  	// mohit: 1/16/2012  function to get the data for back action
  	getDashboardByDate:function(date){ //Mohit: 1/22/2012 change the function name from getBackData to getDashboardByDate
		
		// Mohit: 1/17/2012 get the data from localstorage on the bases of current cycle
		var allDashboardData = dojo.fromJson(localStorage.getItem("dash_"+phase))[1]; // Mohit: 1/21/2012 replace getCurrent Function with phase variable
		
		var data = "";
	  	allDashboardData.forEach (dojo.hitch(this,function(item,i){
			if(item.date==date){												// Mohit: 1/16/2012 check the current date data
				
				data = {meals : item.meals.input+" / "+allDashboardData[i].meals.required,exercise: item.exercise.input+" / "+allDashboardData[i].exercise.required,h20: " x "+item.h20,weight: item.weight+" lbs"};
			}
		}));
		
		return data;
  	},
	getCurrentPhase:function(){  
		return phase;
	}
	/*
	
  setPhase : function() {  //Mohit: 1/20/2012  create new function to set new phase
	var cycle = 1;  
	if(localStorage.getItem("currentPhase")){ 									// Mohit: 1/20/2012 check the currentpahse that is in localstorage
		cycle = dojo.fromJson(localStorage.getItem("currentPhase")).key+1; 	// Mohit: 1/20/2012 increase the pahse 
	}
   	localStorage.setItem("currentPhase",dojo.toJson({key:cycle}));  // Mohit: 1/20/2012 update the data in loaclstorage	
  }
*/
	
};

}());