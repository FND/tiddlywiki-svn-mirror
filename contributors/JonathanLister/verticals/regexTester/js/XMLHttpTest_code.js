/***
XMLHttpTester
This is an example use of the using basicUI library and RSSAdaptor 
***/

//{{{

config.macros.XMLHttpTest = {};

config.macros.XMLHttpTest.handler = function(place,macroName,params) {

	// defaults is a named array with input defaults
	// labels is a named array with input labels
	// callback is the function to call on button press
	var ui = new config.macros.basicUI();
	var labels = {
		"input_url" : "The envelope",
		"input_control" : "The pen",
		"ui_go_button" : "Go!",
		"input_box" : "The paper",
		"output_box" : "The results"
	};
	var defaults = {
		"input_url" : "http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/front_page/rss.xml",
		"input_control" : "<item>"
	};
	var callback = config.macros.XMLHttpTest.go;
	
	// Let's get going
	ui.buildUI(place,labels,defaults,callback);

};

config.macros.XMLHttpTest.go = function(boxes,userParams) {

	var adaptor = new RSSAdaptor();
	// As we're communicating between a UI and this macro
	// use the context object to store macro variables
	var context = {};
	context.adaptor = adaptor;
	context.boxes = boxes;
	context.host = userParams.input_url;
	var ret = adaptor.openHost(context.host,context,userParams,config.macros.XMLHttpTest.onOpenHost);
	if (!ret) {
		displayMessage("problem opening host: " + ret);
		return false;
	}
	return typeof(ret) == "string" ? ret : true;

};

// Display the input text and proceed
config.macros.XMLHttpTest.onOpenHost = function(context,userParams) {
	context.boxes.input_box.value = context.adaptor.store;
	// Next line calls custom version of the adaptor's getTiddlerList to allow for user-defined regex
	var ret = config.macros.XMLHttpTest.getTiddlerList(context,userParams);
	if (typeof(ret) == "string") {
		displayMessage("problem opening tiddler list: " + ret);
	}
};

// This is a customised version of the getTiddlerList RSSAdaptor function
// We just print the responseText
config.macros.XMLHttpTest.getTiddlerList = function(context,userParams) {
	if(!context.adaptor.store) {
		return RSSAdaptor.NotLoadedError;
	}
	var place = context.boxes.output_box;
	context.boxes.output_box.value = context.adaptor.store;

	return true;
};

//}}}