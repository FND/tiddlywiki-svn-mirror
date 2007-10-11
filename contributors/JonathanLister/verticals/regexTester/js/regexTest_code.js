/***
Visual regex query builder to debug any regex problems
This is an example use of the using basicUI library and RSSAdaptor 
***/

//{{{

config.macros.regexTest = {};

config.macros.regexTest.handler = function(place,macroName,params) {

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
	var callback = config.macros.regexTest.go;
	
	// Let's get going
	ui.buildUI(place,labels,defaults,callback);

};

config.macros.regexTest.go = function(boxes,userParams) {

	var adaptor = new RSSAdaptor();
	// As we're communicating between a UI and this macro
	// use the context object to store macro variables
	var context = {};
	context.adaptor = adaptor;
	context.boxes = boxes;
	context.host = userParams.input_url;
	var ret = adaptor.openHost(context.host,context,userParams,config.macros.regexTest.onOpenHost);
	if (!ret) {
		displayMessage("problem opening host: " + ret);
		return false;
	}
	return typeof(ret) == "string" ? ret : true;

};

// Display the input text and proceed
config.macros.regexTest.onOpenHost = function(context,userParams) {
	context.boxes.input_box.value = context.adaptor.store;
	// Next line calls custom version of the adaptor's getTiddlerList to allow for user-defined regex
	var ret = config.macros.regexTest.getTiddlerList(context,userParams);
	if (typeof(ret) == "string") {
		displayMessage("problem opening tiddler list: " + ret);
	}
};

// This is a customised version of the getTiddlerList RSSAdaptor function
// We just apply the regex and print out to the output box
config.macros.regexTest.getTiddlerList = function(context,userParams) {
	if(!context.adaptor.store) {
		return RSSAdaptor.NotLoadedError;
	}
	var place = context.boxes.output_box;
	var regex_item = new RegExp(userParams.input_control,"mg");
	var item_match = context.adaptor.store.match(regex_item);
	// item_match will be an array
	if (item_match) {
		var result_string = "";
		for (var i=0; i<item_match.length; i++) {
			// Print out results to the output box
			result_string += item_match[i];
			result_string += "\n\n";
		}
		context.boxes.output_box.value = result_string;
	} else {
		displayMessage("error: check your regex");
	}
	return true;
};

//}}}