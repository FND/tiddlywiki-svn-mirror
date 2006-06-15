/***
''Export Tiddlers Plugin for TiddlyWiki version 2.0''
^^author: Eric Shulman - ELS Design Studios
source: http://www.TiddlyTools.com/#ExportTiddlersPlugin
license: [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]^^

When many people edit copies of the same TiddlyWiki document, the ability to easily copy and share these changes so they can then be redistributed to the entire group is very important.  This ability is also very useful when moving your own tiddlers from document to document (e.g., when upgrading to the latest version of TiddlyWiki, or 'pre-loading' your favorite stylesheets into a new 'empty' TiddlyWiki document.)

ExportTiddlersPlugin let you ''select and extract tiddlers from your ~TiddlyWiki documents and save them to a local file'' or a remote server (requires installation of compatible server-side scripting, still under development...).  An interactive control panel lets you specify a destination, and then select which tiddlers to export.  A convenient 'selection filter' helps you pick desired tiddlers by specifying a combination of modification dates, tags, or tiddler text to be matched or excluded.  ''Tiddler data can be output as ~TiddlyWiki "storeArea ~DIVs" that can be imported into another ~TiddlyWiki or as ~RSS-compatible XML that can be published for RSS syndication.''

!!!!!Inline interface (live)
<<<
<<exportTiddlers inline>>
<<<
!!!!!Usage
<<<
Optional "special tiddlers" used by this plugin:
* SiteUrl^^
URL for official server-published version of document being viewed (used in XML export)
default: //none//^^
* SiteHost^^
host name/address for remote server (e.g., "www.server.com" or "192.168.1.27")
default: //none//^^
* SitePost^^
remote path/filename for submitting changes (e.g., "/cgi-bin/submit.cgi")
default: //none//^^
* SiteParams^^
arguments (if any) for server-side receiving script
default: //none//^^
* SiteNotify^^
addresses (if any) for sending automatic server-side email notices
default: //none//^^
* SiteID^^
username or other authorization identifier for login-controlled access to remote server
default: current TiddlyWiki username (e.g., "YourName")^^
* SiteDate^^
stored date/time stamp for most recent published version of document
default: current document.modified value (i.e., the 'file date')^^
<<<
!!!!!Example
<<<
<<exportTiddlers>>
<<<
!!!!!Installation
<<<
Import (or copy/paste) the following tiddlers into your document:
''ExportTiddlersPlugin'' (tagged with <<tag systemConfig>>)

create/edit ''SideBarOptions'': (sidebar menu items) 
^^Add {{{<<exportTiddlers>>}}} macro^^
<<<
!!!!!Revision History
<<<
''2006.05.11 [2.2.2]''
in createExportPanel, removed call to addNotification() to no longer auto-refresh the list every time a tiddler is changed.  Instead, call refreshExportList(0) only when the panel is first rendered and each time it is made visible.  Prevents unneeded feedback messages from being displayed and increases overall document performance, since the listbox is no longer being updated each time a tiddler is saved.
''2006.05.02 [2.2.1]''
Use displayMessage() to show number of selected tiddlers instead of updating listbox 'header' item after each selection.  Prevents awkward 'scroll-to-top' behavior that made multi-select via ctrl-click nearly impossible.  Reported by Paul Reiber.
''2006.04.29 [2.2.0]''
New features: "Notes" are free-form text that is inserted in the header of a TWDIV export file.  When exporting to a server, the "notify" checkbox indicates that server-side script processing should send an email message when the export file is stored on the server.  Comma-separated addresses may be typed in, or pre-defined in the SiteNotify tiddler.
''2006.03.29 [2.1.3]''
added calls to convertUnicodeToUTF8() for generated output, so it better handles international characters.
''2006.02.12 [2.1.2]''
added var to unintended global 'tags' in matchTags(). Avoids FF1501 bug when filtering by tags.  (based on report by TedPavlic)
''2006.02.04 [2.1.1]''
added var to variables that were unintentionally global.  Avoids FireFox 1.5.0.1 crash bug when referencing global variables
''2006.02.02 [2.1.0]''
Added support for output of complete TiddlyWiki documents.  Let's you use ExportTiddlers to generate 'starter' documents from selected tiddlers.
''2006.01.21 [2.0.1]''
Defer initial panel creation and only register a notification function when panel first is created
in saveChanges 'hijack', create panel as needed.  Note: if window.event is not available to identify the click location, the export panel is positioned relative to the 'tiddlerDisplay' element of the TW document.
''2005.12.27 [2.0.0]''
Update for TW2.0
Defer initial panel creation and only register a notification function when panel first is created
''2005.12.24 [0.9.5]''
Minor adjustments to CSS to force correct link colors regardless of TW stylesheet selection
''2005.12.16 [0.9.4]''
Dynamically create/remove exportPanel as needed to ensure only one instance of interface elements exists, even if there are multiple instances of macro embedding.
''2005.11.15 [0.9.2]''
added non-Ajax post function to bypass javascript security restrictions on cross-domain I/O.  Moved AJAX functions to separate tiddler (no longer needed here).  Generalized HTTP server to support UnaWiki servers
''2005.11.08 [0.9.1]''
moved HTML, CSS and control initialization into exportInit() function and call from macro handler instead of at load time.  This allows exportPanel to be placed within the same containing element as the "export tiddlers" button, so that relative positioning can be achieved.
''2005.10.28 [0.9.0]''
added 'select opened tiddlers' feature
Based on a suggestion by Geoff Slocock
''2005.10.24 [0.8.3]''
Corrected hijack of 'save changes' when using http:
''2005.10.18 [0.8.2]''
added AJAX functions
''2005.10.18 [0.8.1]''
Corrected timezone handling when filtering for date ranges.
Improved error checking/reporting for invalid filter values and filters that don't match any tiddlers.
Exporting localfile-to-localfile is working for IE and FF
Exporting server-to-localfile works in IE (after ActiveX warnings), but has security issues in FF
Cross-domain exporting (localfile/server-to-server) is under development
Cookies to remember filter settings - coming soon
More style tweaks, minor text changes and some assorted layout cleanup.
''2005.10.17 [0.8.0]''
First pre-release.
''2005.10.16 [0.7.0]''
filter by tags
''2005.10.15 [0.6.0]''
filter by title/text
''2005.10.14 [0.5.0]''
export to local file (DIV or XML)
''2005.10.14 [0.4.0]''
filter by start/end date
''2005.10.13 [0.3.0]''
panel interaction
''2005.10.11 [0.2.0]''
panel layout
''2005.10.10 [0.1.0]''
code framework
''2005.10.09 [0.0.0]''
development started
<<<
!!!!!Credits
<<<
This feature was developed by EricShulman from [[ELS Design Studios|http:/www.elsdesign.com]]
<<<
!!!!!Code
***/
// // +++[version]
//{{{
version.extensions.exportTiddlers = {major: 2, minor: 2, revision: 2, date: new Date(2006,5,2)};
//}}}
// //===

