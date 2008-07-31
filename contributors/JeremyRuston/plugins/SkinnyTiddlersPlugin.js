/***
|''Name:''|SkinnyTiddlersPlugin.js|
|''Description:''|Adds support for config.skinnyTiddlers which show up timelines and other contexts |
|''Author:''|Jeremy Ruston (jeremy (at) osmosoft (dot) com)|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/JeremyRuston/plugins/SkinnyTiddlersPlugin.js|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JeremyRuston/plugins/SkinnyTiddlersPlugin.js|
|''Version:''|0.0.9|
|''Status:''|Under Development|
|''Date:''|July 31, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|BSD|
|''~CoreVersion:''|2.4.0|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SkinnyTiddlersPlugin) {
version.extensions.SkinnyTiddlersPlugin = {installed:true};

config.skinnyTiddlers = {}; // Hashmap of {title,modifier,created,modified,tags[]}

// Just an example, let's you test this plugin by creating a link to a tiddler called "SkinnyTiddler"
// and watching how it doesn't get treated like an ordinary missing tiddler link
config.skinnyTiddlers.SkinnyTiddler = {
	title: "SkinnyTiddler", // Also should initialise modifier,created,modified,tags[],fields{}
};

var old_getTiddlyLinkInfo = window.getTiddlyLinkInfo;

window.getTiddlyLinkInfo = function(title,currClasses)
{
	var result = old_getTiddlyLinkInfo.apply(window,arguments);
	var classes = result.classes.split(" ");
	if(classes.indexOf("tiddlyLinkNonExisting") !== -1 && config.skinnyTiddlers[title]) {
		classes.remove("tiddlyLinkNonExisting");
		classes.pushUnique("tiddlyLinkExisting");
		var skinny = config.skinnyTiddlers[title];
		result.subTitle = "'" + title + "' has not yet been loaded from the server";
	}
	result.classes = classes.join(" ");
	return result;
}



} // if(!version.extensions.SkinnyTiddlersPlugin)

//}}}
