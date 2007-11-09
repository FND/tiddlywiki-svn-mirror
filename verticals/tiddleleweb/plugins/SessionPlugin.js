/***
|''Name:''|SessionPlugin|
|''Description:''|Macros to support session|
|''Author:''|My Name|
|''Source:''|http://www.MyWebSite.com/#SessionPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MyDirectory/plugins/SessionPlugin.js |
|''Version:''|0.0.1|
|''Status:''|Not for release - this is a template for creating new plugins|
|''Date:''|July 31, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

To make this example into a real TiddlyWiki adaptor, you need to:

# Globally search and replace SessionPlugin with the name of your plugin
# Globally search and replace example with the name of your macro
# Update the header text above with your description, name etc
# Do the actions indicated by the !!TODO comments, namely:
## Write the code for the macro

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SessionPlugin) {
version.extensions.SessionPlugin = {installed:true};

config.macros.sessionAnnotation = {};
config.macros.sessionAnnotation.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var title = tiddler.title;
	var wikitext = "''Speaker:''" + store.getTiddlerSlice(title,"speaker") + "<br/>" +
	"''From:''" + store.getTiddlerSlice(title,"start") + "<br/>" +
	"''To:''" + store.getTiddlerSlice(title,"end");
	wikify(wikitext,place,highlightHack,tiddler);
};

config.macros.sessionNotes = {};
config.macros.sessionNotes.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var title = tiddler.title;
	var wikitext = "Display the session notes here";
	wikify(wikitext,place,highlightHack,tiddler);
};
} //# end of 'install only once'
//}}}
