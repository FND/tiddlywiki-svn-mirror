/***
''Import Tiddlers Plugin for TiddlyWiki version 1.2.x, 2.0 and 2.1beta''
^^author: Eric Shulman - ELS Design Studios
source: http://www.TiddlyTools.com/#ImportTiddlersPlugin
license: [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]^^

When many people share and edit copies of the same TiddlyWiki document, the ability to quickly collect all these changes back into a single, updated document that can then be redistributed to the entire group is very important.  This plugin lets you selectively combine tiddlers from any two TiddlyWiki documents.  It can also be very useful when moving your own tiddlers from document to document (e.g., when upgrading to the latest version of TiddlyWiki, or 'pre-loading' your favorite stylesheets into a new 'empty' TiddlyWiki document.)

!!!!!Interactive interface
<<<
{{{<<importTiddlers>>}}}
creates "import tiddlers" link.  click to show/hide import control panel

{{{<<importTiddlers inline>>}}}
creates import control panel directly in tiddler content

<<importTiddlers inline>>

Press ''[browse]'' to select a TiddlyWiki document file to import.  You can also type in the path/filename or a remote document URL (starting with http://)and press ''[open]''.  //Note: There may be some delay to permit the browser time to access and load the document before updating the listbox with the titles of all tiddlers that are available to be imported.//

Select one or more titles from the listbox (hold CTRL or SHIFT while clicking to add/remove the highlight from individual list items).  You can press ''[select all]'' to quickly highlight all tiddler titles in the list.  Use the ''[-]'', ''[+]'', or ''[=]'' links to adjust the listbox size so you can view more (or less) tiddler titles at one time.  When you have chosen the tiddlers you want to import and entered any extra tags, press ''[import]'' to begin copying them to the current TiddlyWiki document.

''select: all, new, changes, or differences''

You can click on ''all'', ''new'', ''changes'', or ''differences'' to automatically select a subset of tiddlers from the list. This makes it very quick and easy to find and import just the updated tiddlers you are interested in:
>''"all"'' selects ALL tiddlers from the import source document, even if they have not been changed.
>''"new"'' selects only tiddlers that are found in the import source document, but do not yet exist in the destination document
>''"changes"'' selects only tiddlers that exist in both documents but that are newer in the source document
>''"differences"'' selects all new and existing tiddlers that are different from the destination document (even if destination tiddler is newer)

''Import Tagging:''

Tiddlers that have been imported can be automatically tagged, so they will be easier to find later on, after they have been added to your document.  New tags are entered into the "add tags" input field, and then //added// to the existing tags for each tiddler as it is imported.

''Skip, Rename, Merge, or Replace:''

When importing a tiddler whose title is identical to one that already exists, the import process pauses and the tiddler title is displayed in an input field, along with four push buttons: ''[skip]'', ''[rename]'', ''[merge]'' and ''[replace]''.

To bypass importing this tiddler, press ''[skip]''.  To import the tiddler with a different name (so that both the tiddlers will exist when the import is done), enter a new title in the input field and then press ''[rename]''.   Press ''[merge]'' to combine the content from both tiddlers into a single tiddler.  Press ''[replace]'' to overwrite the existing tiddler with the imported one, discarding the previous tiddler content.

//Note: if both the title ''and'' modification date/////time match, the imported tiddler is assumed to be identical to the existing one, and will be automatically skipped (i.e., not imported) without asking.//

''Import Report History''

When tiddlers are imported, a report is generated into ImportedTiddlers, indicating when the latest import was performed, the number of tiddlers successfully imported, from what location, and by whom. It also includes a list with the title, date and author of each tiddler that was imported.

When the import process is completed, the ImportedTiddlers report is automatically displayed for your review.  If more tiddlers are subsequently imported, a new report is //added// to ImportedTiddlers, above the previous report (i.e., at the top of the tiddler), so that a reverse-chronological history of imports is maintained.

If a cumulative record is not desired, the ImportedTiddlers report may be deleted at any time. A new ImportedTiddlers report will be created the next time tiddlers are imported.

Note: You can prevent the ImportedTiddlers report from being generated for any given import activity by clearing the "create a report" checkbox before beginning the import processing.

<<<
!!!!!non-interactive 'load tiddlers' macro
<<<
Useful for automated installation/update of plugins and other tiddler content.

{{{<<loadTiddlers "label:load tiddlers from %0" http://www.tiddlytools.com/example.html confirm>>}}}
<<loadTiddlers "label:load tiddlers from %0" http://www.tiddlytools.com/example.html confirm>>

Syntax:
{{{<<loadTiddlers label:text prompt:text filter source quiet confirm>>}}}

''label:text'' and ''prompt:text''
>defines link text and tooltip (prompt) that can be clicked to trigger the load tiddler processing.  If a label is NOT provided, then no link is created and loadTiddlers() is executed whenever the containing tiddler is rendered.
''filter'' (optional) determines which tiddlers will be automatically selected for importing.  Use one of the following keywords:
>''"all"'' retrieves ALL tiddlers from the import source document, even if they have not been changed.
>''"new"'' retrieves only tiddlers that are found in the import source document, but do not yet exist in the destination document
>''"changes"'' retrieves only tiddlers that exist in both documents for which the import source tiddler is newer than the existing tiddler
>''"updates"'' retrieves both ''new'' and ''changed'' tiddlers (this is the default action when none is specified)
>''"tiddler:~TiddlerName"'' retrieves only the specific tiddler named in the parameter.
>''"tag:text"'' retrieves only the tiddlers tagged with the indicated text.
''source'' (required) is the location of the imported document.  It can be either a local document path/filename in whatever format your system requires, or a remote web location (starting with "http://" or "https://")
>use the keyword ''ask'' to prompt for a source location whenever the macro is invoked
''"quiet"'' (optional)
>supresses all status message during the import processing (e.g., "opening local file...", "found NN tiddlers..." etc).  Note that if ANY tiddlers are actualy imported, a final information message will still be displayed (along with the ImportedTiddlers report), even when 'quiet' is specified.  This ensures that changes to your document cannot occur without any visible indication at all.
''"confirm"'' (optional)
>adds interactive confirmation.  A browser message box (OK/Cancel) is displayed for each tiddler that will be imported, so that you can manually bypass any tiddlers that you do not want to import.
<<<
!!!!!Installation
<<<
copy/paste the following tiddlers into your document:
''ImportTiddlersPlugin'' (tagged with <<tag systemConfig>>)

create/edit ''SideBarOptions'': (sidebar menu items) 
^^Add "< < ImportTiddlers > >" macro^^

''Quick Installation Tip #1:''
If you are using an unmodified version of TiddlyWiki (core release version <<version>>), you can get a new, empty TiddlyWiki with the Import Tiddlers plugin pre-installed (''[[download from here|TW+ImportExport.html]]''), and then simply import all your content from your old document into this new, empty document.
<<<
!!!!!Revision History
<<<
''2006.04.18 [3.0.4]''
in loadTiddlers.handler, fixed parsing of "prompt:" param. Also, corrected parameters mismatch in loadTiddlers() callback function definition (order of params was wrong, resulting in filters NOT being applied)
''2006.04.12 [3.0.3]''
moved many display messages to macro properties for easier L10N translations via 'lingo' definitions.
''2006.04.12 [3.0.2]''
additional refactoring of 'core candidate' code.  Proposed API now defines "loadRemoteFile()" for XMLHttpRequest processing with built in fallback for handling local filesystem access, and readTiddlersFromHTML() to process the resulting source HTML content.
''2006.04.04 [3.0.1]''
in refreshImportList(), when using [by tags], tiddlers without tags are now included in a new "untagged" psuedo-tag list section
''2006.04.04 [3.0.0]''
Separate non-interactive {{{<<importTiddlers...>>}}} macro functionality for incorporation into TW2.1 core and renamed as {{{<<loadTiddlers>>}}} macro.  New parameters for loadTiddlers: ''label:text'' and ''prompt:text'' for link creation,  ''ask'' for filename/URL, ''tag:text'' for filtering, "confirm" for accept/reject of individual inbound tiddlers.  Also, ImportedTiddlers report generator output has been simplified and "importReplace/importPublic" tags and associated "force" param (which were rarely, if ever, used) has been dropped.
''2006.03.30 [2.9.1]''
when extracting store area from remote URL, look for "</body>" instead of "</body>\sn</html>" so it will match even if the "\sn" is absent from the source.
''2006.03.30 [2.9.0]''
added optional 'force' macro param.  When present, autoImportTiddlers() bypasses the checks for importPublic and importReplace.  Based on a request from Tom Otvos.
''2006.03.28 [2.8.1]''
in loadImportFile(), added checks to see if 'netscape' and 'x.overrideMimeType()' are defined (IE does *not* define these values, so we bypass this code)
Also, when extracting store area from remote URL, explicitly look for "</body>\sn</html>" to exclude any extra content that may have been added to the end of the file by hosting environments such as GeoCities.  Thanks to Tom Otvos for finding these bugs and suggesting some fixes.
''2006.02.21 [2.8.0]''
added support for "tiddler:TiddlerName" filtering parameter in auto-import processing
''2006.02.21 [2.7.1]''
Clean up layout problems with IE.  (Use tables for alignment instead of SPANs styled with float:left and float:right)
''2006.02.21 [2.7.0]''
Added "local file" and "web server" radio buttons for selecting dynamic import source controls in ImportPanel.  Default file control is replaced with URL text input field when "web server" is selected.  Default remote document URL is defined in SiteURL tiddler.  Also, added option for prepending SiteProxy URL as prefix to remote URL to mask cross-domain document access (requires compatible server-side script)
''2006.02.17 [2.6.0]''
Removed "differences only" listbox display mode, replaced with selection filter 'presets': all/new/changes/differences.  Also fixed initialization handling for "add new tags" so that checkbox state is correctly tracked when panel is first displayed.
''2006.02.16 [2.5.4]''
added checkbox options to control "import remote tags" and "keep existing tags" behavior, in addition to existing "add new tags" functionality.
''2006.02.14 [2.5.3]''
FF1501 corrected unintended global 't' (loop index) in importReport() and autoImportTiddlers()
''2006.02.10 [2.5.2]''
corrected unintended global variable in importReport().
''2006.02.05 [2.5.1]''
moved globals from window.* to config.macros.importTiddlers.* to avoid FireFox 1.5.0.1 crash bug when referencing globals
''2006.01.18 [2.5.0]''
added checkbox for "create a report".  Default is to create/update the ImportedTiddlers report.  Clear the checkbox to skip this step.
''2006.01.15 [2.4.1]''
added "importPublic" tag and inverted default so that auto sharing is NOT done unless tagged with importPublic
''2006.01.15 [2.4.0]''
Added support for tagging individual tiddlers with importSkip, importReplace, and/or importPrivate to control which tiddlers can be overwritten or shared with others when using auto-import macro syntax.  Defaults are to SKIP overwriting existing tiddlers with imported tiddlers, and ALLOW your tiddlers to be auto-imported by others.
''2006.01.15 [2.3.2]''
Added "ask" parameter to confirm each tiddler before importing (for use with auto-importing)
''2006.01.15 [2.3.1]''
Strip TW core scripts from import source content and load just the storeArea into the hidden IFRAME.  Makes loading more efficient by reducing the document size and by preventing the import document from executing its TW initialization (including plugins).  Seems to resolve the "Found 0 tiddlers" problem.  Also, when importing local documents, use convertUTF8ToUnicode() to convert the file contents so support international characters sets.
''2006.01.12 [2.3.0]''
Reorganized code to use callback function for loading import files to support event-driven I/O via an ASYNCHRONOUS XMLHttpRequest.  Let's processing continue while waiting for remote hosts to respond to URL requests.  Added non-interactive 'batch' macro mode, using parameters to specify which tiddlers to import, and from what document source.  Improved error messages and diagnostics, plus an optional 'quiet' switch for batch mode to eliminate //most// feedback.
''2006.01.11 [2.2.0]''
Added "[by tags]" to list of tiddlers, based on code submitted by BradleyMeck
''2006.01.09 [2.1.1]''
When a URL is typed in, and then the "open" button is pressed, it generates both an onChange event for the file input and a click event for open button.  This results in multiple XMLHttpRequest()'s which seem to jam things up quite a bit.  I removed the onChange handling for file input field.  To open a file (local or URL), you must now explicitly press the "open" button in the control panel.
''2006.01.08 [2.1.0]''
IMPORT FROM ANYWHERE!!! re-write getImportedTiddlers() logic to either read a local file (using local I/O), OR... read a remote file, using a combination of XML and an iframe to permit cross-domain reading of DOM elements.  Adapted from example code and techniques courtesy of Jonny LeRoy.
''2006.01.06 [2.0.2]''
When refreshing list contents, fixed check for tiddlerExists() when "show differences only" is selected, so that imported tiddlers that don't exist in the current file will be recognized as differences and included in the list.
''2006.01.04 [2.0.1]''
When "show differences only" is NOT checked, import all tiddlers that have been selected even when they have a matching title and date.
''2005.12.27 [2.0.0]''
Update for TW2.0
Defer initial panel creation and only register a notification function when panel first is created
''2005.12.22 [1.3.1]''
tweak formatting in importReport() and add 'discard report' link to output
''2005.12.03 [1.3.0]''
Dynamically create/remove importPanel as needed to ensure only one instance of interface elements exists, even if there are multiple instances of macro embedding.  Also, dynamically create/recreate importFrame each time an external TW document is loaded for importation (reduces DOM overhead and ensures a 'fresh' frame for each document)
''2005.11.29 [1.2.1]''
fixed formatting of 'detail info' in importReport()
''2005.11.11 [1.2.0]''
added 'inline' param to embed controls in a tiddler
''2005.11.09 [1.1.0]''
only load HTML and CSS the first time the macro handler is called.  Allows for redundant placement of the macro without creating multiple instances of controls with the same ID's.
''2005.10.25 [1.0.5]''
fixed typo in importReport() that prevented reports from being generated
''2005.10.09 [1.0.4]''
combined documentation with plugin code instead of using separate tiddlers
''2005.08.05 [1.0.3]''
moved CSS and HTML definitions into plugin code instead of using separate tiddlers
''2005.07.27 [1.0.2]''
core update 1.2.29: custom overlayStyleSheet() replaced with new core setStylesheet()
''2005.07.23 [1.0.1]''
added parameter checks and corrected addNotification() usage
''2005.07.20 [1.0.0]''
Initial Release
<<<
!!!!!Credits
<<<
This feature was developed by EricShulman from [[ELS Design Studios|http:/www.elsdesign.com]]
<<<
!!!!!Code
***/
// // ''MACRO DEFINITION''
//{{{
// Version
version.extensions.importTiddlers = {major: 3, minor: 0, revision: 4, date: new Date(2006,4,18)};

