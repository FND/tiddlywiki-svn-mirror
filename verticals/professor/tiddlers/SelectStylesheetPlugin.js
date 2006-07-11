/***
''Select Stylesheet Plugin for TiddlyWiki version 1.2.x and 2.0''
^^author: Eric Shulman - ELS Design Studios
source: http://www.TiddlyTools.com/#SelectStylesheetPlugin
license: [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]^^

Select alternative TiddlyWiki CSS stylesheet 'themes' from a list of tiddlers tagged with "stylesheets".

!!!!!Usage
<<<
This plugin defines a macro that creates a stylesheet link or selection listbox/droplist that can be added to the content of any tiddler (such as the OptionsPanel or MainMenu tiddlers).

First, create (or import) a custom style sheet tiddler (i.e, a tiddler containing CSS definitions) and tag it with <<tag stylesheets>> so it can be included in the selection list.  Then, add the {{{<<selectStylesheet>>}}} macro to the desired tiddler to display the stylesheet list.  (note: to create a link to apply a specific stylesheet, include the stylesheet tiddlername as a parameter.  See below for more details).

Select your desired stylesheet from the droplist:
** ''[system]'' uses the built-in CSS definitions
** ''[default]'' uses "StyleSheet" tiddler (if present)
** //tiddlername// uses any named stylesheet
The currently selected stylesheet is indicated by a '>' symbol.

//Note: If a selected stylesheet tiddler no longer exists (i.e, the tiddler was deleted or renamed after it had been selected for use), the [default] CSS tiddler ("StyleSheet") will be used as a fallback.  If this tiddler does not exist either, then the built-in CSS definitions are used.//
<<<
!!!!!Parameters
<<<
The selectStylesheet macro accepts parameters to control various features and functions. //Note: while each parameter is optional and may be omitted from the macro, the parameters (when present) must appear in the order shown below.//
* ''size:nnn''
Determines the number of lines to display in the stylesheet list.  If this parameter is omitted or "size:1" is specified, a single-line droplist is created.  When a size > 1 is provided, a standard, fixed-size scrollable listbox is created.  You can use "size:0" or "size:auto" to display a varible-height listbox that automatically adjusts to fit the current list contents without scrolling.
* ''width:nnn[cm|px|em|%]''
Controls the width of the stylesheet list.  Overrides the built-in CSS width declaration (=100%).  Use standard CSS width units (cm=centimeters, px=pixels, em=M-space, %=proportional to containing area).  You can also use a ".selectStylesheet" custom CSS class definition to override the built-in CSS declarations for the stylesheet list.
* ''label:text'' and ''prompt:text''
when used in conjunction with a specific named stylesheet to create a stylesheet link (see //tiddlername// param, below), these two parameters define the link text the 'tooltip' text that appears near the mouse pointer when placed over the link, respectively.
* ''//tiddlername//''
If you include a stylesheet //tiddlername// parameter in the macro (e.g., {{{<<selectStylesheet [[Woodshop]]>>}}} then a link will be created instead of a listbox/droplist.  Selecting this link applies the specified stylesheet.  You may use the special keywords ''[system]'' to use the built-in CSS definitions, or ''[none]'' to bypass all stylesheet tiddlers (sometimes useful during CSS debugging).

<<<
!!!!!Nested Stylesheets
<<<
The CSS definitions for TiddlyWiki are fairly substantial, and stylesheet tiddlers can include hundreds of lines of CSS statements.  Often, these stylesheets will use the exact same CSS for the bulk of their definitions plus several changes or additions to create a difference in appearance.  This results in lots of duplicated CSS definitions that can become difficult to keep 'in sync' with each other.

To make this problem much easier to manage, you can move the common CSS definitions into separate stylesheet tiddlers.  Then, embed {{{[[tiddlertitle]]}}} references in the original stylesheet tiddlers to re-combine the CSS definitions into a single stylesheet 'theme' to be applied.

With some clever division of CSS into separate tiddlers, you can quite easily construct dozens of stylesheet combinations.  You can also mark the common CSS tiddlers with tags and use them as overlay stylesheets so you can mix-and-match their styles to create even more 'on-the-fly' stylesheet combinations.

Note: Normally, when rendering tiddler content for display, the {{{[[tiddlertitle]]}}} syntax means "insert a link to this tiddler".  However, when applying stylesheets, this syntax means "insert the content of this tiddler"
<<<
!!!!!Changing templates or invoking custom javascript from a stylesheet
<<<
In addition to CSS definitions, some TiddlyWiki look-and-feel designs also make adjustments to the TiddlyWiki document structure so that certain document features can be moved, hidden, or otherwise redefined.  The default set of templates that control the document structure are called PageTemplate, ViewTemplate, and EditTemplate.  To select an alternative set of templates, you can include the special psuedo-macro ''{{{<<template prefix>>}}}'' in your stylesheet.  This adds the indicated prefix to the standard template names, and automatically switches to using those templates whenever the stylesheet is selected and applied.

Whenever a document is being viewed in read-only mode (i.e., via http: protocol), an implied template prefix of "Web" is also used, and is inserted between any custom template prefix and the standard template name.  For example, ''{{{<<template Custom>>}}}'' will use {{{CustomWebViewTemplate}}} when the document is in read-only mode.  You can specify an alternative for this implied prefix by including a second prefix parameter in the pseudo-macro.  For example, ''{{{<<template Custom ReadOnly>>}}}'' will use {{{CustomReadOnlyViewTemplate}}}.  Note: if a template tiddler with the indicated combination of custom and read-only prefixes is not available, a suitable fallback template is chosen, first by omitting the custom prefix, then by omitting the read-only prefix, and finally by omitting both, and reverting to the appropriate default template.

In addition to selecting alternative templates, a stylesheet can also include the psuedo-macro ''{{{<<init tiddlertitle>>}}}'' to execute custom javascript that can access TiddlyWiki internal data and 'core' functions or perform direct manipulation of the currently-rendered DOM elements of the document.  First, place the desired javascript code into one or more tiddlers (note: //although these tiddlers will contain javascript, ''do NOT tag them as 'systemConfig', since this will cause the javascript to be executed every time TW starts'', rather than only when a specific stylesheet has been selected//).  Then, add the ''{{{<<init tiddlertitle>>}}}'' pseudo-macro to your stylesheet so the javascript will be executed when that specific stylesheet is selected and applied.

Of course, when another stylesheet is subsequently selected, other custom javascript functions may be needed to reset whatever TW internal data changes or DOM manipulations were performed by any {{{<<init>>}}} scripts.  You can define tiddlers containing these ''reset'' scripts by embedding ''{{{<<reset tiddlertitle>>}}}'' in your stylesheet definition.  Unlike {{{<<init>>}}} scripts, any tiddlers declared in this way will NOT be executed when the stylesheet is applied, but will be remembered and automatically executed before applying another stylesheet.

Note: These special-purpose psuedo-macros are only executed when the stylesheet containing them is actually in use.  When these macros are rendered as part of the tiddler content (such as when //viewing// a stylesheet definition), the macros simply report their values without performing any actions.
<<<
!!!!!Examples
<<<
single auto-sized listbox
{{{<<selectStylesheet size:auto width:60%>>}}}
<<selectStylesheet size:auto width:60%>>

droplist for stylesheets
{{{<<selectStylesheet size:1 width:30%>>}}}
<<selectStylesheet size:1 width:30%>>

inline links to set specific stylesheets
{{{<<selectStylesheet Woodshop>> or <<selectStylesheet [[Edge of Night]]>> or <<selectStylesheet [default]>>  or <<selectStylesheet [none]>> or <<selectStylesheet label:TiddlyWiki "prompt:The standard TW stylesheet" [system]>>
}}}
<<selectStylesheet Woodshop>> or <<selectStylesheet [[Edge of Night]]>> or <<selectStylesheet [default]>>  or <<selectStylesheet [none]>> or <<selectStylesheet label:TiddlyWiki "prompt:The standard TW stylesheet" [system]>>

stylesheet definitions (tagged with "stylesheets"):
<<tag stylesheets>>
<<<
!!!!!Installation
<<<
import (or copy/paste) the following tiddlers into your document:
''SelectStylesheetPlugin'' (tagged with <<tag systemConfig>>)
^^documentation and javascript for SelectStylesheethandling^^

create/edit ''OptionsPanel'':
Add "{{{<<selectStylesheet [size:nnn|auto] [width:nnn[cm|px|em|%]>>}}}" macro.
<<<
!!!!!Revision History
<<<
''2006.05.18 [4.2.5]'' revert to 'onchange' handling, BUT... don't *reload* the list contents each time selection changes (just move the ">" indicator to the current item instead), AND... track onkeydown/up to avoid FF crash due to excess calls to set() when scrolling a listbox by holding down arrow keys.
''2006.05.15 [4.2.4]'' switch from 'onchange' listbox handling to 'onclick' and 'onkeyup'.  Avoids FF **CRASH** due to stylesheets being excessively refreshed *during* onchange due to keyboard event handling.
''2006.04.21 [4.2.3]'' recognize "stylesheet" tag when building list of available stylesheets (in addition to plural, "stylesheets")
''2006.04.05 [4.2.2]'' in applyStylesheet(), reverted change from 4.2.0: *don't* apply "StyleSheetColors" and "StyleSheetLayout" along with selected stylesheet, so custom stylesheet can completely bypass the default formatting.  To include default formatting in a stylesheet, embed "[[StyleSheetColors]] [[StyleSheetLayout]]" 
''2006.03.30 [4.2.1]'' in applyStylesheet(), change calls from "window.eval()" to just "eval()" to avoid FF1501 'global variable crash' problem 
''2006.03.30 [4.2.0]'' remove [none] choice from listbox.  Added handling for <<selectStylesheet sheetname>> to create a link that applies the specified sheet instead of presenting a listbox of available sheets.  added "style:" paramifier.  Apply "StyleSheetColors" and "StyleSheetLayout" along with selected stylesheet (i.e., overlay selected sheet on top of shadow styles instead of replacing default shadow styles).  Based on suggestions from Clint Checketts.
''2006.03.09 [4.1.4]'' in refreshSelectStylesheet(), make sure that tiddler named in stylesheet cookie value still exists before attempting to select it in the listbox.
''2006.02.25 [4.1.3]'' Problem: the ">" indicator was not always being refreshed, due to event "timing" issues.  refreshSelectStylesheet() deferred for 10msec so it will execute *after* onChangeSelectStylesheet event processing has completed.
''2006.02.24 [4.1.2]'' Problem: """<<template>>""" macro was not being processed in IE.
Cause: regexp processing creates browser-internal "private globals" used to keep track of the regexp parser's state, including the current 'scan' position within the source string.  This lets you use search() and exec() inside loops to scan for successive pattern matches.  In applyStyleSheet(), "theCSS.search(templateRegExp)" was called before "theCSS.exec(templateRegExp)".  As a result, the regexp parser had already matched the """<<template>>""" macro embedded in the CSS and thus did not actually process the macro and switch the templates.
Fix: use """indexOf("<<template")""" instead of search(templateRegExp) to check for presence of template switching macro in CSS.
''2006.02.23 [4.1.1]'' performance fixes: in switchTemplates(), added default init of 'altTemplate' value to prevent unneeded triggering of refreshPageTemplate() during TW load-time when using standard templates.  Saves LOTS of startup time and avoids the dreaded "script is running slowly" FireFox warnings.
Also, the forEachTiddler() call to force a "refresh all tiddlers" (needed when view/edit templates are changed) was moved from applyPageTemplate() and is now called directly from switchTemplates().  This eliminates redundant re-rendering of tiddlers while the page template is being refreshed.
''2006.02.21 [4.1.0]'' added """<<template>>""" pseudo-macro with new switchTemplate() function.  Allows stylsheets to switch page/view/edit templates by adding a prefix to standard template names.  Detects readOnly mode and automatically adds "Web" to template name (e.g. "MyWebViewTemplate").  Defines "Web" shadow templates and "viewSource" toolbar command.
''2006.02.21 [4.0.3]'' added real macro handlers for psuedo-macros "init", "reset" so they will display in the stylesheet tiddler without appearing as an error.
''2006.01.20 [4.0.2]'' add 'var' to unintended global variable declarations and wrapped notification hijack in init function to eliminate globals and avoid FireFox 1.5.0.1 crash bug when referencing globals
''2006.01.20 [4.0.1]'' Added optional "init" keyword for {{{<<init tiddlertitle>>}}} psuedo-macro syntax (note: previous {{{<<tiddlertitle>>}}} syntax still permitted)
Revised documentation to better describe use of init/reset for custom code invokation.
''2005.11.05 [4.0.0]'' Entire plugin simplified in response to new "shadow stylesheet" architecture introduced in TW1.2.37.  Concept of separate overlays has been removed.  Stylesheet themes are assembled using [[tiddler]] 'nesting' syntax, and tagged as 'stylesheet'.  A single listbox/droplist is provided to select themes.
''2005.10.25 [3.1.0]'' added support for embedding {{{<<reset tiddlertitle>>}}} companion code (to declare 'DOM cleanup' routines invoked when a stylesheet is UNloaded)
//Based on a request from ClintChecketts//
''2005.10.09 [3.0.1]'' combined documentation and code in a single tiddler
''2005.08.15 [3.0.0]'' Another major re-write.  Replaced separate "selectOverlays" macro definition with 'overlays' parameter on 'selectStylesheet' macro.  Added support for embedding {{{<<tiddlertitle>>}}} companion code.  applyStylesheets() completely re-designed to address quirks with loading and combining multiple stylesheets using browser-specific native handling, as well as add support for executing companion code.  Stylesheets+overlays+code are now handled in a platform-neutral manner that avoids differences between browser implementations and uses much less overhead in the DOM.
''2005.08.07 [2.0.0]'' Major re-write to not use static ID values for listbox controls, so that multiple macro instances can exist without corrupting each other or the DOM.  Moved HTML and CSS definitions into plugin code instead of using separate tiddlers.  Added new features: support for multiple groups of overlay stylesheets with collapsible tree display. Added size and width params for listbox display.
''2005.07.27 [1.0.3]'' core update 1.2.29: custom overlayStyleSheet() replaced with new core setStylesheet()
''2005.07.25 [1.0.2]'' correct 'fallback' handling in selectStyleSheet()
''2005.07.23 [1.0.1]'' added parameter checks and corrected addNotification() usage
''2005.07.20 [1.0.0]'' Initial Release
<<<
!!!!!Credits
<<<
This feature was developed by EricShulman from [[ELS Design Studios|http:/www.elsdesign.com]].  Thanks to David Jaquith for testing and bug reports and SteveRumsby for feature suggestions.
<<<
!!!!!Code
***/
//{{{
version.extensions.selectStylesheet = {major: 4, minor: 2, revision: 5, date: new Date(2006,5,18)};

