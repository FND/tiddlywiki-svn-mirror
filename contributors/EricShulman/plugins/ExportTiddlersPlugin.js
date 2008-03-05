/***
|Name|ExportTiddlersPlugin|
|Source|http://www.TiddlyTools.com/#ExportTiddlersPlugin|
|Documentation|http://www.TiddlyTools.com/#ExportTiddlersPluginInfo|
|Version|2.5.1|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides||
|Description|select and extract tiddlers from your ~TiddlyWiki documents and save them to a separate file|
ExportTiddlersPlugin lets you select and extract tiddlers from your ~TiddlyWiki documents using interactive control panel lets you specify a destination, and then select which tiddlers to export. Tiddler data can be output as complete, stand-alone TiddlyWiki documents, or just the selected tiddlers ("~PureStore" format -- smaller files!) that can be imported directly into another ~TiddlyWiki, or as an ~RSS-compatible XML file that can be published for RSS syndication.
!!!!!Documentation
>see [[ExportTiddlersPluginInfo]]
!!!!!Inline control panel (live):
><<exportTiddlers inline>>
!!!!!Revisions
<<<
2007.12.04 [*.*.*] update for TW2.3.0: replaced deprecated core functions, regexps, and macros
2007.11.10 [2.5.1] removed debugging alert messages from promptForExportFilename()
|please see [[ExportTiddlersPluginInfo]] for additional revision details|
2005.10.09 [0.0.0] development started
<<<
!!!!!Code
***/
//{{{
// version
version.extensions.exportTiddlers = {major: 2, minor: 5, revision: 1, date: new Date(2007,11,10)};

// default shadow definition
config.shadowTiddlers.ExportTiddlers="<<exportTiddlers inline>>";

