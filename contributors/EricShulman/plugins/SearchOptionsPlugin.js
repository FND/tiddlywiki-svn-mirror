/***
|Name|SearchOptionsPlugin|
|Source|http://www.TiddlyTools.com/#SearchOptionsPlugin|
|Documentation|http://www.TiddlyTools.com/#SearchOptionsPluginInfo|
|Version|2.6.1|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides|Story.prototype.search, TiddlyWiki.prototype.search, config.macros.search.onKeyPress|
|Description|extend core search function with additional user-configurable options|
Extend core search function with additional user-configurable options including generating a ''list of matching tiddlers'' instead of immediately displaying all matches.
!!!!!Documentation
>see [[SearchOptionsPluginInfo]]
!!!!!Configuration
<<<
<<option chkSearchTitles>> Search in titles
<<option chkSearchText>> Search in tiddler text
<<option chkSearchTags>> Search in tags
<<option chkSearchFields>> Search in data fields
<<option chkSearchShadows>> Search shadow tiddlers
<<option chkSearchTitlesFirst>> Show title matches first
<<option chkSearchByDate>> Sort matching tiddlers by date
<<option chkSearchList>> Show list of matches in [[SearchResults]]
<<option chkSearchIncremental>> Incremental (key-by-key) searching
<<<
!!!!!Revisions
<<<
2007.02.17 [2.6.1] added redefinition of config.macros.search.onKeyPress() to restore check to bypass key-by-key searching (i.e., when chkSearchIncremental==false), which had been unintentionally removed with v2.6.0
|please see [[SearchOptionsPluginInfo]] for additional revision details|
2005.10.18 [1.0.0] Initial Release
<<<
!!!!!Code
***/
//{{{
version.extensions.searchOptions = {major: 2, minor: 6, revision: 1, date: new Date(2007,2,17)};

if (config.options.chkSearchTitles===undefined) config.options.chkSearchTitles=true;
if (config.options.chkSearchText===undefined) config.options.chkSearchText=true;
if (config.options.chkSearchTags===undefined) config.options.chkSearchTags=true;
if (config.options.chkSearchFields===undefined) config.options.chkSearchFields=true;
if (config.options.chkSearchTitlesFirst===undefined) config.options.chkSearchTitlesFirst=false;
if (config.options.chkSearchList===undefined) config.options.chkSearchList=false;
if (config.options.chkSearchByDate===undefined) config.options.chkSearchByDate=false;
if (config.options.chkSearchIncremental===undefined) config.options.chkSearchIncremental=true;
if (config.options.chkSearchShadows===undefined) config.options.chkSearchShadows=false;

if (config.optionsDesc) {
	config.optionsDesc.chkSearchTitles="Search in tiddler titles";
	config.optionsDesc.chkSearchText="Search in tiddler text";
	config.optionsDesc.chkSearchTags="Search in tiddler tags";
	config.optionsDesc.chkSearchFields="Search in tiddler data fields";
	config.optionsDesc.chkSearchShadows="Search in shadow tiddlers";
	config.optionsDesc.chkSearchTitlesFirst="Search results show title matches first";
	config.optionsDesc.chkSearchList="Search results show list of matching tiddlers";
	config.optionsDesc.chkSearchByDate="Search results sorted by modification date ";
	config.optionsDesc.chkSearchIncremental="Incremental searching";
} else {
	config.shadowTiddlers.AdvancedOptions += "\n<<option chkSearchTitles>> Search in tiddler titles"
		+"\n<<option chkSearchText>> Search in tiddler text"
		+"\n<<option chkSearchTags>> Search in tiddler tags"
		+"\n<<option chkSearchFields>> Search in tiddler data fields"
		+"\n<<option chkSearchShadows>> Search in shadow tiddlers"
		+"\n<<option chkSearchTitlesFirst>> Search results show title matches first"
		+"\n<<option chkSearchList>> Search results show list of matching tiddlers"
		+"\n<<option chkSearchByDate>> Search results sorted by modification date"
		+"\n<<option chkSearchIncremental>> Incremental searching";
}

if (config.macros.search.reportTitle==undefined)
	config.macros.search.reportTitle="SearchResults";

config.macros.search.onKeyPress = function(e)
{
	if(!e) var e = window.event;
	switch(e.keyCode)
		{
		case 13: // Ctrl-Enter
		case 10: // Ctrl-Enter on IE PC
			config.macros.search.doSearch(this);
			break;
		case 27: // Escape
			this.value = "";
			clearMessage();
			break;
		}
	if (config.options.chkSearchIncremental) {
		if(this.value.length > 2)
			{
			if(this.value != this.getAttribute("lastSearchText"))
				{
				if(config.macros.search.timeout)
					clearTimeout(config.macros.search.timeout);
				var txt = this;
				config.macros.search.timeout = setTimeout(function() {config.macros.search.doSearch(txt);},500);
				}
			}
		else
			{
			if(config.macros.search.timeout)
				clearTimeout(config.macros.search.timeout);
			}
	}
}
//}}}

