/***
|''Name''|ButtonMemoryMacro|
|''Version''|0.2|
|''Status''|@@experimental@@|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#ButtonMemoryMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|creates a list of buttons and remembers the order they were clicked in|
!Usage
{{{
<<btnmem "[button 1 label];[button 2 label];[button 3 label] ...">>
}}}
!!Example
<<btnmem "foo;bar;baz">>
!Revision History
!!v0.1 (2007-12-20)
* initial release
!!v0.2 (2007-12-21)
* added configuration options
* changed parameter processing
* selection buttons now update output
!To Do
* rename
* named macro parameters for config items
* code sanitzing
* documentation
* allow for more than one instance at a time (due to global selection array and output container)
!Code
***/
//{{{
config.macros.btnmem = {
	resetLabel: "reset",
	submitLabel: "submit",
	itemSeparator: ";",
	itemPrefix: "* ",
	itemSuffix: "\n",
	outputID: "btnMemOutput",
	itemButtonClass: "button btnMemItemBtn",
	functionButtonClass: "button btnMemFunctionBtn",
	selectionBoxClass: "btnMemSelectionBox",
	functionBoxClass: "btnMemFunctionBox",
	selection: []
};

config.macros.btnmem.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	// create selection buttons
	if(params[0]) var items = params[0].split(this.itemSeparator);
	var e = createTiddlyElement(place, "div", null, this.selectionBoxClass);
	for(var i = 0; i < items.length; i++) {
		createTiddlyButton(e, items[i], null,
			function() { config.macros.btnmem.extendSelection(this.firstChild.nodeValue); },
			this.itemButtonClass);
	}
	// create function buttons
	e = createTiddlyElement(place, "div", null, this.functionBoxClass);
	createTiddlyButton(e, this.resetLabel, null,
		function() { config.macros.btnmem.resetResults(); },
		this.functionButtonClass);
	createTiddlyButton(e, this.submitLabel, null,
		function() { config.macros.btnmem.submitResults(); },
		this.functionButtonClass);
	// create output container -- DEBUG: reuse place instead!?
	config.macros.btnmem.output = createTiddlyElement(place, "div", this.outputID);
}

config.macros.btnmem.extendSelection = function(str) {
	this.selection.push(str);
	var output = "";
	var e = document.getElementById(this.outputID);
	if(e) {
		e.innerHTML = "";
		for(var i = 0; i < this.selection.length; i++) {
			output += this.itemPrefix + this.selection[i] + this.itemSuffix;
		}
		wikify(output.trim(), e);
	}
}

config.macros.btnmem.resetResults = function() {
	this.selection = [];
	var e = document.getElementById(this.outputID);
	if(e) e.innerHTML = "";
}

config.macros.btnmem.submitResults = function() {
	var output = config.macros.btnmem.selection;
	this.resetResults();
	var e = document.getElementById(this.outputID);
	if(e) wikify("submitting selection:\n" + output.join(), e);
}
//}}}