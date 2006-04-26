/***
|''Name:''|OrderedListMacro |
|''Version:''|<<getversion olist>> |
|''Date:''|<<getversiondate olist "DD MMM YYYY">> |
|''Source:''|http://www.tiddlyforge.net/pytw/#OrderedListMacro |
|''Author:''|[[DevonJones]] |
|''Type:''|List Macro Extension |
|''License:''|Copyright (c) 2005, Devon Jones. Licensed under the [[TiddlyWiki Plugin License|http://www.tiddlyforge.net/pytw/#TWPluginLicense]], all rights reserved. |
|''Requires:''|TiddlyWiki 1.2.32 or higher, TiddlyWiki 2.0.0 or higher|
!Description
Uses the TiddlyWiki ''list'' macros to generate an Ordered (Numbered) List instead of an unordered list.

!Syntax
* {{{<<olist all>>}}}
* {{{<<olist orphans>>}}}

!Sample Output
''Example:'' lists all orphan tiddlers in reverse.
{{{<<olist orphans>>}}}

<<olist orphans>>

!Known issues

!Notes
* Is known to work with my ListReversePlugin and Paul Petterson's ListWithTagsPlugin

!Revision history
v0.9.0 October 19th 2005 - initial release
v0.9.1 October 20th 2005 - changed name to OrderedListMacro to better reflect purpose.

!Code
***/
//{{{

version.extensions.olist = { major: 0, minor: 9, revision: 1, date: new Date(2005, 9, 20) };

config.macros.olist = {}

config.macros.olist.handler = function(place,macroName,params) {
	var type = params[0] ? params[0] : "all";
	var list = config.macros["list"];
	var theList = document.createElement("ol");
	if(list[type].prompt) {
		createTiddlyElement(place, "span", null, "listTitle", list[type].prompt);
	}
	place.appendChild(theList);
	var results;
	if(list[type].handler) {
		results = list[type].handler(params);
	}
	for (t = 0; t < results.length; t++) {
		theListItem = document.createElement("li")
		theList.appendChild(theListItem);
		if(typeof results[t] == "string") {
			createTiddlyLink(theListItem, results[t], true);
		}
		else {
			createTiddlyLink(theListItem, results[t].title, true);
		}
	}
}

//}}}
