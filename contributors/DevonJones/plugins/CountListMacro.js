/***
|''Name:''|CountListMacro |
|''Version:''|<<getversion clist>> |
|''Date:''|<<getversiondate clist "DD MMM YYYY">> |
|''Source:''|http://www.tiddlyforge.net/pytw/#CountListMacro |
|''Author:''|[[DevonJones]] |
|''Type:''|List Macro Extension |
|''License:''|Copyright (c) 2005, Devon Jones. Licensed under the [[TiddlyWiki Plugin License|http://www.tiddlyforge.net/pytw/#TWPluginLicense]], all rights reserved. |
|''Requires:''|TiddlyWiki 1.2.32 or higher, TiddlyWiki 2.0.0 or higher|
!Description
Uses the TiddlyWiki ''list'' macros to return a count of elements in that list call.

!Syntax
* {{{<<clist all>>}}}
* {{{<<clist orphans>>}}}

!Sample Output
''Example:'' counts all orphan tiddlers.
{{{<<olist orphans>>}}}

<<clist orphans>>

!Known issues

!Notes
* Is known to work with Paul Petterson's ListWithTagsPlugin

!Revision history
v0.9.0 January 10th 2005 - initial release

!Code
***/
//{{{

version.extensions.clist = { major: 0, minor: 9, revision: 0, date: new Date(2006, 1, 10) };

config.macros.clist = {}

config.macros.clist.handler = function(place,macroName,params) {
	var type = params[0] ? params[0] : "all";
	var list = config.macros["list"];
	if(list[type].prompt) {
		createTiddlyElement(place, "span", null, "listTitle", list[type].prompt + ": ");
	}
	var results;
	if(list[type].handler) {
		results = list[type].handler(params);
	}
	createTiddlyElement(place, "span", null, "list", results.length);
}

//}}}
