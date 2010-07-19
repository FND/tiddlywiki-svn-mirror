/***
|''Name:''|ImageFieldMacro|
|''Description:''| @@@Description@@@ |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ImageFieldMacro/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ImageFieldMacro/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation

This macro was created to assist including images in a tiddler view template, where the source 
of an image is defined by a tiddler field:

&lt;&lt;imageField "http://tiddlywiki.com/fractalveg.jpg"&gt;&gt;

<<imageField "http://tiddlywiki.com/fractalveg.jpg">>

&lt;&lt;imageField "field:image"&gt;&gt;

<<imageField field:image>>
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config store createTiddlyElement */
(function ($) {
	version.extensions.ImageFieldMacro = {installed: true};

	config.macros.imageField = {};
	config.macros.imageField.handler = function (place, macroName, params, wikifier, paramString, tiddler) {

		var value = params[0].match(/^field:/) ? store.getValue(tiddler, params[0].substring(6))
			: params[0];

		var e = createTiddlyElement(place, 'img', null, null);
		e.setAttribute('src', value);
	};

}(jQuery));
//}}}