// // +++[macro handler]
//{{{
config.macros.exportTiddlers = {
	label: "export tiddlers",
	prompt: "Copy selected tiddlers to an export document",
	datetimefmt: "0MM/0DD/YYYY 0hh:0mm:0ss" // for "filter date/time" edit fields
};

config.macros.exportTiddlers.handler = function(place,macroName,params) {
	if (params[0]!="inline")
		{ createTiddlyButton(place,this.label,this.prompt,onClickExportMenu); return; }
	var panel=createExportPanel(place);
	panel.style.position="static";
	panel.style.display="block";
}

function createExportPanel(place) {
	var panel=document.getElementById("exportPanel");
	if (panel) { panel.parentNode.removeChild(panel); }
	setStylesheet(config.macros.exportTiddlers.css,"exportTiddlers");
	panel=createTiddlyElement(place,"span","exportPanel",null,null)
	panel.innerHTML=config.macros.exportTiddlers.html;
	exportShowPanel(document.location.protocol);
	exportInitFilter();
	refreshExportList(0);
	return panel;
}

function onClickExportMenu(e)
{
	if (!e) var e = window.event;
	var parent=resolveTarget(e).parentNode;
	var panel = document.getElementById("exportPanel");
	if (panel==undefined || panel.parentNode!=parent)
		panel=createExportPanel(parent);
	var isOpen = panel.style.display=="block";
	if(config.options.chkAnimate)
		anim.startAnimating(new Slider(panel,!isOpen,e.shiftKey || e.altKey,"none"));
	else
		panel.style.display = isOpen ? "none" : "block" ;
	if (panel.style.display!="none") refreshExportList(0); // update list when panel is made visible
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return(false);
}
//}}}
// //===

// // +++[Hijack saveChanges] diverts 'notFileUrlError' to display export control panel instead
//{{{
window.coreSaveChanges=window.saveChanges;
window.saveChanges = function()
{
	if (document.location.protocol=="file:") { coreSaveChanges(); return; }
	var e = window.event;
	var parent=e?resolveTarget(e).parentNode:document.body;
	var panel = document.getElementById("exportPanel");
	if (panel==undefined || panel.parentNode!=parent) panel=createExportPanel(parent);
	exportShowPanel(document.location.protocol);
	if (parent==document.body) { panel.style.left="30%"; panel.style.top="30%"; }
	panel.style.display = "block" ;
}
//}}}
// //===

// // +++[IE needs explicit scoping] for functions called by browser events
//{{{
window.onClickExportMenu=onClickExportMenu;
window.onClickExportButton=onClickExportButton;
window.exportShowPanel=exportShowPanel;
window.exportShowFilterFields=exportShowFilterFields;
window.refreshExportList=refreshExportList;
//}}}
// //===

// // +++[CSS] for floating export control panel
//{{{
config.macros.exportTiddlers.css = '\s
#exportPanel {\s
	display: none; position:absolute; z-index:12; width:35em; right:105%; top:6em;\s
	background-color: #eee; color:#000; font-size: 8pt; line-height:110%;\s
	border:1px solid black; border-bottom-width: 3px; border-right-width: 3px;\s
	padding: 0.5em; margin:0em; -moz-border-radius:1em;\s
}\s
#exportPanel a, #exportPanel td a { color:#009; display:inline; margin:0px; padding:1px; }\s
#exportPanel table { width:100%; border:0px; padding:0px; margin:0px; font-size:8pt; line-height:110%; background:transparent; }\s
#exportPanel tr { border:0px;padding:0px;margin:0px; background:transparent; }\s
#exportPanel td { color:#000; border:0px;padding:0px;margin:0px; background:transparent; }\s
#exportPanel select { width:98%;margin:0px;font-size:8pt;line-height:110%;}\s
#exportPanel input  { width:98%;padding:0px;margin:0px;font-size:8pt;line-height:110%; }\s
#exportPanel textarea  { width:98%;padding:0px;margin:0px;overflow:auto;font-size:8pt; }\s
#exportPanel .box { border:1px solid black; padding:3px; margin-bottom:5px; background:#f8f8f8; -moz-border-radius:5px; }\s
#exportPanel .topline { border-top:2px solid black; padding-top:3px; margin-bottom:5px; }\s
#exportPanel .rad { width:auto;border:0 }\s
#exportPanel .chk { width:auto;border:0 }\s
#exportPanel .btn { width:auto; }\s
#exportPanel .btn1 { width:98%; }\s
#exportPanel .btn2 { width:48%; }\s
#exportPanel .btn3 { width:32%; }\s
#exportPanel .btn4 { width:24%; }\s
#exportPanel .btn5 { width:19%; }\s
';
//}}}
// //===