// IE needs explicit global scoping for functions/vars called from browser events
window.refreshSelectStylesheet=refreshSelectStylesheet;
window.applyStylesheets=applyStylesheets;

if (!config.options.txtStyleSheet) config.options.txtStyleSheet="StyleSheet";
//}}}

//{{{
// define macro rendering handler
config.macros.selectStylesheet = { };
config.macros.selectStylesheet.reset = [];
config.macros.selectStylesheet.handler = function(place,macroName,params) {
	setStylesheet(".selectStylesheet {width:100%;font-size:8pt;margin:0em}","selectStylesheetPlugin");
	var autosize=1;
	if (params[0] && (params[0]=="size:auto"))
		{ autosize=0; params.shift(); }
	if (params[0] && (params[0].substr(0,5)=="size:"))
		autosize=(params.shift()).substr(5);
	if (params[0] && (params[0].substr(0,6)=="width:"))
		var width=(params.shift()).substr(6);
	if (params[0] && (params[0].substr(0,6)=="label:"))
		var label=(params.shift()).substr(6);
	if (params[0] && (params[0].substr(0,7)=="prompt:"))
		var prompt=(params.shift()).substr(7);
	if (params[0] && params[0].trim().length) // create a link that sets a specific stylesheet
		createTiddlyButton(place,label?label:params[0],prompt?prompt:params[0], function(){config.macros.selectStylesheet.set(params[0]); return false;});
	else { // create a select list of available stylesheets
		var theList=createTiddlyElement(place,"select",null,"selectStylesheet",null);
		theList.onkeydown=function() // track keystrokes for listbox only
			{ if (this.size>1 && !this.keydown) { this.keydown=true; this.previousIndex=this.selectedIndex; } return true; };
		theList.onkeyup=function()
			{ if (this.keydown) { this.keydown=false; if (this.selectedIndex!=this.previousIndex) config.macros.selectStylesheet.set(this.value); } return true; };
		theList.onchange=function()
			{ if (!this.keydown) config.macros.selectStylesheet.set(this.value); return true; };
		theList.size=1;
		theList.autosize=autosize;
		if (width) theList.style.width=width;
		store.addNotification(null,refreshSelectStylesheet);
		refreshSelectStylesheet();
	}
}
config.macros.selectStylesheet.set = function(theSheet) {
	if (!theSheet || !theSheet.trim().length) return;
	var allStyleLists=getElementsByClass("selectStylesheet");
	for (var k=0; k<allStyleLists.length; k++) {
		var theList=allStyleLists[k];
		for (var t=0; t<theList.options.length; t++)	 {
			if (theList.options[t].text.substr(0,1)==">")
				theList.options[t].text=String.fromCharCode(160)+String.fromCharCode(160)+theList.options[t].text.substr(1);
			if ((theList.options[t].value==theSheet) || (theSheet=="[default]" && theList.options[t].value=="StyleSheet"))
				{ theList.options[t].text=">"+theList.options[t].text.substr(2); theList.selectedIndex=t; }
		}
	}
	config.options.txtStyleSheet=theSheet;
	saveOptionCookie("txtStyleSheet");
	applyStylesheets();
	return;
}
if (config.paramifiers) config.paramifiers.style = { onstart: function(theSheet) { config.macros.selectStylesheet.set(theSheet); } };

