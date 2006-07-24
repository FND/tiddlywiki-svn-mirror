/***
''SearchOptionsPlugin for TiddlyWiki version 2.0''
^^author: Eric Shulman - ELS Design Studios
source: http://www.TiddlyTools.com/#SearchOptionsPlugin
license: [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]^^

The TiddlyWiki search function normally looks in both tiddler titles and tiddler body content ('text').  However, narrowing the search so that it examines only titles or only text, or expanding the search to include text contained in tiddler tags can be very helpful, especially when searching on common words or phrases.  In addition, it is often useful for the search results to show tiddlers with matching titles before tiddlers that contain matching text or tags.

!!!!!Usage
<<<
This plugin adds checkboxes (see below and in AdvancedOptions) to let you selectively configure the TiddlyWiki search function to just examine any combination of tiddler titles, text, or tags.  It also provides an option to switch the search results order between 'titles mixed in' (default) and 'titles shown first', as well as an option display the search results as a list of links (in an auto-generated "SearchResults" tiddler), rather than actually displaying all matching tiddlers.  You can also enable/disable the "incremental search" (key-by-key searching), so that a search is only initiated when you press the ENTER key or click on the "search:" prompt text.
<<<
!!!!!Configuration
<<<
In additional to the checkboxes in AdvancedOptions, a self-contained control panel is included here for your convenience:
<<option chkSearchTitles>> Search tiddler titles
<<option chkSearchText>> Search tiddler text
<<option chkSearchTags>> Search in tiddler tags
<<option chkSearchShadows>> Search shadow tiddlers
<<option chkSearchTitlesFirst>> Show title matches first
<<option chkSearchList>> Show list of matching tiddlers
<<option chkSearchIncremental>> Incremental searching
<<<
!!!!!Installation
<<<
import (or copy/paste) the following tiddlers into your document:
''SearchOptionsPlugin'' (tagged with <<tag systemConfig>>)
^^documentation and javascript for SearchOptionsPlugin handling^^

When installed, this plugin automatically adds checkboxes in the AdvancedOptions shadow tiddler so you can enable/disable the extended search behavior.  However, if you have customized your AdvancedOptions, you will need to manually add {{{<<option chkSearchTitles>>}}},  {{{<<option chkSearchText>>}}} and {{{<<option chkSearchTitlesFirst>>}}}  (with suitable prompt text) to your customized tiddler.
<<<
!!!!!Revision History
<<<
''2006.04.06 [2.3.0]'' added support for "search in shadow tiddlers".  Default is *not* to search in the shadows (i.e.standard TW behavior).  Note: if a shadow tiddler has a 'real' counterpart, only the real tiddler is searched, since the shadow is inaccessible for viewing/editing.
''2006.02.03 [2.2.1]'' rewrite timeout clearing code and blank search text handling to match 2.0.4 core release changes.  note that core no longer permits "blank=all" searches, so neither does this plugin.  To search for all, use "." with text patterns enabled.
''2006.02.02 [2.2.0]'' in search.handler(), KeyHandler() function clears 'left over' timeout when search input is < 3 chars.  Prevents searching on shorter text when shortened by rapid backspaces (<500msec)
''2006.02.01 [2.1.9]'' in Story.prototype.search(), correct inverted logic for using/not using regular expressions when searching
also, blank search text now presents "No search text.  Continue anyway?" confirm() message box, so search on blank can still be processed if desired by user.
''2006.02.01 [2.1.8]'' in doSearch(), added alert/return if search text is blank
''2006.01.20 [2.1.7]'' fixed setting of config.macros.search.reportTitle so that Tweaks can override it.
''2006.01.19 [2.1.6]'' improved SearchResults formatting, added a "search again" form to the report (based on a suggestion from MorrisGray)
define results report title using config.macros.search.reportTitle instead of hard-coding the tiddler title
''2006.01.18 [2.1.5]'' Created separate functions for reportSearchResults(text,matches) and discardSearchResults(), so that other developers can create alternative report generators.
''2006.01.17 [2.1.4]'' Use regExp.search() instead of regExp.test() to scan for matches.  Correctd the problem where only half the matching tiddlers (the odd-numbered ones) were being reported.
''2006.01.15 [2.1.3]'' Added information (date/time, username, search options used) to SearchResults output
''2006.01.10 [2.1.2]'' use displayTiddlers() to render matched tiddlers.  This lets you display multiple matching tiddlers, even if SinglePageModePlugin is enabled.
''2006.01.08 [2.1.1]'' corrected invalid variable reference, "txt.value" to "text" in story.search()
''2006.01.08 [2.1.0]'' re-write to match new store.search(), store.search.handler() and story.search() functions.
''2005.12.30 [2.0.0]'' Upgraded to TW2.0
when rendering SearchResults tiddler, closeTiddler() first to ensure display is refreshed.
''2005.12.26 [1.4.0]'' added option to search for matching text in tiddler tags
''2005.12.21 [1.3.7]'' use \s\s to 'escape' single quotes in tiddler titles when generating "Open all matching tiddlers" link.  Also, added access key: "O", to trigger "open all" link.
Based on a suggestion by UdoBorkowski.
''2005.12.18 [1.3.6]'' call displayMessage() AFTER showing matching tiddlers so message is not cleared too soon
''2005.12.17 [1.3.5]'' if no matches found, just display message and delete any existing SearchResults tiddler.
''2005.12.17 [1.3.4]'' use """{{{"""  and """}}}""" to 'escape' display text in SearchResults tiddler to ensure that formatting contained in search string is not rendered 
Based on a suggestion by UdoBorkowski.
''2005.12.14 [1.3.3]'' tag SearchResults tiddler with 'excludeSearch' so it won't list itself in subsequent searches
Based on a suggestion by UdoBorkowski.
''2005.12.14 [1.3.2]'' added "open all matching tiddlers..." link to search results output.
Based on a suggestion by UdoBorkowski.
''2005.12.10 [1.3.1]'' added "discard search results" link to end of search list tiddler output for quick self-removal of 'SearchResults' tiddler.
''2005.12.01 [1.3.0]'' added chkSearchIncremental to enable/disable 'incremental' searching (i.e., search after each keystroke) (default is ENABLED).
added handling for Enter key so it can be used to start a search.
Based on a suggestion by LyallPearce
''2005.11.25 [1.2.1]'' renamed from SearchTitleOrTextPlugin to SearchOptionsPlugin
''2005.11.25 [1.2.0]'' added chkSearchList option
Based on a suggestion by RodneyGomes
''2005.10.19 [1.1.0]'' added chkSearchTitlesFirst option.
Based on a suggestion by ChristianHauck
''2005.10.18 [1.0.0]'' Initial Release
<<<
!!!!!Credits
<<<
This feature was developed by EricShulman from [[ELS Design Studios|http:/www.elsdesign.com]].
Based on a suggestion by LyallPearce.
<<<
!!!!!Code
***/
//{{{
version.extensions.SearchTitleOrText = {major: 2, minor: 3, revision: 0, date: new Date(2006,4,6)};
//}}}

