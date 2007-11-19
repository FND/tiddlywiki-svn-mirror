/***
|''Name:''|SessionPlugin|
|''Description:''|Macros to support session|
|''Author:''|MartinBudden|
|''Source:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/SessionPlugin.js|
|''CodeRepository:''|see Source above|
|''Version:''|0.0.1|
|''Status:''|Not for release - this is a template for creating new plugins|
|''Date:''|July 31, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

To make this example into a real TiddlyWiki adaptor, you need to:

***/

//{{{
if(!version.extensions.SessionPlugin) {
version.extensions.SessionPlugin = {installed:true};

config.macros.sessionAnnotation = {};
config.macros.sessionAnnotation.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var title = tiddler.title;
	createTiddlyElement(place,'span', null, 'time', store.getTiddlerSlice(title,"start") + " - " + store.getTiddlerSlice(title,"end"));
	createTiddlyElement(place,'span', null, 'speaker', store.getTiddlerSlice(title,"speaker"));
	createTiddlyElement(place,'div', null, 'synopsis', store.getTiddlerSlice(title,"synopsis"));
};

config.macros.sessionNotes = {};
config.macros.sessionNotes.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	// just output each note in a list for the moment
	var ct = tiddler.title;
	var ul = null;
	store.forEachTiddler(function(title,tiddler) {
		if(title.startsWith(ct) && ct!=title) {
			if(!ul)
				ul = createTiddlyElement(place,'ul');
			var li = createTiddlyElement(ul,'li');
			var wikitext = tiddler.text;
			wikify(wikitext,li,highlightHack,tiddler);
		}
	});
};
} //# end of 'install only once'
//}}}