// set to TRUE to enable debugging status messages when stylesheets are applied
config.macros.selectStylesheet.verbose = false;

// hijack existing notifications for refreshStyles() handler
initSelectStylesheetNotification();
function initSelectStylesheetNotification() {
	for (var i=0; i<store.namedNotifications.length; i++)
		if (store.namedNotifications[i].notify==window.refreshStyles)
			store.namedNotifications[i].notify=applyStylesheets;
}

// hijack refreshStyles() handler
window.refreshStyles=applyStylesheets;

function getElementsByClass(classname)
{
	var arr=new Array();
	var count=0;
	var all=document.all? document.all : document.getElementsByTagName("*");
	for (var i=0; i<all.length; i++)
		if (all[i].className==classname)
			arr[count++]=all[i];
	return arr;
}

function refreshSelectStylesheet()
{
	var indent = String.fromCharCode(160)+String.fromCharCode(160)+String.fromCharCode(160);
	// for all instances of the selectStylesheet control
	var allStyleLists=getElementsByClass("selectStylesheet");
	for (var k=0; k<allStyleLists.length; k++) {
		var theList=allStyleLists[k];
		// clear current list contents
		while (theList.length > 0) { theList.options[0] = null; }
		theList.selectedIndex=-1;
		// fill the stylesheet list
		var count=0;
		// prompt text
		theList.options[count++] = new Option("select a stylesheet:","",false,false);
// DISABLED		// option: none (built-in hard-coded CSS only)
// DISABLED		theList.options[count++] = new Option(indent+"[none]","[none]",false,false);
		// option: default (built-in plus shadow stylesheets)
		theList.options[count++] = new Option(indent+"[system]","[system]",false,false);
		// option: StyleSheet tiddler, if present
		if (store.getTiddler("StyleSheet")!=undefined)
			theList.options[count++] = new Option(indent+"[default]","StyleSheet",false,false);
		// options: CSS tiddlers tagged with "stylesheets" or "stylesheet"
		var theSheets=store.getTaggedTiddlers("stylesheets").concat(store.getTaggedTiddlers("stylesheet"));
		for (var i=0; i<theSheets.length; i++) {
			var theTitle=theSheets[i].title;
			if (theTitle=="StyleSheet") continue;
			theList.options[count++] = new Option(indent+theTitle,theTitle,false,false);
		}
		// make sure the requested stylesheet exists, fallback if not...
		var theSheet=config.options.txtStyleSheet;
		if (theSheet!="[none]" && theSheet!="[system]" && !store.getTiddler(theSheet)) theSheet="StyleSheet";
		if (!store.getTiddler(theSheet)) theSheet="[system]";
		// set the listbox selection to current stylesheet
		theList.selectedIndex=0;	// default to first item
		for (var t=0; t<theList.options.length; t++)	
			if (theList.options[t].value==theSheet)
				{ theList.selectedIndex=t; break; }
		theList.options[t].text=">"+theList.options[t].text.substr(2);
		// autosize as appropriate
		theList.size=(theList.autosize<1)?theList.options.length:theList.autosize;
	} // end of "for all instances"
}
//}}}

