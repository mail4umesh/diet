// Provide the class
dojo.provide("app.controllers._ViewMixin");
 
// Declare the class
dojo.declare("app.controllers._ViewMixin", null, {
    // Returns this pane's list
    getListNode: function() {
        return this.getElements("tweetviewList",this.domNode)[0];
    },
    // Updates the list widget's state
    showListNode: function(show) {
        dojo[(show ? "remove" : "add") + "Class"](this.listNode, "tweetviewHidden");
    },
    // Pushes data into a template - primitive
    substitute: function(template,obj) {
        return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match,key){
            return obj[key];
        });
    },
    // Get elements by CSS class name
    getElements: function(cssClass,rootNode) {
        return (rootNode || dojo.body()).getElementsByClassName(cssClass);
    },
	// Used in event handling functions to find the id of the root item clicked on
	// typically we get an event generated from a sub element that has no id
	//warning - this is not a very exception proof function!!!
	findId: function(element){
		var id = "";
		while (true) {
			element = element.parentElement;
		 	if (element.id != "") {
				id = element.id;
				break;
			}
		}
		return id;
	},
	getWidget: function(className){		
		var node = this.getElements(className,this.domNode);
//		var w = dijit.byNode(node[0]); // find the widget this node is in
		return dijit.getEnclosingWidget(node[0]); // find the widget this node is in
	}
});