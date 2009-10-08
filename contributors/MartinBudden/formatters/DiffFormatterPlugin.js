/***
|''Name:''|DiffFormatterPlugin|
|''Description:''|Extension of TiddlyWiki syntax to support Diff text formatting|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#DiffFormatterPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/DiffFormatterPlugin.js |
|''Version:''|0.0.3|
|''Date:''|Sep 11, 2009|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.1.0|

This is an early release of the DiffFormatterPlugin, which extends the TiddlyWiki syntax to support Diff
text formatting.

The Diff formatter is different from the other formatters in that Tiddlers are not required to be
tagged: instead the Diff format adds formatting that augments TiddlyWiki's format.

The Diff formatter adds the following:
# ^+ for added
# ^- for removed
# ^"""@@ """, """--- """ and """+++ """ for special markers

Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev
!StyleSheet
.viewer .removed { background: #fdd; }
.viewer .added { background: #dfd; }
!Code
***/
//{{{
// Ensure that the DiffFormatterPlugin is only installed once.
if(!version.extensions.DiffFormatterPlugin) {
version.extensions.DiffFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1)) {
	alertAndThrow('DiffFormatterPlugin requires TiddlyWiki 2.1 or later.');
}

diffFormatter = {}; // 'namespace' for local functions

diffFormatter.init = function() {
	var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
	if(stylesheet) { // check necessary because it happens more than once for some reason
		config.shadowTiddlers["StyleSheetDiffFormatter"] = stylesheet;
		store.addNotification("StyleSheetDiffFormatter", refreshStyles);
	}
};

diffFormatter.added = {
	name: 'diffAdded',
	match: '^\\+',
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var e = createTiddlyElement(w.output,'span',null,'added');
		w.subWikifyTerm(e,this.termRegExp);
		createTiddlyElement(w.output,'br');
	}
};

diffFormatter.removed = {
	name: 'diffRemoved',
	match: '^-',
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var e = createTiddlyElement(w.output,'span',null,'removed');
		w.subWikifyTerm(e,this.termRegExp);
		createTiddlyElement(w.output,'br');
	}
};

diffFormatter.charDiff = {
	name: 'diffChars',
	match: '^(?:@@|[+-]{3}) ',
	lookaheadRegExp: /^(?:@@|[+-]{3}) .*\n/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
};

// add new formatters
diffFormatter.init();
config.formatters.push(diffFormatter.added);
config.formatters.push(diffFormatter.removed);

diffFormatter.replaceFormatter = function()
{
	for(var i=0; i<config.formatters.length; i++) {
		if(config.formatters[i].name == 'characterFormat') {
			config.formatters.splice(i,0,diffFormatter.charDiff);
			break;
		}
	}
};
diffFormatter.replaceFormatter();

}// end of 'install only once'
//}}}