// IE needs explicit global scoping for functions/vars called from browser events
window.onClickImportButton=onClickImportButton;
window.refreshImportList=refreshImportList;

// default cookie/option values
if (!config.options.chkImportReport) config.options.chkImportReport=true;

config.macros.importTiddlers = { };
config.macros.importTiddlers = {
	label: "import tiddlers",
	prompt: "Copy tiddlers from another document",
	foundMsg: "Found %0 tiddlers in %1",
	countMsg: "%0 tiddlers selected for import",
	importedMsg: "Imported %0 of %1 tiddlers from %2",
	src: "",		// path/filename or URL of document to import (retrieved from SiteUrl tiddler)
	proxy: "",		// URL for remote proxy script (retrieved from SiteProxy tiddler)
	useProxy: false,	// use specific proxy script in front of remote URL
	inbound: null,		// hash-indexed array of tiddlers from other document
	newTags: "",		// text of tags added to imported tiddlers
	addTags: true,		// add new tags to imported tiddlers
	listsize: 8,		// # of lines to show in imported tiddler list
	importTags: true,	// include tags from remote source document when importing a tiddler
	keepTags: true,		// retain existing tags when replacing a tiddler
	index: 0,		// current processing index in import list
	sort: ""		// sort order for imported tiddler listbox
};

