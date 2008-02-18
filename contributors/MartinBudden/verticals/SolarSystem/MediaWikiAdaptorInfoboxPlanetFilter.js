/***
|''Name:''|MediaWikiAdaptorInfoboxPlanetFilter|
|''Description:''|Post process tiddlers retrieved from the server to only include the first infobox|
|''Author:''|Martin Budden|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MyDirectory/plugins/MediaWikiAdaptorInfoboxPlanetFilter.js |
|''Version:''|0.0.1|
|''Date:''|Feb 18, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.3|


!!Description
Processes tiddlers retrieved from the server to map (eg)
{{Infobox Planet
...
| name = Mercury
...
}}
to
{{Planet Infobox/Mercury}}

!!Usage
Just include in your TiddlyWiki (which must include the MediaWikiAdaptorPlugin). The MediaWikiAdaptor will pick it up automatically.
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.MediaWikiAdaptorInfoboxPlanetFilter) {
version.extensions.MediaWikiAdaptorInfoboxPlanetFilter = {installed:true};

MediaWikiAdaptor.prototype.getTiddlerPostProcess = function(context)
{
	var text = context.tiddler.text;
	var infoboxRegExp = /\{\{Infobox Planet(?:(?:.|\n)*?)name ?= ?(.*)/mg;
	infoboxRegExp.lastIndex = 0;
	var match = infoboxRegExp.exec(text);
	if(match) {
		var name = match[1];
		var infoboxEndRegExp = /\n\}\}[^|]/mg;
		var start = match.index;
		infoboxEndRegExp.lastIndex = match.index;
		match = infoboxEndRegExp.exec(text);
		if(match) {
			text = text.substr(0,start) + '{{Planet Infobox/' + name + text.substr(match.index+1);
			context.tiddler.text = text;
		}
	}
	return context.tiddler;
};

} //# end of 'install only once'
//}}}