//{{{
if (config.options.chkSearchTitles==undefined) config.options.chkSearchTitles=true;
if (config.options.chkSearchText==undefined) config.options.chkSearchText=true;
if (config.options.chkSearchTags==undefined) config.options.chkSearchTags=true;
if (config.options.chkSearchTitlesFirst==undefined) config.options.chkSearchTitlesFirst=false;
if (config.options.chkSearchList==undefined) config.options.chkSearchList=false;
if (config.options.chkSearchIncremental==undefined) config.options.chkSearchIncremental=true;
if (config.options.chkSearchShadows==undefined) config.options.chkSearchShadows=false;

config.shadowTiddlers.AdvancedOptions += "\sn<<option chkSearchTitles>> Search in tiddler titles";
config.shadowTiddlers.AdvancedOptions += "\sn<<option chkSearchText>> Search in tiddler text";
config.shadowTiddlers.AdvancedOptions += "\sn<<option chkSearchTags>> Search in tiddler tags";
config.shadowTiddlers.AdvancedOptions += "\sn<<option chkSearchShadows>> Search in shadow tiddlers";
config.shadowTiddlers.AdvancedOptions += "\sn<<option chkSearchTitlesFirst>> Search results show title matches first";
config.shadowTiddlers.AdvancedOptions += "\sn<<option chkSearchList>> Search results show list of matching tiddlers";
config.shadowTiddlers.AdvancedOptions += "\sn<<option chkSearchIncremental>> Incremental searching";
//}}}

