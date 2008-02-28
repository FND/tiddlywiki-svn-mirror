/***
|''Name:''|BackstageTiddlersPlugin|
|''Description:''|Adds a backstage panel allowing easy access to all tiddlers|
|''Author:''|JeremyRuston|
|''Source:''|http://www.osmosoft.com/#BackstageTiddlersPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JeremyRuston/plugins/BackstageTiddlersPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Feb 28, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.BackstageTiddlersPlugin) {

version.extensions.BackstageTiddlersPlugin = {installed:true};

config.tasks.tiddlers = {
	text: "tiddlers",
	tooltip: "Access the raw tiddlers",
	content: "<<tabs txtMainTab 'Timeline' 'Timeline' TabTimeline 'All' 'All tiddlers' TabAll 'Tags' 'All tags' TabTags 'More' 'More lists' TabMore>>"};
config.backstageTasks.push("tiddlers");

} //# end of 'install only once'
//}}}