config.macros.importTiddlers.handler = function(place,macroName,params) {
	if (!config.macros.loadTiddlers.handler)
		{ alert("importTiddlers error: this plugin requires LoadTiddlersPlugin or TiddlyWiki 2.1+"); return; }
	if (!params[0]) // LINK TO FLOATING PANEL
		createTiddlyButton(place,this.label,this.prompt,onClickImportMenu);
	else if (params[0]=="inline") {// // INLINE TIDDLER CONTENT
		createImportPanel(place);
		document.getElementById("importPanel").style.position="static";
		document.getElementById("importPanel").style.display="block";
	}
	else config.macros.loadTiddlers.handler(place,macroName,params); // FALLBACK: PASS TO LOADTIDDLERS
}
//}}}

// // ''INTERFACE DEFINITION''

// // Handle link click to create/show/hide control panel
//{{{
function onClickImportMenu(e)
{
	if (!e) var e = window.event;
	var parent=resolveTarget(e).parentNode;
	var panel = document.getElementById("importPanel");
	if (panel==undefined || panel.parentNode!=parent)
		panel=createImportPanel(parent);
	var isOpen = panel.style.display=="block";
	if(config.options.chkAnimate)
		anim.startAnimating(new Slider(panel,!isOpen,e.shiftKey || e.altKey,"none"));
	else
		panel.style.display = isOpen ? "none" : "block" ;
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return(false);
}
//}}}

// // Create control panel: HTML, CSS, register for notification
//{{{
function createImportPanel(place) {
	var panel=document.getElementById("importPanel");
	if (panel) { panel.parentNode.removeChild(panel); }
	setStylesheet(config.macros.importTiddlers.css,"importTiddlers");
	panel=createTiddlyElement(place,"span","importPanel",null,null)
	panel.innerHTML=config.macros.importTiddlers.html;
	store.addNotification(null,refreshImportList); // refresh listbox after every tiddler change
	refreshImportList();
	var siteURL=store.getTiddlerText("SiteUrl"); if (!siteURL) siteURL="";
	document.getElementById("importSourceURL").value=siteURL;
	config.macros.importTiddlers.src=siteURL;
	var siteProxy=store.getTiddlerText("SiteProxy"); if (!siteProxy) siteProxy="SiteProxy";
	document.getElementById("importSiteProxy").value=siteProxy;
	config.macros.importTiddlers.proxy=siteProxy;
	return panel;
}
//}}}

// // CSS
//{{{
config.macros.importTiddlers.css = '\s
#importPanel {\s
	display: none; position:absolute; z-index:11; width:35em; right:105%; top:3em;\s
	background-color: #eee; color:#000; font-size: 8pt; line-height:110%;\s
	border:1px solid black; border-bottom-width: 3px; border-right-width: 3px;\s
	padding: 0.5em; margin:0em; -moz-border-radius:1em;\s
}\s
#importPanel a, #importPanel td a { color:#009; display:inline; margin:0px; padding:1px; }\s
#importPanel table { width:100%; border:0px; padding:0px; margin:0px; font-size:8pt; line-height:110%; background:transparent; }\s
#importPanel tr { border:0px;padding:0px;margin:0px; background:transparent; }\s
#importPanel td { color:#000; border:0px;padding:0px;margin:0px; background:transparent; }\s
#importPanel select { width:98%;margin:0px;font-size:8pt;line-height:110%;}\s
#importPanel input  { width:98%;padding:0px;margin:0px;font-size:8pt;line-height:110%}\s
#importPanel .box { border:1px solid black; padding:3px; margin-bottom:5px; background:#f8f8f8; -moz-border-radius:5px;}\s
#importPanel .topline { border-top:2px solid black; padding-top:3px; margin-bottom:5px; }\s
#importPanel .rad { width:auto; }\s
#importPanel .chk { width:auto; margin:1px;border:0; }\s
#importPanel .btn { width:auto; }\s
#importPanel .btn1 { width:98%; }\s
#importPanel .btn2 { width:48%; }\s
#importPanel .btn3 { width:32%; }\s
#importPanel .btn4 { width:24%; }\s
#importPanel .btn5 { width:19%; }\s
#importPanel .importButton { padding: 0em; margin: 0px; font-size:8pt; }\s
#importPanel .importListButton { padding:0em 0.25em 0em 0.25em; color: #000000; display:inline }\s
#importCollisionPanel { display:none; margin:0.5em 0em 0em 0em; }\s
';
//}}}

