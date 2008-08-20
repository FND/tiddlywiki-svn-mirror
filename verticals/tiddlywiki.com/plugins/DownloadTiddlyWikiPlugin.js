/***
|''Name:''|DownloadTiddlyWikiPlugin|
|''Description:''|Download TiddlyWiki according to browser type|
|''Version:''|0.0.5|
|''Date:''|Aug 13, 2008|
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

config.macros.download.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var span = createTiddlyElement(place,"span",null,this.className);
	createTiddlyButton(span,params[0]||this.label,params[1]||this.prompt,this.onClick);
};

config.macros.download.onClick = function(ev)
{
	// display the tiddler containing the instructions
	var e = ev || window.event;
	var title;
	if(config.browser.isMac) {
		if(config.browser.isSafari) {
			title = "Installation guidelines: Safari on Mac OS X";
		} else if(config.browser.isOpera) {
			title = "Installation guidelines: Opera on Mac OS X";
		} else {
			title = "Installation guidelines: Firefox on Mac OS X";
		}
	} else if(config.browser.isWindows) {
		if(config.browser.isIE) {
			title = "Installation guidelines: Internet Explorer on Windows Vista";
		} else {
			title = "Installation guidelines: Firefox on Windows Vista";
		}
	} else {
			title = "Installation guidelines: Firefox on Ubuntu";
	}
	// put an iframe in the target instructions tiddler to start the download
	var url = config.browser.isSafari || config.browser.isOpera ? 'http://www.tiddlywiki.com/empty.zip' :'http://www.tiddlywiki.com/empty.download';
	var html = '<html><iframe src="' + url + '" style="display:none"></html>';
	var tiddler = store.getTiddler(title);
	var oldText = tiddler.text;
	tiddler.text = html + tiddler.text;
	var target = resolveTarget(e);
	story.closeTiddler(title,true);
	story.displayTiddler(target,title);
	tiddler.text = oldText;
	return false;
};

} //# end of 'install only once'
//}}}
