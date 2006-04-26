/***
This plugin requires altering tiddlywiki.html, so I have put it in it's own wiki at http://www.tiddlyforge.net/pytw/gmap.html
***/

/***
|''Name:''|GmapMacro |
|''Version:''|<<getversion gmap>> |
|''Date:''|<<getversiondate gmap "DD MMM YYYY">> |
|''Source:''|http://www.tiddlyforge.net/pytw#GmapMacro |
|''Author:''|[[DevonJones]] |
|''Type:''|Macro |
|''License:''|Copyright (c) 2005, Devon Jones. Licensed under the [[TiddlyWiki Plugin License|http://www.tiddlyforge.net/pytw/#TWPluginLicense]], all rights reserved. |
|''Requires:''|TiddlyWiki 1.2.32 or higher (tested only on 1.2.37, but should work on 1.2.32)|
!Description
displays a google map of the given coordinants

!Syntax
{{{<<gmap longitude latitude [zoom]>>}}}

!Sample Output
<<gmap -104.962335 39.740253>>
!Known issues

!Notes

!Installation
Gmap is harder to install then a normal plugin.

Steps:
# Install the GmapMacro as usual
# Go to [[Google|http://www.google.com/apis/maps/]] to sign up for a map key
# Open up tiddlywiki in a text editor, at the top of the file, right under </script> (line 4), add 
{{{
<script src="http://maps.google.com/maps?file=api&v=1&key=###YOUR KEY###" type="text/javascript"></script>
}}}

!Revision history
v0.9.0 November 2nd 2005 - initial release

!Code
***/
//{{{
version.extensions.gmap = { major: 0, minor: 9, revision: 0, date: new Date(2005, 11, 2) };

config.macros.gmap = {}
config.macros.gmap.handler = function(place, macroName, params) {
	var element = createTiddlyElement(place, "div", "map", null, "");
	element.style.width = "300px";
	element.style.height = "300px";
	
	zoom = 4
	if(params.length >= 3) {
		zoom = params[2]
	}
	
	if (GBrowserIsCompatible()) {
		var map = new GMap(document.getElementById("map"));
		map.addControl(new GSmallMapControl());
		map.addControl(new GMapTypeControl());
		map.centerAndZoom(new GPoint(params[0], params[1]), zoom);
	}
}

//}}}
