/***
|Name|TidIDEPlugin|
|Source|http://www.TiddlyTools.com/#TidIDEPlugin|
|Version|1.6.1|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <<br>>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides||
|Description|TiddlyWiki Integrated Development Environment - tools for authors and plugin writers|

~TidIDE (//prounounced "Tie Dyed"//) - ''Tid''dlyWiki ''I''ntegrated ''D''evelopment ''E''nvironment - tools for ~TiddlyWiki authors and editors.  

Provides a full-featured tiddler editor with key-by-key ''LIVE PREVIEW'' of //formatted// tiddler content!!  Also includes diagnostic tools to help you debug your TiddlyWiki problems by letting you view current TiddlyWiki internal option values, messages, shadows, stylesheets, notify and macro functions or display the internal DOM (Document Object Model) tree structure for any specific part of the TiddlyWiki document.
!!!!!Configuration
<<<
Automatically freeze preview updates when a tiddler takes more than <<option txtTidIDEAutoFreeze>> milliseconds to render.
<<<
!!!!!Usage/Example
<<<
{{{<<tidIDE id:example "font:Courier New" size:8pt system +edit:GettingStarted>>}}}
<<tidIDE id:example "font:Courier New" size:8pt system +edit:GettingStarted>>
!!!!!parameters:
* ''id'' - assign a unique ID to this instance of TidIDE.  (default id=current tiddler title or "" if not in a tiddler)
* ''font'' - sets the CSS font-family used by textarea controls in editor and system information panels.  Note: if the font name includes a space (e.g., Courier New), then you must enclose the entire parameter in double-quotes: {{{"font:Courier New"}}}.
* ''size'' - sets the CSS font-size used by text input and droplist controls in editor and system information panels.
* ''system'' includes system information panel.
* ''edit'' includes tiddler editor/previewer.
**''edit:here'' automatically sets the editor to show the current tiddler contents (if in a tiddler)
**''edit:tiddlertitle'' automatically sets the editor to show the specified tiddler contents
* use ''{{{[[label|tiddlertitle]]}}}'' to include 'custom panels' (and corresponding labelled checkboxes to toggle their display)
* all parameters are optional.  The default panel is "edit:here".
* panel parameters preceded by a "+" are displayed by default.  If only one panel specified in the parameters, it is automatically displayed, even if the "+" is omitted.
!!!!!using the editor
The editor includes a droplist of all tiddlers in the document, sorted alpha-numerically by tiddler title.  Shadow tiddlers that have not been customized are added to the end of this list and marked with "(shadow)".  Next to the droplist are several buttons:
* ''view'' opens the tiddler in the normal ~TiddlyWiki display area
* ''add'' prompts for a new tiddler title and begins a new editing session
* ''remove'' deletes an existing tiddler (note: shadow tiddlers cannot be removed)
* ''save'' saves changes to the tiddler currently being edited
* ''save as'' saves changes using a new tiddler title
If a tiddlername was not specified in the macro, select a tiddler from the droplist (or press ''add'') to begin editing.  Once a tiddler has been loaded into the editor, you can change it's content, enter or select tags.

Normally, when you save changes to a tiddler, the created/modified dates and tiddler author are automatically updated.  However, it is sometimes useful to make small changes to a tiddler without automatically updating the date/author information.  Select the ''minor edits'' checkbox to prevent those values from being //automatically// changed.  In addition, this enables the date/author edit fields which allows you to //manually// 'back date' a tiddler or change the author to another name.  When the tiddler is saved, the date/author values shown in the edit fields will be used.
!!!!!using the previewer
The ''preview'' checkbox adds a display area that shows you what your tiddler changes will look like, //before// committing to those changes.

By default, this preview display is automatically rendered each time a key is typed into the tiddler content edit field.  As soon as changes are entered, they will be instantly visible within the preview display.  Unfortunately, the partial tiddler source definitions that occur //during// editing may somtimes cause rendering problems, and some exceptionally complex tiddlers make take an unusually long amount of time to completely render their content.   In such cases, key-by-key display updates are undesirable or impractical.

When ''preview'' is selected, you can also select ''freeze'' to suspend automatic key-by-key preview display updates.  The preview display will not be re-rendered again until you press the ''refresh'' button, or clear the 'freeze' checkbox, or switch to editing a different tiddler.  The editor automatically freezes the preview display whenever the //rendering time// exceeds a pre-determined time limit (see configuration section), specified in milliseconds.  Note: the ''actual elapsed time'' used to process and render any given tiddler is reported in the browser's status bar area whenever that tiddler is previewed.

The previewer also can display a ''DOM viewer'' and an ''HTML viewer'' that are also updated with each keystroke.  These text-based displays can be helpful while attempting to correct or enhance the formatting of tiddler content, especially when complex combinations of wiki-syntax produce unexpected or undesired results.
!!!!!system information and TW option settings
You can use the ''system information'' panel to view a variety of system internal data and functions, and view/modify ''all'' of ~TiddlyWiki's internal config.option.* settings.  NOTE: Non-default config.options are stored in cookies and are retrieved whenever the TW document is loaded into a browser; however, ''core TW functions and custom-defined plugins can explicitly ignore or reset any locally-stored cookie values and use their own, internally-defined values'' instead.  As a result, changes to these may be completely ignored, or may only have an effect during the current TW document "session" (i.e., until the TW document is reloaded), even though a persistent cookie value has been saved.
!!!!! ~DOMViewer macro
syntax: {{{<<DOMViewer rows:nn indent:xxxx inline path elementID|tiddlertitle>>}}}

Whenever TiddlyWiki renders a given tiddler, it creates a 'tree' of DOM (Document Object Model) elements that represent the information that is displayed by the browser.  You can use the ''DOMViewer'' macro to examine the internal DOM elements that are produced by TiddlyWiki's formatter (the 'wikifier'), or elements directly produced by embedded macros that create custom formatted output.  This can be particularly helpful when trying to fine tune the layout and appearance of your tiddler content.

DOMViewer creates a textarea control and reports the DOM tree for the current 'insertion point' where the DOMViewer macro is being placed.  ''inline'' flag uses TiddlyWiki rendering instead of textarea control. ''path'' shows the relative location of each child element in the DOM tree, using subscript notation, ''[elementID or tiddlertitle]'' displays DOM elements starting from the node with the specified ID.  If that ID is not found in the DOM tree, the macro attempts to open a tiddler with that title and then displays the "tiddler"+title DOM elements that were rendered.
<<<
!!!!!Installation
<<<
import (or copy/paste) the following tiddlers into your document:
''TidIDEPlugin'' (tagged with <<tag systemConfig>>)
^^documentation and javascript for macro handling^^
<<<
!!!!!Revision History
<<<
''2006.12.09 [1.6.1]'' in handler(), allow non-existing tiddler title when processing "edit:title" param
so that new tiddler (or journal) can be created directly from newTiddler, newJournal, or tidIDE macro (without pressing "new" button).  Also, set 'edit=text' attribute on text area field so that default content can be initialized from "text:xxx" parameter specified in newTiddler/newJournal macro.
''2006.11.28 [1.6.0]'' added font and size params to set CSS for form controls in editor and system info panels
|please see [[TidIDEPluginHistory]] for additional revision details|
''2006.04.15 [0.5.0]'' Initial ALPHA release. Converted from TiddlerTweaker inline script.
<<<
!!!!!Credits
<<<
This feature was developed by EricShulman from [[ELS Design Studios|http:/www.elsdesign.com]].
<<<
!!!!!Code
***/
// // version info
//{{{
version.extensions.tidIDE = {major: 1, minor: 6, revision: 1, date: new Date(2006,12,9)};
//}}}

