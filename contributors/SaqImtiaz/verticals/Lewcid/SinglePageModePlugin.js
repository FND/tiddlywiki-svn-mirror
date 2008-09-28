/***
|''Name:''|SinglePageModePlugin|
|''Source:''|http://www.TiddlyTools.com/#SinglePageModePlugin|
|''Author:''|Eric Shulman - ELS Design Studios|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.0.10|

!!!!!Credits
<<<
This feature was developed by EricShulman from [[ELS Design Studios|http:/www.elsdesign.com]].
Support for BACK/FORWARD buttons adapted from code developed by Clint Checketts
<<<
!!!!!Code
***/
//{{{
version.extensions.SinglePageMode= {major: 2, minor: 2, revision: 1, date: new Date(2006,7,3)};

config.options.chkSinglePageMode=true;

if (config.options.chkSinglePageMode==undefined) config.options.chkSinglePageMode=false;
config.shadowTiddlers.AdvancedOptions += "\n<<option chkSinglePageMode>> Display one tiddler at a time";

if (config.options.chkTopOfPageMode==undefined) config.options.chkTopOfPageMode=false;
config.shadowTiddlers.AdvancedOptions += "\n<<option chkTopOfPageMode>> Always open tiddlers at the top of the page";

config.SPMTimer = 0;
config.lastURL = window.location.hash;
function checkLastURL()
{
	if (!config.options.chkSinglePageMode)
		{ window.clearInterval(config.SPMTimer); config.SPMTimer=0; return; }
	if (config.lastURL == window.location.hash)
		return;
	var tiddlerName = convertUTF8ToUnicode(decodeURI(window.location.hash.substr(1)));
	tiddlerName=tiddlerName.replace(/\[\[/,"").replace(/\]\]/,""); // strip any [[ ]] bracketing
	if (tiddlerName.length) story.displayTiddler(null,tiddlerName,1,null,null);
}

if (Story.prototype.SPM_coreDisplayTiddler==undefined) Story.prototype.SPM_coreDisplayTiddler=Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement,title,template,animate,slowly)
{
	if (config.options.chkSinglePageMode) {
		window.location.hash = encodeURIComponent(String.encodeTiddlyLink(title));
		config.lastURL = window.location.hash;
		document.title = wikifyPlain("SiteTitle") + " - " + title;
		story.closeAllTiddlers();
		if (!config.SPMTimer) config.SPMTimer=window.setInterval(function() {checkLastURL();},1000);
	}
	if (config.options.chkTopOfPageMode) { story.closeTiddler(title); window.scrollTo(0,0); srcElement=null; }
window.scrollTo(0,0);
	this.SPM_coreDisplayTiddler(null,title,template,animate,slowly)
}

if (Story.prototype.SPM_coreDisplayTiddlers==undefined) Story.prototype.SPM_coreDisplayTiddlers=Story.prototype.displayTiddlers;
Story.prototype.displayTiddlers = function(srcElement,titles,template,unused1,unused2,animate,slowly)
{
	// suspend single-page mode when displaying multiple tiddlers
	var saveSPM=config.options.chkSinglePageMode; config.options.chkSinglePageMode=false;
	var saveTPM=config.options.chkTopOfPageMode; config.options.chkTopOfPageMode=false;
	this.SPM_coreDisplayTiddlers(srcElement,titles,template,unused1,unused2,animate,slowly);
	config.options.chkSinglePageMode=saveSPM; config.options.chkTopOfPageMode=saveTPM;
}
//}}}