// // HTML 
//{{{
config.macros.importTiddlers.html = '\s
<!-- source and report -->\s
<table><tr><td align=left>\s
	import from\s
	<input type="radio" class="rad" name="importFrom" value="file" CHECKED\s
		onClick="document.getElementById(\s'importLocalPanel\s').style.display=this.checked?\s'block\s':\s'none\s';\s
			document.getElementById(\s'importHTTPPanel\s').style.display=!this.checked?\s'block\s':\s'none\s'"> local file\s
	<input type="radio" class="rad" name="importFrom" value="http"\s
		onClick="document.getElementById(\s'importLocalPanel\s').style.display=!this.checked?\s'block\s':\s'none\s';\s
			document.getElementById(\s'importHTTPPanel\s').style.display=this.checked?\s'block\s':\s'none\s'"> web server\s
</td><td align=right>\s
	<input type=checkbox class="chk" id="chkImportReport" checked\s
		onClick="config.options[\s'chkImportReport\s']=this.checked;"> create a report\s
</td></tr></table>\s
<!-- import from local file  -->\s
<div id="importLocalPanel" style="display:block;margin-bottom:5px;margin-top:5px;padding-top:3px;border-top:1px solid #999">\s
local document path/filename:<br>\s
<input type="file" id="fileImportSource" size=57 style="width:100%"\s
	onKeyUp="config.macros.importTiddlers.src=this.value"\s
	onChange="config.macros.importTiddlers.src=this.value;">\s
</div><!--panel-->\s
\s
<!-- import from http server -->\s
<div id="importHTTPPanel" style="display:none;margin-bottom:5px;margin-top:5px;padding-top:3px;border-top:1px solid #999">\s
<table><tr><td align=left>\s
	remote document URL:<br>\s
</td><td align=right>\s
	<input type="checkbox" class="chk" id="importUseProxy"\s
		onClick="config.macros.importTiddlers.useProxy=this.checked;\s
			document.getElementById(\s'importSiteProxy\s').style.display=this.checked?\s'block\s':\s'none\s'"> use a proxy script\s
</td></tr></table>\s
<input type="text" id="importSiteProxy" style="display:none;margin-bottom:1px" onfocus="this.select()" value="SiteProxy"\s
	onKeyUp="config.macros.importTiddlers.proxy=this.value"\s
	onChange="config.macros.importTiddlers.proxy=this.value;">\s
<input type="text" id="importSourceURL" onfocus="this.select()" value="SiteUrl"\s
	onKeyUp="config.macros.importTiddlers.src=this.value"\s
	onChange="config.macros.importTiddlers.src=this.value;">\s
</div><!--panel-->\s
\s
<table><tr><td align=left>\s
	select:\s
	<a href="JavaScript:;" id="importSelectAll"\s
		onclick="onClickImportButton(this)" title="select all tiddlers">\s
		&nbsp;all&nbsp;</a>\s
	<a href="JavaScript:;" id="importSelectNew"\s
		onclick="onClickImportButton(this)" title="select tiddlers not already in destination document">\s
		&nbsp;added&nbsp;</a> \s
	<a href="JavaScript:;" id="importSelectChanges"\s
		onclick="onClickImportButton(this)" title="select tiddlers that have been updated in source document">\s
		&nbsp;changes&nbsp;</a> \s
	<a href="JavaScript:;" id="importSelectDifferences"\s
		onclick="onClickImportButton(this)" title="select tiddlers that have been added or are different from existing tiddlers">\s
		&nbsp;differences&nbsp;</a> \s
	<a href="JavaScript:;" id="importToggleFilter"\s
		onclick="onClickImportButton(this)" title="show/hide selection filter">\s
		&nbsp;filter&nbsp;</a> \s
</td><td align=right>\s
	<a href="JavaScript:;" id="importListSmaller"\s
		onclick="onClickImportButton(this)" title="reduce list size">\s
		&nbsp;&#150;&nbsp;</a>\s
	<a href="JavaScript:;" id="importListLarger"\s
		onclick="onClickImportButton(this)" title="increase list size">\s
		&nbsp;+&nbsp;</a>\s
	<a href="JavaScript:;" id="importListMaximize"\s
		onclick="onClickImportButton(this)" title="maximize/restore list size">\s
		&nbsp;=&nbsp;</a>\s
</td></tr></table>\s
<select id="importList" size=8 multiple\s
	onchange="setTimeout(\s'refreshImportList(\s'+this.selectedIndex+\s')\s',1)">\s
	<!-- NOTE: delay refresh so list is updated AFTER onchange event is handled -->\s
</select>\s
<input type=checkbox class="chk" id="chkAddTags" checked\s
	onClick="config.macros.importTiddlers.addTags=this.checked;">add new tags &nbsp;\s
<input type=checkbox class="chk" id="chkImportTags" checked\s
	onClick="config.macros.importTiddlers.importTags=this.checked;">import source tags &nbsp;\s
<input type=checkbox class="chk" id="chkKeepTags" checked\s
	onClick="config.macros.importTiddlers.keepTags=this.checked;">keep existing tags<br>\s
<input type=text id="txtNewTags" size=15 onKeyUp="config.macros.importTiddlers.newTags=this.value" autocomplete=off>\s
<div align=center>\s
	<input type=button id="importOpen" class="importButton" style="width:32%" value="open"\s
		onclick="onClickImportButton(this)">\s
	<input type=button id="importStart"	 class="importButton" style="width:32%" value="import"\s
		onclick="onClickImportButton(this)">\s
	<input type=button id="importClose"	 class="importButton" style="width:32%" value="close"\s
		onclick="onClickImportButton(this)">\s
</div>\s
<div id="importCollisionPanel">\s
	tiddler already exists:\s
	<input type=text id="importNewTitle" size=15 autocomplete=off">\s
	<div align=center>\s
	<input type=button id="importSkip"	class="importButton" style="width:23%" value="skip"\s
		onclick="onClickImportButton(this)">\s
	<input type=button id="importRename"  class="importButton" style="width:23%" value="rename"\s
		onclick="onClickImportButton(this)">\s
	<input type=button id="importMerge"   class="importButton" style="width:23%" value="merge"\s
		onclick="onClickImportButton(this)">\s
	<input type=button id="importReplace" class="importButton" style="width:23%" value="replace"\s
		onclick="onClickImportButton(this)">\s
	</div>\s
</div>\s
';
//}}}