// macro handler
config.macros.exportTiddlers = {
	label: "export tiddlers",
	prompt: "Copy selected tiddlers to an export document",
	newdefault: "export.html",
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

// // IE needs explicit scoping for functions called by browser events
//{{{
window.onClickExportMenu=onClickExportMenu;
window.onClickExportButton=onClickExportButton;
window.exportShowFilterFields=exportShowFilterFields;
window.refreshExportList=refreshExportList;
//}}}

// // CSS for floating export control panel
//{{{
config.macros.exportTiddlers.css = '\
#exportPanel {\
	display: none; position:absolute; z-index:12; width:35em; right:105%; top:6em;\
	background-color: #eee; color:#000; font-size: 8pt; line-height:110%;\
	border:1px solid black; border-bottom-width: 3px; border-right-width: 3px;\
	padding: 0.5em; margin:0em; -moz-border-radius:1em;\
}\
#exportPanel a, #exportPanel td a { color:#009; display:inline; margin:0px; padding:1px; }\
#exportPanel table { width:100%; border:0px; padding:0px; margin:0px; font-size:8pt; line-height:110%; background:transparent; }\
#exportPanel tr { border:0px;padding:0px;margin:0px; background:transparent; }\
#exportPanel td { color:#000; border:0px;padding:0px;margin:0px; background:transparent; }\
#exportPanel select { width:98%;margin:0px;font-size:8pt;line-height:110%;}\
#exportPanel input  { width:98%;padding:0px;margin:0px;font-size:8pt;line-height:110%; }\
#exportPanel textarea  { width:98%;padding:0px;margin:0px;overflow:auto;font-size:8pt; }\
#exportPanel .box { border:1px solid black; padding:3px; margin-bottom:5px; background:#f8f8f8; -moz-border-radius:5px; }\
#exportPanel .topline { border-top:2px solid black; padding-top:3px; margin-bottom:5px; }\
#exportPanel .rad { width:auto;border:0 }\
#exportPanel .chk { width:auto;border:0 }\
#exportPanel .btn { width:auto; }\
#exportPanel .btn1 { width:98%; }\
#exportPanel .btn2 { width:48%; }\
#exportPanel .btn3 { width:32%; }\
#exportPanel .btn4 { width:24%; }\
#exportPanel .btn5 { width:19%; }\
';
//}}}

// // HTML for export control panel interface
//{{{
config.macros.exportTiddlers.html = '\
<!-- target path/file  -->\
<div>\
export to path/filename:<br>\
<input type="text" id="exportFilename" size=40 style="width:93%"><input \
	type="button" id="exportBrowse" value="..." title="select or enter a local folder/file..." style="width:5%" \
	onclick="this.previousSibling.value=window.promptForExportFilename(this);">\
</div>\
\
<!-- output format -->\
<div>\
output file format:\
<select id="exportFormat" size=1>\
<option value="DIV">TiddlyWiki export file</option>\
<option value="TW">TiddlyWiki document</option>\
<option value="XML">RSS feed (XML)</option>\
</select>\
</div>\
\
<!-- notes -->\
<div>\
notes:<br>\
<textarea id="exportNotes" rows=3 cols=40 style="height:4em;margin-bottom:5px;" onfocus="this.select()"></textarea> \
</div>\
\
<!-- list of tiddlers -->\
<table><tr align="left"><td>\
	select:\
	<a href="JavaScript:;" id="exportSelectAll"\
		onclick="onClickExportButton(this)" title="select all tiddlers">\
		&nbsp;all&nbsp;</a>\
	<a href="JavaScript:;" id="exportSelectChanges"\
		onclick="onClickExportButton(this)" title="select tiddlers changed since last save">\
		&nbsp;changes&nbsp;</a> \
	<a href="JavaScript:;" id="exportSelectOpened"\
		onclick="onClickExportButton(this)" title="select tiddlers currently being displayed">\
		&nbsp;opened&nbsp;</a> \
	<a href="JavaScript:;" id="exportSelectRelated"\
		onclick="onClickExportButton(this)" title="select all tiddlers related (by link or transclusion) to the currently selected tiddlers">\
		&nbsp;related&nbsp;</a> \
	<a href="JavaScript:;" id="exportToggleFilter"\
		onclick="onClickExportButton(this)" title="show/hide selection filter">\
		&nbsp;filter&nbsp;</a>  \
</td><td align="right">\
	<a href="JavaScript:;" id="exportListSmaller"\
		onclick="onClickExportButton(this)" title="reduce list size">\
		&nbsp;&#150;&nbsp;</a>\
	<a href="JavaScript:;" id="exportListLarger"\
		onclick="onClickExportButton(this)" title="increase list size">\
		&nbsp;+&nbsp;</a>\
</td></tr></table>\
<select id="exportList" multiple size="10" style="margin-bottom:5px;"\
	onchange="refreshExportList(this.selectedIndex)">\
</select><br>\
</div><!--box-->\
\
<!-- selection filter -->\
<div id="exportFilterPanel" style="display:none">\
<table><tr align="left"><td>\
	selection filter\
</td><td align="right">\
	<a href="JavaScript:;" id="exportHideFilter"\
		onclick="onClickExportButton(this)" title="hide selection filter">hide</a>\
</td></tr></table>\
<div class="box">\
<input type="checkbox" class="chk" id="exportFilterStart" value="1"\
	onclick="exportShowFilterFields(this)"> starting date/time<br>\
<table cellpadding="0" cellspacing="0"><tr valign="center"><td width="50%">\
	<select size=1 id="exportFilterStartBy" onchange="exportShowFilterFields(this);">\
		<option value="0">today</option>\
		<option value="1">yesterday</option>\
		<option value="7">a week ago</option>\
		<option value="30">a month ago</option>\
		<option value="site">SiteDate</option>\
		<option value="file">file date</option>\
		<option value="other">other (mm/dd/yyyy hh:mm)</option>\
	</select>\
</td><td width="50%">\
	<input type="text" id="exportStartDate" onfocus="this.select()"\
		onchange="document.getElementById(\'exportFilterStartBy\').value=\'other\';">\
</td></tr></table>\
<input type="checkbox" class="chk" id="exportFilterEnd" value="1"\
	onclick="exportShowFilterFields(this)"> ending date/time<br>\
<table cellpadding="0" cellspacing="0"><tr valign="center"><td width="50%">\
	<select size=1 id="exportFilterEndBy" onchange="exportShowFilterFields(this);">\
		<option value="0">today</option>\
		<option value="1">yesterday</option>\
		<option value="7">a week ago</option>\
		<option value="30">a month ago</option>\
		<option value="site">SiteDate</option>\
		<option value="file">file date</option>\
		<option value="other">other (mm/dd/yyyy hh:mm)</option>\
	</select>\
</td><td width="50%">\
	<input type="text" id="exportEndDate" onfocus="this.select()"\
		onchange="document.getElementById(\'exportFilterEndBy\').value=\'other\';">\
</td></tr></table>\
<input type="checkbox" class="chk" id=exportFilterTags value="1"\
	onclick="exportShowFilterFields(this)"> match tags<br>\
<input type="text" id="exportTags" onfocus="this.select()">\
<input type="checkbox" class="chk" id=exportFilterText value="1"\
	onclick="exportShowFilterFields(this)"> match titles/tiddler text<br>\
<input type="text" id="exportText" onfocus="this.select()">\
</div> <!--box-->\
</div> <!--panel-->\
\
<!-- action buttons -->\
<div style="text-align:center">\
<input type=button class="btn3" onclick="onClickExportButton(this)"\
	id="exportFilter" value="apply filter">\
<input type=button class="btn3" onclick="onClickExportButton(this)"\
	id="exportStart" value="export tiddlers">\
<input type=button class="btn3" onclick="onClickExportButton(this)"\
	id="exportClose" value="close">\
</div><!--center-->\
';
//}}}

// // initialize interface

// // exportInitFilter()
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

// // exportShowFilterFields(which)
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

// // onClickExportButton(which): control interactions
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
			var tiddlerDisplay = document.getElementById("tiddlerDisplay"); // for TW2.1-
			if (!tiddlerDisplay) tiddlerDisplay = document.getElementById("storyDisplay"); // for TW2.2+
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
		case 'exportSelectRelated':
			// recursively build list of related tiddlers
			function getRelatedTiddlers(tid,tids) {
				var t=store.getTiddler(tid); if (!t || tids.contains(tid)) return tids;
				tids.push(t.title);
				if (!t.linksUpdated) t.changed();
				for (var i=0; i<t.links.length; i++)
					if (t.links[i]!=tid) tids=getRelatedTiddlers(t.links[i],tids);
				return tids;
			}
			// for all currently selected tiddlers, gather up the related tiddlers (including self) and select them as well
			var tids=[];
			for (var i=0; i<theList.options.length; i++)
				if (theList.options[i].selected) tids=getRelatedTiddlers(theList.options[i].value,tids);
			// select related tiddlers (includes original selected tiddlers)
			for (var i=0; i<theList.options.length; i++)
				theList.options[i].selected=tids.contains(theList.options[i].value);
			clearMessage(); displayMessage(formatExportMessage(tids.length,total));
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

// // promptForFilename(msg,path,file) uses platform/browser specific functions to get local filespec
//{{{
window.promptForExportFilename=function(here)
{
	var msg=here.title; // use tooltip as dialog box message
	var path=getLocalPath(document.location.href);
	var slashpos=path.lastIndexOf("/"); if (slashpos==-1) slashpos=path.lastIndexOf("\\"); 
	if (slashpos!=-1) path = path.substr(0,slashpos+1); // remove filename from path, leave the trailing slash
	var file=config.macros.exportTiddlers.newdefault;
	var result="";
	if(window.Components) { // moz
		try {
			netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
			var nsIFilePicker = window.Components.interfaces.nsIFilePicker;
			var picker = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
			picker.init(window, msg, nsIFilePicker.modeSave);
			var thispath = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			thispath.initWithPath(path);
			picker.displayDirectory=thispath;
			picker.defaultExtension='html';
			picker.defaultString=file;
			picker.appendFilters(nsIFilePicker.filterAll|nsIFilePicker.filterText|nsIFilePicker.filterHTML);
			if (picker.show()!=nsIFilePicker.returnCancel) var result=picker.file.persistentDescriptor;
		}
		catch(e) { alert('error during local file access: '+e.toString()) }
	}
	else { // IE
		try { // XPSP2 IE only
			var s = new ActiveXObject('UserAccounts.CommonDialog');
			s.Filter='All files|*.*|Text files|*.txt|HTML files|*.htm;*.html|';
			s.FilterIndex=3; // default to HTML files;
			s.InitialDir=path;
			s.FileName=file;
			if (s.showOpen()) var result=s.FileName;
		}
		catch(e) {  // fallback
			var result=prompt(msg,path+file);
		}
	}
	return result;
}
//}}}

// // list display
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
	if (selectedIndex==4) sort='tags';

	// unselect headings and count number of tiddlers actually selected
	for (var t=0,count=0; t < theList.options.length; t++) {
		if (!theList.options[t].selected) continue;
		if (theList.options[t].value!="")
			count++;
		else { // if heading is selected, deselect it, and then select and count all in section
			theList.options[t].selected=false;
			for ( t++; t<theList.options.length && theList.options[t].value!=""; t++) {
				theList.options[t].selected=true;
				count++;
			}
		}
	}

	// disable "export" button if no tiddlers selected
	document.getElementById("exportStart").disabled=(count==0);
	// show selection count
	var tiddlers = store.getTiddlers('title');
	if (theList.options.length) { clearMessage(); displayMessage(formatExportMessage(count,tiddlers.length)); }

	// if a [command] item, reload list... otherwise, no further refresh needed
	if (selectedIndex>4)  return;

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
	theList.options[i++]=
		new Option(((sort=="tags"	)?">":indent)+' [by tags]', "",false,false);
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
}
//}}}

