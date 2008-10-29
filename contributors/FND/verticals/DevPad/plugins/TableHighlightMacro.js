/***
|''Name''|TableHighlightMacro|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#TableHighlightMacro]]|
|''Version''|0.3|
|''Author''|FND|
|''License''|[[Creative Commons Attribution-Share Alike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|macro for highlighting elements on mouse-over (hover)|
!Usage Notes
* two options:
** add {{{<<tableHighlight [class tag]>>}}} to the desired tiddler(s)
** add as a macro to ViewTemplate: {{{<span macro='tableHighlight [class tag]'></span>}}}
!!Example
highlight table rows (using footer class for compatibility reasons): {{{<<tableHighlight "footer" "tr">>}}} <<tableHighlight "footer" "tr">>
!Revision History
!!v0.1 (2007-08-16)
* initial proof-of-concept implementation
!!v0.2 (2007-08-16)
* added shadow tiddler for styles
!!v0.3 (2007-08-16)
* added optional parameters for class name and target element
* replaced minimal shadow tiddler with {{{setStylesheet()}}} call
* greatly improved code efficiency (thanks Lewcid)
!To Do
* rename plugin (e.g. ElementHoverHighlightMacro?) => also rename dependencies (macro name, default class and style sheet)
* adjust Description and Usage Notes
!Code
***/
//{{{
config.macros.tableHighlight = {}
config.macros.tableHighlight.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	// process parameters
	var highlightClass = (params[0] && params[0] != "") ? params[0] : "tableHighlightActive";
	var targetElement = (params[1] && params[1] != "") ? params[1] : "td";
	// highlight elements
	var cells = story.findContainingTiddler(place).getElementsByTagName(targetElement);
	for(var i = 0; i < cells.length; i++) {
		cells[i].onmouseover = function() { addClass(this, highlightClass); };
		cells[i].onmouseout = function() { removeClass(this, highlightClass); };
	}
}

// set default styles
setStylesheet(".tableHighlightActive { "
	+ "background-color: " + store.getTiddlerSlice("ColorPalette", "SecondaryPale") + ";"
	+ " }",
	+ "StyleSheetTableHighlight");
//}}}