// // +++[HTML] for export control panel interface
//{{{
config.macros.exportTiddlers.html = '\s
<!-- output target and format -->\s
<table cellpadding="0" cellspacing="0"><tr><td width=50%>\s
	export to\s
	<select size=1 id="exportTo" onchange="exportShowPanel(this.value);">\s
	<option value="file:" SELECTED>this computer</option>\s
	<option value="http:">web server (http)</option>\s
	<option value="https:">secure web server (https)</option>\s
	<option value="ftp:">file server (ftp)</option>\s
	</select>\s
</td><td width=50%>\s
	output format\s
	<select id="exportFormat" size=1>\s
	<option value="DIV">TiddlyWiki export file</option>\s
	<option value="TW">TiddlyWiki document</option>\s
	<option value="XML">RSS feed (XML)</option>\s
	</select>\s
</td></tr></table>\s
\s
<!-- export to local file  -->\s
<div id="exportLocalPanel" style="margin-top:5px;">\s
local path/filename<br>\s
<input type="file" id="exportFilename" size=57 style="width:100%"><br>\s
</div><!--panel-->\s
\s
<!-- export to http server -->\s
<div id="exportHTTPPanel" style="display:none;margin-top:5px;">\s
<table><tr><td align=left>\s
	server location, script, and parameters<br>\s
</td><td align=right>\s
	<input type="checkbox" class="chk" id="exportNotify"\s
		onClick="document.getElementById(\s'exportSetNotifyPanel\s').style.display=this.checked?\s'block\s':\s'none\s'"> notify\s
</td></tr></table>\s
<input type="text" id="exportHTTPServerURL" onfocus="this.select()"><br>\s
<div id="exportSetNotifyPanel" style="display:none">\s
	send email notices to<br>\s
	<input type="text" id="exportNotifyTo" onfocus="this.select()"><br>\s
</div>\s
</div><!--panel-->\s
\s
<!-- export to ftp server -->\s
<div id="exportFTPPanel" style="display:none;margin-top:5px;">\s
<table cellpadding="0" cellspacing="0" width="32%"><tr valign="top"><td>\s
	host server<br>\s
	<input type="text" id="exportFTPHost" onfocus="this.select()"><br>\s
</td><td width="32%">\s
	username<br>\s
	<input type="text" id="exportFTPID" onfocus="this.select()"><br>\s
</td><td width="32%">\s
	password<br>\s
	<input type="password" id="exportFTPPW" onfocus="this.select()"><br>\s
</td></tr></table>\s
FTP path/filename<br>\s
<input type="text" id="exportFTPFilename" onfocus="this.select()"><br>\s
</div><!--panel-->\s
\s
<!-- notes -->\s
notes<br>\s
<textarea id="exportNotes" rows=3 cols=40 style="height:4em;margin-bottom:5px;" onfocus="this.select()"></textarea> \s
\s
<!-- list of tiddlers -->\s
<table><tr align="left"><td>\s
	select:\s
	<a href="JavaScript:;" id="exportSelectAll"\s
		onclick="onClickExportButton(this)" title="select all tiddlers">\s
		&nbsp;all&nbsp;</a>\s
	<a href="JavaScript:;" id="exportSelectChanges"\s
		onclick="onClickExportButton(this)" title="select tiddlers changed since last save">\s
		&nbsp;changes&nbsp;</a> \s
	<a href="JavaScript:;" id="exportSelectOpened"\s
		onclick="onClickExportButton(this)" title="select tiddlers currently being displayed">\s
		&nbsp;opened&nbsp;</a> \s
	<a href="JavaScript:;" id="exportToggleFilter"\s
		onclick="onClickExportButton(this)" title="show/hide selection filter">\s
		&nbsp;filter&nbsp;</a>  \s
</td><td align="right">\s
	<a href="JavaScript:;" id="exportListSmaller"\s
		onclick="onClickExportButton(this)" title="reduce list size">\s
		&nbsp;&#150;&nbsp;</a>\s
	<a href="JavaScript:;" id="exportListLarger"\s
		onclick="onClickExportButton(this)" title="increase list size">\s
		&nbsp;+&nbsp;</a>\s
</td></tr></table>\s
<select id="exportList" multiple size="10" style="margin-bottom:5px;"\s
	onchange="refreshExportList(this.selectedIndex)">\s
</select><br>\s
</div><!--box-->\s
\s
<!-- selection filter -->\s
<div id="exportFilterPanel" style="display:none">\s
<table><tr align="left"><td>\s
	selection filter\s
</td><td align="right">\s
	<a href="JavaScript:;" id="exportHideFilter"\s
		onclick="onClickExportButton(this)" title="hide selection filter">hide</a>\s
</td></tr></table>\s
<div class="box">\s
<input type="checkbox" class="chk" id="exportFilterStart" value="1"\s
	onclick="exportShowFilterFields(this)"> starting date/time<br>\s
<table cellpadding="0" cellspacing="0"><tr valign="center"><td width="50%">\s
	<select size=1 id="exportFilterStartBy" onchange="exportShowFilterFields(this);">\s
		<option value="0">today</option>\s
		<option value="1">yesterday</option>\s
		<option value="7">a week ago</option>\s
		<option value="30">a month ago</option>\s
		<option value="site">SiteDate</option>\s
		<option value="file">file date</option>\s
		<option value="other">other (mm/dd/yyyy hh:mm)</option>\s
	</select>\s
</td><td width="50%">\s
	<input type="text" id="exportStartDate" onfocus="this.select()"\s
		onchange="document.getElementById(\s'exportFilterStartBy\s').value=\s'other\s';">\s