// // list filtering
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
	// DEBUG alert('getFilterDate('+val+','+id+')=='+result+"\nnow="+now);
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
		var msg="starting date/time:\n"
		msg+=startDate.toLocaleString()+"\n";
		msg+="is later than ending date/time:\n"
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
	exp = exp.replace( /(,[\d]+)/g, "" ) ;
	var regex = new RegExp( exp, "ig" );

	// build a string such that an expression that looks like this: tag1 AND tag2 OR NOT tag3
	// turns into : /tag1/.test(...) && /tag2/.test(...) || ! /tag2/.test(...)
	cond = cond.replace( regex, "/$1\\|/.test(tiddlerTags)" );
	cond = cond.replace( /\sand\s/ig, " && " ) ;
	cond = cond.replace( /\sor\s/ig, " || " ) ;
	cond = cond.replace( /\s?not\s/ig, " ! " ) ;

	// if a boolean uses a tag that doesn't exist - it will get left alone 
	// (we only turn existing tags into actual tests).
	// replace anything that wasn't found as a tag, AND, OR, or NOT with the string "false"
	// if the tag doesn't exist then /tag/.test(...) will always return false.
	cond = cond.replace( /(\s|^)+[^\/\|&!][^\s]*/g, "false" ) ;

	// make a string of the tags in the tiddler and eval the 'cond' string against that string 
	// if it's TRUE then the tiddler qualifies!
	var tiddlerTags = (tiddler.tags?tiddler.tags.join("|"):"")+"|" ;
	try { if ( eval( cond ) ) return true; }
	catch( e ) { displayMessage("Error in tag filter '" + e + "'" ); }
	return false;
}
//}}}

