/***
|''Name:''|XMLReaderPlugin|
|''Description:''|Read and explode an XML file into Tiddlers |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/XMLReaderPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/XMLReaderPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin generates tiddlers from a [[jqGrid|http://www.trirand.com/blog/]] style service.

	<<XMLReader "" />>

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config alert createTiddlyButton */
(function ($) {
    version.extensions.XMLReaderPlugin = {installed: true};

	config.macros.XMLReader = {
		handler: function (place, macroName, params) {
			var url = params[1];
			var label = params[2] || "load";
			var prompt = params[3] || "load XML file";
			createTiddlyButton(place, label, prompt, function () {
				alert("hello!");
			});
		}
	};

}(jQuery));
//}}}
