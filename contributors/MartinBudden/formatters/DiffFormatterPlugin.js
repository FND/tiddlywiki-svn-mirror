/***
|''Name:''|DiffFormatterPlugin|
|''Description:''|Extension of TiddlyWiki syntax to support Diff text formatting|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#DiffFormatterPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/DiffFormatterPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Sep 2, 2009|
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

Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev

***/

//{{{
// Ensure that the DiffFormatterPlugin is only installed once.
if(!version.extensions.DiffFormatterPlugin) {
version.extensions.DiffFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1)) {
	alertAndThrow('DiffFormatterPlugin requires TiddlyWiki 2.1 or later.');
}

diffFormatter = {}; // 'namespace' for local functions

diffFormatter.added = {
	name: 'diffAdded',
	match: '^\\+ ',
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
	match: '^- ',
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var e = createTiddlyElement(w.output,'span',null,'removed');
		w.subWikifyTerm(e,this.termRegExp);
		createTiddlyElement(w.output,'br');
	}
};

// add new formatters
config.formatters.push(diffFormatter.added);
config.formatters.push(diffFormatter.removed);

}// end of 'install only once'
//}}}
