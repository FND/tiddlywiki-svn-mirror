/***
|''Name:''|TiddlifyListPlugin|
|''Description:''|Convert a comma separated list into Tiddler references |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/TiddlifyListPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TiddlifyListPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Originally developed for [[RippleRap|http://ripplerap.com]], the tiddlifyList macro turns a field containing comma-separated list into a series of links to tiddlers, for example:

&lt;&lt;TiddlifyList members&gt;&gt;
<<TiddlifyList members>>

where {{{members}}} is an extended field on the current tiddler.

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config store wikify */
if (!version.extensions.TiddlifyListPlugin) {
    version.extensions.TiddlifyListPlugin = {installed: true};

	config.macros.TiddlifyList = {};
	config.macros.TiddlifyList.handler = function (place, macroName, params, wikifier, paramString, tiddler) {

		var value = store.getValue(tiddler, params[0]);
		var tokens = value.split(/\s*,\s*/);
		var text = "[[" + tokens.join("]], [[") + "]]";
		wikify(text, place);
	};
}
//}}}

