/***
basicUI class - create a simple, configurable UI for processing
data through an aribitrary control function and seeing the results

First use-case that this supports is where we have an input box,
an output box and a go button, which calls a function
The box labels and default values are optional parameters

defaults is a named array with input defaults
labels is a named array with input labels
callback is the function to call on button press
this.boxes contains references to all the UI elements
***/

/***

|Title|basicUI|
|Summary|Create a simple, configurable UI for processing data through an aribitrary control function and seeing the results|
|Description||
|Version of product it works with|2.2.5|
|Version of component|1.0|
|Explanation of how it can be used and modified|First use-case that this supports is where we have an input box, an output box and a go button, which calls a function. The box labels and default values are optional parameters. Create a new UI using {{{var ui = new basicUI; ui.buildUI(place,labels,defaults,callback);}}}|
|Examples where it can be seen working|basicUI is used in this regexTester application: http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/applications/regexTester/examples/regexTester.html|
***/

//{{{

config.macros.basicUI = function() {

	this.labels = {
		"input_url" : "Please input a url to get some information from",
		"input_control" : "Please input a control string",
		"input_box" : "Input text",
		"ui_go_button" : "go!",
		"output_box" : "The results"
	};
	this.defaults = {
		"input_url" : "http://",
		"input_control" : "e.g. for a regex: / .. /mg"
	};
	this.callback = function() { alert("no behaviour defined for ui go button!") };
};

config.macros.basicUI.prototype.buildUI = function(place,labels,defaults,callback) {

	if(labels) { this.labels = labels; }
	if(defaults) { this.defaults = defaults; }
	if(callback) { this.callback = callback; }
	
	var ui_wrapper = createTiddlyElement(place,"div","ui_wrapper");
	var input_url_label = createTiddlyElement(ui_wrapper,"span",null,null,this.labels["input_url"]);
	createTiddlyElement(ui_wrapper,"br");
	var input_url = createTiddlyElement(ui_wrapper,"input","input_url");
	input_url.setAttribute("size","50");
	input_url.setAttribute("value",this.defaults["input_url"]);
	createTiddlyElement(ui_wrapper,"br");
	var input_control_label = createTiddlyElement(ui_wrapper,"span",null,null,this.labels["input_control"]);
	createTiddlyElement(ui_wrapper,"br");
	var input_control = createTiddlyElement(ui_wrapper,"input","input_control");
	input_control.setAttribute("size","50");
	input_control.setAttribute("value",this.defaults["input_control"]);
	createTiddlyElement(ui_wrapper,"br");
	var ui_go_button = createTiddlyElement(ui_wrapper,"input","ui_go_button");
	ui_go_button.setAttribute("type","button");
	ui_go_button.setAttribute("value",labels["ui_go_button"]);
	ui_go_button.onclick = this.editorOnClick;
	ui_go_button.callback = callback;
	createTiddlyElement(ui_wrapper,"br");
	var input_box_label = createTiddlyElement(ui_wrapper,"span",null,null,this.labels["input_box"]);
	createTiddlyElement(ui_wrapper,"br");
	var input_box = createTiddlyElement(ui_wrapper,"textarea","input_box");
	input_box.setAttribute("cols","50");
	input_box.setAttribute("rows","30");
	createTiddlyElement(ui_wrapper,"br");
	var output_box_label = createTiddlyElement(ui_wrapper,"span",null,null,this.labels["output_box"]);
	createTiddlyElement(ui_wrapper,"br");
	var output_box = createTiddlyElement(ui_wrapper,"textarea","output_box");
	output_box.setAttribute("cols","50");
	output_box.setAttribute("rows","30");
};

// The onclick function for the UI go button
config.macros.basicUI.prototype.editorOnClick = function() {

	// that points at the button clicked
	var that = this;
	 
	return (function() {

		// ui_wrapper refers to the containing div
		var ui_wrapper = that.parentNode;
		var boxes = {};
		boxes.input_url = ui_wrapper.childNodes[2];
		boxes.input_control = ui_wrapper.childNodes[6];
		boxes.input_go_button = ui_wrapper.childNodes[8];
		boxes.input_box = ui_wrapper.childNodes[12];
		boxes.output_box = ui_wrapper.childNodes[16];
		
		var userParams = {};
		userParams.input_url = ui_wrapper.childNodes[2].value;
		userParams.input_control = ui_wrapper.childNodes[6].value;
		if(!userParams.input_url) {
			displayMessage("error: check input url!");
		} else if(!userParams.input_control) {
			displayMessage("error: check input control!");
		} else {
			boxes.input_go_button.callback(boxes,userParams);	
		}
	})();
};

// Utility function to clear a box
// box_id is the id of a box in this.boxes
config.macros.basicUI.clearBox = function(boxes,box_id) {
	var box = boxes[box_id];
	if (box && box.hasChildNodes()) {
		var count=box.childNodes.length;
		for (var i=0;i<count;i++) {
			removeNode(box.childNodes[0]);
		}
	}
};

//}}}