// // Control interactions
//{{{
function onClickImportButton(which)
{
	// DEBUG alert(which.id);
	var theList		  = document.getElementById('importList');
	if (!theList) return;
	var thePanel	= document.getElementById('importPanel');
	var theCollisionPanel   = document.getElementById('importCollisionPanel');
	var theNewTitle   = document.getElementById('importNewTitle');
	var count=0;
	switch (which.id)
		{
		case 'fileImportSource':
		case 'importOpen':		// load import source into hidden frame
			importReport();		// if an import was in progress, generate a report
			config.macros.importTiddlers.inbound=null;	// clear the imported tiddler buffer
			refreshImportList();	// reset/resize the listbox
			if (config.macros.importTiddlers.src=="") break;
			// Load document into hidden iframe so we can read it's DOM and fill the list
			loadRemoteFile(config.macros.importTiddlers.src, function(src,txt) {
				var tiddlers = readTiddlersFromHTML(txt);
				var count=tiddlers?tiddlers.length:0;
				displayMessage(config.macros.importTiddlers.foundMsg.format([count,src]));
				config.macros.importTiddlers.inbound=tiddlers;
				window.refreshImportList(0);
			});
			break;
		case 'importSelectAll':		// select all tiddler list items (i.e., not headings)
			importReport();		// if an import was in progress, generate a report
			for (var t=0,count=0; t < theList.options.length; t++) {
				if (theList.options[t].value=="") continue;
				theList.options[t].selected=true;
				count++;
			}
			clearMessage(); displayMessage(config.macros.importTiddlers.countMsg.format([count]));
			break;
		case 'importSelectNew':		// select tiddlers not in current document
			importReport();		// if an import was in progress, generate a report
			for (var t=0,count=0; t < theList.options.length; t++) {
				theList.options[t].selected=false;
				if (theList.options[t].value=="") continue;
				theList.options[t].selected=!store.tiddlerExists(theList.options[t].value);
				count+=theList.options[t].selected?1:0;
			}
			clearMessage(); displayMessage(config.macros.importTiddlers.countMsg.format([count]));
			break;
		case 'importSelectChanges':		// select tiddlers that are updated from existing tiddlers
			importReport();		// if an import was in progress, generate a report
			for (var t=0,count=0; t < theList.options.length; t++) {
				theList.options[t].selected=false;
				if (theList.options[t].value==""||!store.tiddlerExists(theList.options[t].value)) continue;
				for (var i=0; i<config.macros.importTiddlers.inbound.length; i++) // find matching inbound tiddler
					{ var inbound=config.macros.importTiddlers.inbound[i]; if (inbound.title==theList.options[t].value) break; }
				theList.options[t].selected=(inbound.modified-store.getTiddler(theList.options[t].value).modified>0); // updated tiddler
				count+=theList.options[t].selected?1:0;
			}
			clearMessage(); displayMessage(config.macros.importTiddlers.countMsg.format([count]));
			break;
		case 'importSelectDifferences':		// select tiddlers that are new or different from existing tiddlers
			importReport();		// if an import was in progress, generate a report
			for (var t=0,count=0; t < theList.options.length; t++) {
				theList.options[t].selected=false;
				if (theList.options[t].value=="") continue;
				if (!store.tiddlerExists(theList.options[t].value)) { theList.options[t].selected=true; count++; continue; }
				for (var i=0; i<config.macros.importTiddlers.inbound.length; i++) // find matching inbound tiddler
					{ var inbound=config.macros.importTiddlers.inbound[i]; if (inbound.title==theList.options[t].value) break; }
				theList.options[t].selected=(inbound.modified-store.getTiddler(theList.options[t].value).modified!=0); // changed tiddler
				count+=theList.options[t].selected?1:0;
			}
			clearMessage(); displayMessage(config.macros.importTiddlers.countMsg.format([count]));
			break;
		case 'importToggleFilter': // show/hide filter
		case 'importFilter': // apply filter
			alert("coming soon!");
			break;
		case 'importStart':		// initiate the import processing
			importReport();		// if an import was in progress, generate a report
			config.macros.importTiddlers.index=0;
			config.macros.importTiddlers.index=importTiddlers(0);
			importStopped();
			break;
		case 'importClose':		// unload imported tiddlers or hide the import control panel
			// if imported tiddlers not loaded, close the import control panel
			if (!config.macros.importTiddlers.inbound) { thePanel.style.display='none'; break; }
			importReport();		// if an import was in progress, generate a report
			config.macros.importTiddlers.inbound=null;	// clear the imported tiddler buffer
			refreshImportList();	// reset/resize the listbox
			break;
		case 'importSkip':	// don't import the tiddler
			var theItem	= theList.options[config.macros.importTiddlers.index];
			for (var j=0;j<config.macros.importTiddlers.inbound.length;j++)
			if (config.macros.importTiddlers.inbound[j].title==theItem.value) break;
			var theImported = config.macros.importTiddlers.inbound[j];
			theImported.status='skipped after asking';			// mark item as skipped
			theCollisionPanel.style.display='none';
			config.macros.importTiddlers.index=importTiddlers(config.macros.importTiddlers.index+1);	// resume with NEXT item
			importStopped();
			break;
		case 'importRename':		// change name of imported tiddler
			var theItem		= theList.options[config.macros.importTiddlers.index];
			for (var j=0;j<config.macros.importTiddlers.inbound.length;j++)
			if (config.macros.importTiddlers.inbound[j].title==theItem.value) break;
			var theImported		= config.macros.importTiddlers.inbound[j];
			theImported.status	= 'renamed from '+theImported.title;	// mark item as renamed
			theImported.set(theNewTitle.value,null,null,null,null);		// change the tiddler title
			theItem.value		= theNewTitle.value;			// change the listbox item text
			theItem.text		= theNewTitle.value;			// change the listbox item text
			theCollisionPanel.style.display='none';
			config.macros.importTiddlers.index=importTiddlers(config.macros.importTiddlers.index);	// resume with THIS item
			importStopped();
			break;
		case 'importMerge':	// join existing and imported tiddler content
			var theItem	= theList.options[config.macros.importTiddlers.index];
			for (var j=0;j<config.macros.importTiddlers.inbound.length;j++)
			if (config.macros.importTiddlers.inbound[j].title==theItem.value) break;
			var theImported	= config.macros.importTiddlers.inbound[j];
			var theExisting	= store.getTiddler(theItem.value);
			var theText	= theExisting.text+'\sn----\sn^^merged from: ';
			theText		+='[['+config.macros.importTiddlers.src+'#'+theItem.value+'|'+config.macros.importTiddlers.src+'#'+theItem.value+']]^^\sn';
			theText		+='^^'+theImported.modified.toLocaleString()+' by '+theImported.modifier+'^^\sn'+theImported.text;
			var theDate	= new Date();
			var theTags	= theExisting.getTags()+' '+theImported.getTags();
			theImported.set(null,theText,null,theDate,theTags);
			theImported.status   = 'merged with '+theExisting.title;	// mark item as merged
			theImported.status  += ' - '+theExisting.modified.formatString("MM/DD/YYYY 0hh:0mm:0ss");
			theImported.status  += ' by '+theExisting.modifier;
			theCollisionPanel.style.display='none';
			config.macros.importTiddlers.index=importTiddlers(config.macros.importTiddlers.index);	// resume with this item
			importStopped();
			break;
		case 'importReplace':		// substitute imported tiddler for existing tiddler
			var theItem		  = theList.options[config.macros.importTiddlers.index];
			for (var j=0;j<config.macros.importTiddlers.inbound.length;j++)
			if (config.macros.importTiddlers.inbound[j].title==theItem.value) break;
			var theImported     = config.macros.importTiddlers.inbound[j];
			var theExisting	  = store.getTiddler(theItem.value);
			theImported.status  = 'replaces '+theExisting.title;		// mark item for replace
			theImported.status += ' - '+theExisting.modified.formatString("MM/DD/YYYY 0hh:0mm:0ss");
			theImported.status += ' by '+theExisting.modifier;
			theCollisionPanel.style.display='none';
			config.macros.importTiddlers.index=importTiddlers(config.macros.importTiddlers.index);	// resume with THIS item
			importStopped();
			break;
		case 'importListSmaller':		// decrease current listbox size, minimum=5
			if (theList.options.length==1) break;
			theList.size-=(theList.size>5)?1:0;
			config.macros.importTiddlers.listsize=theList.size;
			break;
		case 'importListLarger':		// increase current listbox size, maximum=number of items in list
			if (theList.options.length==1) break;
			theList.size+=(theList.size<theList.options.length)?1:0;
			config.macros.importTiddlers.listsize=theList.size;
			break;
		case 'importListMaximize':	// toggle listbox size between current and maximum
			if (theList.options.length==1) break;
			theList.size=(theList.size==theList.options.length)?config.macros.importTiddlers.listsize:theList.options.length;
			break;
		}
}
//}}}

