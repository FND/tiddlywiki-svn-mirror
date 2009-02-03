/***
|Name|SinglePageModePlugin|
|Source|http://www.TiddlyTools.com/#SinglePageModePlugin|
|Documentation|http://www.TiddlyTools.com/#SinglePageModePluginInfo|
|Version|2.9.6|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides|Story.prototype.displayTiddler(), Story.prototype.displayTiddlers()|
|Options|##Configuration|
|Description|Show tiddlers one at a time with automatic permalink, or always open tiddlers at top/bottom of page.|
This plugin allows you to configure TiddlyWiki to navigate more like a traditional multipage web site with only one tiddler displayed at a time.
!!!!!Documentation
>see [[SinglePageModePluginInfo]]
!!!!!Configuration
<<<
<<option chkSinglePageMode>> Display one tiddler at a time
><<option chkSinglePagePermalink>> Automatically permalink current tiddler
><<option chkSinglePageKeepFoldedTiddlers>> Don't close tiddlers that are folded
><<option chkSinglePageKeepEditedTiddlers>> Don't close tiddlers that are being edited
<<option chkTopOfPageMode>> Open tiddlers at the top of the page
<<option chkBottomOfPageMode>> Open tiddlers at the bottom of the page
<<option chkSinglePageAutoScroll>> Automatically scroll tiddler into view (if needed)

Notes:
* The "display one tiddler at a time" option can also be //temporarily// set/reset by including a 'paramifier' in the document URL: {{{#SPM:true}}} or {{{#SPM:false}}}.
* If more than one display mode is selected, 'one at a time' display takes precedence over both 'top' and 'bottom' settings, and if 'one at a time' setting is not used, 'top of page' takes precedence over 'bottom of page'.
* When using Apple's Safari browser, automatically setting the permalink causes an error and is disabled.
<<<
!!!!!Revisions
<<<
2008.10.17 [2.9.6] changed chkSinglePageAutoScroll default to false
| Please see [[SinglePageModePluginInfo]] for previous revision details |
2005.08.15 [1.0.0] Initial Release.  Support for BACK/FORWARD buttons adapted from code developed by Clint Checketts.
<<<
!!!!!Code
***/
//{{{
version.extensions.SinglePageModePlugin= {major: 2, minor: 9, revision: 6, date: new Date(2008,10,17)};
//}}}
//{{{
config.paramifiers.SPM = { onstart: function(v) {
	config.options.chkSinglePageMode=eval(v);
	if (config.options.chkSinglePageMode && config.options.chkSinglePagePermalink && !config.browser.isSafari) {
		config.lastURL = window.location.hash;
		if (!config.SPMTimer) config.SPMTimer=window.setInterval(function() {checkLastURL();},1000);
	}
} };
//}}}
//{{{
if (config.options.chkSinglePageMode==undefined)
	config.options.chkSinglePageMode=false;
if (config.options.chkSinglePagePermalink==undefined)
	config.options.chkSinglePagePermalink=true;
if (config.options.chkSinglePageKeepFoldedTiddlers==undefined)
	config.options.chkSinglePageKeepFoldedTiddlers=false;
if (config.options.chkSinglePageKeepEditedTiddlers==undefined)
	config.options.chkSinglePageKeepEditedTiddlers=false;
if (config.options.chkTopOfPageMode==undefined)
	config.options.chkTopOfPageMode=false;
if (config.options.chkBottomOfPageMode==undefined)
	config.options.chkBottomOfPageMode=false;
if (config.options.chkSinglePageAutoScroll==undefined)
	config.options.chkSinglePageAutoScroll=false;
//}}}
//{{{
config.SPMTimer = 0;
config.lastURL = window.location.hash;
function checkLastURL()
{
	if (!config.options.chkSinglePageMode)
		{ window.clearInterval(config.SPMTimer); config.SPMTimer=0; return; }
	if (config.lastURL == window.location.hash) return; // no change in hash
	var tids=decodeURIComponent(window.location.hash.substr(1)).readBracketedList();
	if (tids.length==1) // permalink (single tiddler in URL)
		story.displayTiddler(null,tids[0]);
	else { // restore permaview or default view
		config.lastURL = window.location.hash;
		if (!tids.length) tids=store.getTiddlerText("DefaultTiddlers").readBracketedList();
		story.closeAllTiddlers();
		story.displayTiddlers(null,tids);
	}
}


