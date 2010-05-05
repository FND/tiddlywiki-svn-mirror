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

	<<XMLReader "http://whatfettle.com/2008/07/XMLReaderPlugin/data/one.xml" "LOAD" "Load Test XML File" "id" "record" >>

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config alert createTiddlyButton doHttp */
(function ($) {
    version.extensions.XMLReaderPlugin = {installed: true};

	config.macros.XMLReader = {
		handler: function (place, macroName, params) {
			var url = params[0];
			var label = params[1] || "load";
			var prompt = params[2] || "load XML file";
			var context = {
				id: params[3],
				row: params[4],
			};
			createTiddlyButton(place, label, prompt, function () {
				var ret = doHttp('GET', url, null, null, null, null, function (status, context, responseText, url, xhr) {
					var rows = xhr.responseXML.getElementsByTagName(context.row);
					var getVal = function (node, tag, def) {
						return node.getElementsByTagName(tag)[0].textContent || def;
					};
					for (var i = 0; i < rows.length; i++) {
						var row = rows[i];
						var title = getVal(row, context.id, "node");
						var tiddler = store.createTiddler(title);
					}
				}, context, {}, true);
			});
		}
	};

}(jQuery));
//}}}