// //  macro definition
//{{{
config.macros.tidIDE = {
	versionMsg: "TidIDE v%0.%1.%2: ",
	datetimefmt: "0MM/0DD/YYYY 0hh:0mm",
	titleMsg: "Please enter a new tiddler title",
	isShadowMsg: "'%0' is a shadow tiddler and cannot be removed.",
	renderMsg: "rendering preview...",
	timeoutMsg: " (> %0ms)",
	freezeMsg: " - preview is frozen.  Press [refresh] to re-display.",
	evalMsg: "Warning!!\n\nThis action will process '%0' as a systemConfig (plugin) tiddler, and may produce unexpected results!\n\nAre you sure you want to proceed?",
	toolsDef: "<html><a href='javascript:config.macros.tidIDE.set(\"%0\",\"%1\");'>edit %1...</a></html>",
	editorLabel: "TiddlerEditor",
	systemLabel: "SystemInfo"
};
config.macros.tidIDE.handler= function(place,macroName,params) {
	var here=story.findContainingTiddler(place);
	var selectors="";
	var panels="";
	var showsys=false;
	var title="";
	var id=""; if (here) id=here.id.substr(7);
	var p=params.shift();
	if (!p) p="edit:here"; // default to editor if no params
	var openpanels=[];
	var panelcount=0;
	var fontsize="8pt";
	var fontface="Courier New,fixed";
	while (p) {
		var defOpen=(p.substr(0,1)=="+"); if (defOpen) p=p.substr(1);
		if (p.substr(0,3)=="id:")
			{ id=p.substr(3); }
		else if (p.substr(0,5)=="font:")
			{ fontface=p.substr(5); }
		else if (p.substr(0,5)=="size:")
			{ fontsize=p.substr(5); }
		else if (p.substr(0,4)=="edit") {
			panelcount++;
			defOpen=defOpen || (!params[0] && panelcount==1); // if only one panel to show, default to open
			var toolname=this.editorLabel;
			if (p.indexOf('|')!=-1) toolname=p.substr(0,p.indexOf('|'));
			selectors+=this.html.editorchk.replace(/%toolname%/mg,toolname);
			selectors=selectors.replace(/%showpanel%/mg,defOpen?"CHECKED":"");
			panels+=this.html.editorpanel;
			// editor panel setup...
			panels=panels.replace(/%showpanel%/mg,defOpen?"block":"none");
			panels=panels.replace(/%maxrows%/mg,config.options.txtMaxEditRows);
			panels=panels.replace(/%disabled%/mg,readOnly?"DISABLED":"");
			panels=panels.replace(/%readonlychk%/mg,readOnly?"CHECKED":"");
			panels=panels.replace(/%minoredits%/mg,config.options.chkForceMinorUpdate&&!readOnly?"":"DISABLED");
			panels=panels.replace(/%minorchk%/mg,config.options.chkForceMinorUpdate?"CHECKED":"");
			panels=panels.replace(/%fontsize%/mg,fontsize);
			panels=panels.replace(/%fontface%/mg,fontface);
			var tiddlers=store.getTiddlers("title"); var tiddlerlist=""; 
			for (var t=0; t<tiddlers.length; t++)
				tiddlerlist+='<option value="'+tiddlers[t].title+'">'+tiddlers[t].title+'</option>';
			for (var t in config.shadowTiddlers)
				if (!store.tiddlerExists(t)) tiddlerlist+="<option value='"+t+"'>"+t+" (shadow)</option>";
			panels=panels.replace(/%tiddlerlist%/mg,tiddlerlist);
			var tags = store.getTags(); var taglist="";
			for (var t=0; t<tags.length; t++)
				taglist+="<option value='"+tags[t][0]+"'>"+tags[t][0]+"</option>";
			panels=panels.replace(/%taglist%/mg,taglist);
			if (p.substr(0,5)=="edit:") { 
				title=p.substr(5); 
				if (here && title=="here") title=here.id.substr(7);
			}
		}
		else if (p=="system") {
			panelcount++;
			defOpen=defOpen || (!params[0] && panelcount==1); // if only one panel to show, default to open
			var toolname=this.systemLabel;
			showsys=defOpen;
			if (p.indexOf('|')!=-1) toolname=p.substr(0,p.indexOf('|'));
			selectors+=this.html.systemchk.replace(/%toolname%/mg,toolname);
			selectors=selectors.replace(/%showpanel%/mg,defOpen?"CHECKED":"");
			panels+=this.html.systempanel;
			panels=panels.replace(/%showpanel%/mg,defOpen?"block":"none");
			panels=panels.replace(/%fontsize%/mg,fontsize);
			panels=panels.replace(/%fontface%/mg,fontface);
		}
		else {
			panelcount++;
			defOpen=defOpen || (!params[0] && panelcount==1); // if only one panel to show, default to open
			var toolid=toolname=p;
			if (p.indexOf('|')!=-1)
				{ toolname=p.substr(0,p.indexOf('|')); toolid=p.substr(p.indexOf('|')+1); }
			selectors+=this.html.toolschk.replace(/%toolid%/mg,toolid).replace(/%toolname%/mg,toolname);
			selectors=selectors.replace(/%showpanel%/mg,defOpen?"CHECKED":"");
			panels+=this.html.toolspanel.replace(/%toolid%/mg,toolid);
			panels=panels.replace(/%showpanel%/mg,defOpen?"block":"none");
			if (defOpen) openpanels.push(toolid);
		}
		p=params.shift(); // next param
	}
	var html=this.html.framework;
	if (panelcount<2)
		html=html.replace(/%version%/mg,'').replace(/%selector%/mg,''); // omit header/selectors if just one panel to display
	else {
		html=html.replace(/%version%/mg,
			this.versionMsg.format([version.extensions.tidIDE.major,version.extensions.tidIDE.minor,version.extensions.tidIDE.revision]));
		html=html.replace(/%selector%/mg,selectors+"<hr style='margin:0;padding:0'>");
	}
	html=html.replace(/%panels%/mg,panels);
	html=html.replace(/%id%/mg,id);
	var newIDE=createTiddlyElement(place,"span");
	newIDE.innerHTML=html;
	if (title.length) this.set(id,title);  // pre-load tiddler editor (if needed)
	if (showsys) config.macros.tidIDE.getsys(id); // pre-load system information (if needed)
	if (openpanels.length) for (i=0;i<openpanels.length;i++) { config.macros.tidIDE.loadPanel(id,openpanels[i]); }
	// see [[TextAreaPlugin]] for extended ctrl-F/G (search/search again)and TAB handler definitions
	var elems=newIDE.getElementsByTagName("textarea");
	for (var i=0;i<elems.length;i++) { 
		if (window.addKeyDownHandlers!=undefined) window.addKeyDownHandlers(elems[i]);
	}
}
//}}}

