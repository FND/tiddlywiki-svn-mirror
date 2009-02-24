/***
|''Name:''|MediaWikiFormatterForTemplatesPlugin|
|''Description:''|renders templates user from mediawikis|
|''Author:''|Nicolas Rusconi (nrusconi (at) globant (dot) com)|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/NicolasRusconi/formatters/MediaWikiFormatterPlugin.js |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/NicolasRusconi/formatters/MediaWikiFormatterPlugin.js |
|''Version:''|0.1|
|''Date:''|Feb 24, 2009|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.1.0|

***/
//{{{
var formatters = config.parsers.mediawikiFormatter.formatters;
formatters.push({
	//# render templates used inside tiddlers
	name: 'mediaWikiTemplate',
	match: '\\{\\{',
	handler: function(w) {
		var index = w.source.indexOf("}}", w.matchStart);
		var templateName = w.source.substring(w.matchStart+ 2, index)
		var colonIndex = templateName.indexOf(":")
		if (colonIndex == -1) {
			templateName = "Template:" + templateName;
		} else if (colonIndex == 0) {
			templateName = templateName.substring(1);
		}
		var tiddler = store.getTiddler(templateName);
		if (!tiddler) {
			createTiddlyElement(w.output, "div", templateName,
				"tiddlyLinkNonExisting", "Could not found template " + templateName);
		} else {
			wikify(tiddler.text, w.output, highlightHack, tiddler);
		}
		w.nextMatch = index + 2;
	}

});
config.parsers.mediawikiFormatter = new Formatter(formatters);
config.parsers.mediawikiFormatter.format = 'mediawiki';
config.parsers.mediawikiFormatter.formatTag = 'MediaWikiFormat';
//}}}