// // refresh listbox
//{{{
function refreshImportList(selectedIndex)
{
	var theList  = document.getElementById("importList");
	if (!theList) return;
	// if nothing to show, reset list content and size
	if (!config.macros.importTiddlers.inbound) 
	{
		while (theList.length > 0) { theList.options[0] = null; }
		theList.options[0]=new Option('please open a document...',"",false,false);
		theList.size=config.macros.importTiddlers.listsize;
		return;
	}
	// get the sort order
	if (!selectedIndex)   selectedIndex=0;
	if (selectedIndex==0) config.macros.importTiddlers.sort='title';		// heading
	if (selectedIndex==1) config.macros.importTiddlers.sort='title';
	if (selectedIndex==2) config.macros.importTiddlers.sort='modified';
	if (selectedIndex==3) config.macros.importTiddlers.sort='tags';
	if (selectedIndex>3) {
		// display selected tiddler count
		for (var t=0,count=0; t < theList.options.length; t++) count+=(theList.options[t].selected&&theList.options[t].value!="")?1:0;
		clearMessage(); displayMessage(config.macros.importTiddlers.countMsg.format([count]));
		return; // no refresh needed
	}

	// get the alphasorted list of tiddlers (optionally, filter out unchanged tiddlers)
	var tiddlers=config.macros.importTiddlers.inbound;
	tiddlers.sort(function (a,b) {if(a['title'] == b['title']) return(0); else return (a['title'] < b['title']) ? -1 : +1; });
	// clear current list contents
	while (theList.length > 0) { theList.options[0] = null; }
	// add heading and control items to list
	var i=0;
	var indent=String.fromCharCode(160)+String.fromCharCode(160);
	theList.options[i++]=new Option(tiddlers.length+' tiddler'+((tiddlers.length!=1)?'s are':' is')+' in the document',"",false,false);
	theList.options[i++]=new Option(((config.macros.importTiddlers.sort=="title"   )?">":indent)+' [by title]',"",false,false);
	theList.options[i++]=new Option(((config.macros.importTiddlers.sort=="modified")?">":indent)+' [by date]',"",false,false);
	theList.options[i++]=new Option(((config.macros.importTiddlers.sort=="tags")?">":indent)+' [by tags]',"",false,false);
	// output the tiddler list
	switch(config.macros.importTiddlers.sort)
		{
		case "title":
			for(var t = 0; t < tiddlers.length; t++)
				theList.options[i++] = new Option(tiddlers[t].title,tiddlers[t].title,false,false);
			break;
		case "modified":
			// sort descending for newest date first
			tiddlers.sort(function (a,b) {if(a['modified'] == b['modified']) return(0); else return (a['modified'] > b['modified']) ? -1 : +1; });
			var lastSection = "";
			for(var t = 0; t < tiddlers.length; t++) {
				var tiddler = tiddlers[t];
				var theSection = tiddler.modified.toLocaleDateString();
				if (theSection != lastSection) {
					theList.options[i++] = new Option(theSection,"",false,false);
					lastSection = theSection;
				}
				theList.options[i++] = new Option(indent+indent+tiddler.title,tiddler.title,false,false);
			}
			break;
		case "tags":
			var theTitles = {}; // all tiddler titles, hash indexed by tag value
			var theTags = new Array();
			for(var t=0; t<tiddlers.length; t++) {
				var title=tiddlers[t].title;
				var tags=tiddlers[t].tags;
				if (!tags || !tags.length) {
					if (theTitles["untagged"]==undefined) { theTags.push("untagged"); theTitles["untagged"]=new Array(); }
					theTitles["untagged"].push(title);
				}
				else for(var s=0; s<tags.length; s++) {
					if (theTitles[tags[s]]==undefined) { theTags.push(tags[s]); theTitles[tags[s]]=new Array(); }
					theTitles[tags[s]].push(title);
				}
			}
			theTags.sort();
			for(var tagindex=0; tagindex<theTags.length; tagindex++) {
				var theTag=theTags[tagindex];
				theList.options[i++]=new Option(theTag,"",false,false);
				for(var t=0; t<theTitles[theTag].length; t++)
					theList.options[i++]=new Option(indent+indent+theTitles[theTag][t],theTitles[theTag][t],false,false);
			}
			break;
		}
	theList.selectedIndex=selectedIndex;		  // select current control item
	if (theList.size<config.macros.importTiddlers.listsize) theList.size=config.macros.importTiddlers.listsize;
	if (theList.size>theList.options.length) theList.size=theList.options.length;
}
//}}}

// // re-entrant processing for handling import with interactive collision prompting
//{{{
function importTiddlers(startIndex)
{
	if (!config.macros.importTiddlers.inbound) return -1;

	var theList = document.getElementById('importList');
	if (!theList) return;
	var t;
	// if starting new import, reset import status flags
	if (startIndex==0)
		for (var t=0;t<config.macros.importTiddlers.inbound.length;t++)
			config.macros.importTiddlers.inbound[t].status="";
	for (var i=startIndex; i<theList.options.length; i++)
		{
		// if list item is not selected or is a heading (i.e., has no value), skip it
		if ((!theList.options[i].selected) || ((t=theList.options[i].value)==""))
			continue;
		for (var j=0;j<config.macros.importTiddlers.inbound.length;j++)
			if (config.macros.importTiddlers.inbound[j].title==t) break;
		var theImported = config.macros.importTiddlers.inbound[j];
		var theExisting = store.getTiddler(theImported.title);
		// avoid redundant import for tiddlers that are listed multiple times (when 'by tags')
		if (theImported.status=="added")
			continue;
		// don't import the "ImportedTiddlers" history from the other document...
		if (theImported.title=='ImportedTiddlers')
			continue;
		// if tiddler exists and import not marked for replace or merge, stop importing
		if (theExisting && (theImported.status.substr(0,7)!="replace") && (theImported.status.substr(0,5)!="merge"))
			return i;
		// assemble tags (remote + existing + added)
		var newTags = "";
		if (config.macros.importTiddlers.importTags)
			newTags+=theImported.getTags()	// import remote tags
		if (config.macros.importTiddlers.keepTags && theExisting)
			newTags+=" "+theExisting.getTags(); // keep existing tags
		if (config.macros.importTiddlers.addTags && config.macros.importTiddlers.newTags.trim().length)
			newTags+=" "+config.macros.importTiddlers.newTags; // add new tags
		theImported.set(null,null,null,null,newTags.trim());
		// set the status to 'added' (if not already set by the 'ask the user' UI)
		theImported.status=(theImported.status=="")?'added':theImported.status;
		// do the import!
		store.addTiddler(theImported);
		store.setDirty(true);
		}
	return(-1);	// signals that we really finished the entire list
}
//}}}