//{{{
if (config.macros.search.reportTitle==undefined)
	config.macros.search.reportTitle="SearchResults";
//}}}

//{{{
config.macros.search.handler = function(place,macroName,params)
{
	var lastSearchText = "";
	var searchTimeout = null;
	var doSearch = function(txt)
		{
		if (txt.value.length>0)
			{
			story.search(txt.value,config.options.chkCaseSensitiveSearch,config.options.chkRegExpSearch);
			lastSearchText = txt.value;
			}
		};
	var clickHandler = function(e)
		{
		doSearch(this.nextSibling);
		return false;
		};
	var keyHandler = function(e)
		{
		if (!e) var e = window.event;
		switch(e.keyCode)
			{
			case 13: // ELS: handle enter key
				doSearch(this);
				break;
			case 27:
				this.value = "";
				clearMessage();
				break;
			}
		if (config.options.chkSearchIncremental)
			{
			if(this.value.length > 2)
				{
				if(this.value != lastSearchText)
					{
					if(searchTimeout) clearTimeout(searchTimeout);
					var txt = this;
					searchTimeout = setTimeout(function() {doSearch(txt);},500);
					}
				}
			else
				if(searchTimeout) clearTimeout(searchTimeout);
			}
		};
	var focusHandler = function(e)
		{
		this.select();
		};
	var btn = createTiddlyButton(place,this.label,this.prompt,clickHandler);
	var txt = createTiddlyElement(place,"input",null,null,null);
	if(params[0])
		txt.value = params[0];
	txt.onkeyup = keyHandler;
	txt.onfocus = focusHandler;
	txt.setAttribute("size",this.sizeTextbox);
	txt.setAttribute("accessKey",this.accessKey);
	txt.setAttribute("autocomplete","off");
	if(config.browser.isSafari)
		{
		txt.setAttribute("type","search");
		txt.setAttribute("results","5");
		}
	else
		txt.setAttribute("type","text");
}
//}}}

