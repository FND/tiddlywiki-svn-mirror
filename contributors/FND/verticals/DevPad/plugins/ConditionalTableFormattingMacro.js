/***
|''Name''|ConditionalTableFormattingMacro|
|''Description''|apply formatting based on table contents|
|''Author''|FND|
|''Version''|0.2|
|''Status''|@@experimental@@|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#EvalMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Usage
{{{
<<conditionalTableFormatting [cell|row] matchValue className>>
}}}
!!Parameters
|!Index|!Description|!Optional|!Default Value|
|1|case #1: value to search for|no|N/A|
|2|case #1: class to apply to matching elements|no|N/A|
|3|case #1: apply class to individual cells or the entire row|yes|cell|
|4|case #2: value to search for|yes|N/A|
|5|case #2: class to apply to matching elements|yes|N/A|
|6|case #2: apply class to individual cells or the entire row|yes|cell|
|7|...|yes|N/A|
|8|...|yes|N/A|
|9|...|yes|cell|
|10|case #//n//: value to search for|yes|N/A|
|11|case #//n//: class to apply to matching elements|yes|N/A|
|12|case #//n//: apply class to individual cells or the entire row|yes|cell|
!!Examples
<<<
|foo|bar|baz|
<<conditionalTableFormatting "" "bar" "header">>
<<<
<<<
|1|2|3|
|lorem|ipsum|dolor|
|foo|bar|baz|
<<conditionalTableFormatting "row" "lorem" "header" "cell" "2" "wizard">>
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
!!v0.2 (2008-06-01)
* significant changes to accommodate multiple cases per macro call
!To Do
* documentation
* option for combining matching conditions (boolean operators?)
* add option to target respective column
* add option for RegEx matching
!Code
***/
//{{{
config.macros.conditionalTableFormatting = {};

config.macros.conditionalTableFormatting.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	while(params.length) {
		// process parameters
		var target = (params.shift() === "row") ? "row" : "cell";
		var match = params.shift();
		var className = params.shift();
		// retrieve table cells
		var table = place.getElementsByTagName("table")[0];
		var cells = table.getElementsByTagName("td");
		for(var i = 0; i < cells.length; i++) {
			var text = cells[i].innerText || cells[i].textContent;
			// apply conditional formatting
			if(text === match) {
				addClass((target === "row") ? cells[i].parentNode : cells[i], className);
			}
		}
	}
};
//}}}