//{{{
config.macros.selectStylesheet.templates = { };
function switchTemplates(which,readOnlyPrefix)
{
	// remember original templates (init only)
	if (!config.macros.selectStylesheet.templates.originalpage)
		config.macros.selectStylesheet.templates.originalpage = "PageTemplate";
	if (!config.macros.selectStylesheet.templates.originalview)
		config.macros.selectStylesheet.templates.originalview = config.tiddlerTemplates[1];
	if (!config.macros.selectStylesheet.templates.originaledit)
		config.macros.selectStylesheet.templates.originaledit = config.tiddlerTemplates[2];
	if (!config.macros.selectStylesheet.altTemplate)
		config.macros.selectStylesheet.altTemplate="";

	// define shorthand variables just for code readability 
	var page=config.macros.selectStylesheet.templates.originalpage;
	var view=config.macros.selectStylesheet.templates.originalview;
	var edit=config.macros.selectStylesheet.templates.originaledit;

	// get 'readOnly' mode... set by TW core, but not until after the plugin is loaded, so we need to do this here as well...
	var loc = document.location.toString();
	if (readOnly==undefined)
		var readOnly = (loc.substr(0,4) == "http" || loc.substr(0,3) == "ftp") ? config.options.chkHttpReadOnly : false;

	// get prefix defaults
	if (!which) var which="";
	if (!readOnlyPrefix) var readOnlyPrefix = "Web";
	if (!readOnly) readOnlyPrefix="";
	var alt = which+readOnlyPrefix;

	var msg="current template prefix: '%0', requested template prefix '%1'";
	if (config.macros.selectStylesheet.verbose) alert(msg.format([config.macros.selectStylesheet.altTemplate,alt]));

	// only switch if really changing templates
	if (alt == config.macros.selectStylesheet.altTemplate) return;

	// remember which templates are being used
	config.macros.selectStylesheet.altTemplate = alt;

	// set page template, with fallbacks for missing combinations
	var pageTemplate=alt+page;
	if (!store.getTiddlerText(pageTemplate)) pageTemplate=which+page;
	if (!store.getTiddlerText(pageTemplate)) pageTemplate=readOnlyPrefix+page;
	if (!store.getTiddlerText(pageTemplate)) pageTemplate=page;
	config.macros.selectStylesheet.templates.currentpage = pageTemplate;

	// set view template, with fallbacks for missing combinations
	var viewTemplate=alt+view;
	if (!store.getTiddlerText(viewTemplate)) viewTemplate=which+view;
	if (!store.getTiddlerText(viewTemplate)) viewTemplate=readOnlyPrefix+view;
	if (!store.getTiddlerText(viewTemplate)) viewTemplate=view;
	config.tiddlerTemplates[1] = config.macros.selectStylesheet.templates.currentview = viewTemplate;

	// set edit template, with fallbacks for missing combinations
	var editTemplate=alt+edit;
	if (!store.getTiddlerText(editTemplate)) editTemplate=which+edit;
	if (!store.getTiddlerText(editTemplate)) editTemplate=readOnlyPrefix+edit;
	if (!store.getTiddlerText(editTemplate)) editTemplate=edit;
	config.tiddlerTemplates[2] = config.macros.selectStylesheet.templates.currentedit = editTemplate;

	var msg="switching to templates: %0, %1, %2";
	if (config.macros.selectStylesheet.verbose) alert(msg.format([pageTemplate,viewTemplate,editTemplate]));

	// apply page template
	window.applyPageTemplate();
	// apply view/edit templates
	story.forEachTiddler(function(title,element) { this.refreshTiddler(title,null,true);});

}
// Hijack the applyPageTemplate so the alternate page template (if any) will refresh correctly
config.macros.selectStylesheet.coreApplyPageTemplate = window.applyPageTemplate;
window.applyPageTemplate = function(template)
{
	var cw=document.getElementById("contentWrapper");
	cw.style.display="none";
	config.macros.selectStylesheet.coreApplyPageTemplate(config.macros.selectStylesheet.templates.currentpage);
	cw.style.display="block";
}
//}}}

