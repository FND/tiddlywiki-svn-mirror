/***
|''Name:''|ImageMacroPlugin|
|''Description:''| macro to create an image using a tiddler field |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ImageMacroPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ImageMacroPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This macro was created to assist including images in a tiddler view template, where the source 
of an image is defined by a tiddler field:

&lt;&lt;image "http://tiddlywiki.com/fractalveg.jpg"&gt;&gt;

<<image "http://tiddlywiki.com/fractalveg.jpg">>

&lt;&lt;image "@image"&gt;&gt;

<<image @image>>

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config */
if (!version.extensions.ImageMacroPlugin) {
    version.extensions.ImageMacroPlugin = {installed: true};

	config.macros.image = {};
	config.macros.image.handler = function(place, macroName, params, wikifier, paramString,tiddler) {
        
        var value = params[0].match(/^@/) ? store.getValue(tiddler, params[0].substring(1))
			: value = params[0];

		var e = createTiddlyElement(place, 'img', null, null);
		e.setAttribute('src', value);
	}
}
//}}}
