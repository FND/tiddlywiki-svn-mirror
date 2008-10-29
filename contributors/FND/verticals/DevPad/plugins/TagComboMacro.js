/***
|''Name''|TagComboMacro|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#TagComboMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|returns a list of tiddlers matching a combination of tags|
!Usage
{{{
<<tagcombo [tag1] [tag2] [tag3] ... >>
}}}
!!Example
<<tagcombo [[systemConfig]] [[plugins]]>>
!Revision History
!!v0.1 (2007-11-30)
* initial release
!To Do
* rename
* remove excessive spacing (i.e. replace {{{.join()}}} with {{{for()}}} loop!?)
* custom output format (e.g. comma-separated list)
!Code
***/
//{{{
config.macros.tagcombo = {};
config.macros.tagcombo.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var r = [];
	var t = store.getTaggedTiddlers(params[0]);
	for(var i = 0; i < t.length; i++) {
		if(t[i].tags.containsAll(params)) {
			r.push(t[i].title);
		}
	}
	wikify("* [[" + r.join("]]\n* [[") + "]]", place);
}
//}}}