//{{{
function applyStylesheets()
{
	// define pattern to match executable <<tiddlername>> references embedded in CSS text
	var setTiddlerRegExp = new RegExp("(?:<<(?:init )([^>]+)>>)","mg");
	var resetTiddlerRegExp = new RegExp("(?:<<reset ([^>]+)>>)","mg");
	var templateRegExp = new RegExp("(?:<<template ([^\ss>]+)( [^>]+)?>>)","mg");

	// make sure the requested stylesheet exists, fallback if not...
	var theSheet=config.options.txtStyleSheet;
	switch (theSheet) {
		case "[none]":
		case "[system]":
			break;
		default:
			if (!store.getTiddler(theSheet)) theSheet="StyleSheet";
			if (!store.getTiddler(theSheet)) theSheet="[system]";
			break;
	}

	// When store.NotifyAll() is invoked, it can trigger multiple calls to applyStylesheets(),
	// even though only one is needed to set the styles and render things properly.  The extra calls
	// add unnecessary processing overhead by performing multiple re-rendering of entire TW display,
	// often resulting in "slow script" warnings.  To avoid this, we can track the last stylesheet that
	// was applied and only apply the current requested sheet if it is really a different sheet, OR
	// if the TW contents have actually changed (which might include changes to the current stylesheet)
	if (theSheet==config.macros.selectStylesheet.current && !store.dirty) return;
	config.macros.selectStylesheet.current=theSheet;

	// get the primary stylesheet CSS
	var msg="stylesheet: '%0'";
	if (config.macros.selectStylesheet.verbose) alert(msg.format([theSheet]));
	var theCSS = (theSheet.substr(0,1)=='[')?"":store.getRecursiveTiddlerText(theSheet,"");
	if (theSheet.substr(0,1)!='[') store.addNotification(theSheet,refreshStyles);

	// if <<template>> reference is not specified, reset to standard template
	if (theCSS.indexOf("<<template")==-1) switchTemplates();

	// execute any embedded <<template>> references
	do {
		var match = templateRegExp.exec(theCSS);
		if(match && match[1]) switchTemplates(match[1],match[2]);
	} while(match);
	// filter out embedded <<template>> references
	theCSS = theCSS.replace(templateRegExp,"");

	// execute any saved stylesheet 'reset' code tiddlers
	while (config.macros.selectStylesheet.reset.length) {
		var tiddler=config.macros.selectStylesheet.reset.shift();
		var msg="stylesheet reset macro: '%0'";
		if (config.macros.selectStylesheet.verbose) alert(msg.format([tiddler]));
		var msg="error in '%0': %1";
		try { eval(store.getTiddlerText(tiddler)); }
		catch(e) { displayMessage(msg.format([tiddler,e.toString()])); }
	}

	// save embedded <<reset tiddlername>> references
	do {
		var match = resetTiddlerRegExp.exec(theCSS);
		if(match && match[1])
			config.macros.selectStylesheet.reset.push(match[1]);
	} while(match);
	// filter out embedded <<reset tiddlername>> references
	theCSS = theCSS.replace(resetTiddlerRegExp,"");

	// execute any embedded <<init tiddlername>> references
	do {
		var match = setTiddlerRegExp.exec(theCSS);
		if(match && match[1]) {
			var msg="stylesheet macro: '%0'";
			if (config.macros.selectStylesheet.verbose) alert(msg.format([match[1]]));
			var msg="error in '%0': %1";
			try { eval(store.getTiddlerText(match[1])); }
			catch(e) { displayMessage(msg.format([match[1],e.toString()])); }
		}
	} while(match);
	// filter out embedded <<set tiddlername>> references
	theCSS = theCSS.replace(setTiddlerRegExp,"");

	// finally, apply the styles
	switch (theSheet) {
		case "[none]": // no styles
			setStylesheet("","StyleSheetColors");
			setStylesheet("","StyleSheetLayout");
			setStylesheet("","StyleSheet");
			break;
		case "[system]": // default styles only
			setStylesheet(store.getTiddlerText("StyleSheetColors"),"StyleSheetColors");
			setStylesheet(store.getTiddlerText("StyleSheetLayout"),"StyleSheetLayout");
			setStylesheet("","StyleSheet");
			break;
		default: // alternative stylesheet *replaces* default styles
			setStylesheet("/* overridden by [["+theSheet+"]] */","StyleSheetColors");
			setStylesheet("/* overridden by [["+theSheet+"]] */","StyleSheetLayout");
			setStylesheet(theCSS,"StyleSheet");
			break;
	}
}

config.macros.init = { };
config.macros.init.handler = function(place,macroName,params)
	{ var out="init: [[%0]]"; wikify(out.format(params),place); }
config.macros.reset = { };
config.macros.reset.handler = function(place,macroName,params)
	{ var out="reset: [[%0]]"; wikify(out.format(params),place); }
config.macros.template = { };
config.macros.template.handler = function(place,macroName,params)
	{ var out="use template prefix: ''%0 %1''"; wikify(out.format(params),place); }

//}}}