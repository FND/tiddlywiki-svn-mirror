/***
|''Name''|TagBoxToggleMacro|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#TagBoxToggleMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Description''|toggles the visibility of the respective tiddler's tag box|
!Usage
{{{
<<taggedToggle
	[class name]
	[button label]
	[button tooltip]
	[button class]
	[button access key]
	[startup mode]
>>
}}}
!!Example
<<taggedToggle "" "" "" "" "" "hide">>
!Revision History
!!v0.1 (2007-12-20)
* initial release
!To Do
* documentation
!Code
***/
//{{{
config.macros.taggedToggle = {
	className: "tagged",
	label: "Toggle Tagged",
	prompt: "Switch tag box on and off",
	buttonClass: "",
	accessKey: ""
};

config.macros.taggedToggle.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	// process command line parameters
	var className = params[0] || this.className;
	var label = params[1] || this.label;
	var prompt = params[2] || this.prompt;
	var buttonClass = params[3] || this.buttonClass;
	var accessKey = params[4] || this.accessKey;
	// startup mode
	var t = story.findContainingTiddler(place);
	if(params[5] == "hide") {
		this.toggle(t, className);
	}
	// create toggle button
	createTiddlyButton(place, label, prompt,
		function() { config.macros.taggedToggle.toggle(t, className); },
		buttonClass, null, accessKey);
};

config.macros.taggedToggle.toggle = function(el, className) {
	if(el) {
		els = getElementsByClass(className, el);
		if(els[0].style.display != "none") {
			els[0].style.display = "none";
		} else {
			els[0].style.display = "";
		}
	}
};

/* by Dustin Diaz (http://www.dustindiaz.com/getelementsbyclass/) */
function getElementsByClass(searchClass,node,tag) {
	var classElements = new Array();
	if ( node == null )
		node = document;
	if ( tag == null )
		tag = '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("(^|\\\\s)"+searchClass+"(\\\\s|$)");
	for (i = 0, j = 0; i < elsLen; i++) {
		if ( pattern.test(els[i].className) ) {
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
}
//}}}