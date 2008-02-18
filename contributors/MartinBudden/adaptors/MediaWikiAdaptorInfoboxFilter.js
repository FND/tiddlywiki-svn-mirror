/***
|''Name:''|MediaWikiAdaptorInfoboxFilter|
|''Description:''|Post process tiddlers retrieved from the server to only include the first infobox|
|''Author:''|Martin Budden|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MyDirectory/plugins/MediaWikiAdaptorInfoboxFilter.js |
|''Version:''|0.0.1|
|''Date:''|Feb 18, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.3|


!!Description
Processes tiddlers retrieved from the server to remove all text except the first Infobox

!!Usage
Just include in your TiddlyWiki (which must include the MediaWikiAdaptorPlugin). The MediaWikiAdaptor will pick it up automatically.
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.MediaWikiAdaptorInfoboxFilter) {
version.extensions.MediaWikiAdaptorInfoboxFilter = {installed:true};

MediaWikiAdaptor.prototype.getTiddlerPostProcess = function(context)
{
	var text = context.tiddler.text;
	var infoboxRegExp = /\{\{Infobox/mg;
	infoboxRegExp.lastIndex = 0;
	var match = infoboxRegExp.exec(text);
	if(match) {
		var infoboxEndRegExp = /\n\}\}[^|]/mg;
		var start = match.index;
		infoboxEndRegExp.lastIndex = match.index;
		match = infoboxEndRegExp.exec(text);
		if(match) {
			text = text.substring(start,match.index+3);
			context.tiddler.text = '<pre>\n'+ text + '</pre>';
		}
	}
	return context.tiddler;
};

} //# end of 'install only once'
//}}}