</td></tr></table>\s
<input type="checkbox" class="chk" id="exportFilterEnd" value="1"\s
	onclick="exportShowFilterFields(this)"> ending date/time<br>\s
<table cellpadding="0" cellspacing="0"><tr valign="center"><td width="50%">\s
	<select size=1 id="exportFilterEndBy" onchange="exportShowFilterFields(this);">\s
		<option value="0">today</option>\s
		<option value="1">yesterday</option>\s
		<option value="7">a week ago</option>\s
		<option value="30">a month ago</option>\s
		<option value="site">SiteDate</option>\s
		<option value="file">file date</option>\s
		<option value="other">other (mm/dd/yyyy hh:mm)</option>\s
	</select>\s
</td><td width="50%">\s
	<input type="text" id="exportEndDate" onfocus="this.select()"\s
		onchange="document.getElementById(\s'exportFilterEndBy\s').value=\s'other\s';">\s
</td></tr></table>\s
<input type="checkbox" class="chk" id=exportFilterTags value="1"\s
	onclick="exportShowFilterFields(this)"> match tags<br>\s
<input type="text" id="exportTags" onfocus="this.select()">\s
<input type="checkbox" class="chk" id=exportFilterText value="1"\s
	onclick="exportShowFilterFields(this)"> match titles/tiddler text<br>\s
<input type="text" id="exportText" onfocus="this.select()">\s
</div> <!--box-->\s
</div> <!--panel-->\s
\s
<!-- action buttons -->\s
<div style="text-align:center">\s
<input type=button class="btn3" onclick="onClickExportButton(this)"\s
	id="exportFilter" value="apply filter">\s
<input type=button class="btn3" onclick="onClickExportButton(this)"\s
	id="exportStart" value="export tiddlers">\s
<input type=button class="btn3" onclick="onClickExportButton(this)"\s
	id="exportClose" value="close">\s
</div><!--center-->\s
';
//}}}
// //===

// // +++[initialize interface]>
// // +++[exportShowPanel(which)]
//{{{
function exportShowPanel(which) {
	var index=0; var panel='exportLocalPanel';
	switch (which) {
		case 'file:':
		case undefined:
			index=0; panel='exportLocalPanel'; break;
		case 'http:':
			index=1; panel='exportHTTPPanel'; break;
		case 'https:':
			index=2; panel='exportHTTPPanel'; break;
		case 'ftp:':
			index=3; panel='exportFTPPanel'; break;
		default:
			alert("Sorry, export to "+which+" is not yet available");
			break;
	}
	exportInitPanel(which);
	document.getElementById('exportTo').selectedIndex=index;
	document.getElementById('exportLocalPanel').style.display='none';
	document.getElementById('exportHTTPPanel').style.display='none';
	document.getElementById('exportFTPPanel').style.display='none';
	document.getElementById(panel).style.display='block';
}
//}}}
// //===

// // +++[exportInitPanel(which)]
//{{{
function exportInitPanel(which) {
	switch (which) {
		case "file:": // LOCAL EXPORT PANEL: file/path:
			// ** no init - security issues in IE **
			break;
		case "http:": // WEB EXPORT PANEL
		case "https:": // SECURE WEB EXPORT PANEL
			// url
			if (store.tiddlerExists("unawiki_download")) {
				var theURL=store.getTiddlerText("unawiki_download");
				theURL=theURL.replace(/\s[\s[download\s|/,'').replace(/\s]\s]/,'');
				var title=(store.tiddlerExists("unawiki_host"))?"unawiki_host":"SiteHost";
				var theHost=store.getTiddlerText(title);
				if (!theHost || !theHost.length) theHost=document.location.host;
				if (!theHost || !theHost.length) theHost=title;
			}
			// server script/params
			var title=(store.tiddlerExists("unawiki_host"))?"unawiki_host":"SiteHost";
			var theHost=store.getTiddlerText(title);
			if (!theHost || !theHost.length) theHost=document.location.host;
			if (!theHost || !theHost.length) theHost=title;
			// get POST
			var title=(store.tiddlerExists("unawiki_post"))?"unawiki_post":"SitePost";
			var thePost=store.getTiddlerText(title);
			if (!thePost || !thePost.length) thePost="/"+title;
			// get PARAMS
			var title=(store.tiddlerExists("unawiki_params"))?"unawiki_params":"SiteParams";
			var theParams=store.getTiddlerText(title);
			if (!theParams|| !theParams.length) theParams=title;
			var serverURL = which+"//"+theHost+thePost+"?"+theParams;
			document.getElementById("exportHTTPServerURL").value=serverURL;
			// get NOTIFY
			var theAddresses=store.getTiddlerText("SiteNotify");
			if (!theAddresses|| !theAddresses.length) theAddresses="SiteNotify";
			document.getElementById("exportNotifyTo").value=theAddresses;
			break;
		case "ftp:": // FTP EXPORT PANEL
			// host
			var siteHost=store.getTiddlerText("SiteHost");
			if (!siteHost || !siteHost.length) siteHost=document.location.host;
			if (!siteHost || !siteHost.length) siteHost="SiteHost";
			document.getElementById("exportFTPHost").value=siteHost;
			// username
			var siteID=store.getTiddlerText("SiteID");
			if (!siteID || !siteID.length) siteID=config.options.txtUserName;
			document.getElementById("exportFTPID").value=siteID;
			// password
			document.getElementById("exportFTPPW").value="";
			// file/path
			document.getElementById("exportFTPFilename").value="";
			break;
	}
}
//}}}
// //===

