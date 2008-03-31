//{{{
config.macros.search.doSearch = function(txt)
{
	highlightHack = new RegExp(config.options.chkRegExpSearch ?	 txt.value : txt.value.escapeRegExp(),config.options.chkCaseSensitiveSearch ? "mg" : "img");
	var matches = store.search(highlightHack,"title","excludeSearch");
	var body;
	if (!matches.length){
		body = "''" + config.macros.search.failureMsg.format(["{{{"+txt.value+"}}}"]) + "''";
	}
	else {
		body = "''" + config.macros.search.successMsg.format([matches.length,"{{{"+txt.value+"}}}"]) + ":''";
		for (var i=0; i<matches.length; i++){
			body += "\n# [[" + matches[i].title + "]]<br>" + matches[i].modifier + " - <<view modified date>>";
		}
	}
	var tTitle = "Search results for " + txt.value;
	config.shadowTiddlers[tTitle] = body;
	story.displayTiddler(null,tTitle,1);
}
//}}}