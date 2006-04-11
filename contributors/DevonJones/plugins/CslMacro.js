/***
|''Name:''|CslMacro |
|''Version:''|<<getversion csl>> |
|''Date:''|<<getversiondate csl "DD MMM YYYY">> |
|''Source:''|http://www.legolas.org/gmwiki/dev/gmwikidev.html#CslMacro |
|''Author:''|[[DevonJones]] |
|''Type:''|List Macro Extension |
|''License:''|Copyright (c) 2005, Devon Jones. Licensed under the [[TiddlyWiki Plugin License|http://www.tiddlyforge.net/pytw/#TWPluginLicense]], all rights reserved. |
|''Requires:''|TiddlyWiki 1.2.32 or higher, TiddlyWiki 2.0.0 or higher|
!Description
Uses the TiddlyWiki ''list'' macros to generate Comma Seperated Lists of tiddlers instead of html unordered lists.

!Syntax
* {{{<<csl all>>}}}
* {{{<<csl orphans>>}}}

!Sample Output
''Example:'' lists all orphan tiddlers in reverse.
{{{<<csl orphans>>}}}

<<csl orphans>>

!Known issues

!Notes
* Is known to work with my ListReversePlugin and Paul Petterson's ListWithTagsPlugin

!Revision history
v0.9.0 October 19th 2005 - initial release
v0.9.1 October 20th 2005 - changed name to CslMacro to better reflect purpose.
v0.9.2 February 3rd 2006 - fix for Firefox 1.5.0.1

!Code
***/
//{{{
version.extensions.csl = { major: 0, minor: 9, revision: 2, date: new Date(2006, 2, 3) };

config.macros.csl = {}

config.macros.csl.handler = function(place, macroName, params) {
	var type = params[0] ? params[0] : "all";
	var list = config.macros["list"];

	/*if(list[type].prompt) {
		createTiddlyElement(place, "span", null, "listTitle", list[type].prompt);
	}*/
	var results;
	if(list[type].handler) {
		results = list[type].handler(params);
	}
	for(var t = 0; t < results.length; t++) {
		if(typeof results[t] == "string") {
			createTiddlyLink(place,results[t],true);
		}
		else {
			createTiddlyLink(place, results[t].title, true);
		}
		if(t < results.length - 1) {
			var element = createTiddlyElement(place, "span", null, null, ", ");
		}
	}
}

//}}}