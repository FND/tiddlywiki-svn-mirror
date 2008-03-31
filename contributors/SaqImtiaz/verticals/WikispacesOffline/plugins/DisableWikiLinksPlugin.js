/***
|Name|DisableWikiLinksPlugin|
|Source|http://www.TiddlyTools.com/#DisableWikiLinksPlugin|
|Version|1.5.0|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides|Tiddler.prototype.autoLinkWikiWords, 'wikiLink' formatter|
|Description|selectively disable TiddlyWiki's automatic ~WikiWord linking behavior|
This plugin allows you to disable TiddlyWiki's automatic ~WikiWord linking behavior, so that WikiWords embedded in tiddler content will be rendered as regular text, instead of being automatically converted to tiddler links.  To create a tiddler link when automatic linking is disabled, you must enclose the link text within {{{[[...]]}}}.
!!!!!Usage
<<<
You can block automatic WikiWord linking behavior for any specific tiddler by ''tagging it with<<tag excludeWikiWords>>'' (see configuration below) or, check a plugin option to disable automatic WikiWord links to non-existing tiddler titles, while still linking WikiWords that correspond to existing tiddlers titles or shadow tiddler titles.  You can also block specific selected WikiWords from being automatically linked by listing them in [[DisableWikiLinksList]] (see configuration below), separated by whitespace.  This tiddler is optional and, when present, causes the listed words to always be excluded, even if automatic linking of other WikiWords is being permitted.  

Note: WikiWords contained in default ''shadow'' tiddlers will be automatically linked unless you select an additional checkbox option lets you disable these automatic links as well, though this is not recommended, since it can make it more difficult to access some TiddlyWiki standard default content (such as AdvancedOptions or SideBarTabs)
<<<
!!!!!Configuration
<<<
Self-contained control panel:
<<option chkDisableWikiLinks>> Disable ALL automatic WikiWord tiddler links
<<option chkAllowLinksFromShadowTiddlers>> ... except for WikiWords //contained in// shadow tiddlers
<<option chkDisableNonExistingWikiLinks>> Disable automatic WikiWord links for non-existing tiddlers
Disable automatic WikiWord links for words listed in: <<option txtDisableWikiLinksList>>
Disable automatic WikiWord links for tiddlers tagged with: <<option txtDisableWikiLinksTag>>
<<<
!!!!!Revisions
<<<
''2006.06.09 [1.5.0]'' added configurable txtDisableWikiLinksTag (default value: "excludeWikiWords") to allows selective disabling of automatic WikiWord links for any tiddler tagged with that value.
''2006.12.31 [1.4.0]'' in formatter, test for chkDisableNonExistingWikiLinks
''2006.12.09 [1.3.0]'' in formatter, test for excluded wiki words specified in DisableWikiLinksList
''2006.12.09 [1.2.2]'' fix logic in autoLinkWikiWords() (was allowing links TO shadow tiddlers, even when chkDisableWikiLinks is TRUE).  
''2006.12.09 [1.2.1]'' revised logic for handling links in shadow content
''2006.12.08 [1.2.0]'' added hijack of Tiddler.prototype.autoLinkWikiWords so regular (non-bracketed) WikiWords won't be added to the missing list
''2006.05.24 [1.1.0]'' added option to NOT bypass automatic wikiword links when displaying default shadow content (default is to auto-link shadow content)
''2006.02.05 [1.0.1]'' wrapped wikifier hijack in init function to eliminate globals and avoid FireFox 1.5.0.1 crash bug when referencing globals
''2005.12.09 [1.0.0]'' initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.disableWikiLinks= {major: 1, minor: 5, revision: 0, date: new Date(2007,6,9)};

if (config.options.chkDisableNonExistingWikiLinks==undefined) config.options.chkDisableNonExistingWikiLinks= false;
if (config.options.chkDisableWikiLinks==undefined) config.options.chkDisableWikiLinks=false;
if (config.options.txtDisableWikiLinksList==undefined) config.options.txtDisableWikiLinksList="DisableWikiLinksList";
if (config.options.chkAllowLinksFromShadowTiddlers==undefined) config.options.chkAllowLinksFromShadowTiddlers=true;
if (config.options.txtDisableWikiLinksTag==undefined) config.options.txtDisableWikiLinksTag="excludeWikiWords";

// find the formatter for wikiLink and replace handler with 'pass-thru' rendering
initDisableWikiLinksFormatter();
function initDisableWikiLinksFormatter() {
	for (var i=0; i<config.formatters.length && config.formatters[i].name!="wikiLink"; i++);
	config.formatters[i].coreHandler=config.formatters[i].handler;
	config.formatters[i].handler=function(w) {
		// supress any leading "~" (if present)
		var skip=(w.matchText.substr(0,1)==config.textPrimitives.unWikiLink)?1:0;
		var title=w.matchText.substr(skip);
		var exists=store.tiddlerExists(title);
		var inShadow=w.tiddler && store.isShadowTiddler(w.tiddler.title);

		// check for excluded Tiddler
		if (w.tiddler && w.tiddler.isTagged(config.options.txtDisableWikiLinksTag))
			{ w.outputText(w.output,w.matchStart+skip,w.nextMatch); return; }
		
		// check for specific excluded wiki words
		var t=store.getTiddlerText(config.options.txtDisableWikiLinksList)
		if (t && t.length && t.indexOf(w.matchText)!=-1)
			{ w.outputText(w.output,w.matchStart+skip,w.nextMatch); return; }

		// if not disabling links from shadows (default setting)
		if (config.options.chkAllowLinksFromShadowTiddlers && inShadow)
			return this.coreHandler(w);

		// check for non-existing non-shadow tiddler
		if (config.options.chkDisableNonExistingWikiLinks && !exists)
			{ w.outputText(w.output,w.matchStart+skip,w.nextMatch); return; }

		// if not enabled, just do standard WikiWord link formatting
		if (!config.options.chkDisableWikiLinks)
			return this.coreHandler(w);

		// just return text without linking
		w.outputText(w.output,w.matchStart+skip,w.nextMatch)
	}
}

Tiddler.prototype.coreAutoLinkWikiWords = Tiddler.prototype.autoLinkWikiWords;
Tiddler.prototype.autoLinkWikiWords = function()
{
	// DEBUG alert("processing: "+this.title);
	// if all automatic links are not disabled, just return results from core function
	if (!config.options.chkDisableWikiLinks)
		return this.coreAutoLinkWikiWords.apply(this,arguments);
	return false;
}
//}}}