if (Story.prototype.SPM_coreDisplayTiddler==undefined)
	Story.prototype.SPM_coreDisplayTiddler=Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,slowly)
{
	var title=(tiddler instanceof Tiddler)?tiddler.title:tiddler;
	var tiddlerElem=document.getElementById(story.idPrefix+title); // ==null unless tiddler is already displayed
	var opt=config.options;
	var single=opt.chkSinglePageMode && !startingUp;
	var top=opt.chkTopOfPageMode && !startingUp;
	var bottom=opt.chkBottomOfPageMode && !startingUp;
	if (single) {
		story.forEachTiddler(function(tid,elem) {
			// skip current tiddler and, optionally, tiddlers that are folded.
			if (	tid==title
				|| (opt.chkSinglePageKeepFoldedTiddlers && elem.getAttribute("folded")=="true"))
				return;
			// if a tiddler is being edited, ask before closing
			if (elem.getAttribute("dirty")=="true") {
				if (opt.chkSinglePageKeepEditedTiddlers) return;
				// if tiddler to be displayed is already shown, then leave active tiddler editor as is
				// (occurs when switching between view and edit modes)
				if (tiddlerElem) return;
				// otherwise, ask for permission
				var msg="'"+tid+"' is currently being edited.\n\n";
				msg+="Press OK to save and close this tiddler\nor press Cancel to leave it opened";
				if (!confirm(msg)) return; else story.saveTiddler(tid);
			}
			story.closeTiddler(tid);
		});
	}
	else if (top)
		arguments[0]=null;
	else if (bottom)
		arguments[0]="bottom";
	if (single && opt.chkSinglePagePermalink && !config.browser.isSafari) {
		window.location.hash = encodeURIComponent(String.encodeTiddlyLink(title));
		config.lastURL = window.location.hash;
		document.title = wikifyPlain("SiteTitle") + " - " + title;
		if (!config.SPMTimer) config.SPMTimer=window.setInterval(function() {checkLastURL();},1000);
	}
	if (tiddlerElem && tiddlerElem.getAttribute("dirty")=="true") { // editing... move tiddler without re-rendering
		var isTopTiddler=(tiddlerElem.previousSibling==null);
		if (!isTopTiddler && (single || top))
			tiddlerElem.parentNode.insertBefore(tiddlerElem,tiddlerElem.parentNode.firstChild);
		else if (bottom)
			tiddlerElem.parentNode.insertBefore(tiddlerElem,null);
		else this.SPM_coreDisplayTiddler.apply(this,arguments); // let CORE render tiddler
	} else
		this.SPM_coreDisplayTiddler.apply(this,arguments); // let CORE render tiddler
	var tiddlerElem=document.getElementById(story.idPrefix+title);
	if (tiddlerElem&&opt.chkSinglePageAutoScroll) {
		// scroll to top of page or top of tiddler
		var isTopTiddler=(tiddlerElem.previousSibling==null);
		var yPos=isTopTiddler?0:ensureVisible(tiddlerElem);
		// if animating, defer scroll until after animation completes
		var delay=opt.chkAnimate?config.animDuration+10:0;
		setTimeout("window.scrollTo(0,"+yPos+")",delay); 
	}
}

if (Story.prototype.SPM_coreDisplayTiddlers==undefined)
	Story.prototype.SPM_coreDisplayTiddlers=Story.prototype.displayTiddlers;
Story.prototype.displayTiddlers = function() {
	// suspend single/top/bottom modes when showing multiple tiddlers
	var opt=config.options;
	var saveSPM=opt.chkSinglePageMode; opt.chkSinglePageMode=false;
	var saveTPM=opt.chkTopOfPageMode; opt.chkTopOfPageMode=false;
	var saveBPM=opt.chkBottomOfPageMode; opt.chkBottomOfPageMode=false;
	this.SPM_coreDisplayTiddlers.apply(this,arguments);
	opt.chkBottomOfPageMode=saveBPM;
	opt.chkTopOfPageMode=saveTPM;
	opt.chkSinglePageMode=saveSPM;
}
//}}}