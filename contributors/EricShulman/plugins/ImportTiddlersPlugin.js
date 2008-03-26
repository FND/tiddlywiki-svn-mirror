/***
|Name|ImportTiddlersPlugin|
|Source|http://www.TiddlyTools.com/#ImportTiddlersPlugin|
|Documentation|http://www.TiddlyTools.com/#ImportTiddlersPluginInfo|
|Version|3.8.0|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides|config.macros.importTiddlers.handler|
|Description|interactive controls for import/export with filtering.|
This plugin lets you selectively combine tiddlers from any two TiddlyWiki documents.  An interactive control panel lets you pick a document to import from, and then select which tiddlers to import, with prompting for skip, rename, merge or replace actions when importing tiddlers that match existing titles.  Automatically add tags to imported tiddlers so they are easy to find later on.  Generates a detailed report of import 'history' in ImportedTiddlers.
!!!!!Documentation
<<<
see [[ImportTiddlersPluginInfo]] for details

<<importTiddlers inline>>
<<<
!!!!!Configuration
<<<
__password-protected server settings //(optional, if needed)//:__
>username: <<option txtRemoteUsername>> password: <<option txtRemotePassword>>
>{{{usage: <<option txtRemoteUsername>> <<option txtRemotePassword>>}}}
>''note: these settings are also used by [[LoadTiddlersPlugin]] and [[ExternalTiddlersPlugin]]''
<<<
!!!!!Installation Notes
<<<
* As of 6/27/2007, "patch" functions that provide backward-compatibility with TW2.1.x and earlier have been split into a separate [[ImportTiddlersPluginPatch]] tiddler to reduce installation overhead for //this// plugin.  You only need to install the additional plugin tiddler when using ImportTiddlersPlugin in documents using TW2.1.x or earlier.
* As of 3/21/2007, the interactive {{{<<importTiddlers>>}}} and non-interactive {{{<<loadTiddlers>>}}} macro definitions and related code have been split into separate [[ImportTiddlersPlugin]] and [[LoadTiddlersPlugin]] to permit selective installation of either the interactive and/or non-interactive macro functions.
* Quick Installation Tip: If you are using an unmodified version of TiddlyWiki (core release version <<version>>), you can get a new, empty TiddlyWiki with the Import Tiddlers plugin pre-installed (''[[download from here|TW+ImportExport.html]]''), and then simply import all your content from your old document into this new, empty document.
<<<
!!!!!Revisions
<<<
2008.03.26 [3.8.0] added support for selecting pre-defined systemServer URLs
2008.03.25 [3.7.0] added support for setting 'server' fields on imported tiddlers (for later synchronizing of changes)
|please see [[ImportTiddlersPluginInfo]] for additional revision details|
2005.07.20 [1.0.0] Initial Release
<<<
!!!!!Code
***/
// // ''MACRO DEFINITION''
//{{{
// Version
version.extensions.importTiddlers = {major: 3, minor: 8, revision: 0, date: new Date(2008,3,25)};

// IE needs explicit global scoping for functions/vars called from browser events
window.onClickImportButton=onClickImportButton;
window.refreshImportList=refreshImportList;

// default cookie/option values
if (!config.options.chkImportReport) config.options.chkImportReport=true;

// default shadow definition
config.shadowTiddlers.ImportTiddlers="<<importTiddlers inline>>";

merge(config.macros.importTiddlers,{
	label: "import tiddlers",
	prompt: "Copy tiddlers from another document",
	openMsg: "Opening %0",
	openErrMsg: "Could not open %0 - error=%1",
	readMsg: "Read %0 bytes from %1",
	foundMsg: "Found %0 tiddlers in %1",
	countMsg: "%0 tiddlers selected for import",
	importedMsg: "Imported %0 of %1 tiddlers from %2",
	loadText: "please load a document...",
	closeText: "close",	// text for close button when file is loaded
	doneText: "done",	// text for close button when file is not loaded
	local: true,		// default to import from local file
	src: "",		// path/filename or URL of document to import (retrieved from SiteUrl tiddler)
	proxy: "",		// URL for remote proxy script (retrieved from SiteProxy tiddler)
	useProxy: false,	// use specific proxy script in front of remote URL
	inbound: null,		// hash-indexed array of tiddlers from other document
	newTags: "",		// text of tags added to imported tiddlers
	addTags: true,		// add new tags to imported tiddlers
	listsize: 8,		// # of lines to show in imported tiddler list
	importTags: true,	// include tags from remote source document when importing a tiddler
	keepTags: true,		// retain existing tags when replacing a tiddler
	sync: false,		// add 'server' fields to imported tiddlers (for sync function)
	index: 0,		// current processing index in import list
	sort: ""		// sort order for imported tiddler listbox
});

