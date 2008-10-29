/***
|''Name''|BlockCollapseMacro|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#BlockCollapseMacro]]|
|''Version''|0.3|
|''Author''|FND|
|''License''|[[Creative Commons Attribution-Share Alike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|macro for collapsing/expanding block elements' height on click|
!Usage Notes
* two options:
** add {{{<<blockCollapse [class] [tag]>>}}} to the desired tiddler(s)
** add as a macro to ViewTemplate: {{{<span macro='blockCollapse [class] [tag]'></span>}}}
!!Example
{{{<<blockCollapse "footer" "h1">>}}} <<blockCollapse "footer" "h1">> /% DEBUG: not working here %/
!Revision History
!!v0.3 (2007-08-17)
* adapted from [[TableHighlightMacro|http://devpad.tiddlyspot.com/#TableHighlightMacro]]
!To Do
* rename plugin => also rename dependencies (macro name, default class and style sheet)
* fix/remove DEBUG flags
* adjust Description and Usage Notes
!Code
***/
//{{{
config.macros.blockCollapse = {}
config.macros.blockCollapse.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	// process parameters
	var collapseClass = (params[0] && params[0] != "") ? params[0] : "blockCollapse";
	var targetElement = (params[1] && params[1] != "") ? params[1] : "pre";
	// toggle collapsing
	var els = story.findContainingTiddler(place).getElementsByTagName(targetElement);
	for(var i = 0; i < els.length; i++) {
		els[i].onclick = function() {
			config.macros.blockCollapse.toggleCollapse(this, collapseClass);
		};
	}
}

config.macros.blockCollapse.toggleCollapse = function(el, customClass) {
	if(!hasClass(el, customClass)) {
		addClass(el, customClass);
		//el.style.height = "1em !important"; // DEBUG
		//el.style.border = "10px dashed #F00 !important"; // DEBUG 
	} else {
		removeClass(el, customClass);
		//el.style.height = ""; // DEBUG
		//el.style.border = ""; // DEBUG
	}
}

// set default styles
setStylesheet(".blockCollapse { "
	+ "height: 1em !important; "
	+ "border: 10px dashed #0F0 !important; " // DEBUG
	+ "overflow: hidden !important; " // DEBUG
	+ "}",
	"StyleSheetBlockCollapse");
//}}}