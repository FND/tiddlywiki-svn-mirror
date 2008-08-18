/***
|''Name''|SimpleSearchPlugin|
|''Description''|displays search results as a simple list of matching tiddlers|
|''Authors''|FND|
|''Version''|0.2.0|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/SimpleSearchPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/SimpleSearchPlugin.js|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Keywords''|search|
!Configuration Options
<<option chkClassicSearch>> Use classic search behavior
!Revision History
!!v0.1.0 (2008-08-17)
* initial release
!To Do
* default styling
* animations for container creation and removal
* when clicking on search results, do not scroll to the respective tiddler (optional)
!Code
***/
//{{{
if(!version.extensions.SimpleSearchPlugin) { //# ensure that the plugin is only installed once
version.extensions.SimpleSearchPlugin = {
	installed: true,
	btnLabel: "close",
	btnTooltip: "dismiss search results",
	id: "searchResults",

	displayResults: function(matches, query) {
		var el = document.getElementById(this.id);
		if(el) {
			removeChildren(el);
		} else { //# fallback: use displayArea as parent
			var container = document.getElementById("displayArea");
			el = document.createElement("div");
			el.setAttribute("id", this.id);
			el = container.insertBefore(el, container.firstChild);
		}
		if(matches.length > 0) {
			var msg = "!Search Results\n" +
				"''" + config.macros.search.successMsg.format([matches.length.toString(), query]) + ":''\n";
			for(var i = 0 ; i < matches.length; i++) {
				msg += "* [[" + matches[i].title + "]]\n";
			}
		} else {
			msg = config.macros.search.failureMsg.format([query]);
		}
		createTiddlyButton(el, this.btnLabel, this.btntooltip,
			function() { removeNode(this.parentNode); },
			"button", null, null);
		wikify(msg, el);
	}
};

config.optionsDesc.chkClassicSearch = "Use classic search behavior";

config.shadowTiddlers.StyleSheetSimpleSearch = "/*{{{*/\n"
	+ "#" + version.extensions.SimpleSearchPlugin.id + " {\n"
	+ "\tborder: 2px solid [[ColorPalette::TertiaryLight]];\n"
	+ "\tpadding: 5px 1em;\n"
	+ "}\n\n"
	+ "#" + version.extensions.SimpleSearchPlugin.id + " h1 {\n"
	+ "\tmargin-top: 0;\n"
	+ "\tborder: none;\n"
	+ "}\n\n"
	+ "#" + version.extensions.SimpleSearchPlugin.id + " ul {\n"
	+ "\tmargin-top: 0.5em;\n"
	+ "\tmargin-bottom: 0.5em;\n"
	+ "}\n\n"
	+ "#" + version.extensions.SimpleSearchPlugin.id + " .button {\n"
	+ "\tfloat: right;\n"
	+ "\tmargin: -5px -1em 5px 5px;\n"
	+ "\tborder-color: [[ColorPalette::TertiaryPale]];\n"
	+ "\tpadding: 5px;\n"
	+ "\tbackground-color: [[ColorPalette::TertiaryPale]];\n"
	+ "}\n\n"
	+ "#" + version.extensions.SimpleSearchPlugin.id + " .button:hover {\n"
	+ "\tborder-color: [[ColorPalette::SecondaryMid]];\n"
	+ "\tbackground-color: [[ColorPalette::SecondaryLight]];\n"
	+ "}\n"
	+ "/*}}}*/";
store.addNotification("StyleSheetSimpleSearch", refreshStyles);

// hijack Story.search()
Story.prototype.search_SimpleSearch = Story.prototype.search;
Story.prototype.search = function(text, useCaseSensitive, useRegExp) {
	if(config.options.chkClassicSearch) {
		Story.prototype.search_SimpleSearch.apply(this, arguments);
	} else {
		highlightHack = new RegExp(useRegExp ? text : text.escapeRegExp(), useCaseSensitive ? "mg" : "img");
		var matches = store.search(highlightHack, "title", "excludeSearch");
		highlightHack = null;
		var q = useRegExp ? "/" : "'";
		version.extensions.SimpleSearchPlugin.displayResults(matches, q + text + q);
	}
};

} //# end of "install only once"
//}}}