// // +++[exportInitFilter()]
//{{{
function exportInitFilter() {
	// start date
	document.getElementById("exportFilterStart").checked=false;
	document.getElementById("exportStartDate").value="";
	// end date
	document.getElementById("exportFilterEnd").checked=false;
	document.getElementById("exportEndDate").value="";
	// tags
	document.getElementById("exportFilterTags").checked=false;
	document.getElementById("exportTags").value="";
	// text
	document.getElementById("exportFilterText").checked=false;
	document.getElementById("exportText").value="";
	// show/hide filter input fields
	exportShowFilterFields();
}
//}}}
// //===

// // +++[exportShowFilterFields(which)]
//{{{
function exportShowFilterFields(which) {
	var show;

	show=document.getElementById('exportFilterStart').checked;
	document.getElementById('exportFilterStartBy').style.display=show?"block":"none";
	document.getElementById('exportStartDate').style.display=show?"block":"none";
	var val=document.getElementById('exportFilterStartBy').value;
	document.getElementById('exportStartDate').value
		=getFilterDate(val,'exportStartDate').formatString(config.macros.exportTiddlers.datetimefmt);
	 if (which && (which.id=='exportFilterStartBy') && (val=='other'))
		document.getElementById('exportStartDate').focus();

	show=document.getElementById('exportFilterEnd').checked;
	document.getElementById('exportFilterEndBy').style.display=show?"block":"none";
	document.getElementById('exportEndDate').style.display=show?"block":"none";
	var val=document.getElementById('exportFilterEndBy').value;
	document.getElementById('exportEndDate').value
		=getFilterDate(val,'exportEndDate').formatString(config.macros.exportTiddlers.datetimefmt);
	 if (which && (which.id=='exportFilterEndBy') && (val=='other'))
		document.getElementById('exportEndDate').focus();

	show=document.getElementById('exportFilterTags').checked;
	document.getElementById('exportTags').style.display=show?"block":"none";

	show=document.getElementById('exportFilterText').checked;
	document.getElementById('exportText').style.display=show?"block":"none";
}
//}}}
// //===
// //===

// // +++[onClickExportButton(which): control interactions]
//{{{
function onClickExportButton(which)
{
	// DEBUG alert(which.id);
	var theList=document.getElementById('exportList'); if (!theList) return;
	var count = 0;
	var total = store.getTiddlers('title').length;
	switch (which.id)
		{
		case 'exportFilter':
			count=filterExportList();
			var panel=document.getElementById('exportFilterPanel');
			if (count==-1) { panel.style.display='block'; break; }
			document.getElementById("exportStart").disabled=(count==0);
			clearMessage(); displayMessage("filtered "+formatExportMessage(count,total));
			if (count==0) { alert("No tiddlers were selected"); panel.style.display='block'; }
			break;
		case 'exportStart':
			exportTiddlers();
			break;
		case 'exportHideFilter':
		case 'exportToggleFilter':
			var panel=document.getElementById('exportFilterPanel')
			panel.style.display=(panel.style.display=='block')?'none':'block';
			break;
		case 'exportSelectChanges':
			var lastmod=new Date(document.lastModified);
			for (var t = 0; t < theList.options.length; t++) {
				if (theList.options[t].value=="") continue;
				var tiddler=store.getTiddler(theList.options[t].value); if (!tiddler) continue;
				theList.options[t].selected=(tiddler.modified>lastmod);
				count += (tiddler.modified>lastmod)?1:0;
			}
			document.getElementById("exportStart").disabled=(count==0);
			clearMessage(); displayMessage(formatExportMessage(count,total));
			if (count==0) alert("There are no unsaved changes");
			break;
		case 'exportSelectAll':
			for (var t = 0; t < theList.options.length; t++) {
				if (theList.options[t].value=="") continue;
				theList.options[t].selected=true;
				count += 1;
			}
			document.getElementById("exportStart").disabled=(count==0);
			clearMessage(); displayMessage(formatExportMessage(count,count));
			break;
		case 'exportSelectOpened':
			for (var t = 0; t < theList.options.length; t++) theList.options[t].selected=false;
			var tiddlerDisplay = document.getElementById("tiddlerDisplay");
			for (var t=0;t<tiddlerDisplay.childNodes.length;t++) {
				var tiddler=tiddlerDisplay.childNodes[t].id.substr(7);
				for (var i = 0; i < theList.options.length; i++) {
					if (theList.options[i].value!=tiddler) continue;
					theList.options[i].selected=true; count++; break;
				}
			}
			document.getElementById("exportStart").disabled=(count==0);
			clearMessage(); displayMessage(formatExportMessage(count,total));
			if (count==0) alert("There are no tiddlers currently opened");
			break;
		case 'exportListSmaller':	// decrease current listbox size
			var min=5;
			theList.size-=(theList.size>min)?1:0;
			break;
		case 'exportListLarger':	// increase current listbox size
			var max=(theList.options.length>25)?theList.options.length:25;
			theList.size+=(theList.size<max)?1:0;
			break;
		case 'exportClose':
			document.getElementById('exportPanel').style.display='none';
			break;
		}
}
//}}}
// //===

// // +++[list display]
//{{{
function formatExportMessage(count,total)
{
	var txt=total+' tiddler'+((total!=1)?'s':'')+" - ";
	txt += (count==0)?"none":(count==total)?"all":count;
	txt += " selected for export";
	return txt;
}

