/***
''Single Page Mode Plugin for TiddlyWiki version 2.0 or above''
^^author: Eric Shulman - ELS Design Studios
source: http://www.TiddlyTools.com/#SinglePageModePlugin
license: [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]^^

Normally, as you click on the links in TiddlyWiki, more and more tiddlers are displayed on the page. The order of this tiddler display depends upon when and where you have clicked. Some people like this non-linear method of reading the document, while others have reported that when many tiddlers have been opened, it can get somewhat confusing.

!!!!!Usage
<<<
SinglePageMode allows you to configure TiddlyWiki to navigate more like a traditional multipage web site with only one item displayed at a time.  When SinglePageMode is enabled, the title of the current tiddler is automatically displayed in the browser window's titlebar and the browser's location URL is updated with a 'permalink' for the current tiddler so that it is easier to create a browser 'bookmark' for the current tiddler.

Even when SinglePageMode is disabled (i.e., displaying multiple tiddlers is permitted), you can reduce the potential for confusion by enable TopOfPageMode, which forces tiddlers to always open at the top of the page instead of being displayed following the tiddler containing the link that was clicked.
<<<
!!!!!Configuration
<<<
When installed, this plugin automatically adds checkboxes in the AdvancedOptions tiddler so you can enable/disable the plugin behavior.  For convenience, these checkboxes are also included here:

<<option chkSinglePageMode>> Display one tiddler at a time
<<option chkTopOfPageMode>> Always open tiddlers at the top of the page
<<<
!!!!!Installation
<<<
import (or copy/paste) the following tiddlers into your document:
''SinglePageModePlugin'' (tagged with <<tag systemConfig>>)
^^documentation and javascript for SinglePageMode handling^^

When installed, this plugin automatically adds checkboxes in the ''shadow'' AdvancedOptions tiddler so you can enable/disable this behavior.  However, if you have customized your AdvancedOptions, you will need to ''manually add these checkboxes to your customized tiddler.''
<<<
!!!!!Revision History
<<<
''2006.06.01 [2.2.0]'' added chkTopOfPageMode handling
''2006.02.04 [2.1.1]'' moved global variable declarations to config.* to avoid FireFox 1.5.0.1 crash bug when assigning to globals
''2005.12.27 [2.1.0]'' hijack displayTiddlers() so that SPM can be suspended during startup while displaying the DefaultTiddlers (or #hash list).  Also, corrected initialization for undefined SPM flag to "false", so default behavior is to display multiple tiddlers
''2005.12.27 [2.0.0]'' Update for TW2.0
''2005.11.24 [1.1.2]'' When the back and forward buttons are used, the page now changes to match the URL.  Based on code added by Clint Checketts
''2005.10.14 [1.1.1]'' permalink creation now calls encodeTiddlyLink() to handle tiddler titles with spaces in them
''2005.10.14 [1.1.0]'' added automatic setting of window title and location bar ('auto-permalink').  feature suggestion by David Dickens.
''2005.10.09 [1.0.1]'' combined documentation and code in a single tiddler
''2005.08.15 [1.0.0]'' Initial Release
<<<
!!!!!Credits
<<<
This feature was developed by EricShulman from [[ELS Design Studios|http:/www.elsdesign.com]].
Support for BACK/FORWARD buttons adapted from code developed by Clint Checketts
<<<
!!!!!Code
***/
//{{{
version.extensions.SinglePageMode= {major: 2, minor: 2, revision: 0, date: new Date(2006,6,1)};

if (config.options.chkSinglePageMode==undefined) config.options.chkSinglePageMode=false;
config.shadowTiddlers.AdvancedOptions += "\sn<<option chkSinglePageMode>> Display one tiddler at a time";

if (config.options.chkTopOfPageMode==undefined) config.options.chkTopOfPageMode=false;
config.shadowTiddlers.AdvancedOptions += "\sn<<option chkTopOfPageMode>> Always open tiddlers at the top of the page";

config.SPMTimer = 0;
config.lastURL = window.location.hash;
function checkLastURL()
{
	if (!config.options.chkSinglePageMode)
		{ window.clearInterval(config.SPMTimer); config.SPMTimer=0; return; }
	if (config.lastURL == window.location.hash)
		return;
	var tiddlerName = convertUTF8ToUnicode(decodeURI(window.location.hash.substr(1)));
	tiddlerName=tiddlerName.replace(/\s[\s[/,"").replace(/\s]\s]/,""); // strip any [[ ]] bracketing
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
	this.SPM_coreDisplayTiddler(srcElement,title,template,animate,slowly)
}

if (Story.prototype.SPM_coreDisplayTiddlers==undefined) Story.prototype.SPM_coreDisplayTiddlers=Story.prototype.displayTiddlers;
Story.prototype.displayTiddlers = function(srcElement,titles,template,unused1,unused2,animate,slowly)
{
	// suspend single-page mode when displaying multiple tiddlers
	var save=config.options.chkSinglePageMode;
	config.options.chkSinglePageMode=false;
	this.SPM_coreDisplayTiddlers(srcElement,titles,template,unused1,unused2,animate,slowly);
	config.options.chkSinglePageMode=save;
}
//}}}