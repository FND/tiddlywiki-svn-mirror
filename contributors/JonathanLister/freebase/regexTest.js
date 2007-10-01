/***
The concept with this is to use the RSSAdaptor in a controlled environment to debug any regex problems
I'll create a RSSAdaptor, open the xml file and apply the regex to it
The xml file comes from the 1st macro parameter, the regex from the 2nd 
***/

//{{{

config.macros.regex_test = {};

// As we're communicating between a UI and the macro, use the context object to store macro variables
config.macros.regex_test.context = {};

config.macros.regex_test.handler = function(place,macroName,params) {

	// Make sure the macro context knows about place...
	this.context.place = place;
	// ...and the UI does too
	this.queryEditor(place,params);

};

config.macros.regex_test.go = function(boxes,userParams) {

	this.context.adaptor = new RSSAdaptor();
	this.context.boxes = boxes;
	this.context.host = userParams.input_url;
	this.context.regex_item = new RegExp(userParams.input_regex,"mg");

	var ret = this.context.adaptor.openHost(this.context.host,this.context,userParams,this.onOpenHost);
	if (!ret) {
		displayMessage("problem opening host: " + ret);
		return false;
	}
	return typeof(ret) == "string" ? ret : true;

};

// Display the input text and proceed
config.macros.regex_test.onOpenHost = function(context,userParams) {
	createTiddlyText(context.boxes.input_box,context.adaptor.store);
	// Next line calls custom version of the adaptor's getTiddlerList to allow for user-defined regex
	var ret = config.macros.regex_test.getTiddlerList(context,userParams);
	if (typeof(ret) == "string") {
		displayMessage("problem opening tiddler list: " + ret);
	}
};

// This is a customised version of the getTiddlerList RSSAdaptor function
// We just apply the regex and print out to the output box
config.macros.regex_test.getTiddlerList = function(context,userParams)
{
	if(!context.adaptor.store) {
		return RSSAdaptor.NotLoadedError;
	}
	var place = context.boxes.output_box;
	var label = context.boxes.output_box_label;
	// regex_item matches on the items
	// RSSAdaptor regex:
	// var regex_item = /<item>(.|\n)*?<\/item>/mg;
	// var regex_item = new RegExp(userParams[1],"mg");
	var item_match = context.adaptor.store.match(userParams.input_regex);
	// Print out results to the output box
	var header = "for regex: " + userParams.input_regex;
	label.childNodes[0].data += " " + header;
	// item_match will be an array
	for (var i=0; i<item_match.length; i++) {
		createTiddlyText(place,item_match[i]);
	}

	return true;
};

//}}}


// UI FUNCTION, no access to 'place'
config.macros.regex_test.queryEditorOnClick = function() {

// The onclick function for the UI
var boxes = {};
boxes.regex_editor = document.getElementById("regex_editor");
boxes.input_box = document.getElementById("input_box");
boxes.input_url = document.getElementById("input_url");
boxes.regex_box = document.getElementById("regex_box");
boxes.output_box = document.getElementById("output_box");
boxes.output_box_label = boxes.output_box.previousSibling.previousSibling;

var userParams = {};
userParams.input_text = boxes.input_box.value;
userParams.input_regex = boxes.regex_box.value;
if(boxes.input_url.value) {
	userParams.input_url = boxes.input_url.value;
} else {
	displayMessage("error: check input url!");
}

if(userParams.input_url) {
	config.macros.regex_test.go(boxes,userParams);
} // else ?

};

// Visual query builder function
config.macros.regex_test.queryEditor = function(place,params) {
	
	// Some code to insert the appropriate styles into StyleSheet tiddler
	/** var newbody = "div.metaweb #q, div.metaweb #r { width: 400px; height: 300px; border-width:0px;padding:5px;} \n" +
		"div.metaweb th {background-color:black; color:white; font:bold 12pt sans-serif;} \n" +
		"div.metaweb td.border,div.metaweb th {border:solid black 3px;} \n" +
		"div.metaweb input { margin: 5px; font-weight: bold; } \n" +
		"div.metaweb table { border-collapse: collapse;}";
	store.saveTiddler("StyleSheet","StyleSheet",newbody); **/
	
	var default_url = params[0] ? params[0] : "http://";
	var default_regex = params[1] ? params[1] : / /mg;
	
	var regex_editor = createTiddlyElement(place,"div","regex_editor");
	var input_url_label = createTiddlyElement(regex_editor,"span",null,null,"Please input a url to grab a document from");
	createTiddlyElement(regex_editor,"br");
	var input_url = createTiddlyElement(regex_editor,"input","input_url");
	input_url.setAttribute("size","50");
	input_url.setAttribute("value",default_url);
	createTiddlyElement(regex_editor,"br");
	var regex_box_label = createTiddlyElement(regex_editor,"span",null,null,"Please input a regex to apply");
	createTiddlyElement(regex_editor,"br");
	var regex_box = createTiddlyElement(regex_editor,"input","regex_box");
	regex_box.setAttribute("size","50");
	regex_box.setAttribute("value",default_regex);
	createTiddlyElement(regex_editor,"br");
	var regex_go_button = createTiddlyElement(regex_editor,"input","regex_go_button");
	regex_go_button.setAttribute("type","button");
	regex_go_button.setAttribute("value","Go regex!");
	regex_go_button.setAttribute("onclick","config.macros.regex_test.queryEditorOnClick()");
	createTiddlyElement(regex_editor,"br");
	var input_box_label = createTiddlyElement(regex_editor,"span",null,null,"The input document");
	createTiddlyElement(regex_editor,"br");
	var input_box = createTiddlyElement(regex_editor,"textarea","input_box");
	input_box.setAttribute("cols","50");
	input_box.setAttribute("rows","30");
	createTiddlyElement(regex_editor,"br");
	var output_box_label = createTiddlyElement(regex_editor,"span",null,null,"The results");
	createTiddlyElement(regex_editor,"br");
	var output_box = createTiddlyElement(regex_editor,"textarea","output_box");
	output_box.setAttribute("cols","50");
	output_box.setAttribute("rows","30");
	
};

// Utility function to clear a box
config.macros.regex_test.clearBox = function(box) {
	if (box.hasChildNodes()) {
		var count=box.childNodes.length;
		for (var i=0;i<count;i++) {
			box.removeNode(box.childNodes[0]);
		}
	}
};
