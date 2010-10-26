/***
|''Name:''|CharsetPlugin|
|''Description:''|Display a character set |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/CharsetPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/CharsetPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Produces a characterset, as used by http://fonts.tiddlyspace.com
&lt;&lt;charset&gt;&gt;
<<charset>>
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config createTiddlyElement createTiddlyText */
(function ($) {
	version.extensions.CharsetPlugin = {installed: true};

	function div(place, name, text) {
		var e = createTiddlyElement(place, 'div', null, null);
		e.setAttribute('class', name);
		return createTiddlyText(e, text);
	}
	function leg(low, high) {
		var text = "";
		for (var i = low; i <= high; i++) {
			text += String.fromCharCode(0x200b) + String.fromCharCode(i);
		}
		return text;
	}
	
	config.macros.charset = {};
	config.macros.charset.handler = function (place, macroName, params, wikifier, paramString, tiddler) {
		var e = createTiddlyElement(place, 'div', null, null);
		e.setAttribute('class', 'charset');
		div(e, "capitals", leg(0x41, 0x5A));
		div(e, "lowercase", leg(0x61, 0x7a));
		div(e, "digits", leg(0x30, 0x3A));
		div(e, "punctuation", leg(0x21, 0x2f)+leg(0x3b, 0x40)+leg(0x7b, 0x7e));
	};

}(jQuery));
//}}}
