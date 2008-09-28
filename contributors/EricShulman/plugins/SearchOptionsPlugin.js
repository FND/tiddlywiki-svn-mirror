/***
|Name|SearchOptionsPlugin|
|Source|http://www.TiddlyTools.com/#SearchOptionsPlugin|
|Documentation|http://www.TiddlyTools.com/#SearchOptionsPluginInfo|
|Version|2.9.9|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides|Story.prototype.search, TiddlyWiki.prototype.search, config.macros.search.onKeyPress|
|Options|##Configuration|
|Description|extend core search function with additional user-configurable options|
Adds extra options to core search function including selecting which data items to search, enabling/disabling incremental key-by-key searches, and generating a ''list of matching tiddlers'' instead of immediately displaying all matches.  This plugin also adds syntax for rendering 'search links' within tiddler content to embed one-click searches using pre-defined 'hard-coded' search terms.
!!!!!Documentation
>see [[SearchOptionsPluginInfo]]
!!!!!Configuration
<<<
Search in:
<<option chkSearchTitles>> titles <<option chkSearchText>> text <<option chkSearchTags>> tags <<option chkSearchFields>> fields <<option chkSearchShadows>> shadows
<<option chkSearchList>> Show list of matches
<<option chkSearchListTiddler>> Write list to [[SearchResults]] tiddler
<<option chkSearchTitlesFirst>> Show title matches first
<<option chkSearchByDate>> Sort matching tiddlers by modification date (most recent first)
<<option chkIncrementalSearch>> Incremental key-by-key search: {{twochar{<<option txtIncrementalSearchMin>>}}} or more characters,  {{threechar{<<option txtIncrementalSearchDelay>>}}} msec delay
<<<
!!!!!Revisions
<<<
2008.09.24 [2.9.9] performance improvment to reportSearchResults(): when rendering a real SearchResults tiddler, store.notify() isn't needed since the results tiddler is always explicitly closed and redrawn each time.
2008.09.20 [2.9.8] corrected createPanel() and renderPanel() so toolbar will be correctly shown/hidden on mouseover/mouseout.
|please see [[SearchOptionsPluginInfo]] for additional revision details|
2005.10.18 [1.0.0] Initial Release
<<<
!!!!!Code
***/
//{{{
version.extensions.SearchOptionsPlugin= {major: 2, minor: 9, revision: 9, date: new Date(2008,9,24)};

var co=config.options; // abbrev
if (co.chkSearchTitles===undefined) co.chkSearchTitles=true;
if (co.chkSearchText===undefined) co.chkSearchText=true;
if (co.chkSearchTags===undefined) co.chkSearchTags=true;
if (co.chkSearchFields===undefined) co.chkSearchFields=true;
if (co.chkSearchTitlesFirst===undefined) co.chkSearchTitlesFirst=true;
if (co.chkSearchList===undefined) co.chkSearchList=true;
if (co.chkSearchListTiddler===undefined) co.chkSearchListTiddler=false;
if (co.chkSearchByDate===undefined) co.chkSearchByDate=false;
if (co.chkIncrementalSearch===undefined) co.chkIncrementalSearch=true;
if (co.chkSearchShadows===undefined) co.chkSearchShadows=true;
if (co.txtIncrementalSearchDelay===undefined) co.txtIncrementalSearchDelay=500;
if (co.txtIncrementalSearchMin===undefined) co.txtIncrementalSearchMin=3;
if (config.macros.search.reportTitle==undefined)
	config.macros.search.reportTitle="SearchResults"; // note: not a cookie!
