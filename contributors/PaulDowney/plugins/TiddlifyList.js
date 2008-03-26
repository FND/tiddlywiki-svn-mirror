/***
|''Name:''|TiddlifyListPlugin|
|''Description:''|Assist constructing TiddlifyLists in a TiddlyWiki|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/Plugins/TiddlifyListPlugin.js |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.2|

turns a comma-separated list into a series of links to tiddlers
<<tiddlyfyList storeName>>

***/

//{{{
if(!version.extensions.TiddlifyList) {
version.extensions.TiddlifyList = {installed:true};

	config.macros.TiddlifyList= {};
	config.macros.TiddlifyList.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

		var value = store.getValue(tiddler,params[0]);
		var tokens = value.split(/\s*,\s*/);
		var text = "[[" + tokens.join("]], [[") + "]]";
		wikify(text,place);
	};

} //# end of 'install only once'
//}}}