// // CUSTOM PANEL FUNCTIONS 
//{{{
config.macros.tidIDE.loadPanel=function(id,toolid) {
	var place=document.getElementById(id+"_"+toolid+"_panel"); if (!place) return;
	var t=store.getTiddler(toolid);
	place.innerHTML=""; 
	if (t) wikify(t.text,place); else place.innerHTML=this.toolsDef.format([id,toolid]);
}
//}}}

// // EDITOR PANEL FUNCTIONS
//{{{
config.macros.tidIDE.set=function(id,title) {
	var place=document.getElementById(id+"_editorpanel"); if (!place) return;
	var f=document.getElementById(id+"_editorform");
	var p=document.getElementById(id+"_preview");
	if (f.dirty && !confirm(config.commands.cancelTiddler.warning.format([f.current]))) return;
	// reset to form defaults
	f.dirty=false;
	f.current="";
	f.created.value=f.created.defaultValue;
	f.modified.value=f.modified.defaultValue;
	f.author.value=f.author.defaultValue;
	f.content.value=f.content.defaultValue;
	f.tags.value=f.tags.defaultValue;
	f.size.value=f.size.defaultValue;
	f.freeze.checked=false;
	f.domview.value="";
	f.htmlview.value="";
	f.status.value="";
	p.innerHTML="";
	if (!title.length) return;
	f.current=title;
	// values for new/shadow tiddlers
	var cdate=new Date();
	var mdate=new Date();
	var modifier=config.options.txtUserName;
	var text=config.views.editor.defaultText.format([title]);
	var tags="";
	// adjust values for shadow tiddlers
	if (store.isShadowTiddler(title))
		{ modifier=config.views.wikified.shadowModifier; text=store.getTiddlerText(title) }
	// get values for specified tiddler (if it exists)
	var t=store.getTiddler(title);
	if (t)	{ var cdate=t.created; var mdate=t.modified; var modifier=t.modifier; var text=t.text; var tags=t.getTags(); }
	if (!t && !store.isShadowTiddler(title)) f.tiddlers.options[f.tiddlers.options.length]=new Option(title,title,false,true); // add item to list
	f.tiddlers.value=title; // select current title (just in case it wasn't already selected)
	f.created.value=cdate.formatString(this.datetimefmt);
	f.modified.value=mdate.formatString(this.datetimefmt);
	f.author.value=modifier;
	f.content.value=text;
	f.tags.value=tags;
	f.minoredits.checked=config.options.chkForceMinorUpdate&&!readOnly;
	f.size.value=f.content.value.length+" bytes";
	if (f.preview.checked) { p.style.display="block"; this.render(id); }
}

config.macros.tidIDE.add=function(id) {
	var place=document.getElementById(id+"_editorpanel"); if (!place) return;
	var f=document.getElementById(id+"_editorform");
	var p=document.getElementById(id+"_preview");
	if (f.dirty && !confirm(config.commands.cancelTiddler.warning.format([f.current]))) return;
	var title=prompt(this.titleMsg,config.macros.newTiddler.title);
	while (title && store.tiddlerExists(title) && !confirm(config.messages.overwriteWarning.format([title])))
		title=prompt(this.titleMsg,config.macros.newTiddler.title);
	if (!title || !title.trim().length) return; // cancelled by user
	f.dirty=false; // suppress unneeded confirmation message
	this.set(id,title);
}

config.macros.tidIDE.remove=function(id) {
	var place=document.getElementById(id+"_editorpanel"); if (!place) return;
	var f=document.getElementById(id+"_editorform");
	var p=document.getElementById(id+"_preview");
	if (!f.current.length) return;
	if (!store.tiddlerExists(f.current) && store.isShadowTiddler(f.current)) { alert(this.isShadowMsg.format([f.current])); return; }
	if (config.options.chkConfirmDelete && !confirm(config.commands.deleteTiddler.warning.format([f.current]))) return;
	if (store.tiddlerExists(f.current)) {
		story.closeTiddler(f.current);
		store.removeTiddler(f.current);
		store.setDirty(true);
		if(config.options.chkAutoSave) saveChanges();
	}
	f.tiddlers.options[f.tiddlers.selectedIndex]=null; // remove item from list
	f.dirty=false; // suppress unneeded confirmation message
	this.set(id,""); // clear form controls
}

config.macros.tidIDE.save=function(id,saveAs) {
	var place=document.getElementById(id+"_editorpanel"); if (!place) return;
	var f=document.getElementById(id+"_editorform");
	var title=f.current;
	if (!title || !title.trim().length || saveAs) { // get a new title
		title=prompt(this.titleMsg,config.macros.newTiddler.title);
		while (title && store.tiddlerExists(title) && !confirm(config.messages.overwriteWarning.format([title])))
			title=prompt(this.titleMsg,config.macros.newTiddler.title);
		if (!title || !title.trim().length) return; // cancelled by user
		f.tiddlers.options[f.tiddlers.options.length]=new Option(title,title,false,true); // add item to list
		f.current=title;
	}
	var author=config.options.txtUserName;
	var mdate=new Date();
	var content=f.content.value;
	var tags=f.tags.value;
	var tiddler=store.saveTiddler(title,title,content,author,mdate,tags);
	if (f.minoredits.checked) {
		var author=f.author.value;
		var mdate=new Date(f.modified.value);
		var cdate=new Date(f.created.value);
		tiddler.assign(null,null,author,mdate,null,cdate);
	}
	store.setDirty(true);
	if(config.options.chkAutoSave) saveChanges();
	story.refreshTiddler(title,null,true);
	f.dirty=false;
}
//}}}

