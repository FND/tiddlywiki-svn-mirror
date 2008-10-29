/***
|''Name''|ComputedStyleMacro|
|''Author''|FND|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#EvalMacro]]|
|''CodeRepository''|http://fnd.lewcid.org/svn/TiddlyWiki/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Description''|retrieves parent container's computed CSS properties|
!Usage
{{{
<<calcStyle "CSS property">>
}}}
!!Examples
<<calcStyle "height">>
<<calcStyle "font-size">>
!Revision History
!!v0.1 (2008-03-31)
* initial release
!Code
***/
//{{{
config.macros.calcStyle = {};
config.macros.calcStyle.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	wikify("; " + params[0] + "\n" + ": " + getStyle(place, params[0]), place);
};

// retrieve computed CSS property
// by Inge Jørgensen (http://www.elektronaut.no/articles/2006/06/07/computed-styles)
function getStyle(element, cssRule) {
	if(document.defaultView && document.defaultView.getComputedStyle) {
		var value = document.defaultView.getComputedStyle(element, "").getPropertyValue(
			cssRule.replace(/[A-Z]/g, function(match, char) { 
				return "-" + char.toLowerCase(); 
			})
		);
	}
	else if(element.currentStyle)
		var value = element.currentStyle[cssRule];
	else
		var value = false;
	return value;
}
//}}}