//{{{
function importStopped()
{
	var theList     = document.getElementById('importList');
	var theNewTitle = document.getElementById('importNewTitle');
	if (!theList) return;
	if (config.macros.importTiddlers.index==-1)
		importReport();		// import finished... generate the report
	else
		{
		// DEBUG alert('import stopped at: '+config.macros.importTiddlers.index);
		// import collision... show the collision panel and set the title edit field
		document.getElementById('importCollisionPanel').style.display='block';
		theNewTitle.value=theList.options[config.macros.importTiddlers.index].value;
		}
}
//}}}

// // ''REPORT GENERATOR''
//{{{
function importReport(quiet)
{
	if (!config.macros.importTiddlers.inbound) return;
	// DEBUG alert('importReport: start');

	// if import was not completed, the collision panel will still be open... close it now.
	var panel=document.getElementById('importCollisionPanel'); if (panel) panel.style.display='none';

	// get the alphasorted list of tiddlers
	var tiddlers = config.macros.importTiddlers.inbound;
	// gather the statistics
	var count=0;
	for (var t=0; t<tiddlers.length; t++)
		if (tiddlers[t].status && tiddlers[t].status.trim().length && tiddlers[t].status.substr(0,7)!="skipped") count++;

	// generate a report
	if (count && config.options.chkImportReport) {
		// get/create the report tiddler
		var theReport = store.getTiddler('ImportedTiddlers');
		if (!theReport) { theReport= new Tiddler(); theReport.title = 'ImportedTiddlers'; theReport.text  = ""; }
		// format the report content
		var now = new Date();
		var newText = "On "+now.toLocaleString()+", "+config.options.txtUserName
		newText +=" imported "+count+" tiddler"+(count==1?"":"s")+" from\sn[["+config.macros.importTiddlers.src+"|"+config.macros.importTiddlers.src+"]]:\sn";
		if (config.macros.importTiddlers.addTags && config.macros.importTiddlers.newTags.trim().length)
			newText += "imported tiddlers were tagged with: \s""+config.macros.importTiddlers.newTags+"\s"\sn";
		newText += "<<<\sn";
		for (var t=0; t<tiddlers.length; t++) if (tiddlers[t].status) newText += "#[["+tiddlers[t].title+"]] - "+tiddlers[t].status+"\sn";
		newText += "<<<\sn";
		newText += "<html><input type=\s"button\s" href=\s"javascript:;\s" ";
		newText += "onclick=\s"story.closeTiddler('"+theReport.title+"'); store.deleteTiddler('"+theReport.title+"');\s" ";
		newText += "value=\s"discard report\s"></html>";
		// update the ImportedTiddlers content and show the tiddler
		theReport.text	 = newText+((theReport.text!="")?'\sn----\sn':"")+theReport.text;
		theReport.modifier = config.options.txtUserName;
		theReport.modified = new Date();
		store.addTiddler(theReport);
		if (!quiet) { story.displayTiddler(null,theReport.title,1,null,null,false); story.refreshTiddler(theReport.title,1,true); }
	}

	// reset status flags
	for (var t=0; t<config.macros.importTiddlers.inbound.length; t++) config.macros.importTiddlers.inbound[t].status="";

	// refresh display if tiddlers have been loaded
	if (count) { store.setDirty(true);  store.notifyAll(); }

	// always show final message when tiddlers were actually loaded
	if (count) displayMessage(config.macros.importTiddlers.importedMsg.format([count,tiddlers.length,config.macros.importTiddlers.src]));
}
//}}}

/***
!!!!!TW 2.1beta Core Code Candidate
//The following section is a preliminary 'code candidate' for incorporation of non-interactive 'load tiddlers' functionality into TW2.1beta. //
***/
//{{{
// default cookie/option values
if (!config.options.chkImportReport) config.options.chkImportReport=true;

config.macros.loadTiddlers = {
	label: "",
	prompt: "add/update tiddlers from '%0'",
	askMsg: "Please enter a local path/filename or a remote URL",
	openMsg: "Opening %0",
	openErrMsg: "Could not open %0 - error=%1",
	readMsg: "Read %0 bytes from %1",
	foundMsg: "Found %0 tiddlers in %1",
	loadedMsg: "Loaded %0 of %1 tiddlers from %2"
};

config.macros.loadTiddlers.handler = function(place,macroName,params) {
	var label=(params[0] && params[0].substr(0,6)=='label:')?params.shift().substr(6):this.label;
	var prompt=(params[0] && params[0].substr(0,7)=='prompt:')?params.shift().substr(7):this.prompt;
	var filter="updates";
	if (params[0] && (params[0]=='all' || params[0]=='new' || params[0]=='changes' || params[0]=='updates'
		|| params[0].substr(0,8)=='tiddler:' || params[0].substr(0,4)=='tag:'))
		filter=params.shift();
	var src=params.shift(); if (!src || !src.length) return; // filename is required
	var quiet=(params[0]=="quiet"); if (quiet) params.shift();
	var ask=(params[0]=="confirm"); if (ask) params.shift();
	if (label.trim().length) {
		// link triggers load tiddlers from another file/URL and then applies filtering rules to add/replace tiddlers in the store
		createTiddlyButton(place,label.format([src]),prompt.format([src]), function() {
			if (src=="ask") src=prompt(config.macros.loadTiddlers.askMsg);
			loadRemoteFile(src,loadTiddlers,quiet,ask,filter);
		})
	}
	else {
		// load tiddlers from another file/URL and then apply filtering rules to add/replace tiddlers in the store
		if (src=="ask") src=prompt(config.macros.loadTiddlers.askMsg);
		loadRemoteFile(src,loadTiddlers,quiet,ask,filter);
	}
}

