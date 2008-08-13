/***
|''Name:''|DownloadTiddlyWikiPlugin|
|''Description:''|Download TiddlyWiki according to browser type|
|''Version:''|0.0.1|
|''Date:''|Sep 22, 2006|
|''Source:''|http://www.tiddlywiki.com/#DownloadTiddlyWikiPlugin|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.4.1|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.DownloadTiddlyWikiPlugin) {
version.extensions.DownloadTiddlyWikiPlugin = {installed:true};

config.macros.download = {};

merge(config.macros.download,{
	label: "download",
	prompt: "Download TiddlyWiki",
	className: "chunkyButton"});

config.macros.download.handler = function(place)
{
	var span = createTiddlyElement(place,"span",null,this.className);
	createTiddlyButton(span,this.label,this.prompt,this.onClick);
};

config.macros.download.onClick = function(e)
{
	return false;
};

} //# end of 'install only once'
//}}}
