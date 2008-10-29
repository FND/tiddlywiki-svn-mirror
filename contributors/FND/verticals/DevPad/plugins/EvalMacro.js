/***
|''Name''|EvalMacro|
|''Version''|0.96|
|''Status''|stable|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#EvalMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|Allows executing JavaScript code to return computed values.|
!Usage
{{{
<<eval [code] [mode]>>
}}}
* {{{<<eval {{code}}>>}}}
** if no mode is specified, the first parameter's contents will be wikified
** through the use evaluated parameters, calculations can be performed within this parameter
* {{{<<eval [[code]] "scriptMode">>}}}
** if "scriptMode" is specified, the contents of the first parameter will be evaluated in place, proving access to local variables like the tiddler object
** no output is generated in this mode by default, though the {{{wikify()}}} function can be used for that
!!Examples
<<eval {{
	var dateFormat = "YYYY-0MM-0DD 0hh:0mm";
	var now = new Date;
	"time: " + now.formatString(dateFormat);
}}>>
<<eval
	[[
	var dateFormat = "YYYY-0MM-0DD";
	var title = tiddler.title;
	var author = tiddler.modifier;
	var date = tiddler.modified.formatString(dateFormat);
	wikify(title + ": " + author + ", " + date, place);
	]]
	"scriptMode"
>>
!Revision History
!!v0.9 (2007-10-14)
* initial release
!!v0.95 (2007-12-23)
* introduced script mode
!!v0.96 (2008-04-18)
* bugfix regarding type conversion
!Code
***/
//{{{
config.macros.eval = {};
config.macros.eval.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	if(params[1] == "scriptMode")
		eval(params[0]);
	else
		wikify(params[0].toString(), place);
}
//}}}