if (config.macros.importTiddlers.coreHandler==undefined)
	config.macros.importTiddlers.coreHandler=config.macros.importTiddlers.handler; // save built-in handler

config.macros.importTiddlers.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	if (!params[0] || params[0].toLowerCase()=='core') { // default to built in
		if (config.macros.importTiddlers.coreHandler)
			config.macros.importTiddlers.coreHandler.apply(this,arguments);
		else 
			createTiddlyButton(place,this.label,this.prompt,onClickImportMenu);
	}
	else if (params[0]=='link') { // show link to floating panel
		var label=params[1]?params[1]:this.label;
		var prompt=params[2]?params[2]:this.prompt;
		createTiddlyButton(place,label,prompt,onClickImportMenu);
	}
	else if (params[0]=='inline') {// show panel as INLINE tiddler content
		createImportPanel(place);
		document.getElementById("importPanel").style.position="static";
		document.getElementById("importPanel").style.display="block";
	}
	else if (config.macros.loadTiddlers)
		config.macros.loadTiddlers.handler(place,macroName,params); // any other params: loadtiddlers
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

// // Create control panel: HTML, CSS
//{{{
function createImportPanel(place) {
	var panel=document.getElementById("importPanel");
	if (panel) { panel.parentNode.removeChild(panel); }
	setStylesheet(config.macros.importTiddlers.css,"importTiddlers");
	panel=createTiddlyElement(place,"span","importPanel",null,null)
	panel.innerHTML=config.macros.importTiddlers.html;
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
config.macros.importTiddlers.css = '\
#importPanel {\
	display: none; position:absolute; z-index:11; width:35em; right:105%; top:3em;\
	background-color: #eee; color:#000; font-size: 8pt; line-height:110%;\
	border:1px solid black; border-bottom-width: 3px; border-right-width: 3px;\
	padding: 0.5em; margin:0em; -moz-border-radius:1em;\
}\
#importPanel a, #importPanel td a { color:#009; display:inline; margin:0px; padding:1px; }\
#importPanel table { width:100%; border:0px; padding:0px; margin:0px; font-size:8pt; line-height:110%; background:transparent; }\
#importPanel tr { border:0px;padding:0px;margin:0px; background:transparent; }\
#importPanel td { color:#000; border:0px;padding:0px;margin:0px; background:transparent; }\
#importPanel select { width:98%;margin:0px;font-size:8pt;line-height:110%;}\
#importPanel input  { width:98%;padding:0px;margin:0px;font-size:8pt;line-height:110%}\
#importPanel .box { border:1px solid black; padding:3px; margin-bottom:5px; background:#f8f8f8; -moz-border-radius:5px;}\
#importPanel .topline { border-top:2px solid black; padding-top:3px; margin-bottom:5px; }\
#importPanel .rad { width:auto; }\
#importPanel .chk { width:auto; margin:1px;border:0; }\
#importPanel .btn { width:auto; }\
#importPanel .btn1 { width:98%; }\
#importPanel .btn2 { width:48%; }\
#importPanel .btn3 { width:32%; }\
#importPanel .btn4 { width:24%; }\
#importPanel .btn5 { width:19%; }\
#importPanel .importButton { padding: 0em; margin: 0px; font-size:8pt; }\
#importPanel .importListButton { padding:0em 0.25em 0em 0.25em; color: #000000; display:inline }\
#importCollisionPanel { display:none; margin:0.5em 0em 0em 0em; }\
';
//}}}

// // HTML 
//{{{
config.macros.importTiddlers.html = '\
<!-- source and report -->\
<table><tr><td align=left>\
	import from\
	<input type="radio" class="rad" name="importFrom" id="importFromFile" value="file" CHECKED\
		onClick="config.macros.importTiddlers.local=true;\
			document.getElementById(\'importLocalPanel\').style.display=\'block\';\
			document.getElementById(\'importHTTPPanel\').style.display=\'none\'"> local file\
	<input type="radio" class="rad" name="importFrom" id="importFromWeb"  value="http"\
		onClick="config.macros.importTiddlers.local=false;\
			document.getElementById(\'importLocalPanel\').style.display=\'none\';\
			document.getElementById(\'importHTTPPanel\').style.display=\'block\'"> web server\
</td><td align=right>\
	<input type=checkbox class="chk" id="chkImportReport" checked\
		onClick="config.options[\'chkImportReport\']=this.checked;"> create report\
</td></tr></table>\
<!-- import from local file  -->\
<div id="importLocalPanel" style="display:block;margin-bottom:2px;margin-top:5px;padding-top:3px;border-top:1px solid #999">\
enter source path/filename<br>\
<input type="file" id="fileImportSource" size=57 style="width:100%"\
	onKeyUp="config.macros.importTiddlers.src=this.value"\
	onChange="config.macros.importTiddlers.src=this.value;document.getElementById(\'importLoad\').onclick()">\
</div><!--panel-->\
\
<!-- import from http server -->\
<div id="importHTTPPanel" style="display:none;margin-bottom:2px;margin-top:5px;padding-top:3px;border-top:1px solid #999">\
<table><tr><td align=left>\
	enter source URL or <a href="javascript:;" id="importSelectFeed"\
		onclick="onClickImportButton(this,event)" title="select a pre-defined \'systemServer\' URL">\
		select a server</a><br>\
</td><td align=right>\
	<input type="checkbox" class="chk" id="importUseProxy"\
		onClick="config.macros.importTiddlers.useProxy=this.checked;\
			document.getElementById(\'importSiteProxy\').style.display=this.checked?\'block\':\'none\'"> use a proxy\
</td></tr></table>\
<input type="text" id="importSiteProxy" style="display:none;margin-bottom:1px" onfocus="this.select()" value="SiteProxy"\
	onKeyUp="config.macros.importTiddlers.proxy=this.value"\
	onChange="config.macros.importTiddlers.proxy=this.value;">\
<input type="text" id="importSourceURL" onfocus="this.select()" value="SiteUrl"\
	onKeyUp="config.macros.importTiddlers.src=this.value"\
	onChange="config.macros.importTiddlers.src=this.value;">\
</div><!--panel-->\
\
<table><tr><td align=left>\
	select:\
	<a href="javascript:;" id="importSelectAll"\
		onclick="onClickImportButton(this)" title="select all tiddlers">\
		&nbsp;all&nbsp;</a>\
	<a href="javascript:;" id="importSelectNew"\
		onclick="onClickImportButton(this)" title="select tiddlers not already in destination document">\
		&nbsp;added&nbsp;</a> \
	<a href="javascript:;" id="importSelectChanges"\
		onclick="onClickImportButton(this)" title="select tiddlers that have been updated in source document">\
		&nbsp;changes&nbsp;</a> \
	<a href="javascript:;" id="importSelectDifferences"\
		onclick="onClickImportButton(this)" title="select tiddlers that have been added or are different from existing tiddlers">\
		&nbsp;differences&nbsp;</a> \
	<!--<a href="javascript:;" id="importToggleFilter"\
		onclick="onClickImportButton(this)" title="show/hide selection filter">\
		&nbsp;filter&nbsp;</a>--> \
</td><td align=right>\
	<a href="javascript:;" id="importListSmaller"\
		onclick="onClickImportButton(this)" title="reduce list size">\
		&nbsp;&#150;&nbsp;</a>\
	<a href="javascript:;" id="importListLarger"\
		onclick="onClickImportButton(this)" title="increase list size">\
		&nbsp;+&nbsp;</a>\
	<a href="javascript:;" id="importListMaximize"\
		onclick="onClickImportButton(this)" title="maximize/restore list size">\
		&nbsp;=&nbsp;</a>\
</td></tr></table>\
<select id="importList" size=8 multiple\
	onchange="setTimeout(\'refreshImportList(\'+this.selectedIndex+\')\',1)">\
	<!-- NOTE: delay refresh so list is updated AFTER onchange event is handled -->\
</select>\
<div style="margin-bottom:2px;padding-bottom:2px;border-bottom:1px solid #999">\
<input type=checkbox class="chk" id="chkSync" \
	onClick="config.macros.importTiddlers.sync=this.checked;">link tiddlers to source document (for synchronizing later)\
</div>\
<input type=checkbox class="chk" id="chkAddTags" checked\
	onClick="config.macros.importTiddlers.addTags=this.checked;">add new tags &nbsp;\
<input type=checkbox class="chk" id="chkImportTags" checked\
	onClick="config.macros.importTiddlers.importTags=this.checked;">import source tags &nbsp;\
<input type=checkbox class="chk" id="chkKeepTags" checked\
	onClick="config.macros.importTiddlers.keepTags=this.checked;">keep existing tags<br>\
<input type=text id="txtNewTags" size=15 onKeyUp="config.macros.importTiddlers.newTags=this.value" autocomplete=off>\
<div align=center style="margin-top:2px">\
	<input type=button id="importLoad" class="importButton" style="width:32%" value="load"\
		title="load listbox with tiddlers from source document"\
		onclick="onClickImportButton(this)">\
	<input type=button id="importStart"	 class="importButton" style="width:32%" value="import"\
		title="add selected source tiddlers to the current document"\
		onclick="onClickImportButton(this)">\
	<input type=button id="importClose"	 class="importButton" style="width:32%" value="close"\
		title="clear listbox or hide control panel"\
		onclick="onClickImportButton(this)">\
</div>\
<div id="importCollisionPanel" style="text-align:left">\
	tiddler already exists:\
	<input type=text id="importNewTitle" size=15 autocomplete=off">\
	<div align=center>\
	<input type=button id="importSkip"	class="importButton" style="width:23%" value="skip"\
		title="do not import this tiddler"\
		onclick="onClickImportButton(this)">\
	<input type=button id="importRename"  class="importButton" style="width:23%" value="rename"\
		title="rename the incoming tiddler"\
		onclick="onClickImportButton(this)">\
	<input type=button id="importMerge"   class="importButton" style="width:23%" value="merge"\
		title="append the incoming tiddler to the existing tiddler"\
		onclick="onClickImportButton(this)">\
	<input type=button id="importReplace" class="importButton" style="width:23%" value="replace"\
		title="discard the existing tiddler"\
		onclick="onClickImportButton(this)">\
	</div>\
</div>\
';
//}}}

// // Control interactions
//{{{
function onClickImportButton(which,event)
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
		case 'importLoad':		// load import source into hidden frame
			importReport();		// if an import was in progress, generate a report
			config.macros.importTiddlers.inbound=null;	// clear the imported tiddler buffer
			refreshImportList();	// reset/resize the listbox
			if (config.macros.importTiddlers.src=="") break;
			// Load document, read it's DOM and fill the list
			config.macros.importTiddlers.loadRemoteFile(config.macros.importTiddlers.src,
				function(success,params,txt,src,xhr) {
					var src=src.replace(/%20/g," ");
					if (!success) { displayMessage(config.macros.importTiddlers.openErrMsg.format([src,xhr.status])); return; }
					var tiddlers = config.macros.importTiddlers.readTiddlersFromHTML(txt);
					var count=tiddlers?tiddlers.length:0;
					var querypos=src.lastIndexOf("?"); if (querypos!=-1) src=src.substr(0,querypos);
					displayMessage(config.macros.importTiddlers.foundMsg.format([count,src]));
					config.macros.importTiddlers.inbound=tiddlers;
					window.refreshImportList(0);
				});
			break;
		case 'importSelectFeed':	// select a pre-defined systemServer feed URL
			var p=Popup.create(which); if (!p) return;
			var tids=store.getTaggedTiddlers('systemServer');
			if (!tids.length)
				createTiddlyText(createTiddlyElement(p,'li'),'no pre-defined server feeds');
			for (var t=0; t<tids.length; t++) {
				var u=store.getTiddlerSlice(tids[t].title,"URL");
				var d=store.getTiddlerSlice(tids[t].title,"Description");
				if (!d||!d.length) d=store.getTiddlerSlice(tids[t].title,"description");
				if (!d||!d.length) d=u;
				createTiddlyButton(createTiddlyElement(p,'li'),tids[t].title,d,
					function(){
						var u=this.getAttribute('url');
						document.getElementById('importSourceURL').value=u;
						config.macros.importTiddlers.src=u;
						document.getElementById('importLoad').onclick();
					},
					null,null,null,{url:u});
			}
			Popup.show(p,false);
			event.cancelBubble = true;
			if (event.stopPropagation) event.stopPropagation();
			return(false);
			// create popup with feed list
			// onselect, insert feed URL into input field.
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
			var theText	= theExisting.text+'\n----\n^^merged from: ';
			theText		+='[['+config.macros.importTiddlers.src+'#'+theItem.value+'|'+config.macros.importTiddlers.src+'#'+theItem.value+']]^^\n';
			theText		+='^^'+theImported.modified.toLocaleString()+' by '+theImported.modifier+'^^\n'+theImported.text;
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
		theList.options[0]=new Option(config.macros.importTiddlers.loadText,"",false,false);
		theList.size=config.macros.importTiddlers.listsize;
		document.getElementById('importLoad').disabled=false;
		document.getElementById('fileImportSource').disabled=false;
		document.getElementById('importFromFile').disabled=false;
		document.getElementById('importFromWeb').disabled=false;
		document.getElementById('importClose').value=config.macros.importTiddlers.closeText;
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
		for (var t=0,count=0; t < theList.options.length; t++) {
			if (!theList.options[t].selected) continue;
			if (theList.options[t].value!="")
				count+=1;
			else { // if heading is selected, deselect it, and then select and count all in section
				theList.options[t].selected=false;
				for ( t++; t<theList.options.length && theList.options[t].value!=""; t++) {
					theList.options[t].selected=true;
					count++;
				}
			}
		}
		clearMessage(); displayMessage(config.macros.importTiddlers.countMsg.format([count]));
		return; // no refresh needed
	}

	// there are inbound tiddlers loaded... disable inapplicable controls...
	document.getElementById('importLoad').disabled=true;
	document.getElementById('fileImportSource').disabled=true;
	document.getElementById('importFromFile').disabled=true;
	document.getElementById('importFromWeb').disabled=true;
	document.getElementById('importClose').value=config.macros.importTiddlers.doneText;

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
		var inbound = config.macros.importTiddlers.inbound[j];
		var theExisting = store.getTiddler(inbound.title);
		// avoid redundant import for tiddlers that are listed multiple times (when 'by tags')
		if (inbound.status=="added")
			continue;
		// don't import the "ImportedTiddlers" history from the other document...
		if (inbound.title=='ImportedTiddlers')
			continue;
		// if tiddler exists and import not marked for replace or merge, stop importing
		if (theExisting && (inbound.status.substr(0,7)!="replace") && (inbound.status.substr(0,5)!="merge"))
			return i;
		// assemble tags (remote + existing + added)
		var newTags = "";
		if (config.macros.importTiddlers.importTags)
			newTags+=inbound.getTags()	// import remote tags
		if (config.macros.importTiddlers.keepTags && theExisting)
			newTags+=" "+theExisting.getTags(); // keep existing tags
		if (config.macros.importTiddlers.addTags && config.macros.importTiddlers.newTags.trim().length)
			newTags+=" "+config.macros.importTiddlers.newTags; // add new tags
		inbound.set(null,null,null,null,newTags.trim());
		// set the status to 'added' (if not already set by the 'ask the user' UI)
		inbound.status=(inbound.status=="")?'added':inbound.status;
		// set sync fields
		if (config.macros.importTiddlers.sync) {
			if (!inbound.fields) inbound.fields={}; // for TW2.1.x backward-compatibility
			inbound.fields["server.page.revision"]=inbound.modified.convertToYYYYMMDDHHMM();
			inbound.fields["server.type"]="file";
			inbound.fields["server.host"]=(config.macros.importTiddlers.local?"file://":"")+config.macros.importTiddlers.src;
		}
		// do the import!
		store.suspendNotifications();
		store.saveTiddler(inbound.title, inbound.title, inbound.text, inbound.modifier, inbound.modified, inbound.tags, inbound.fields, true, inbound.created);
                store.fetchTiddler(inbound.title).created = inbound.created; // force creation date to imported value (needed for TW2.1.x and earlier)
		store.resumeNotifications();
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
		newText +=" imported "+count+" tiddler"+(count==1?"":"s")+" from\n[["+config.macros.importTiddlers.src+"|"+config.macros.importTiddlers.src+"]]:\n";
		if (config.macros.importTiddlers.addTags && config.macros.importTiddlers.newTags.trim().length)
			newText += "imported tiddlers were tagged with: \""+config.macros.importTiddlers.newTags+"\"\n";
		newText += "<<<\n";
		for (var t=0; t<tiddlers.length; t++) if (tiddlers[t].status) newText += "#[["+tiddlers[t].title+"]] - "+tiddlers[t].status+"\n";
		newText += "<<<\n";
		// update the ImportedTiddlers content and show the tiddler
		theReport.text	 = newText+((theReport.text!="")?'\n----\n':"")+theReport.text;
		theReport.modifier = config.options.txtUserName;
		theReport.modified = new Date();
                store.saveTiddler(theReport.title, theReport.title, theReport.text, theReport.modifier, theReport.modified, theReport.tags, theReport.fields);
		if (!quiet) { story.displayTiddler(null,theReport.title,1,null,null,false); story.refreshTiddler(theReport.title,1,true); }
	}

	// reset status flags
	for (var t=0; t<config.macros.importTiddlers.inbound.length; t++) config.macros.importTiddlers.inbound[t].status="";

	// mark document as dirty and let display update as needed
	if (count) { store.setDirty(true); store.notifyAll(); }

	// always show final message when tiddlers were actually loaded
	if (count) displayMessage(config.macros.importTiddlers.importedMsg.format([count,tiddlers.length,config.macros.importTiddlers.src.replace(/%20/g," ")]));
}
//}}}

