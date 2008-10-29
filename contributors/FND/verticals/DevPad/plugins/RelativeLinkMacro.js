/***
|''Name''|RelativeLinkMacro|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#RelativeLinkMacro]]|
|''Version''|0.2|
|''Author''|FND|
|''License''|[[Creative Commons Attribution-Share Alike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|creates PrettyLinks relative to the current tiddler|
!Usage Notes
{{{
<<relLink "sub-tiddler" ["link title"]>>
}}}
!!Examples
* {{{<<relLink "SubTiddler">>}}}: <<relLink "SubTiddler">>
* {{{<<relLink "SubTiddler" "custom link title">>}}}: <<relLink "SubTiddler" "custom link title">>
!Revision History
!!v0.1 (2007-08-10)
* initial proof-of-concept implementation
!!v0.2 (2007-08-10)
* added optional parameter for link title
!To Do
* rename plugin(?)
* adjust description
!Code
***/
//{{{
config.macros.relLink = {}
config.macros.relLink.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	if(!params[1])
		var link = "[[" + tiddler.title + params[0] + "]]";
	else
		var link = "[[" + params[1] + "|" + tiddler.title + params[0] + "]]";
	wikify(link, place);
}
//}}}