function refreshExportList(selectedIndex)
{
	var theList  = document.getElementById("exportList");
	var sort;
	if (!theList) return;
	// get the sort order
	if (!selectedIndex)   selectedIndex=0;
	if (selectedIndex==0) sort='modified';
	if (selectedIndex==1) sort='title';
	if (selectedIndex==2) sort='modified';
	if (selectedIndex==3) sort='modifier';

	// get the alphasorted list of tiddlers
	var tiddlers = store.getTiddlers('title');
	// unselect headings and count number of tiddlers actually selected
	var count=0;
	for (var i=0; i<theList.options.length; i++) {
		if (theList.options[i].value=="") theList.options[i].selected=false;
		count+=theList.options[i].selected?1:0;
	}
	// disable "export" button if no tiddlers selected
	document.getElementById("exportStart").disabled=(count==0);
	// update listbox heading to show selection count
	if (theList.options.length) { clearMessage(); displayMessage(formatExportMessage(count,tiddlers.length)); }

	// if a [command] item, reload list... otherwise, no further refresh needed
	if (selectedIndex>3)  return;

	// clear current list contents
	while (theList.length > 0) { theList.options[0] = null; }
	// add heading and control items to list
	var i=0;
	var indent=String.fromCharCode(160)+String.fromCharCode(160);
	theList.options[i++]=
		new Option(tiddlers.length+" tiddlers in document", "",false,false);
	theList.options[i++]=
		new Option(((sort=="title"        )?">":indent)+' [by title]', "",false,false);
	theList.options[i++]=
		new Option(((sort=="modified")?">":indent)+' [by date]', "",false,false);
	theList.options[i++]=
		new Option(((sort=="modifier")?">":indent)+' [by author]', "",false,false);
	// output the tiddler list
	switch(sort)
		{
		case "title":
			for(var t = 0; t < tiddlers.length; t++)
				theList.options[i++] = new Option(tiddlers[t].title,tiddlers[t].title,false,false);
			break;
		case "modifier":
		case "modified":
			var tiddlers = store.getTiddlers(sort);
			// sort descending for newest date first
			tiddlers.sort(function (a,b) {if(a[sort] == b[sort]) return(0); else return (a[sort] > b[sort]) ? -1 : +1; });
			var lastSection = "";
			for(var t = 0; t < tiddlers.length; t++)
				{
				var tiddler = tiddlers[t];
				var theSection = "";
				if (sort=="modified") theSection=tiddler.modified.toLocaleDateString();
				if (sort=="modifier") theSection=tiddler.modifier;
				if (theSection != lastSection)
					{
					theList.options[i++] = new Option(theSection,"",false,false);
					lastSection = theSection;
					}
				theList.options[i++] = new Option(indent+indent+tiddler.title,tiddler.title,false,false);
				}
			 break;
		}
	theList.selectedIndex=selectedIndex;		  // select current control item
}
//}}}
// //===

// // +++[list filtering]
//{{{
function getFilterDate(val,id)
{
	var result=0;
	switch (val) {
		case 'site':
			var timestamp=store.getTiddlerText("SiteDate");
			if (!timestamp) timestamp=document.lastModified;
			result=new Date(timestamp);
			break;
		case 'file':
			result=new Date(document.lastModified);
			break;
		case 'other':
			result=new Date(document.getElementById(id).value);
			break;
		default: // today=0, yesterday=1, one week=7, two weeks=14, a month=31
			var now=new Date(); var tz=now.getTimezoneOffset()*60000; now-=tz;
			var oneday=86400000;
			if (id=='exportStartDate')
				result=new Date((Math.floor(now/oneday)-val)*oneday+tz);
			else
				result=new Date((Math.floor(now/oneday)-val+1)*oneday+tz-1);
			break;
	}
	// DEBUG alert('getFilterDate('+val+','+id+')=='+result+"\snnow="+now);
	return result;
}

function filterExportList()
{
	var theList  = document.getElementById("exportList"); if (!theList) return -1;

	var filterStart=document.getElementById("exportFilterStart").checked;
	var val=document.getElementById("exportFilterStartBy").value;
	var startDate=getFilterDate(val,'exportStartDate');

	var filterEnd=document.getElementById("exportFilterEnd").checked;
	var val=document.getElementById("exportFilterEndBy").value;
	var endDate=getFilterDate(val,'exportEndDate');

	var filterTags=document.getElementById("exportFilterTags").checked;
	var tags=document.getElementById("exportTags").value;

	var filterText=document.getElementById("exportFilterText").checked;
	var text=document.getElementById("exportText").value;

	if (!(filterStart||filterEnd||filterTags||filterText)) {
		alert("Please set the selection filter");
		document.getElementById('exportFilterPanel').style.display="block";
		return -1;
	}
	if (filterStart&&filterEnd&&(startDate>endDate)) {
		var msg="starting date/time:\sn"
		msg+=startDate.toLocaleString()+"\sn";
		msg+="is later than ending date/time:\sn"
		msg+=endDate.toLocaleString()
		alert(msg);
		return -1;
	}

	// scan list and select tiddlers that match all applicable criteria
	var total=0;
	var count=0;
	for (var i=0; i<theList.options.length; i++) {
		// get item, skip non-tiddler list items (section headings)
		var opt=theList.options[i]; if (opt.value=="") continue;
		// get tiddler, skip missing tiddlers (this should NOT happen)
		var tiddler=store.getTiddler(opt.value); if (!tiddler) continue; 
		var sel=true;
		if ( (filterStart && tiddler.modified<startDate)
		|| (filterEnd && tiddler.modified>endDate)
		|| (filterTags && !matchTags(tiddler,tags))
		|| (filterText && (tiddler.text.indexOf(text)==-1) && (tiddler.title.indexOf(text)==-1)))
			sel=false;
		opt.selected=sel;
		count+=sel?1:0;
		total++;
	}
	return count;
}
//}}}