// // EDITOR PANEL: PREVIEW FUNCTIONS
//{{{
if (config.options.txtTidIDEAutoFreeze==undefined)
	config.options.txtTidIDEAutoFreeze=250; // limit (in milliseconds) for auto-freezing preview display

config.macros.tidIDE.render=function(id) {
	var place=document.getElementById(id+"_editorpanel"); if (!place) return;
	var f=document.getElementById(id+"_editorform");
	var p=document.getElementById(id+"_preview");
	var d=document.getElementById(id+"_domview");
	var h=document.getElementById(id+"_htmlview");
	p.innerHTML="";
	f.status.value=this.renderMsg;
	var start=new Date();
	wikify(f.content.value.replace(regexpCarriageReturn,''),p);
	var end=new Date();
	this.renderDOM(id);
	this.renderHTML(id);
	f.status.value=f.current+": "+(end-start+1)+"ms";
	// automatically suspend preview updates for slow rendering tiddlers
	if (end-start+1>config.options.txtTidIDEAutoFreeze) {
		f.freeze.checked=true;
		f.status.value+=this.timeoutMsg.format([config.options.txtTidIDEAutoFreeze]);
	}
	if (f.freeze.checked) f.status.value+=this.freezeMsg;
}

config.macros.tidIDE.renderDOM=function(id) {
	var place=document.getElementById(id+"_editorpanel"); if (!place) return;
	var f=document.getElementById(id+"_editorform");
	var p=document.getElementById(id+"_preview");
	var d=document.getElementById(id+"_domview");
	var h=document.getElementById(id+"_htmlview");
	p.style.height=(f.dom.checked||f.html.checked)?"10em":"25em";
	if (f.dom.checked) d.value=this.getNodeTree(p,"|  ");
	d.style.display=f.dom.checked?"inline":"none";
	d.style.width=f.html.checked?"49.5%":"100%";
	h.style.width=f.dom.checked?"49.5%":"100%";
}

config.macros.tidIDE.renderHTML=function(id) {
	var place=document.getElementById(id+"_editorpanel"); if (!place) return;
	var f=document.getElementById(id+"_editorform");
	var p=document.getElementById(id+"_preview");
	var d=document.getElementById(id+"_domview");
	var h=document.getElementById(id+"_htmlview");
	p.style.height=(f.dom.checked||f.html.checked)?"10em":"25em";
	if (f.html.checked) h.value=this.formatHTML(p.innerHTML);
	h.style.display=f.html.checked?"inline":"none";
	d.style.width=f.html.checked?"49.5%":"100%";
	h.style.width=f.dom.checked?"49.5%":"100%";
}

config.macros.tidIDE.formatHTML=function(txt) {
	if (config.browser.isIE) return txt; // BYPASS - 4/24/2006 due to IE hang problem.  Will fix later...
	var out="";
	var indent="";
	var level=0;
	for (var i=0;i<txt.length;i++) {
		var c=txt.substr(i,1);
		if (c=="<") {
			if (txt.substr(i+1,1)=="/")  indent=indent.substr(0,indent.length-2);
			out+="\n"+indent;
			if (txt.substr(i+1,1)!="/" && txt.substr(i+1,3)!="br>" && txt.substr(i+1,2)!="p>" && txt.substr(i+1,3)!="hr>")  indent+="  ";
		}
		out+=c;
		if (c=="\n")
			out+=indent;
		if (c==">" && txt.substr(i+1,1)!="<")
			out+="\n"+indent;
	}
	return out;
}

config.macros.tidIDE.getNodeTree=function(theNode,theIndent,showPath,inline,thePrefix,thePath)
{
	if (!theNode) return "";
	if (!thePrefix) thePrefix="";
	if (!thePath) thePath="";
	var mquote='"'+(inline?"{{{":"");
	var endmquote=(inline?"}}}":"")+'"';
	// generate output for this node
	var out = thePrefix;
	if (showPath && thePath.length)
		out += (inline?"//":"")+thePath.substr(1)+":"+(inline?"//":"")+"\r\n"+thePrefix;
	if (theNode.className=="DOMViewer")
		return out+'[DOMViewer]\r\n'; // avoid self-referential recursion
	out += (inline?"''":"")+theNode.nodeName.toUpperCase()+(inline?"''":"");
	if (theNode.nodeName=="#text")
		out += ' '+mquote+theNode.nodeValue.replace(/\n/g,'\\n')+endmquote;
	if (theNode.className)
		out += ' class='+mquote+theNode.className+endmquote;
	if (theNode.type)
		out += ' type='+mquote+theNode.type+endmquote;
	if (theNode.id)
		out += ' id='+mquote+theNode.id+endmquote;
	if (theNode.name)
		out += " "+theNode.name+(theNode.value?"="+mquote+theNode.value+endmquote:"");
	if (theNode.href)
		out += ' href='+mquote+theNode.href+endmquote;
	if (theNode.src)
		out += ' src='+mquote+theNode.src+endmquote;
	if (theNode.attributes && theNode.getAttribute("tiddlyLink")!=undefined)
		out += ' tiddler='+mquote+theNode.getAttribute("tiddlyLink")+endmquote;
	out += "\r\n";
	// recursively generate output for child nodes
	thePath=thePath+"."+theNode.nodeName.toLowerCase();
	thePrefix=theIndent+thePrefix;
	for (var i=0;i<theNode.childNodes.length;i++)
	{
		var thisChild=theNode.childNodes.item(i);
		var theNum=(inline?"~~":"(")+(i+1)+(inline?"~~":")");
		out += this.getNodeTree(thisChild,theIndent,showPath,inline,thePrefix,thePath+theNum);
	}
	return out;
}
//}}}

