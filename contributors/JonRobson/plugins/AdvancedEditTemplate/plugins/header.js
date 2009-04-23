/***
|''Name:''|AdvancedEditTemplatePlugin based on ValueSwitcherPlugin|
|''Description:''|Gather values from a definition tiddler, and present the user with a UI for setting a value from those available options as an extende field |
|''Version:''|0.4|
|''Date:''|02 March 2009|
|''Source:''|http://www.jonrobson.me.uk|
|''Author:''|Jon Robson : based on the work by PhilHawksworth (phawksworth (at) gmail (dot) com)|
|''License:''|[[BSD open source license]]|
|''CoreVersion:''|2.3|

Allows the adding of multiple level drop down menus and checkboxes to the edit template.
***/

//{{{
// Ensure that this Plugin is only installed once.

// create macro object
(function($) { // set up alias

config.macros.FileTree = { 
 
  // Add a handler function to be invoked by <<listnav TiddlerTitle>> 
  handler: function(place, macroName, params, wikifier, paramString, tiddler) {
 	var el = document.createElement("div");
	try{
	var p = paramString.parseParams();
	var connector= getParam(p,"connector");
	$(el).fileTree({ root: 'images/', script: connector }, function(file) { 
				//alert(file);
			});
	}
	catch(e){
		console.log(e);
	}		
	place.appendChild(el);
  }
};