// // OUTPUT FORMATTING AND FILE I/O

// // exportHeader(format)
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

// // exportFooter(format)
//{{{
function exportFooter(format)
{
	switch (format) {
		case "TW":	return exportTWFooter();
		case "DIV":	return exportDIVFooter();
		case "XML":	return exportXMLFooter();
	}
}
//}}}

// // exportTWHeader()
//{{{
function exportTWHeader()
{
	// get the TiddlyWiki core code source
	var sourcefile=getLocalPath(document.location.href);
	var source=loadFile(sourcefile);
	if(source==null) { alert(config.messages.cantSaveError); return null; }
	// reset existing HTML source markup
	source=updateMarkupBlock(source,"PRE-HEAD");
	source=updateMarkupBlock(source,"POST-HEAD");
	source=updateMarkupBlock(source,"PRE-BODY");
	source=updateMarkupBlock(source,"POST-BODY");
	// find store area
	var posOpeningDiv=source.indexOf(startSaveArea);
	var posClosingDiv=source.lastIndexOf(endSaveArea);
	if((posOpeningDiv==-1)||(posClosingDiv==-1)) { alert(config.messages.invalidFileError.format([sourcefile])); return; }
	// return everything up to store area
	return source.substr(0,posOpeningDiv+startSaveArea.length);
}
//}}}

