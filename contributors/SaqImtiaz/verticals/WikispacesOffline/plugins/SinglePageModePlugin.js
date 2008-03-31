/***
|Name|SinglePageModePlugin|
|Source|http://www.TiddlyTools.com/#SinglePageModePlugin|
|Documentation|http://www.TiddlyTools.com/#SinglePageModePluginInfo|
|Version|2.5.3|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides|Story.prototype.displayTiddler(), Story.prototype.displayTiddlers()|
|Description|Show tiddlers one at a time with automatic permalink, or always open tiddlers at top/bottom of page.|
This plugin allows you to configure TiddlyWiki to navigate more like a traditional multipage web site with only one tiddler displayed at a time.
!!!!!Documentation
>see [[SinglePageModePluginInfo]]
!!!!!Configuration
<<<
<<option chkSinglePageMode>> Display one tiddler at a time
<<option chkSinglePagePermalink>> Automatically permalink current tiddler
<<option chkTopOfPageMode>> Always open tiddlers at the top of the page
<<option chkBottomOfPageMode>> Always open tiddlers at the bottom of the page
//Note: if both 'top' and 'bottom' settings are selected, "top of page" will be used.  Also, in Apple's Safari browser, automatically setting the permalink causes an error and is disabled.//
<<<
!!!!!Revisions
<<<
2007.12.22 [2.5.3] in checkLastURL(), use decodeURIComponent() instead of decodeURI so that tiddler titles with commas (and/or other punctuation) are correctly handled.
| Please see [[SinglePageModePluginInfo]] for previous revision details |
2005.08.15 [1.0.0] Initial Release.  Support for BACK/FORWARD buttons adapted from code developed by Clint Checketts.
<<<
!!!!!Code
***/
//{{{
version.extensions.SinglePageMode= {major: 2, minor: 5, revision: 3, date: new Date(2007,12,22)};

if (config.options.chkSinglePageMode==undefined) config.options.chkSinglePageMode=false;
if (config.options.chkSinglePagePermalink==undefined) config.options.chkSinglePagePermalink=true;
if (config.options.chkTopOfPageMode==undefined) config.options.chkTopOfPageMode=false;
if (config.options.chkBottomOfPageMode==undefined) config.options.chkBottomOfPageMode=false;

if (config.optionsDesc) {
	config.optionsDesc.chkSinglePageMode="Display one tiddler at a time";
	config.optionsDesc.chkSinglePagePermalink="Automatically permalink current tiddler";
	config.optionsDesc.chkTopOfPageMode="Always open tiddlers at the top of the page";
	config.optionsDesc.chkBottomOfPageMode="Always open tiddlers at the bottom of the page";
} else {
	config.shadowTiddlers.AdvancedOptions += "\
		\n<<option chkSinglePageMode>> Display one tiddler at a time \
		\n<<option chkSinglePagePermalink>> Automatically permalink current tiddler \
		\n<<option chkTopOfPageMode>> Always open tiddlers at the top of the page \
		\n<<option chkBottomOfPageMode>> Always open tiddlers at the bottom of the page";
}

config.SPMTimer = 0;
config.lastURL = window.location.hash;
function checkLastURL()
{
	if (!config.options.chkSinglePageMode)
		{ window.clearInterval(config.SPMTimer); config.SPMTimer=0; return; }
	if (config.lastURL == window.location.hash)
		return;
	var tiddlerName = convertUTF8ToUnicode(decodeURIComponent(window.location.hash.substr(1)));
	tiddlerName=tiddlerName.replace(/\[\[/,"").replace(/\]\]/,""); // strip any [[ ]] bracketing
	if (tiddlerName.length) story.displayTiddler(null,tiddlerName,1,null,null);
}

if (Story.prototype.SPM_coreDisplayTiddler==undefined) Story.prototype.SPM_coreDisplayTiddler=Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement,title,template,animate,slowly)
{
	if (config.options.chkSinglePageMode)
		story.closeAllTiddlers(title);
	else if (config.options.chkTopOfPageMode)
		arguments[0]=null;
	else if (config.options.chkBottomOfPageMode)
		arguments[0]="bottom";
	if (config.options.chkSinglePageMode && config.options.chkSinglePagePermalink && !config.browser.isSafari) {
		window.location.hash = encodeURIComponent(convertUnicodeToUTF8(String.encodeTiddlyLink(title)));
		config.lastURL = window.location.hash;
		document.title = wikifyPlain("SiteTitle") + " - " + title;
		if (!config.SPMTimer) config.SPMTimer=window.setInterval(function() {checkLastURL();},1000);
	}
	this.SPM_coreDisplayTiddler.apply(this,arguments); // let CORE render tiddler
	var tiddlerElem=document.getElementById(story.idPrefix+title);
        var editor = document.getElementById('quickedit'+title);
	if (tiddlerElem && !editor) {
		var yPos=ensureVisible(tiddlerElem); // scroll to top of tiddler
		var isTopTiddler=(tiddlerElem.previousSibling==null);
		if (config.options.chkSinglePageMode||config.options.chkTopOfPageMode||isTopTiddler)
			yPos=0; // scroll to top of page instead of top of tiddler
		if (config.options.chkAnimate) // defer scroll until 200ms after animation completes
			setTimeout("window.scrollTo(0,"+yPos+")",config.animDuration+200); 
		else
			window.scrollTo(0,yPos); // scroll immediately
	}
}

if (Story.prototype.SPM_coreDisplayTiddlers==undefined) Story.prototype.SPM_coreDisplayTiddlers=Story.prototype.displayTiddlers;
Story.prototype.displayTiddlers = function(srcElement,titles,template,unused1,unused2,animate,slowly)
{
	// suspend single-page mode (and/or top/bottom display options) when showing multiple tiddlers
	var saveSPM=config.options.chkSinglePageMode; config.options.chkSinglePageMode=false;
	var saveTPM=config.options.chkTopOfPageMode; config.options.chkTopOfPageMode=false;
	var saveBPM=config.options.chkBottomOfPageMode; config.options.chkBottomOfPageMode=false;
	this.SPM_coreDisplayTiddlers.apply(this,arguments);
	config.options.chkBottomOfPageMode=saveBPM;
	config.options.chkTopOfPageMode=saveTPM;
	config.options.chkSinglePageMode=saveSPM;
}
//}}}