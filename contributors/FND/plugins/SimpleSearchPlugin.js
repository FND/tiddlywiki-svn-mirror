/***
|''Name''|SimpleSearchPlugin|
|''Description''|displays search results as a simple list of matching tiddlers|
|''Authors''|FND|
|''Version''|0.3.0|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/SimpleSearchPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/SimpleSearchPlugin.js|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Keywords''|search|
!Configuration Options
<<option chkClassicSearch>> Use classic search behavior
!Revision History
!!v0.2.0 (2008-08-18)
* initial release
!!v0.3.0 (2008-08-19)
* added Open All button (renders Classic Search option obsolete)
!To Do
* animations for container creation and removal
* when clicking on search results, do not scroll to the respective tiddler (optional)
* use template for search results
!Code
***/
//{{{
if(!version.extensions.SimpleSearchPlugin) { //# ensure that the plugin is only installed once
version.extensions.SimpleSearchPlugin = { installed: true };

if(!plugins) { var plugins = {}; }
plugins.SimpleSearchPlugin = {
	heading: "Search Results",
	containerId: "searchResults",
	btnCloseLabel: "close",
	btnCloseTooltip: "dismiss search results",
	btnCloseId: "search_close",
	btnOpenLabel: "Open all",
	btnOpenTooltip: "open all search results",
	btnOpenId: "search_open",
	
	displayResults: function(matches, query) {
		var el = document.getElementById(this.containerId);
		query = '"""' + query + '"""'; // prevent WikiLinks
		if(el) {
			removeChildren(el);
		} else { //# fallback: use displayArea as parent
			var container = document.getElementById("displayArea");
			el = document.createElement("div");
			el.setAttribute("id", this.containerId);
			el = container.insertBefore(el, container.firstChild);
		}
		var msg = "!" + this.heading + "\n";
		if(matches.length > 0) {
			msg += "''" + config.macros.search.successMsg.format([matches.length.toString(), query]) + ":''\n";
			this.results = [];
			for(var i = 0 ; i < matches.length; i++) {
				this.results.push(matches[i].title);
				msg += "* [[" + matches[i].title + "]]\n";
			}
		} else {
			msg += "''" + config.macros.search.failureMsg.format([query]) + "''"; // XXX: do not use bold here!?
		}
		createTiddlyButton(el, this.btnCloseLabel, this.btnCloseTooltip, plugins.SimpleSearchPlugin.closeResults, "button", this.btnCloseId);
		wikify(msg, el);
		if(matches.length > 0) { // XXX: redundant!?
			createTiddlyButton(el, this.btnOpenLabel, this.btnOpenTooltip, plugins.SimpleSearchPlugin.openAll, "button", this.btnOpenId);
		}
	},

	closeResults: function() {
		var el = document.getElementById(plugins.SimpleSearchPlugin.containerId);
		removeNode(el);
		plugins.SimpleSearchPlugin.results = null;
		highlightHack = null;
	},

	openAll: function(ev) {
		story.displayTiddlers(null, plugins.SimpleSearchPlugin.results);
		return false;
	}
};

config.shadowTiddlers.StyleSheetSimpleSearch = "/*{{{*/\n" +
	"#" + plugins.SimpleSearchPlugin.containerId + " {\n" +
	"\toverflow: auto;\n" +
	"\tpadding: 5px 1em 10px;\n" +
	"\tbackground-color: [[ColorPalette::TertiaryPale]];\n" +
	"}\n\n" +
	"#" + plugins.SimpleSearchPlugin.containerId + " h1 {\n" +
	"\tmargin-top: 0;\n" +
	"\tborder: none;\n" +
	"}\n\n" +
	"#" + plugins.SimpleSearchPlugin.containerId + " ul {\n" +
	"\tmargin: 0.5em;\n" +
	"\tpadding-left: 1.5em;\n" +
	"}\n\n" +
	"#" + plugins.SimpleSearchPlugin.containerId + " .button {\n" +
	"\tdisplay: block;\n" +
	"\tborder-color: [[ColorPalette::TertiaryDark]];\n" +
	"\tpadding: 5px;\n" +
	"\tbackground-color: [[ColorPalette::TertiaryLight]];\n" +
	"}\n\n" +
	"#" + plugins.SimpleSearchPlugin.containerId + " .button:hover {\n" +
	"\tborder-color: [[ColorPalette::SecondaryMid]];\n" +
	"\tbackground-color: [[ColorPalette::SecondaryLight]];\n" +
	"}\n\n" +
	"#" + plugins.SimpleSearchPlugin.btnCloseId + " {\n" +
	"\tfloat: right;\n" +
	"\tmargin: -5px -1em 5px 5px;\n" +
	"}\n\n" +
	"#" + plugins.SimpleSearchPlugin.btnOpenId + " {\n" +
	"\tfloat: left;\n" +
	"\tmargin-top: 5px;\n" +
	"}\n" +
	"/*}}}*/";
store.addNotification("StyleSheetSimpleSearch", refreshStyles);

// override Story.search()
Story.prototype.search = function(text, useCaseSensitive, useRegExp) {
	highlightHack = new RegExp(useRegExp ? text : text.escapeRegExp(), useCaseSensitive ? "mg" : "img");
	var matches = store.search(highlightHack, "title", "excludeSearch");
	var q = useRegExp ? "/" : "'";
	plugins.SimpleSearchPlugin.displayResults(matches, q + text + q);
};

} //# end of "install only once"
//}}}