//{{{
Story.prototype.search = function(text,useCaseSensitive,useRegExp)
{
	highlightHack = new RegExp(useRegExp ? text : text.escapeRegExp(),useCaseSensitive ? "mg" : "img");
	var matches = store.search(highlightHack,"title","excludeSearch");
	var q = useRegExp ? "/" : "'";
	clearMessage();
	if (!matches.length) {
		if (config.options.chkSearchList) discardSearchResults();
		displayMessage(config.macros.search.failureMsg.format([q+text+q]));
	} else {
		if (config.options.chkSearchList) 
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

//{{{
TiddlyWiki.prototype.search = function(searchRegExp,sortField,excludeTag)
{
	var candidates = this.reverseLookup("tags",excludeTag,false,sortField);

	// scan for matching titles
	var title_results = [];
	if (config.options.chkSearchTitles) {
		for(var t=0; t<candidates.length; t++)
			if(candidates[t].title.search(searchRegExp)!=-1)
				title_results.push(candidates[t]);
		if (config.options.chkSearchShadows)
			for (var t in config.shadowTiddlers)
				if ((t.search(searchRegExp)!=-1) && !store.tiddlerExists(t))
					title_results.push((new Tiddler()).assign(t,config.shadowTiddlers[t]));
	}

	// scan for matching text
	var text_results = [];
	if (config.options.chkSearchText) {
		for(var t=0; t<candidates.length; t++)
			if(candidates[t].text.search(searchRegExp)!=-1)
				text_results.push(candidates[t]);
		if (config.options.chkSearchShadows)
			for (var t in config.shadowTiddlers)
				if ((config.shadowTiddlers[t].search(searchRegExp)!=-1) && !store.tiddlerExists(t))
					text_results.push((new Tiddler()).assign(t,config.shadowTiddlers[t]));
	}

	// scan for matching tags
	var tag_results = [];
	if (config.options.chkSearchTags)
		for(var t=0; t<candidates.length; t++)
			if(candidates[t].tags.join(" ").search(searchRegExp)!=-1)
				tag_results.push(candidates[t]);

	// merge the results, eliminating redundant matches
	var results = [];
	for(var t=0; t<title_results.length; t++) results.pushUnique(title_results[t]);
	for(var t=0; t<text_results.length; t++) results.pushUnique(text_results[t]);
	for(var t=0; t<tag_results.length; t++) results.pushUnique(tag_results[t]);

	// if not 'titles first',  re-sort results to so titles, text and tag matches are mixed together
	if(!sortField) sortField = "title";
	var bySortField=function (a,b) {if(a[sortField] == b[sortField]) return(0); else return (a[sortField] < b[sortField]) ? -1 : +1; }
	if (!config.options.chkSearchTitlesFirst) results.sort(bySortField);
	return results;
}
//}}}

// // ''REPORT GENERATOR''
//{{{
if (!window.reportSearchResults) window.reportSearchResults=function(text,matches)
{
	var title=config.macros.search.reportTitle
	var q = config.options.chkRegExpSearch ? "/" : "'";
	var body="\sn";

	// summary: nn tiddlers found matching '...', options used
	body+="''"+config.macros.search.successMsg.format([matches.length,q+"{{{"+text+"}}}"+q])+"''\sn";
	body+="^^//searched in:// ";
	body+=(config.options.chkSearchTitles?"''titles'' ":"");
	body+=(config.options.chkSearchText?"''text'' ":"");
	body+=(config.options.chkSearchTags?"''tags'' ":"");
	body+=(config.options.chkSearchShadows?"''shadows'' ":"");
	if (config.options.chkCaseSensitiveSearch||config.options.chkRegExpSearch) {
		body+=" //with options:// ";
		body+=(config.options.chkCaseSensitiveSearch?"''case sensitive'' ":"");
		body+=(config.options.chkRegExpSearch?"''text patterns'' ":"");
	}
	body+="^^";

	// numbered list of links to matching tiddlers
	body+="\sn<<<";
	for(var t=0;t<matches.length;t++) body+="\sn# [["+matches[t].title+"]]";
	body+="\sn<<<\sn";

	// open all matches button
	body+="<html><input type=\s"button\s" href=\s"javascript:;\s" ";
	body+="onclick=\s"story.displayTiddlers(null,["
	for(var t=0;t<matches.length;t++)
		body+="'"+matches[t].title.replace(/\s'/mg,"\s\s'")+"'"+((t<matches.length-1)?", ":"");
	body+="],1);\s" ";
	body+="accesskey=\s"O\s" ";
	body+="value=\s"open all matching tiddlers\s"></html> ";

	// discard search results button
	body+="<html><input type=\s"button\s" href=\s"javascript:;\s" ";
	body+="onclick=\s"story.closeTiddler('"+title+"'); store.deleteTiddler('"+title+"');\s" ";
	body+="value=\s"discard "+title+"\s"></html>";

	// search again
	body+="\sn\sn----\sn";
	body+="<<search \s""+text+"\s">> ";
	body+="<<option chkSearchTitles>>titles ";
	body+="<<option chkSearchText>>text ";
	body+="<<option chkSearchTags>>tags";
	body+="<<option chkSearchShadows>>shadows";
	body+="<<option chkCaseSensitiveSearch>>case-sensitive ";
	body+="<<option chkRegExpSearch>>text patterns";

	// create/update the tiddler
	var tiddler=store.getTiddler(title); if (!tiddler) tiddler=new Tiddler();
	tiddler.set(title,body,config.options.txtUserName,(new Date()),"excludeLists excludeSearch");
	store.addTiddler(tiddler); story.closeTiddler(title);

	// use alternate "search again" label in <<search>> macro
	var oldprompt=config.macros.search.label;
	config.macros.search.label="search again";

	// render tiddler
	story.displayTiddler(null,title,1); // force refresh

	// restore standard search label
	config.macros.search.label=oldprompt;

}

if (!window.discardSearchResults) window.discardSearchResults=function()
{
	// remove the tiddler
	story.closeTiddler(config.macros.search.reportTitle);
	store.deleteTiddler(config.macros.search.reportTitle);
}
//}}}


