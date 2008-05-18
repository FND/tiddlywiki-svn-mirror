/***
|''Name:''|SearchPlusPlugin|
|''Description:''|A simple intuitive search replacement, ideal for websites and blogs|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#SearchPlusPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires:''|PreferenceSaverLib|
|''~CoreVersion:''|2.2.3|
!!Requirements:
* [[PreferenceSaverLib|http://tw.lewcid.org/#PreferenceSaverLib]]
!!Usage:
* Just type into the search field like normal
* Optionally you may include only tiddlers with a given tag in the search. To enable this:
** change config.macros.search.includeByTagMode to true
** change config.macros.search.includeByTag to the tag you want to use.
<<prefs config.macros.search>>
***/
// /%
//!BEGIN-PLUGIN-CODE
if(!window.SetupPrefs)
	alertAndThrow("Missing requirements: PreferenceSaverLib (http://tw.lewcid.org/#PreferenceSaverLib)");

config.macros.search.userprefs = {
	excludeTag:{
		defaults : "excludeSearch",
		gui : "input",
		guiLabel : "Tiddlers with this tag are not searched",
		type : "string"
		},
		
	includeByTagMode:{
		defaults : "false",
		gui : "checkbox",
		guiLabel : "Limit search to tiddlers with a given tag (alt. mode)",
		type : "bool"
		},

	includeTag:{
		defaults : "Public",
		gui : "input",
		guiLabel : "Only search tiddlers with this tag (in alt. mode)",
		type : "string"
		}
};

config.macros.search.doSearch = function(txt)
{
	highlightHack = new RegExp(config.options.chkRegExpSearch ?	 txt.value : txt.value.escapeRegExp(),config.options.chkCaseSensitiveSearch ? "mg" : "img");
	var matches = store.search(highlightHack,"title",this.prefs["includeByTagMode"]?this.prefs["includeTag"]:this.prefs["excludeTag"],this.prefs["includeByTagMode"]);
	var popup = Popup.create(txt);
	if(matches.length>0){
		createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),"Search found "+ matches.length +" matches:");
		var titles = [];
		for (var i=0;i<matches.length;i++){
			createTiddlyLink(createTiddlyElement(popup,"li"),matches[i].title,true,"tiddlyLink",false,false,false);
			titles.push(matches[i].title);
		}
		createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
		var openAll = createTiddlyButton(createTiddlyElement(popup,"li"),"Open all results","Open all search results",onClickSearchOpenAll);
		openAll.tiddlers = titles;
	}
	else{
		createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),"Search found no matches.");
	}
	Popup.show();
	return false;
};

config.macros.search.onClick = function(e)
{
	if (!e)var e = window.event;
	config.macros.search.doSearch(this.nextSibling);
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
};

onClickTiddlerLink_websitesearch = onClickTiddlerLink;
onClickTiddlerLink = function(e)
{
	onClickTiddlerLink_websitesearch.apply(this,arguments);
	highlightHack = null;
};

function onClickSearchOpenAll(e)
{
	if(!e) var e = window.event;
	var titles = this.tiddlers;
	story.displayTiddlers(null,titles);
	highlightHack = null;
	return false;
};

TiddlyWiki.prototype.search = function(searchRegExp,sortField,excludeTag,match)
{
	var candidates = this.reverseLookup("tags",excludeTag,!!match);
	var results = [];
	for(var t=0; t<candidates.length; t++) {
		if((candidates[t].title.search(searchRegExp) != -1) || (candidates[t].text.search(searchRegExp) != -1))
			results.push(candidates[t]);
	}
	if(!sortField)
		sortField = "title";
	results.sort(function(a,b) {return a[sortField] < b[sortField] ? -1 : (a[sortField] == b[sortField] ? 0 : +1);});
	return results;
};

SetupPrefs(config.macros.search);
//!END-PLUGIN-CODE
// %/