// // DOMViewer macro
//{{{
version.extensions.DOMViewer = version.extensions.tidIDE;
config.macros.DOMViewer = { };
config.macros.DOMViewer.handler = function(place,macroName,params) {
	// set default params
	var inline=false;
	var theRows=15;
	var theIndent="|  ";
	var showPath=false;
	var theTarget=place;
	// unpack options parameters
	if (params[0]=='inline') { inline=true; theIndent=">"; params.shift(); } 
	if (params[0]&&(params[0].substr(0,7)=="indent:")) { theIndent=params[0].substr(7); params.shift(); } 
	if (params[0]&&(params[0].substr(0,5)=="rows:")) { theRows=params[0].substr(5); params.shift(); } 
	if (params[0]=='path') { showPath=true; params.shift(); } 
	if (params[0]) {
		theTarget=document.getElementById(params[0]);
		if (!theTarget)
			if (store.getTiddler(params[0])!=undefined) {
				theTarget=document.getElementById("tiddler"+params[0]);
				if (!theTarget && confirm("DOMViewer asks:\n\nIs it OK to open tiddler '"+params[0]+"' now?")) { 
					story.displayTiddler(null,params[0],1,null,null,false);
					theTarget=document.getElementById("tiddler"+params[0]);
				}
			}
		params.shift();
	}
	// generate and display DOM tree
	if (inline) {
		var out=config.macros.tidIDE.getNodeTree(theTarget,theIndent,showPath,inline);
		wikify(out,place);
	}
	else {
		var out=config.macros.tidIDE.getNodeTree(theTarget,theIndent,showPath,inline);
		var css=".DOMViewer{width:100%;font-size:8pt;color:inherit;background:transparent;border:0px;}";
		setStylesheet(css,"DOMViewerPlugin");
		var theTextArea=createTiddlyElement(place,"textarea",null,"DOMViewer",out);
		theTextArea.rows=theRows;
		theTextArea.cols=60;
		theTextArea.wrap="off";
		theTextArea.theTarget=theTarget;
		theTextArea.theIndent=theIndent;
		theTextArea.showPath=showPath;
	}
}
//}}}

// // SYSTEM PANEL FUNCTIONS
//{{{
config.macros.tidIDE.showObject=function(o) { // generate formatted output for displaying object references
	var t="";
	for (var p in o) {
		if (typeof o[p]=="function") {
			t+="- - - - - - - - - - "+p+" - - - - - - - - - -\n";
			t+=o[p].toString();
			t+="\n- - - - - - - - - - END: "+p+" - - - - - - - - - -\n";
		}
		else
			t+='['+typeof o[p]+'] '+p+": "+o[p]+"\n";
	}
	return t;
}

