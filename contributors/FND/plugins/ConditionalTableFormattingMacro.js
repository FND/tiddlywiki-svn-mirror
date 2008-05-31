/***
|''Name''|ConditionalTableFormattingMacro|
|''Description''|apply formatting based on table contents|
|''Author''|FND|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#EvalMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Usage
{{{
<<conditionalTableFormatting matchValue className [row]>>
}}}
!!Parameters
|!Index|!Description|!Optional|!Default Value|
|1|value to search for|no|N/A|
|2|class to apply to matching elements|no|N/A|
|3|apply class to individual cells or the entire row|yes|cell|
!!Examples
<<<
|foo|bar|baz|
<<conditionalTableFormatting "bar" "annotation">>
<<<
<<<
|1|2|3|
|lorem|ipsum|dolor|
|foo|bar|baz|
<<conditionalTableFormatting "lorem" "annotation" "row">>
<<<
!Notes
The first table within the respective container (usually a tiddler) is used.
In order to target a different table, a CSS class wrapper can be used:
{{{
 {{dummyClass{
 |foo|bar|baz|
 }}}
}}}
!Revision History
!!v0.1 (2008-05-30)
* initial release
!To Do
* allow for multiple cases in a single macro call
* option for combining matching conditions (boolean operators?)
* add option to target respective column
* add option for RegEx matching
!Code
***/
//{{{
config.macros.conditionalTableFormatting = {};

config.macros.conditionalTableFormatting.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	// process parameters
	var match = params[0];
	var className = params[1];
	var target = (params[2] === "row") ? "row" : "cell";
	// retrieve table cells
	var table = place.getElementsByTagName("table")[0];
	var cells = table.getElementsByTagName("td");
	for(var i = 0; i < cells.length; i++) {
		var text = cells[i].innerText || cells[i].textContent;
		if(text === match) {
			addClass((target === "row") ? cells[i].parentNode : cells[i], className);
		}
	}
};
//}}}