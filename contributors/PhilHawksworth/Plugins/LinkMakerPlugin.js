/***
|''Name:''|LinkMakerPlugin|
|''Description:''|Create a tiddlylink pragramtically|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/LinkMakerPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Dec 03, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|


Usage:
<<LinkMaker DisplayedText TargetTiddler [className]>>

***/

//{{{
if(!version.extensions.LinkMakerPlugin) {
version.extensions.LinkMakerPlugin = {installed:true};
	
	config.macros.LinkMaker = {};
	config.macros.LinkMaker.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		if(params.length < 2) {
			return;
		}
		var text = store.getValue(tiddler,params[0]);
		var title = store.getValue(tiddler,params[1]);
		var className = params[2] ? store.getValue(tiddler,params[2]) : null;
		var e = createTiddlyLink(place,title,false,className);
		createTiddlyText(e,text);
	};

} //# end of 'install only once'
//}}}