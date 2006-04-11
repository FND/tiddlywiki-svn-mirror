/***
|''Name:''|ListReversePlugin |
|''Version:''|0.9.0 |
|''Source:''|http://www.legolas.org/gmwiki/dev/gmwikidev.html#ListReversePlugin |
|''Author:''|[[DevonJones]] |
|''Type:''|List Macro Extension |
|''License:''|Copyright (c) 2005, Devon Jones. Licensed under the [[TiddlyWiki Plugin License|http://www.tiddlyforge.net/pytw/#TWPluginLicense]], all rights reserved. |
|''Requires:''|TiddlyWiki 1.2.32 or higher, TiddlyWiki 2.0.0 or higher|
!Description
Extends the TiddlyWiki ''list'' macro by adding the capability to reverse the order of any other list macro.

!Syntax
* {{{<<list reverse all>>}}}
* {{{<<list reverse orphans>>}}}

!Sample Output
''Example:'' lists all orphan tiddlers in reverse.
{{{<<list reverse orphans>>}}}
<<list reverse orphans>>

!Known issues

!Notes
* Is known to work with my CslPlugin and Paul Petterson's ListWithTagsPlugin

!Revision history
v0.9.0 October 19th 2005 - initial release

!Code
***/
//{{{

config.macros.list.reverse = {}

config.macros.list.reverse.handler = function(params) {
	var list = config.macros["list"];
	params.shift();
	var type = params[0] ? params[0] : "all";
	results = list[type].handler(params);
	results = results.sort( function(a,b) {
		if(a["title"] != null) {
			return ( a["title"] < b["title"] ) - (a["title"] > b["title"] )
		}
		else {
			return (a < b) - (a > b);
		}
	});
	return results;
}

//}}}