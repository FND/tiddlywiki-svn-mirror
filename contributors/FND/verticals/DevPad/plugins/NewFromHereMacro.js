/***
|''Name''|NewFromHereMacro|
|''Version''|0.9|
|''Status''|stable|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#NewFromHereMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|Creates a new tiddler, using the originating tiddler's title as a prefix.|
!Note
This macro is based upon the [[NewHerePlugin|http://mptw.tiddlyspot.com/#NewHerePlugin]].
!Usage
{{{
<<newFromHere [parameters]>>
}}}
Parameter handling is identical to the [[NewTiddler|http://www.tiddlywiki.com/#NewTiddlerMacro]] macro.
!!Example
<<newFromHere>>
<<newFromHere label:"new tiddler from here">>
!Revision History
!!v0.9 (2007-12-27)
* initial release
!To Do
* custom separator character
* optional default tag
!Code
***/
//{{{
config.macros.newFromHere = {
	separator: ": "
};

config.macros.newFromHere.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	wikify("<<newTiddler " + paramString + " title:[[" + tiddler.title + this.separator + "]]>>",
		place,null,tiddler);
};
//}}}