config.macros.tidIDE.getsys=function(id) {
	var place=document.getElementById(id+"_systempanel"); if (!place) return;
	var f=document.getElementById(id+"_systemform");
	f.sysview.value="";
	// OPTIONS
	while (f.sys_opts.options.length > 1) { f.sys_opts.options[1]=null; } // clear list
	f.config_view.value="";  // clear edit field
	var cookies = { };
	if (document.cookie != "") {
		var p = document.cookie.split("; ");
		for (var i=0; i < p.length; i++) {
			var pos=p[i].indexOf("=");
			if (pos==-1)
				cookies[p[i]]="";
			else
				cookies[p[i].substr(0,pos)]=unescape(p[i].slice(pos+1));
		}
	}
	var c=1;
	var opt=new Array(); for (var i in config.options) opt.push(i); opt.sort();
	for(var i=0; i<opt.length; i++) {
		if ((opt[i].substr(0,3)=="txt")||(opt[i].substr(0,3)=="chk")) {
			var txt = (opt[i].substr(0,3)=="chk"?("["+(config.options[opt[i]]?"x":"_")+"] "):"")+opt[i]+(cookies[opt[i]]?" (cookie)":"");
			var val = config.options[opt[i]];
			f.sys_opts.options[c++]=new Option(txt,val,false,false);
		}
	}
	// STYLESHEETS
	while (f.sys_styles.options.length > 1) { f.sys_styles.options[1]=null; } // clear list
	var c=1;
	var styles=document.getElementsByTagName("style");
	for(var i=0; i < styles.length; i++) {
		var id=styles[i].getAttribute("id"); if (!id) id="(default)";
		var txt=id;
		var val="/* stylesheet:"+txt+" */\n"+styles[i].innerHTML;
		f.sys_styles.options[c++]=new Option(txt,val,false,false);
	}
	// SHADOWS
	while (f.sys_shadows.options.length > 1) { f.sys_shadows.options[1]=null; } // clear list
	var c=1;
	for(var s in config.shadowTiddlers) f.sys_shadows.options[c++]=new Option(s,config.shadowTiddlers[s],false,false);
	// NOTIFICATIONS
	while (f.sys_notify.options.length > 1) { f.sys_notify.options[1]=null; } // clear list
	var c=1;
	for (var i=0; i<store.namedNotifications.length; i++) {
		var n = store.namedNotifications[i];
		var fn = n.notify.toString();
		fn = fn.substring(fn.indexOf("function ")+9,fn.indexOf("{")-1);
		var txt=(n.name?n.name:"any change")+"="+fn;
		var val="/* notify: "+txt+" */\n"+n.notify.toString();
		f.sys_notify.options[c++]=new Option(txt,val,false,false);
	}
	// MACROS
	while (f.sys_macros.options.length > 1) { f.sys_macros.options[1]=null; } // clear list
	var c=1;
	var macros=new Array(); for (var m in config.macros) macros.push(m); macros.sort();
	for(var i=0; i < macros.length; i++)
		f.sys_macros.options[c++]=new Option(macros[i],this.showObject(config.macros[macros[i]]),false,false);
	// TOOLBAR COMMANDS
	while (f.sys_commands.options.length > 1) { f.sys_commands.options[1]=null; } // clear list
	var c=1;
	for(var cmd in config.commands)
		f.sys_commands.options[c++]=new Option(cmd,this.showObject(config.commands[cmd]),false,false);
	// FORMATTERS
	while (f.sys_formatters.options.length > 1) { f.sys_formatters.options[1]=null; } // clear list
	var c=1;
	for(var i=0; i < config.formatters.length; i++)
		f.sys_formatters.options[c++]=new Option(config.formatters[i].name,this.showObject(config.formatters[i]),false,false);
	// PARAMIFIERS
	while (f.sys_params.options.length > 1) { f.sys_params.options[1]=null; } // clear list
	var c=1;
	for(var param in config.paramifiers)
		f.sys_params.options[c++]=new Option(param,this.showObject(config.paramifiers[param]),false,false);
	// GLOBALS
	//global variables and functions (excluding most DOM and ~TiddyWiki core definitions)://
	var DOM0_globals = {
		addEventListener: 1, alert: 1, atob: 1, back: 1, blur: 1, btoa: 1, captureEvents: 1, clearInterval: 1,
		clearTimeout: 1, close: 1, closed: 1, Components: 1, confirm: 1, content: 1, controllers: 1, crypto: 1,
		defaultStatus: 1, defaultStatus: 1, directories: 1, disableExternalCapture: 1, dispatchEvent: 1, document: 1,
		dump: 1, enableExternalCapture: 1, escape: 1, find: 1, focus: 1, forward: 1, frameElement: 1, frames: 1,
		fullScreen: 1, getAttention: 1, getComputedStyle: 1, getSelection: 1, history: 1, home: 1, innerHeight: 1,
		innerWidth: 1, length: 1, location: 1, locationbar: 1, menubar: 1, moveBy: 1, moveTo: 1, name: 1,
		navigator: 1, open: 1, openDialog: 1, opener: 1, outerHeight: 1, outerWidth: 1, pageXOffset: 1,
		pageYOffset: 1, parent: 1, personalbar: 1, pkcs11: 1, print: 1, prompt: 1, prompter: 1, releaseEvents: 1,
		removeEventListener: 1, resizeBy: 1, resizeTo: 1, routeEvent: 1, screen: 1, screenX: 1, screenY: 1,
		scroll: 1, scrollbars: 1, scrollBy: 1, scrollByLines: 1, scrollByPages: 1, scrollMaxX: 1, scrollMaxY: 1,
		scrollTo: 1, scrollX: 1, scrollY: 1, self: 1, setInterval: 1, setResizable: 1, setTimeout: 1, sidebar: 1,
		sizeToContent: 1, status: 1, statusbar: 1, stop: 1, toolbar: 1, top: 1, unescape: 1, updateCommands: 1,
		window: 1, getInterface: 1
	};
	var tw_globals = {
		version: 1, config: 1, DEFAULT_VIEW_TEMPLATE: 1, DEFAULT_EDIT_TEMPLATE: 1, store: 1, story: 1,
		Formatter: 1, anim: 1, readOnly: 1, highlightHack: 1, main: 1, restart: 1, saveTest: 1,  loadSystemConfig: 1,
		processConfig: 1, invokeMacro: 1, Formatter: 1, wikify: 1, wikifyPlain: 1, highlightify: 1, Wikifier: 1, 
		Tiddler: 1, regexpBackSlashEn: 1, regexpBackSlash: 1, regexpBackSlashEss: 1, regexpNewLine: 1, 
		regexpCarriageReturn: 1, TiddlyWiki: 1, displayTiddlers: 1, displayTiddler: 1, Story: 1, displayMessage: 1,
		clearMessage: 1, refreshElements: 1, applyHtmlMacros: 1, refreshPageTemplate: 1, applyPageTemplate: 1,
		refreshDisplay: 1, refreshPageTitle: 1, refreshStyles: 1, loadOptionsCookie: 1, saveOptionCookie: 1,
		saveUsingSafari: 1, startSaveArea: 1, endSaveArea: 1, checkUnsavedChanges: 1, saveChanges: 1,
		getBackupPath: 1, generateRss: 1, allTiddlersAsHtml: 1,
		convertUTF8ToUnicode: 1, manualConvertUTF8ToUnicode: 1, mozConvertUTF8ToUnicode: 1,
		convertUnicodeToUTF8: 1, manualConvertUnicodeToUTF8: 1, mozConvertUnicodeToUTF8: 1,
		saveFile: 1, loadFile: 1, ieSaveFile: 1, ieLoadFile: 1, mozillaSaveFile: 1, mozillaLoadFile: 1,
		operaUrlToFilename: 1, operaSaveFile: 1, operaLoadFile: 1, safariFilenameToUrl: 1, safariLoadFile: 1,
		safariSaveFile: 1, detectPlugin: 1, createTiddlyButton: 1, createTiddlyLink: 1, refreshTiddlyLink: 1,
		createExternalLink: 1, onClickTiddlerLink: 1, createTagButton: 1, onClickTag: 1, onClickTagOpenAll: 1,
		createTiddlyError: 1, Animator: 1, Zoomer: 1, Cascade: 1, Scroller: 1, Slider: 1, Popup: 1,
		createTiddlerPopup: 1, scrollToTiddlerPopup: 1, hideTiddlerPopup: 1, RGB: 1, drawGradient: 1,
		createTiddlyText: 1, createTiddlyElement: 1, addEvent: 1, removeEvent: 1, addClass: 1,
		removeClass: 1, hasClass: 1, resolveTarget: 1, getPlainText: 1, ensureVisible: 1, 
		findWindowWidth: 1, findWindowHeight: 1, findScrollX: 1, findScrollY: 1, findPosX: 1, findPosY: 1,
		insertSpacer: 1, removeChildren: 1, setStylesheet: 1,
		Packages: 1, sun: 1, java: 1, netscape: 1, XPCNativeWrapper: 1, GeckoActiveXObject: 1
	};
	while (f.sys_globals.options.length > 1) { f.sys_globals.options[1]=null; } // clear list
	if (config.browser.isIE) return; // BYPASS - 8/16/2006 // DON'T LIST GLOBALS IN IE... throws object error - WFFL
	try {
		var c=1;
		for (var v in window) if (!(DOM0_globals[v] || tw_globals[v])) {
			var t=window[v];
			if ((typeof window[v])=='object') {
				var t='';
				for (var p in window[v]) {
					t+=((typeof window[v][p])!='function')?('['+typeof window[v][p]+'] '+p):p;
					t+=((typeof window[v][p])!='function')?('='+window[v][p]):'';
					t+='\n';
				}
			}
			f.sys_globals.options[c++]=new Option(((typeof window[v])!='function')?('['+typeof window[v]+'] '+v):v,t,false,false);
		}	
	}
	catch(e) { ; }
}

config.macros.tidIDE.setsys=function(id) {
	var place=document.getElementById(id+"_systempanel"); if (!place) return;
	var f=document.getElementById(id+"_systemform");
	if (f.sys_opts.selectedIndex==0) return; // heading - do nothing
	var name=f.sys_opts.options[f.sys_opts.selectedIndex].text.replace(/\[[Xx_]\] /,'').replace(/ \(cookie\)/,'')
	var value=f.config_view.value;
	config.options[name]=value;
	saveOptionCookie(name);
	f.sys_opts.options[f.sys_opts.selectedIndex].value=value;
	return;
}
//}}}