//{{{
Story.prototype.search = function(text,useCaseSensitive,useRegExp)
{
	highlightHack = new RegExp(useRegExp ? text : text.escapeRegExp(),useCaseSensitive ? "mg" : "img");
	var matches = store.search(highlightHack,config.options.chkSearchByDate?"modified":"title","excludeSearch");
	if (config.options.chkSearchByDate) matches=matches.reverse(); // most recent changes first
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

TiddlyWiki.prototype.search = function(searchRegExp,sortField,excludeTag)
{
	var candidates = this.reverseLookup("tags",excludeTag,false,sortField);

	// scan for matching titles first...
	var results = [];
	if (config.options.chkSearchTitles) {
		for(var t=0; t<candidates.length; t++)
			if(candidates[t].title.search(searchRegExp)!=-1)
				results.push(candidates[t]);
		if (config.options.chkSearchShadows)
			for (var t in config.shadowTiddlers)
				if ((t.search(searchRegExp)!=-1) && !store.tiddlerExists(t))
					results.push((new Tiddler()).assign(t,config.shadowTiddlers[t]));
	}
	// then scan for matching text, tags, or field data
	for(var t=0; t<candidates.length; t++) {
		if (config.options.chkSearchText && candidates[t].text.search(searchRegExp)!=-1)
			results.pushUnique(candidates[t]);
		if (config.options.chkSearchTags && candidates[t].tags.join(" ").search(searchRegExp)!=-1)
			results.pushUnique(candidates[t]);
		if (config.options.chkSearchFields && store.forEachField!=undefined) // requires TW2.1 or above
			store.forEachField(candidates[t],
				function(tid,field,val) { if (val.search(searchRegExp)!=-1) results.pushUnique(candidates[t]); },
				true); // extended fields only
	}
	// then check for matching text in shadows
	if (config.options.chkSearchShadows)
		for (var t in config.shadowTiddlers)
			if ((config.shadowTiddlers[t].search(searchRegExp)!=-1) && !store.tiddlerExists(t))
				results.pushUnique((new Tiddler()).assign(t,config.shadowTiddlers[t]));

	// if not 'titles first', or sorting by modification date,  re-sort results to so titles, text, tag and field matches are mixed together
	if(!sortField) sortField = "title";
	var bySortField=function (a,b) {if(a[sortField] == b[sortField]) return(0); else return (a[sortField] < b[sortField]) ? -1 : +1; }
	if (!config.options.chkSearchTitlesFirst || config.options.chkSearchByDate) results.sort(bySortField);

	return results;
}

// REPORT GENERATOR
if (!window.reportSearchResults) window.reportSearchResults=function(text,matches)
{
	var title=config.macros.search.reportTitle
	var q = config.options.chkRegExpSearch ? "/" : "'";
	var body="\n";

	// summary: nn tiddlers found matching '...', options used
	body+="''"+config.macros.search.successMsg.format([matches.length,q+"{{{"+text+"}}}"+q])+"''\n";
	body+="^^//searched in:// ";
	body+=(config.options.chkSearchTitles?"''titles'' ":"");
	body+=(config.options.chkSearchText?"''text'' ":"");
	body+=(config.options.chkSearchTags?"''tags'' ":"");
	body+=(config.options.chkSearchFields?"''fields'' ":"");
	body+=(config.options.chkSearchShadows?"''shadows'' ":"");
	if (config.options.chkCaseSensitiveSearch||config.options.chkRegExpSearch) {
		body+=" //with options:// ";
		body+=(config.options.chkCaseSensitiveSearch?"''case sensitive'' ":"");
		body+=(config.options.chkRegExpSearch?"''text patterns'' ":"");
	}
	body+="^^";

	// numbered list of links to matching tiddlers
	body+="\n<<<";
	for(var t=0;t<matches.length;t++) {
		var date=config.options.chkSearchByDate?(matches[t].modified.formatString('YYYY.0MM.0DD 0hh:0mm')+" "):"";
		body+="\n# "+date+"[["+matches[t].title+"]]";
	}
	body+="\n<<<\n";

	// open all matches button
	body+="<html><input type=\"button\" href=\"javascript:;\" ";
	body+="onclick=\"story.displayTiddlers(null,["
	for(var t=0;t<matches.length;t++)
		body+="'"+matches[t].title.replace(/\'/mg,"\\'")+"'"+((t<matches.length-1)?", ":"");
	body+="],1);\" ";
	body+="accesskey=\"O\" ";
	body+="value=\"open all matching tiddlers\"></html> ";

	// discard search results button
	body+="<html><input type=\"button\" href=\"javascript:;\" ";
	body+="onclick=\"story.closeTiddler('"+title+"'); store.deleteTiddler('"+title+"'); store.notify('"+title+"',true);\" ";
	body+="value=\"discard "+title+"\"></html>";

	// search again
	body+="\n\n----\n";
	body+="<<search \""+text+"\">>\n";
	body+="<<option chkSearchTitles>>titles ";
	body+="<<option chkSearchText>>text ";
	body+="<<option chkSearchTags>>tags";
	body+="<<option chkSearchFields>>fields";
	body+="<<option chkSearchShadows>>shadows";
	body+="<<option chkCaseSensitiveSearch>>case-sensitive ";
	body+="<<option chkRegExpSearch>>text patterns";
	body+="<<option chkSearchByDate>>sort by date";

	// create/update the tiddler
	var tiddler=store.getTiddler(title); if (!tiddler) tiddler=new Tiddler();
	tiddler.set(title,body,config.options.txtUserName,(new Date()),"excludeLists excludeSearch temporary");
	store.addTiddler(tiddler); story.closeTiddler(title);

	// use alternate "search again" label in <<search>> macro
	var oldprompt=config.macros.search.label;
	config.macros.search.label="search again";

	// render/refresh tiddler
	story.displayTiddler(null,title,1);
	store.notify(title,true);

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