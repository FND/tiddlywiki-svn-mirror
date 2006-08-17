/***
|''Name:''|BaseFormatterPlugin|
|''Description:''|Allows Tiddlers to use Base text formatting|
|''Source:''|http://martinswiki.com/martinsprereleases.html#BaseFormatterPlugin - for pre-release|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.1|
|''Status:''|alpha pre-release|
|''Date:''|Jul 21, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the BaseFormatterPlugin, which allows you to insert Base formated text into a TiddlyWiki.

The aim is not to fully emulate Base, but to allow you to create Base content off-line and then paste the content
into your Base wiki later on, with the expectation that only minor edits will be required.

To use Base format in a Tiddler, tag the Tiddler with BaseFormat. See [[testBaseFormat]] for an example.

Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev

This is an early alpha release, with (at least) the following known issues:
***/

//{{{
// Ensure that the BaseFormatterPlugin is only installed once.
if(!version.extensions.BaseFormatterPlugin) {
version.extensions.BaseFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	alertAndThrow("BaseFormatterPlugin requires TiddlyWiki 2.1 or later.");

baseDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,"\\n").replace(/\r/mg,"RR"));
	createTiddlyElement(out,"br");
}

config.baseFormatters = [
{
	name: "baseHeading",
	match: "^={1,6}",
	termRegExp: /(={1,6}$\n?)/mg,
	handler: function(w)
	{
//var debug = createTiddlyElement(w.output,"p");
//baseDebug(debug,"hello");
		w.subWikifyTerm(createTiddlyElement(w.output,"h"+w.matchLength),this.termRegExp);
	}
},

{
	name: "baseRule",
	match: "^---+$\\n?",
	handler: function(w)
	{
		createTiddlyElement(w.output,"hr");
	}
},

{
	name: "macro",
	match: "<<",
	lookaheadRegExp: /<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[1])
			{
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			invokeMacro(w.output,lookaheadMatch[1],lookaheadMatch[2],w,w.tiddler);
			}
	}
},

{
	name: "baseExplicitLink",
	match: "\\[\\[",
	lookaheadRegExp: /\[\[([^\|\]]*?)(?:(\]\])|(\|(.*?)\]\]))/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var e, text;
			var link = lookaheadMatch[1];
			if(lookaheadMatch[2])
				{// Simple bracketted link
				e = createTiddlyLink(w.output,link,false);
				text = link;
				}
			else if(lookaheadMatch[3])
				{// Titled link
				e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false);
				text = lookaheadMatch[4];
				}
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	},
},

{
	name: "baseNotWikiLink",
	match: "!" + config.textPrimitives.wikiLink,
	handler: function(w)
	{
		w.outputText(w.output,w.matchStart+1,w.nextMatch);
	}
},

{
	name: "baseWikiLink",
	match: config.textPrimitives.wikiLink,
	handler: function(w)
	{
		if(w.matchStart > 0)
			{
			var preRegExp = new RegExp(config.textPrimitives.anyLetter,"mg");
			preRegExp.lastIndex = w.matchStart-1;
			var preMatch = preRegExp.exec(w.source);
			if(preMatch.index == w.matchStart-1)
				{
				w.outputText(w.output,w.matchStart,w.nextMatch);
				return;
				}
			}
		if(w.hasWikiLinks == true || store.isShadowTiddler(w.matchText))
			{
			var link = createTiddlyLink(w.output,w.matchText,false);
			w.outputText(link,w.matchStart,w.nextMatch);
			}
		else
			{
			w.outputText(w.output,w.matchStart,w.nextMatch);
			}
	}
},

{
	name: "baseUrlLink",
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: "baseBoldByChar",
	match: "'''",
	termRegExp: /(''')/mg,
	element: "strong",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseItalicByChar",
	match: "''",
	termRegExp: /('')/mg,
	element: "em",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseUnderlineByChar",
	match: "__",
	termRegExp: /(__)/mg,
	element: "u",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseStrikeByChar",
	match: "--",
	termRegExp: /(--)/mg,
	element: "strike",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseSuperscriptByChar",
	match: "\\^\\^",
	termRegExp: /(\^\^)/mg,
	element: "sup",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseSubscriptByChar",
	match: "~~",
	termRegExp: /(~~)/mg,
	element: "sub",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseMonospacedByChar",
	match: "\\{\\{\\{",
	lookaheadRegExp: /\{\{\{((?:.|\n)*?)\}\}\}/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			createTiddlyElement(w.output,"code",null,null,lookaheadMatch[1]);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "baseParagraph",
	match: "\\n{2,}",
	handler: function(w)
	{
		createTiddlyElement(w.output,"p");
	}
},

{
	name: "baseLineBreak",
	match: "\\n",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
	}
},

{
	name: "baseHtmlEntitiesEncoding",
	match: "&#?[a-zA-Z0-9]{2,8};",
	handler: function(w)
		{
		createTiddlyElement(w.output,"span").innerHTML = w.matchText;
		}
}

];

//formatters.push({formatter: new Formatter(config.baseFormatters), formatTag: "BaseFormat"});
formatters.baseFormatter = new Formatter(config.baseFormatters);
formatters.baseFormatter.formatTag = "BaseFormat";

} // end of "install only once"
//}}}
