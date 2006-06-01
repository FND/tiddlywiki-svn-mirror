/***
''DisableWikiLinksPlugin for TiddlyWiki version 1.2.x and 2.0''
^^author: Eric Shulman - ELS Design Studios
source: http://www.elsdesign.com/tiddlywiki/#DisableWikiLinksPlugin
license: [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]^^

!!!!!Configuration
<<<
Self-contained control panel:
<<option chkDisableWikiLinks>> Disable automatic WikiWord tiddler links
<<<

!!!!!Code
***/
//{{{
version.extensions.disableWikiLinks= {major: 1, minor: 0, revision: 0, date: new Date(2005,12,9)};

if (config.options.chkDisableWikiLinks==undefined) config.options.chkDisableWikiLinks= true;

// find the formatter for wikiLink and replace handler with 'pass-thru' rendering
for (var i=0; i<config.formatters.length && config.formatters[i].name!="wikiLink"; i++);
config.formatters[i].coreHandler=config.formatters[i].handler;
config.formatters[i].handler=function(w) {
	// if not enabled, just do standard WikiWord link formatting
	if (!config.options.chkDisableWikiLinks) return this.coreHandler(w);
	// supress any leading "~" (if present)
	var skip=(w.matchText.substr(0,1)==config.textPrimitives.unWikiLink)?1:0;
	w.outputText(w.output,w.matchStart+skip,w.nextMatch)
}
//}}}
