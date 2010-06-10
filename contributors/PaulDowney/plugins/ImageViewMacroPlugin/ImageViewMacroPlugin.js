/***
|''Name:''|ImageViewMacroPlugin|
|''Description:''|Provide a view macro to display image tiddlers using the ImageMacroPlugin |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ImageViewMacroPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ImageViewMacroPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config */
(function ($) {
    version.extensions.ImageViewMacroPlugin = {installed: true};

	// view macro for SVG image tiddlers
	config.macros.view.views.image = function (value, place, params, wikifier, paramString, tiddler) {
		config.macros.image.handler(place, "image", [tiddler.title, tiddler.fields.width, tiddler.fields.height, tiddler.fields.transform]);
	};

}(jQuery));
//}}}