//{{{
function matchTags(tiddler,cond)
{
	if (!cond||!cond.trim().length) return false;

	// build a regex of all tags as a big-old regex that 
	// OR's the tags together (tag1|tag2|tag3...) in length order
	var tgs = store.getTags();
	if ( tgs.length == 0 ) return results ;
	var tags = tgs.sort( function(a,b){return (a[0].length<b[0].length)-(a[0].length>b[0].length);});
	var exp = "(" + tags.join("|") + ")" ;
	exp = exp.replace( /(,[\sd]+)/g, "" ) ;
	var regex = new RegExp( exp, "ig" );

	// build a string such that an expression that looks like this: tag1 AND tag2 OR NOT tag3
	// turns into : /tag1/.test(...) && /tag2/.test(...) || ! /tag2/.test(...)
	cond = cond.replace( regex, "/$1\s\s|/.test(tiddlerTags)" );
	cond = cond.replace( /\ssand\ss/ig, " && " ) ;
	cond = cond.replace( /\ssor\ss/ig, " || " ) ;
	cond = cond.replace( /\ss?not\ss/ig, " ! " ) ;

	// if a boolean uses a tag that doesn't exist - it will get left alone 
	// (we only turn existing tags into actual tests).
	// replace anything that wasn't found as a tag, AND, OR, or NOT with the string "false"
	// if the tag doesn't exist then /tag/.test(...) will always return false.
	cond = cond.replace( /(\ss|^)+[^\s/\s|&!][^\ss]*/g, "false" ) ;

	// make a string of the tags in the tiddler and eval the 'cond' string against that string 
	// if it's TRUE then the tiddler qualifies!
	var tiddlerTags = (tiddler.tags?tiddler.tags.join("|"):"")+"|" ;
	try { if ( eval( cond ) ) return true; }
	catch( e ) { displayMessage("Error in tag filter '" + e + "'" ); }
	return false;
}
//}}}
// //===

// // +++[output data formatting]>
// // +++[exportHeader(format)]
//{{{
function exportHeader(format)
{
	switch (format) {
		case "TW":	return exportTWHeader();
		case "DIV":	return exportDIVHeader();
		case "XML":	return exportXMLHeader();
	}
}
//}}}
// //===

// // +++[exportFooter(format)]
//{{{
function exportFooter(format)
{
	switch (format) {
		case "TW":	return exportDIVFooter();
		case "DIV":	return exportDIVFooter();
		case "XML":	return exportXMLFooter();
	}
}
//}}}
// //===

// // +++[exportTWHeader()]
//{{{
function exportTWHeader()
{
	// Get the URL of the document
	var originalPath = document.location.toString();
	// Check we were loaded from a file URL
	if(originalPath.substr(0,5) != "file:")
		{ alert(config.messages.notFileUrlError); return; }
	// Remove any location part of the URL
	var hashPos = originalPath.indexOf("#"); if(hashPos != -1) originalPath = originalPath.substr(0,hashPos);
	// Convert to a native file format assuming
	// "file:///x:/path/path/path..." - pc local file --> "x:\spath\spath\spath..."
	// "file://///server/share/path/path/path..." - FireFox pc network file --> "\s\sserver\sshare\spath\spath\spath..."
	// "file:///path/path/path..." - mac/unix local file --> "/path/path/path..."
	// "file://server/share/path/path/path..." - pc network file --> "\s\sserver\sshare\spath\spath\spath..."
	var localPath;
	if(originalPath.charAt(9) == ":") // pc local file
		localPath = unescape(originalPath.substr(8)).replace(new RegExp("/","g"),"\s\s");
	else if(originalPath.indexOf("file://///") == 0) // FireFox pc network file
		localPath = "\s\s\s\s" + unescape(originalPath.substr(10)).replace(new RegExp("/","g"),"\s\s");
	else if(originalPath.indexOf("file:///") == 0) // mac/unix local file
		localPath = unescape(originalPath.substr(7));
	else if(originalPath.indexOf("file:/") == 0) // mac/unix local file
		localPath = unescape(originalPath.substr(5));
	else // pc network file
		localPath = "\s\s\s\s" + unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\s\s");
	// Load the original file
	var original = loadFile(localPath);
	if(original == null)
		{ alert(config.messages.cantSaveError); return; }
	// Locate the storeArea div's
	var posOpeningDiv = original.indexOf(startSaveArea);
	var posClosingDiv = original.lastIndexOf(endSaveArea);
	if((posOpeningDiv == -1) || (posClosingDiv == -1))
		{ alert(config.messages.invalidFileError.format([localPath])); return; }
	return original.substr(0,posOpeningDiv+startSaveArea.length)
}
//}}}
// //===

// // +++[exportDIVHeader()]
//{{{
function exportDIVHeader()
{
	var out=[];
	var now = new Date();
	var title = convertUnicodeToUTF8(wikifyPlain("SiteTitle").htmlEncode());
	var subtitle = convertUnicodeToUTF8(wikifyPlain("SiteSubtitle").htmlEncode());
	var user = convertUnicodeToUTF8(config.options.txtUserName.htmlEncode());
	var twver = version.major+"."+version.minor+"."+version.revision;
	var pver = version.extensions.exportTiddlers.major+"."
		+version.extensions.exportTiddlers.minor+"."+version.extensions.exportTiddlers.revision;
	out.push("<html><body>");
	out.push("<style type=\s"text/css\s">");
	out.push("#storeArea {display:block;margin:1em;}");
	out.push("#storeArea div");
	out.push("{padding:0.5em;margin:1em;border:2px solid black;height:10em;overflow:auto;}");
	out.push("#javascriptWarning");
	out.push("{width:100%;text-align:left;background-color:#eeeeee;padding:1em;}");
	out.push("</style>");
	out.push("<div id=\s"javascriptWarning\s">");
	out.push("TiddlyWiki export file<br>");
	out.push("Source: <b>"+convertUnicodeToUTF8(document.location.toString())+"</b><br>");
	out.push("Title: <b>"+title+"</b><br>");
	out.push("Subtitle: <b>"+subtitle+"</b><br>");
	out.push("Created: <b>"+now.toLocaleString()+"</b> by <b>"+user+"</b><br>");
	out.push("TiddlyWiki "+twver+" / "+"ExportTiddlersPlugin "+pver+"<br>");
	out.push("Notes:<hr><pre>"+document.getElementById("exportNotes").value.replace(regexpNewLine,"<br>")+"</pre>");
	out.push("</div>");
	out.push("<div id=\s"storeArea\s">");
	return out;
}
//}}}
// //===