//}}}
// // searchLink: {{{[search[text to find]] OR [search[text to display|text to find]]}}}
//{{{
config.formatters.push( {
	name: "searchLink",
	match: "\\[search\\[",
	lookaheadRegExp: /\[search\[(.*?)(?:\|(.*?))?\]\]/mg,
	prompt: "search for: '%0'",
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var label=lookaheadMatch[1];
			var text=lookaheadMatch[2]||label;
			var prompt=this.prompt.format([text]);
			var btn=createTiddlyButton(w.output,label,prompt,
				function(){story.search(this.getAttribute("searchText"))},"searchLink");
			btn.setAttribute("searchText",text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
});
//}}}
// // incremental search uses option settings instead of hard-coded delay and minimum input values
//{{{
var fn=config.macros.search.onKeyPress;
fn=fn.toString().replace(/500/g, "config.options.txtIncrementalSearchDelay||500");
fn=fn.toString().replace(/> 2/g, ">=(config.options.txtIncrementalSearchMin||3)");
eval("config.macros.search.onKeyPress="+fn);
//}}}
// // REPLACE story.search() for option to "show search results in a list"
//{{{
Story.prototype.search = function(text,useCaseSensitive,useRegExp)
{
	var co=config.options; // abbrev
	highlightHack = new RegExp(useRegExp ? text : text.escapeRegExp(),useCaseSensitive ? "mg" : "img");
	var matches = store.search(highlightHack,co.chkSearchByDate?"modified":"title","excludeSearch");
	if (co.chkSearchByDate) matches=matches.reverse(); // most recent first
	var q = useRegExp ? "/" : "'";
	clearMessage();
	if (!matches.length) {
		if (co.chkSearchListTiddler) discardSearchResults();
		displayMessage(config.macros.search.failureMsg.format([q+text+q]));
	} else {
		if (co.chkSearchList||co.chkSearchListTiddler) 
			reportSearchResults(text,matches);
		else {
			var titles = []; for(var t=0; t<matches.length; t++) titles.push(matches[t].title);
			this.closeAllTiddlers(); story.displayTiddlers(null,titles);
			displayMessage(config.macros.search.successMsg.format([matches.length, q+text+q]));
		}
	}
	highlightHack = null;
}
//}}}
// // REPLACE store.search() for enhanced searching/sorting options
//{{{
TiddlyWiki.prototype.search = function(searchRegExp,sortField,excludeTag)
{
	var co=config.options; // abbrev
	var tids = this.reverseLookup("tags",excludeTag,false,sortField);

	// scan for matching titles first...
	var results = [];
	if (co.chkSearchTitles) {
		for(var t=0; t<tids.length; t++)
			if(tids[t].title.search(searchRegExp)!=-1)
				results.push(tids[t]);
		if (co.chkSearchShadows)
			for (var t in config.shadowTiddlers)
				if ((t.search(searchRegExp)!=-1) && !store.tiddlerExists(t))
					results.push((new Tiddler()).assign(t,config.shadowTiddlers[t]));
	}
	// then scan for matching text, tags, or field data
	for(var t=0; t<tids.length; t++) {
		if (co.chkSearchText && tids[t].text.search(searchRegExp)!=-1)
			results.pushUnique(tids[t]);
		if (co.chkSearchTags && tids[t].tags.join(" ").search(searchRegExp)!=-1)
			results.pushUnique(tids[t]);
		if (co.chkSearchFields && store.forEachField!=undefined)
			store.forEachField(tids[t],
				function(tid,field,val) {
					if (val.search(searchRegExp)!=-1) results.pushUnique(tids[t]);
				},
				true); // extended fields only
	}
	// then check for matching text in shadows
	if (co.chkSearchShadows)
		for (var t in config.shadowTiddlers)
			if ((config.shadowTiddlers[t].search(searchRegExp)!=-1) && !store.tiddlerExists(t))
				results.pushUnique((new Tiddler()).assign(t,config.shadowTiddlers[t]));

	// if not 'titles first', or sorting by modification date,
	// re-sort results to so titles, text, tag and field matches are mixed together
	if(!sortField) sortField = "title";
	var bySortField=function (a,b) {if(a[sortField] == b[sortField]) return(0); else return (a[sortField] < b[sortField]) ? -1 : +1; }
	if (!co.chkSearchTitlesFirst || co.chkSearchByDate) results.sort(bySortField);

	return results;
}
//}}}
// // HIJACK core {{{<<search>>}}} macro to add "report" and "simple inline" output
//{{{
config.macros.search.SOP_handler=config.macros.search.handler;
config.macros.search.handler = function(place,macroName,params)
{
	// if "report", use SearchOptionsPlugin report generator for inline output
	if (params[1]&&params[1].substr(0,6)=="report") {
		var keyword=params[0];
		var options=params[1].split("=")[1]; // split "report=option+option+..."
		var heading=params[2]?params[2].unescapeLineBreaks():"";
		var matches=store.search(new RegExp(keyword.escapeRegExp(),"img"),"title","excludeSearch");
		if (matches.length) wikify(heading+window.formatSearchResults(keyword,matches,options),place);
	} else if (params[1]) {
		var keyword=params[0];
		var heading=params[1]?params[1].unescapeLineBreaks():"";
		var seperator=params[2]?params[2].unescapeLineBreaks():", ";
		var matches=store.search(new RegExp(keyword.escapeRegExp(),"img"),"title","excludeSearch");
		if (matches.length) {
			var out=[];
			for (var m=0; m<matches.length; m++) out.push("[["+matches[m].title+"]]");
			wikify(heading+out.join(seperator),place);
		}
	} else
		config.macros.search.SOP_handler.apply(this,arguments);
};
//}}}
// // SearchResults panel handling
//{{{
config.macros.search.createPanel=function(text,matches,body) {

	function getByClass(e,c) { var d=e.getElementsByTagName("div");
		for (var i=0;i<d.length;i++) if (hasClass(d[i],c)) return d[i]; }
	var panel=createTiddlyElement(null,"div","searchPanel","tiddler");
	this.renderPanel(panel,text,matches,body);
	var oldpanel=document.getElementById("searchPanel");
	if (!oldpanel) { // insert new panel just above tiddlers
		var da=document.getElementById("displayArea");
		da.insertBefore(panel,da.firstChild);
	} else { // if panel exists
		var oldwrap=getByClass(oldpanel,"searchResults");
		var newwrap=getByClass(panel,"searchResults");
		// if no prior content, just insert new content
		if (!oldwrap) oldpanel.insertBefore(newwrap,null);
		else {	// swap search results content but leave containing panel intact
			oldwrap.style.display='block'; // unfold wrapper if needed
			var i=oldwrap.getElementsByTagName("input")[0]; // get input field
			if (i) { var pos=this.getCursorPos(i); i.onblur=null; } // get cursor pos, ignore blur
			oldpanel.replaceChild(newwrap,oldwrap);
			panel=oldpanel; // use existing panel
		} 
	}
	this.showPanel(true,pos);
	return panel;
}

config.macros.search.renderPanel=function(panel,text,matches,body) {

	var wrap=createTiddlyElement(panel,"div",null,"searchResults");
	wrap.onmouseover = function(e){ addClass(this,"selected"); }
	wrap.onmouseout = function(e){ removeClass(this,"selected"); }
	// create toolbar: "open all", "fold/unfold", "close"
	var tb=createTiddlyElement(wrap,"div",null,"toolbar");
	var b=createTiddlyButton(tb, "open all", "open all matching tiddlers", function() {
		story.displayTiddlers(null,this.getAttribute("list").readBracketedList()); return false; },"button");
	var list=""; for(var t=0;t<matches.length;t++) list+='[['+matches[t].title+']] ';
	b.setAttribute("list",list);
	var b=createTiddlyButton(tb, "fold", "toggle display of search results", function() {
		config.macros.search.foldPanel(this); return false; },"button");
	var b=createTiddlyButton(tb, "close", "dismiss search results",	function() {
		config.macros.search.showPanel(false); return false; },"button");
	createTiddlyText(createTiddlyElement(wrap,"div",null,"title"),"Search for: "+text); // title
	wikify(body,createTiddlyElement(wrap,"div",null,"viewer")); // report
	return panel;
}

config.macros.search.showPanel=function(show,pos) {
	var panel=document.getElementById("searchPanel");
	var i=panel.getElementsByTagName("input")[0];
	i.onfocus=show?function(){config.macros.search.stayFocused(true);}:null;
	i.onblur=show?function(){config.macros.search.stayFocused(false);}:null;
	if (show && panel.style.display=="block") { // if shown, grab focus, restore cursor
		if (i&&this.stayFocused()) { i.focus(); this.setCursorPos(i,pos); }
		return;
	}
	if(!config.options.chkAnimate) {
		panel.style.display=show?"block":"none";
		if (!show) { removeChildren(panel); config.macros.search.stayFocused(false); }
	} else {
		var s=new Slider(panel,show,false,show?"none":"children");
		s.callback=function(e,p){e.style.overflow="visible";}
		anim.startAnimating(s);
	}
	return panel;
}

config.macros.search.foldPanel=function(button) {
	var d=document.getElementById("searchPanel").getElementsByTagName("div");
	for (var i=0;i<d.length;i++) if (hasClass(d[i],"viewer")) var v=d[i]; if (!v) return;
	var show=v.style.display=="none";
	if(!config.options.chkAnimate)
		v.style.display=show?"block":"none";
	else {
		var s=new Slider(v,show,false,"none");
		s.callback=function(e,p){e.style.overflow="visible";}
		anim.startAnimating(s);
	}
	button.innerHTML=show?"fold":"unfold";
	return false;
}

config.macros.search.stayFocused=function(keep) { // TRUE/FALSE=set value, no args=get value
	if (keep===undefined) return this.keepReportInFocus;
	this.keepReportInFocus=keep;
	return keep
}	

config.macros.search.getCursorPos=function(i) {
	var s=0; var e=0; if (!i) return { start:s, end:e };
	try {
		if (i.setSelectionRange) // FF
			{ s=i.selectionStart; e=i.selectionEnd; }
		if (document.selection && document.selection.createRange) { // IE
			var r=document.selection.createRange().duplicate();
			var len=r.text.length; s=0-r.moveStart('character',-100000); e=s+len;
		}
	}catch(e){};
	return { start:s, end:e };
}
config.macros.search.setCursorPos=function(i,pos) {
	if (!i||!pos) return; var s=pos.start; var e=pos.end;
	if (i.setSelectionRange) //FF
		i.setSelectionRange(s,e);
	if (i.createTextRange) // IE
		{ var r=i.createTextRange(); r.collapse(true); r.moveStart("character",s); r.select(); }
}
//}}}
// // SearchResults report generation
// note: these functions are defined globally, so they can be more easily redefined to customize report formats//
//{{{
if (!window.reportSearchResults) window.reportSearchResults=function(text,matches)
{
	var cms=config.macros.search; // abbrev
	var body=window.formatSearchResults(text,matches);
	if (!config.options.chkSearchListTiddler) // show #searchResults panel
		window.scrollTo(0,ensureVisible(cms.createPanel(text,matches,body)));
	else { // write [[SearchResults]] tiddler
		var title=cms.reportTitle;
		var who=config.options.txtUserName;
		var when=new Date();
		var tags="excludeLists excludeSearch temporary";
		var tid=store.getTiddler(title); if (!tid) tid=new Tiddler();
		tid.set(title,body,who,when,tags);
		store.addTiddler(tid);
		story.closeTiddler(title);
		story.displayTiddler(null,title);
	}
}

if (!window.formatSearchResults) window.formatSearchResults=function(text,matches,opt)
{
	var body='';
	var title=config.macros.search.reportTitle
	var q = config.options.chkRegExpSearch ? "/" : "'";
	if (!opt) var opt="all";
	var parts=opt.split("+");
	for (var i=0; i<parts.length; i++) { var p=parts[i].toLowerCase();
		if (p=="again"||p=="all")   body+=window.formatSearchResults_again(text,matches);
		if (p=="summary"||p=="all") body+=window.formatSearchResults_summary(text,matches);
		if (p=="list"||p=="all")    body+=window.formatSearchResults_list(text,matches);
		if (p=="buttons"||p=="all") body+=window.formatSearchResults_buttons(text,matches);
	}
	return body;
}

if (!window.formatSearchResults_again) window.formatSearchResults_again=function(text,matches)
{
	var title=config.macros.search.reportTitle
	var body='';
	// search again
	body+='{{span{<<search "'+text.replace(/"/g,'&#x22;')+'">> /%\n';
	body+='%/<html><input type="button" value="search again"';
	body+=' onclick="var t=this.parentNode.parentNode.getElementsByTagName(\'input\')[0];';
	body+=' config.macros.search.doSearch(t); return false;">';
	body+=' <a href="javascript:;" onclick="';
	body+=' var e=this.parentNode.nextSibling;';
	body+=' var show=e.style.display!=\'block\';';
	body+=' if(!config.options.chkAnimate) e.style.display=show?\'block\':\'none\';';
	body+=' else anim.startAnimating(new Slider(e,show,false,\'none\'));';
	body+=' return false;">options...</a>';
	body+='</html>@@display:none;border-left:1px dotted;margin-left:1em;padding:0;padding-left:.5em;font-size:90%;/%\n';
	body+='	%/<<option chkSearchTitles>>titles /%\n';
	body+='	%/<<option chkSearchText>>text /%\n';
	body+='	%/<<option chkSearchTags>>tags /%\n';
	body+='	%/<<option chkSearchFields>>fields /%\n';
	body+='	%/<<option chkSearchShadows>>shadows\n';
	body+='	<<option chkCaseSensitiveSearch>>case-sensitive /%\n';
	body+='	%/<<option chkRegExpSearch>>text patterns /%\n';
	body+='	%/<<option chkSearchByDate>>sorted by date\n';
	body+='	<<option chkIncrementalSearch>> Incremental key-by-key search: /%\n';
	body+='	%/{{twochar{<<option txtIncrementalSearchMin>>}}} or more characters, /%\n';
	body+='	%/{{threechar{<<option txtIncrementalSearchDelay>>}}} msec delay/%\n';
	body+='%/@@}}}\n\n';
	return body;
}

if (!window.formatSearchResults_summary) window.formatSearchResults_summary=function(text,matches)
{
	// summary: nn tiddlers found matching '...', options used
	var body='';
	var co=config.options; // abbrev
	var title=config.macros.search.reportTitle
	var q = co.chkRegExpSearch ? "/" : "'";
	body+="''"+config.macros.search.successMsg.format([matches.length,q+"{{{"+text+"}}}"+q])+"''\n";
	body+="~~&nbsp; searched in "
		+(co.chkSearchTitles?"titles ":"")
		+(co.chkSearchText?"text ":"")
		+(co.chkSearchTags?"tags ":"")
		+(co.chkSearchFields?"fields ":"")
		+(co.chkSearchShadows?"shadows ":"")
		+"~~\n"
		+(co.chkCaseSensitiveSearch||co.chkRegExpSearch?"^^&nbsp; using ":"")
		+(co.chkCaseSensitiveSearch?"case-sensitive ":"")
		+(co.chkRegExpSearch?"pattern ":"")
		+(co.chkCaseSensitiveSearch||co.chkRegExpSearch?"matching^^\n":"");
	return body;
}

if (!window.formatSearchResults_list) window.formatSearchResults_list=function(text,matches)
{
	// bullet list of links to matching tiddlers
	var body='';
	for(var t=0;t<matches.length;t++) {
		var date=config.options.chkSearchByDate?(matches[t].modified.formatString('YYYY.0MM.0DD 0hh:0mm')+" "):"";
		body+="* "+date+"[["+matches[t].title+"]]\n";
	}
	return body;
}

if (!window.formatSearchResults_buttons) window.formatSearchResults_buttons=function(text,matches)
{
	// embed buttons only if writing SearchResults to tiddler
	if (!config.options.chkSearchListTiddler) return "";
	// "open all" button
	var title=config.macros.search.reportTitle;
	var body="";
	body+="@@diplay:block;<html><input type=\"button\" href=\"javascript:;\" "
		+"onclick=\"story.displayTiddlers(null,[";
	for(var t=0;t<matches.length;t++)
		body+="'"+matches[t].title.replace(/\'/mg,"\\'")+"'"+((t<matches.length-1)?", ":"");
	body+="],1);\" accesskey=\"O\" value=\"open all matching tiddlers\"></html> ";
	// "discard SearchResults" button
	body+="<html><input type=\"button\" href=\"javascript:;\" "
		+"onclick=\"discardSearchResults()\" value=\"discard "+title+"\"></html>";
	body+="@@\n";
	return body;
}

if (!window.discardSearchResults) window.discardSearchResults=function()
{
	// remove the tiddler
	story.closeTiddler(config.macros.search.reportTitle);
	store.deleteTiddler(config.macros.search.reportTitle);
	store.notify(config.macros.search.reportTitle,true);
}
//}}}