function loadTiddlers(src,html,quiet,ask,filter)
{
	var tiddlers = readTiddlersFromHTML(html);
	var count=tiddlers?tiddlers.length:0;
	if (!quiet) displayMessage(config.macros.loadTiddlers.foundMsg.format([count,src]));
	var count=0;
	if (tiddlers) for (var t=0;t<tiddlers.length;t++) {
		var theInbound = tiddlers[t];
		var theExisting = store.getTiddler(theInbound.title);
		if (theInbound.title=='ImportedTiddlers')
			continue; // skip "ImportedTiddlers" history from the other document...

		// apply the all/new/changes/updates filter (if any)
		if (filter && filter!="all") {
			if ((filter=="new") && theExisting) // skip existing tiddlers
				continue;
			if ((filter=="changes") && !theExisting) // skip new tiddlers
				continue;
			if ((filter.substr(0,4)=="tag:") && theInbound.tags.find(filter.substr(4))==null) // must match specific tag value
				continue;
			if ((filter.substr(0,8)=="tiddler:") && theInbound.title!=filter.substr(8)) // must match specific tiddler name
				continue;
			if (store.tiddlerExists(theInbound.title) && ((theExisting.modified.getTime()-theInbound.modified.getTime())>=0)) // tiddler is unchanged
				continue;
		}
		// get confirmation if required
		if (ask && !confirm((theExisting?"Update":"Add")+" tiddler '"+theInbound.title+"'\snfrom "+src))
			{ tiddlers[t].status="skipped - cancelled by user"; continue; }
		// DO IT!
		store.addTiddler(theInbound);
		tiddlers[t].status=theExisting?"updated":"added"
		count++;
	}
	if (count) {
		// refresh display
		store.setDirty(true);
		store.notifyAll();
		// generate a report
		if (config.options.chkImportReport) {
			// get/create the report tiddler
			var theReport = store.getTiddler('ImportedTiddlers');
			if (!theReport) { theReport= new Tiddler(); theReport.title = 'ImportedTiddlers'; theReport.text  = ""; }
			// format the report content
			var now = new Date();
			var newText = "On "+now.toLocaleString()+", "+config.options.txtUserName+" loaded "+count+" tiddlers from\sn[["+src+"|"+src+"]]:\sn";
			newText += "<<<\sn";
			for (var t=0; t<tiddlers.length; t++) if (tiddlers[t].status) newText += "#[["+tiddlers[t].title+"]] - "+tiddlers[t].status+"\sn";
			newText += "<<<\sn";
			newText += "<html><input type=\s"button\s" href=\s"javascript:;\s" ";
			newText += "onclick=\s"story.closeTiddler('"+theReport.title+"'); store.deleteTiddler('"+theReport.title+"');\s" ";
			newText += "value=\s"discard report\s"></html>";
			// update the ImportedTiddlers content and show the tiddler
			theReport.text	 = newText+((theReport.text!="")?'\sn----\sn':"")+theReport.text;
			theReport.modifier = config.options.txtUserName;
			theReport.modified = new Date();
			store.addTiddler(theReport);
			if (!quiet) { story.displayTiddler(null,theReport.title,1,null,null,false); story.refreshTiddler(theReport.title,1,true); }
		}
	}
	// always show final message when tiddlers were actually loaded
	if (!quiet||count) displayMessage(config.macros.loadTiddlers.loadedMsg.format([count,tiddlers.length,src]));
}

function loadRemoteFile(src,callback,quiet,ask,filter) {
	if (src==undefined || !src.length) return null; // filename is required
	if (!quiet) clearMessage();
	if (!quiet) displayMessage(config.macros.loadTiddlers.openMsg.format([src]));
	if (src.substr(0,4)!="http" && src.substr(0,4)!="file") { // if not a URL, fallback to read from local filesystem
		var txt=loadFile(src);
		if ((txt==null)||(txt==false)) // file didn't load
			{ if (!quiet) displayMessage(config.macros.loadTiddlers.openErrMsg.format([src,"(unknown)"])); }
		else {
			if (!quiet) displayMessage(config.macros.loadTiddlers.readMsg.format([txt.length,src]));
			if (callback) callback(src,convertUTF8ToUnicode(txt),quiet,ask,filter);
		}
	}
	else {
		var x; // get an request object
		try {x = new XMLHttpRequest()} // moz
		catch(e) {
			try {x = new ActiveXObject("Msxml2.XMLHTTP")} // IE 6
			catch (e) {
				try {x = new ActiveXObject("Microsoft.XMLHTTP")} // IE 5
				catch (e) { return }
			}
		}
		// setup callback function to handle server response(s)
		x.onreadystatechange = function() {
			if (x.readyState == 4) {
				if (x.status==0 || x.status == 200) {
					if (!quiet) displayMessage(config.macros.loadTiddlers.readMsg.format([x.responseText.length,src]));
					if (callback) callback(src,x.responseText,quiet,ask,filter);
				}
				else {
					if (!quiet) displayMessage(config.macros.loadTiddlers.openErrMsg.format([src,x.status]));
				}
			}
		}
		// get privileges to read another document's DOM via http:// or file:// (moz-only)
		if (typeof(netscape)!="undefined") {
			try { netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead"); }
			catch (e) { if (!quiet) displayMessage(e.description?e.description:e.toString()); }
		}
		// send the HTTP request
		try {
			var url=src+(src.indexOf('?')<0?'?':'&')+'nocache='+Math.random();
			x.open("GET",src,true);
			if (x.overrideMimeType) x.overrideMimeType('text/html');
			x.send(null);
		}
		catch (e) {
			if (!quiet) {
				displayMessage(config.macros.loadTiddlers.openErrMsg.format([src,"(unknown)"]));
				displayMessage(e.description?e.description:e.toString());
			}
		}
	}
}

function readTiddlersFromHTML(html)
{
	// extract store area from html 
	var start=html.indexOf('<div id="storeArea">');
	var end=html.indexOf('</body>',start);
	var sa="<html><body>"+html.substring(start,end)+"</body></html>";

	// load html into iframe document
	var f=document.getElementById("loaderFrame"); if (f) document.body.removeChild(f);
	f=document.createElement("iframe"); f.id="loaderFrame";
	f.style.width="0px"; f.style.height="0px"; f.style.border="0px";
	document.body.appendChild(f);
	var d=f.document;
	if (f.contentDocument) d=f.contentDocument; // For NS6
	else if (f.contentWindow) d=f.contentWindow.document; // For IE5.5 and IE6
	d.open(); d.writeln(sa); d.close();

	// read tiddler DIVs from storeArea DOM element	
	var sa = d.getElementById("storeArea");
	if (!sa) return null;
	sa.normalize();
	var nodes = sa.childNodes;
	if (!nodes || !nodes.length) return null;
	var tiddlers = [];
	for(var t = 0; t < nodes.length; t++) {
		var title = null;
		if(nodes[t].getAttribute)
			title = nodes[t].getAttribute("tiddler");
		if(!title && nodes[t].id && (nodes[t].id.substr(0,5) == "store"))
			title = nodes[t].id.substr(5);
		if(title && title != "")
			tiddlers.push((new Tiddler()).loadFromDiv(nodes[t],title));
	}
	return tiddlers;
}
//}}}