// // +++[exportDIVFooter()]
//{{{
function exportDIVFooter()
{
	var out=[];
	out.push("</div></body></html>");
	return out;
}
//}}}
// //===

// // +++[exportXMLHeader()]
//{{{
function exportXMLHeader()
{
	var out=[];
	var now = new Date();
	var u = store.getTiddlerText("SiteUrl",null);
	var title = convertUnicodeToUTF8(wikifyPlain("SiteTitle").htmlEncode());
	var subtitle = convertUnicodeToUTF8(wikifyPlain("SiteSubtitle").htmlEncode());
	var user = convertUnicodeToUTF8(config.options.txtUserName.htmlEncode());
	var twver = version.major+"."+version.minor+"."+version.revision;
	var pver = version.extensions.exportTiddlers.major+"."
		+version.extensions.exportTiddlers.minor+"."+version.extensions.exportTiddlers.revision;
	out.push("<" + "?xml version=\s"1.0\s"?" + ">");
	out.push("<rss version=\s"2.0\s">");
	out.push("<channel>");
	out.push("<title>" + title + "</title>");
	if(u) out.push("<link>" + convertUnicodeToUTF8(u.htmlEncode()) + "</link>");
	out.push("<description>" + subtitle + "</description>");
	out.push("<language>en-us</language>");
	out.push("<copyright>Copyright " + now.getFullYear() + " " + user + "</copyright>");
	out.push("<pubDate>" + now.toGMTString() + "</pubDate>");
	out.push("<lastBuildDate>" + now.toGMTString() + "</lastBuildDate>");
	out.push("<docs>http://blogs.law.harvard.edu/tech/rss</docs>");
	out.push("<generator>TiddlyWiki "+twver+" plus ExportTiddlersPlugin "+pver+"</generator>");
	return out;
}
//}}}
// //===

// // +++[exportXMLFooter()]
//{{{
function exportXMLFooter()
{
	var out=[];
	out.push("</channel></rss>");
	return out;
}
//}}}
// //===

// // +++[exportData()]
//{{{
function exportData(theList,theFormat)
{
	// scan export listbox and collect DIVs or XML for selected tiddler content
	var out=[];
	for (var i=0; i<theList.options.length; i++) {
		// get item, skip non-selected items and section headings
		var opt=theList.options[i]; if (!opt.selected||(opt.value=="")) continue;
		// get tiddler, skip missing tiddlers (this should NOT happen)
		var thisTiddler=store.getTiddler(opt.value); if (!thisTiddler) continue; 
		if (theFormat=="TW")	out.push(convertUnicodeToUTF8(thisTiddler.saveToDiv()));
		if (theFormat=="DIV")	out.push(convertUnicodeToUTF8(thisTiddler.title+"\sn"+thisTiddler.saveToDiv()));
		if (theFormat=="XML")	out.push(convertUnicodeToUTF8(thisTiddler.saveToRss()));
	}
	return out;
}
//}}}
// //===
// //===

// // +++[exportTiddlers(): output selected data to local or server]
//{{{
function exportTiddlers()
{
	var theList  = document.getElementById("exportList"); if (!theList) return;

	// get the export settings
	var theProtocol = document.getElementById("exportTo").value;
	var theFormat = document.getElementById("exportFormat").value;

	// assemble output: header + tiddlers + footer
	var theData=exportData(theList,theFormat);
	var count=theData.length;
	var out=[]; var txt=out.concat(exportHeader(theFormat),theData,exportFooter(theFormat)).join("\sn");
	var msg="";
	switch (theProtocol) {
		case "file:":
			var theTarget = document.getElementById("exportFilename").value.trim();
			if (!theTarget.length) msg = "A local path/filename is required\sn";
			if (!msg && saveFile(theTarget,txt))
				msg=count+" tiddler"+((count!=1)?"s":"")+" exported to local file";
			else if (!msg)
				msg+="An error occurred while saving to "+theTarget;
			break;
		case "http:":
		case "https:":
			var theTarget = document.getElementById("exportHTTPServerURL").value.trim();
			if (!theTarget.length) msg = "A server URL is required\sn";
			if (document.getElementById('exportNotify').checked)
				theTarget+="&notify="+encodeURIComponent(document.getElementById('exportNotifyTo').value);
			if (document.getElementById('exportNotes').value.trim().length)
				theTarget+="&notes="+encodeURIComponent(document.getElementById('exportNotes').value);
			if (!msg && exportPost(theTarget+encodeURIComponent(txt)))
				msg=count+" tiddler"+((count!=1)?"s":"")+" exported to "+theProtocol+" server";
			else if (!msg)
				msg+="An error occurred while saving to "+theTarget;
			break;
		case "ftp:":
		default:
			msg="Sorry, export to "+theLocation+" is not yet available";
			break;
	}
	clearMessage(); displayMessage(msg,theTarget);
}
//}}}
// //===

// // +++[exportPost(url): cross-domain post] uses hidden iframe to submit url and capture responses
//{{{
function exportPost(url)
{
	var f=document.getElementById("exportFrame"); if (f) document.body.removeChild(f);
	f=document.createElement("iframe"); f.id="exportFrame";
	f.style.width="0px"; f.style.height="0px"; f.style.border="0px";
	document.body.appendChild(f);
	var d=f.document;
	if (f.contentDocument) d=f.contentDocument; // For NS6
	else if (f.contentWindow) d=f.contentWindow.document; // For IE5.5 and IE6
 	d.location.replace(url);
 	return true;
}
//}}}
// //===