// // File and XMLHttpRequest I/O
//{{{
config.macros.importTiddlers.fileExists=function(theFile) {
	var found=false;
	// DEBUG: alert('testing fileExists('+theFile+')...');
	if(window.Components) {
		try { netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); }
		catch(e) { return false; } // security access denied
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		try { file.initWithPath(theFile); }
		catch(e) { return false; } // invalid directory
		found = file.exists();
	}
	else { // use ActiveX FSO object for MSIE 
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		found = fso.FileExists(theFile)
	}
	// DEBUG: alert(theFile+" "+(found?"exists":"not found"));
	return found;
}

config.macros.importTiddlers.loadRemoteFile = function(src,callback,quiet) {
	if (src==undefined || !src.length) return null; // filename is required
	if (!quiet) clearMessage();
	if (!quiet) displayMessage(this.openMsg.format([src.replace(/%20/g," ")]));
	if (src.substr(0,5)!="http:" && src.substr(0,5)!="file:") { // if src is relative (i.e., not a URL)
		if (!this.fileExists(src)) { // if file cannot be found, might be relative path.. try fixup
			var pathPrefix=document.location.href;  // get current document path and trim off filename
			var slashpos=pathPrefix.lastIndexOf("/"); if (slashpos==-1) slashpos=pathPrefix.lastIndexOf("\\"); 
			if (slashpos!=-1 && slashpos!=pathPrefix.length-1) pathPrefix=pathPrefix.substr(0,slashpos+1);
			src=pathPrefix+src;
			if (pathPrefix.substr(0,5)!="http:") src=getLocalPath(src);
		}
	}
	if (src.substr(0,5)!="http:" && src.substr(0,5)!="file:") { // if not a URL, read from local filesystem
		var txt=loadFile(src);
		if ((txt==null)||(txt==false)) // file didn't load
			{ if (!quiet) displayMessage(config.macros.importTiddlers.openErrMsg.format([src.replace(/%20/g," "),"(filesystem error)"])); }
		else {
			if (!quiet) displayMessage(config.macros.importTiddlers.readMsg.format([txt.length,src.replace(/%20/g," ")]));
			if (callback) callback(true,quiet,convertUTF8ToUnicode(txt),src,null);
		}
	}
	else {
		var name=config.options.txtRemoteUsername; var pass=config.options.txtRemotePassword;
		var xhr=doHttp("GET",src,null,null,name,pass,callback,quiet,null)
		if (!quiet && !xhr) displayMessage(config.macros.importTiddlers.openErrMsg.format([src,"(XMLHTTPRequest error)"]));
	}
}

config.macros.importTiddlers.readTiddlersFromHTML=function(html)
{
	var remoteStore=new TiddlyWiki();
	remoteStore.importTiddlyWiki(html);
	return remoteStore.getTiddlers("title");	
}
//}}}