// // HTML DEFINITIONS
//{{{
config.macros.tidIDE.html = { };
config.macros.tidIDE.html.framework = " \
	<html> %version% <form style='display:inline;margin:0;padding:0;'>%selector%</form> %panels% </html> \
";
//}}}
//{{{
config.macros.tidIDE.html.editorchk = " \
	<input type=checkbox name=editor \
		style='display:inline;width:auto;margin:1px;' \
		title='add/delete/modify tiddlers' %showpanel% \
		onclick='document.getElementById(\"%id%_editorpanel\").style.display=this.checked?\"block\":\"none\"; \
			if (this.checked) config.macros.tidIDE.render(\"%id%\");'>%toolname% \
";
config.macros.tidIDE.html.systemchk = " \
	<input type=checkbox name=system \
		style='display:inline;width:auto;margin:1px;' \
		title='view TiddlyWiki system internals and configurable options' %showpanel% \
		onclick='document.getElementById(\"%id%_systempanel\").style.display=this.checked?\"block\":\"none\"; \
			if (this.checked) config.macros.tidIDE.getsys(\"%id%\");'>%toolname% \
";
config.macros.tidIDE.html.toolschk = " \
	<input type=checkbox name=tools \
		style='display:inline;width:auto;margin:1px;' \
		title='' %showpanel% \
		onclick='document.getElementById(\"%id%_%toolid%_panel\").style.display=this.checked?\"block\":\"none\"; \
			if (this.checked) config.macros.tidIDE.loadPanel(\"%id%\",\"%toolid%\");'>%toolname% \
";
//}}}
//{{{
config.macros.tidIDE.html.toolspanel = " \
	<div id='%id%_%toolid%_panel' style='display:%showpanel%;margin:0;margin-top:0.5em'> \
	</div> \
";
//}}}
//{{{
config.macros.tidIDE.html.systempanel = " \
	<div id='%id%_systempanel' style='display:%showpanel%;margin:0;margin-top:0.5em;white-space:nowrap'> \
		<form id='%id%_systemform' style='display:inline;margin:0;padding:0;'> \
		<!-- configurable options --> \
		<table style='width:100%;border:0;padding:0;margin:0'><tr style='border:0;padding:0;margin:0'> \
		<td style='width:30%;border:0;padding:0;margin:0'> \
			<select size=1 name='sys_opts' style='width:100%;font-size:%fontsize%;' \
				onchange='this.form.config_view.value=this.value'> \
				<option value=\"\">config.options.*</option> \
			</select> \
		</td><td style='width:50%;border:0;padding:0;margin:0;'> \
			<input type=text name='config_view' size=60 style='width:99%;font-size:%fontsize%;' value=''> \
		</td><td style='width:20%;white-space:nowrap;border:0;padding:0;margin:0;'> \
			<input type=button style='width:50%;' value='set option' title='save this TiddlyWiki option value' \
				onclick='config.macros.tidIDE.setsys(\"%id%\");config.macros.tidIDE.getsys(\"%id%\");'><!-- \
			--><input type=button style='width:50%;' value='refresh' title='retrieve current options and system values' \
				onclick='this.form.sysview.style.display=\"none\"; config.macros.tidIDE.getsys(\"%id%\");'> \
		</td></tr><tr style='border:0;padding:0;margin:0'><td colspan=3 \
				style='white-space:nowrap;width:100%;border:0;padding:0;margin:0'> \
			<!-- system objects --> \
			<select size=1  name='sys_styles' style='width:25%;font-size:%fontsize%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.%id%_sysview.value=this.value'> \
				<option value=\"\">stylesheets...</option> \
			</select><select size=1  name='sys_shadows' style='width:25%;font-size:%fontsize%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.%id%_sysview.value=this.value'> \
				<option value=\"\">shadows...</option> \
			</select><select size=1  name='sys_notify' style='width:25%;font-size:%fontsize%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.%id%_sysview.value=this.value'> \
				<option value=\"\">notifications...</option> \
			</select><select size=1  name='sys_globals' style='width:25%;font-size:%fontsize%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.%id%_sysview.value=this.value'> \
				<option value=\"\">globals...</option> \
			</select><br><select size=1  name='sys_macros' style='width:25%;font-size:%fontsize%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.%id%_sysview.value=this.value'> \
				<option value=\"\">macros...</option> \
			</select><select size=1  name='sys_commands' style='width:25%;font-size:%fontsize%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.%id%_sysview.value=this.value'> \
				<option value=\"\">toolbars...</option> \
			</select><select size=1  name='sys_formatters' style='width:25%;font-size:%fontsize%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.%id%_sysview.value=this.value'> \
				<option value=\"\">wikifiers...</option> \
			</select><select size=1  name='sys_params' style='width:25%;font-size:%fontsize%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.%id%_sysview.value=this.value'> \
				<option value=\"\">paramifiers...</option> \
			</select> \
			<!-- system value display area --> \
			<span style='white-space:normal;'><textarea id='%id%_sysview' name=sysview cols=60 rows=12 \
				onfocus='this.select()' style='width:99.5%;height:16em;font-size:%fontsize%;font-family:%fontface%;display:none'></textarea></span> \
		</td></tr></table> \
		</form> \
	</div> \
";
//}}}
//{{{
config.macros.tidIDE.html.editorpanel = " \
	<div id='%id%_editorpanel' style='display:%showpanel%;margin:0;margin-top:0.5em'> \
	<form id='%id%_editorform' style='display:inline;margin:0;padding:0;'> \
	<!-- tiddler editor list and buttons --> \
	<select size=1 name=tiddlers style='display:inline;width:40%;font-size:%fontsize%;'  \
		onchange='config.macros.tidIDE.set(\"%id%\",this.value); this.value=this.form.current;'> \
	<option value=''>select a tiddler...</option> \
	%tiddlerlist% \
	</select><!-- \
	--><input name=add type=button style='display:inline;width:10%' \
		value='new' title='create a new tiddler' \
		onclick='config.macros.tidIDE.add(\"%id%\")' %disabled%><!-- \
	--><input name=remove type=button style='display:inline;width:10%' \
		value='remove' title='delete this tiddler' \
		onclick='config.macros.tidIDE.remove(\"%id%\")' %disabled%><!-- \
	--><input name=save type=button style='display:inline;width:10%' \
		value='save' title='save changes to this tiddler' \
		onclick='config.macros.tidIDE.save(\"%id%\")' %disabled%><!-- \
	--><input name=saveas type=button style='display:inline;width:10%' \
		value='save as' title='save changes to a new tiddler' \
		onclick='config.macros.tidIDE.save(\"%id%\",true)' %disabled%><!-- \
	--><input name=view type=button style='display:inline;width:10%' \
		value='open' title='open this tiddler for regular viewing' \
		onclick='if (!this.form.current.length) return;	story.displayTiddler(null,this.form.current)'><!-- \
	--><!-- COMMENTED OUT <input name=run type=button style='display:inline;width:9%' \
		value='run' title='evaluate this tiddler as a javascript \"systemConfig\" plugin' \
		onclick='if (!confirm(config.macros.tidIDE.evalMsg.format([this.form.current]))) return false; \
			var err=processConfig(this.form.content.value); \
			if(err)displayMessage(config.messages.customConfigError.format([err,this.form.current]));'> END COMMENT --><!-- \
	--><input name=previewbutton type=button style='display:inline;width:10%;' \
		value='preview' title='show \"live\" preview display' \
		onclick='document.getElementById(\"%id%_previewpanel\").style.display=\"block\"; \
			this.form.preview.checked=true; config.macros.tidIDE.render(\"%id%\")'><!-- \
	hidden field for preview show/hide state: \
	--><input name=preview type=checkbox style='display:none;'>\
	<!-- tiddler content edit --> \
	<div><textarea id='%id%_content' name='content' edit='text' cols=60 rows=%maxrows% \
		style='width:100%;font-size:%fontsize%;font-family:%fontface%;' \
		onkeyup='var f=this.form; f.dirty=true; f.size.value=this.value.length+\" bytes\";  \
			var p=document.getElementById(\"%id%_preview\"); \
			if (f.preview.checked && !f.freeze.checked) { config.macros.tidIDE.render(\"%id%\"); }'></textarea></div> \
	<!-- tag edit and droplist --> \
	<table width='100%' style='border:0;padding:0;margin:0'><tr style='border:0;padding:0;margin:0'> \
	<td style='border:0;padding:0;margin:0'> \
		<input type=text name=tags size=60 style='width:100%;font-size:%fontsize%;' value='' \
			onchange='this.form.dirty=true' %disabled%> \
	</td><td width='1' style='border:0;padding:0;margin:0;'> \
		<select size=1 name=taglist style='font-size:%fontsize%;' \
			onchange='this.form.dirty=true; this.form.tags.value+=\" \"+this.value' %disabled%> \
		<option value=''>select tags...</option> \
		%taglist% \
		</select> \
	</td></tr></table> \
	<!--  created/modified dates, author, current tiddler size --> \
	<div style='float:right;'> \
		created <input type=text name=created size=15 \
			style='display:inline;font-size:%fontsize%;text-align:center;padding:0;' value='' \
			onchange='this.form.dirty=true' %minoredits%> \
		modified <input type=text name=modified size=15 \
			style='display:inline;font-size:%fontsize%;text-align:center;padding:0;' value='' \
			onchange='this.form.dirty=true;' %minoredits%> \
		by <input type=text name=author size=15 \
			style='display:inline;font-size:%fontsize%;padding:0;' value='' \
			onfocus='this.select()' onchange='this.form.dirty=true' %minoredits%> \
		<input type=text name=size size=10 \
			style='display:inline;font-size:%fontsize%;text-align:center;padding:0;' value='' \
			onfocus='this.blur()' onkeydown='return false' DISABLED>  \
	</div> \
	<!-- toggles: read-only, minor edit --> \
	<span style='white-space:nowrap'> \
	<input type=checkbox name=readonly \
		style='display:inline;width:auto;margin:1px;' %readonlychk% \
		title='do not allow tiddler changes to be saved' \
		onclick='readOnly=config.options.chkHttpReadOnly=this.checked;saveOptionCookie(\"chkHttpReadOnly\"); \
			var f=this.form; f.minoredits.disabled=f.tags.disabled=f.taglist.disabled=this.checked; \
			f.add.disabled=f.remove.disabled=f.save.disabled=f.saveas.disabled=this.checked; \
			f.created.disabled=f.modified.disabled=f.author.disabled=this.checked||!f.minoredits.checked;'>readonly \
	<input type=checkbox name=minoredits \
		style='display:inline;width:auto;margin:1px;' %disabled% %minorchk% \
		title='check: save datestamps/author as entered, uncheck: auto-update modified/author' \
		onclick='this.form.created.disabled=this.form.modified.disabled=this.form.author.disabled=!this.checked; \
			config.options.chkForceMinorUpdate=this.checked;saveOptionCookie(\"chkForceMinorUpdate\");'>minor edits \
	</span> \
	<!-- tiddler preview display --> \
	<div id='%id%_previewpanel' style='display:none;white-space:nowrap'> \
	<div id='%id%_preview' class='viewer' style='margin:0;margin-top:.5em;height:25em;overflow:auto;white-space:normal'> \
		&nbsp; \
	</div> \
	<!-- DOM and HTML viewers --> \
	<textarea id='%id%_domview' name=domview cols=60 rows=12 wrap=off \
		onfocus='this.select()' style='display:none;width:100%;height:16em;font-size:%fontsize%;'></textarea><!-- \
	--><textarea id='%id%_htmlview' name=htmlview cols=60 rows=12 wrap=off \
		onfocus='this.select()' style='display:none;width:100%;height:16em;font-size:%fontsize%;'></textarea> \
	<!-- status line, preview option checkboxes, run/refresh buttons --> \
	<table width='100%' style='border:0;padding:0;margin:0'><tr style='border:0;padding:0;margin:0'> \
	<td style='border:0;padding:0;margin:0'> \
		<input type=text '%id%_status' name=status style='padding:0;width:100%;font-size:%fontsize%;'> \
	</td><td style='width:1%;border:0;padding:0;margin:0;text-align:right;white-space:nowrap'> \
		<input type=checkbox name=dom style='display:inline;width:auto;margin:1px;' \
			title='show Document Object Model (DOM) information' \
			onclick='config.macros.tidIDE.renderDOM(\"%id%\");'>DOM \
		<input type=checkbox name=html style='display:inline;width:auto;margin:1px;' \
			title='show rendered HTML' \
			onclick='config.macros.tidIDE.renderHTML(\"%id%\");'>HTML \
		<input type=checkbox name=freeze style='display:inline;width:auto;margin:1px;' \
			title='do not update preview display as changes are made' \
			onclick='var p=document.getElementById(\"%id%_preview\");  \
				if (this.checked) this.form.status.value+=config.macros.tidIDE.freezeMsg; \
				else config.macros.tidIDE.render(\"%id%\");'>freeze \
		<!-- COMMENTED OUT <input type=button style='display:inline;width:auto;' value='run' \
			title='evaluate this tiddler as a javascript \"systemConfig\" plugin' \
			onclick='if (!confirm(config.macros.tidIDE.evalMsg.format([this.form.current]))) return false; \
				var err=processConfig(this.form.content.value); \
				if(err)displayMessage(config.messages.customConfigError.format([err,this.form.current]));'> END COMMENT --><!-- \
		--><input type=button style='display:inline;width:auto;' value='refresh' \
			title='update preview display' \
			onclick='config.macros.tidIDE.render(\"%id%\")'><!-- \
		--><input type=button style='display:inline;width:auto;' value='hide' \
			title='hide preview display' \
			onclick='document.getElementById(\"%id%_previewpanel\").style.display=\"none\"; \
				this.form.preview.checked=false; config.macros.tidIDE.render(\"%id%\")'> \
	</td></tr></table> \
	</div> \
	</form> \
	</div> \
";
//}}}