// // exportTWFooter()
//{{{
function exportTWFooter()
{
	// get the TiddlyWiki core code source
	var sourcefile=getLocalPath(document.location.href);
	var source=loadFile(sourcefile);
	if(source==null) { alert(config.messages.cantSaveError); return null; }
	// reset existing HTML source markup
	source=updateMarkupBlock(source,"PRE-HEAD");
	source=updateMarkupBlock(source,"POST-HEAD");
	source=updateMarkupBlock(source,"PRE-BODY");
	source=updateMarkupBlock(source,"POST-BODY");
	// find store area
	var posOpeningDiv=source.indexOf(startSaveArea);
	var posClosingDiv=source.lastIndexOf(endSaveArea);
	if((posOpeningDiv==-1)||(posClosingDiv==-1)) { alert(config.messages.invalidFileError.format([sourcefile])); return; }
	// return everything after store area
	return source.substr(posClosingDiv);
}
//}}}

// // exportDIVHeader()
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
	out.push("<style type=\"text/css\">");
	out.push("#storeArea {display:block;margin:1em;}");
	out.push("#storeArea div");
	out.push("{padding:0.5em;margin:1em;border:2px solid black;height:10em;overflow:auto;}");
	out.push("#javascriptWarning");
	out.push("{width:100%;text-align:left;background-color:#eeeeee;padding:1em;}");
	out.push("</style>");
	out.push("<div id=\"javascriptWarning\">");
	out.push("TiddlyWiki export file<br>");
	out.push("Source"+": <b>"+convertUnicodeToUTF8(document.location.href)+"</b><br>");
	out.push("Title: <b>"+title+"</b><br>");
	out.push("Subtitle: <b>"+subtitle+"</b><br>");
	out.push("Created: <b>"+now.toLocaleString()+"</b> by <b>"+user+"</b><br>");
	out.push("TiddlyWiki "+twver+" / "+"ExportTiddlersPlugin "+pver+"<br>");
	out.push("Notes:<hr><pre>"+document.getElementById("exportNotes").value.replace(/\n/g,"<br>")+"</pre>");
	out.push("</div>");
	out.push("<div id=\"storeArea\">");
	return out;
}
//}}}

// // exportDIVFooter()
//{{{
function exportDIVFooter()
{
	return ["</div><!--POST-BODY-START-->\n<!--POST-BODY-END--></body></html>"];
}
//}}}

// // exportXMLHeader()
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
	out.push("<" + "?xml version=\"1.0\"?" + ">");
	out.push("<rss version=\"2.0\">");
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

// // exportXMLFooter()
//{{{
function exportXMLFooter()
{
	return ["</channel></rss>"];
}
//}}}

// // exportData()
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
		switch (theFormat) {
			case "TW":
				out.push(convertUnicodeToUTF8(store.getSaver().externalizeTiddler(store,thisTiddler)));
				break;
			case "DIV":
				out.push(convertUnicodeToUTF8(thisTiddler.title+"\n"+store.getSaver().externalizeTiddler(store,thisTiddler)));
				break;
			case "XML":
				out.push(convertUnicodeToUTF8(thisTiddler.saveToRss(store.getTiddlerText("SiteUrl",""))));
				break;
		}
	}
	return out;
}
//}}}

// // exportTiddlers(): output selected data to local file
//{{{
function exportTiddlers()
{
	var theList  = document.getElementById("exportList"); if (!theList) return;
	var theFormat = document.getElementById("exportFormat").value;
	var theData=exportData(theList,theFormat);
	var count=theData.length;
	var out=[]; var txt=out.concat(exportHeader(theFormat),theData,exportFooter(theFormat)).join("\n");
	var msg="";
	var theTarget = document.getElementById("exportFilename").value.trim();
	if (!theTarget.length) msg = "A target path/filename is required\n";
	if (!msg && saveFile(theTarget,txt))
		msg=count+" tiddler"+((count!=1)?"s":"")+" exported to "+theTarget;
	else if (!msg)
		msg+="An error occurred while saving to "+theTarget;
	theTarget="file:///"+theTarget; // URL link from message text to newly create file
	clearMessage(); displayMessage(msg,theTarget);
}
//}}}