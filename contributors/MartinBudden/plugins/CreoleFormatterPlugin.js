/***
|''Name:''|CreoleFormatterPlugin|
|''Description:''|Extension of TiddlyWiki syntax to support [[Creole|http://www.wikicreole.org/]] text formatting|
|''Source:''|http://martinswiki.com/prereleases.html#CreoleFormatterPlugin - for pre-release|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.4|
|''Status:''|alpha pre-release|
|''Date:''|Oct 21, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the CreoleFormatterPlugin, which extends the TiddlyWiki syntax to support Creole
text formatting. See [[testCreoleFormat]] for an example.

The Creole formatter is different from the other formatters in that Tiddlers are not required to be
tagged: instead the Creole format adds formatting that augments TiddlyWiki's format.

The Creole formatter adds the following:
# {{{**}}} for bold
# {{{== Heading 2==}}} with 2 to 6 equals signs for headings
# {{{[[link|title]]}}} format for links (rather than TW's {{{[[title|link]]}}}).

Since Creole augments rather than replaces TW's formatting there is a problem of how to resolve a prettyLink:
the formatter has some intelligence to determine if whether a link is a TW style link or a Creole style link.
Additionally a tiddler can be tagged "titleThenLinkFormat" or "linkThenTitleFormat" to force resolution one
way or the other.

See: http://www.wikicreole.org/wiki/Home

Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev

This is an early alpha release, with (at least) the following known issues:
# Creole image format not yet supported

***/

//{{{
// Ensure that the CreoleFormatterPlugin is only installed once.
if(!version.extensions.CreoleFormatterPlugin) {
version.extensions.CreoleFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("CreoleFormatterPlugin requires TiddlyWiki 2.1 or later.");}

creoleFormatter = {}; // "namespace" for local functions

creoleDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,"\\n").replace(/\r/mg,"RR"));
	createTiddlyElement(out,"br");
};

config.creoleFormatters = [
{
	name: "creoleHeading",
	match: "^={2,6}(?!=)",
	termRegExp: /(={0,6}\n+)/mg,
	handler: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output,"h" + w.matchLength),this.termRegExp);
	}
},

{
	name: "creoleBoldByChar",
	match: "\\*\\*",
	termRegExp: /(\*\*|(?=\n\n))/mg,
	element: "strong",
	handler: config.formatterHelpers.createElementAndWikify
}
];

for(var i in config.formatters)
	{// replace formatters as required
	if(config.formatters[i].name == "prettyLink")
		{
		config.formatters[i] = 
{
	name: "creoleExplicitLink",
	match: "\\[\\[",
	lookaheadRegExp: /\[\[(.*?)(?:\|(.*?))?\]\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var e;
			var link = lookaheadMatch[1];
			var text = lookaheadMatch[2];
			if(text)
				{// both text and link defined, so try and workout which is which
				var wlRegExp = new RegExp(config.textPrimitives.wikiLink,"mg");
				wlRegExp.lastIndex = 0;
				if(w.tiddler.isTagged("titleThenLinkFormat"))
					{// format is [[text|link]]
					link = text;
					text = lookaheadMatch[1];
					e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
					}
				else if(w.tiddler.isTagged("linkThenTitleFormat"))
					{// standard format is [[link|text]]
					e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
					}
				else if(config.formatterHelpers.isExternalLink(link))
					{
					e = createExternalLink(w.output,link);
					}
				else if(config.formatterHelpers.isExternalLink(text))
					{
					link = text;
					text = lookaheadMatch[1];
					e = createExternalLink(w.output,link);
					}
				else if(store.tiddlerExists(link))
					{
					e = createTiddlyLink(w.output,link,false,null,w.isStatic);
					}
				else if(store.tiddlerExists(text))
					{
					link = text;
					text = lookaheadMatch[1];
					e = createTiddlyLink(w.output,link,false,null,w.isStatic);
					}
				else if(wlRegExp.exec(text))
					{//text is a WikiWord, so assume its a tiddler link
					link = text;
					text = lookaheadMatch[1];
					e = createTiddlyLink(w.output,link,false,null,w.isStatic);
					}
				else
					{// assume standard link format
					e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
					}
				}
			else
				{
				text = link;
				e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
				}
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}//# end handler
};

		}
	else if(config.formatters[i].name == "italicByChar")
		{
		config.formatters[i].termRegExp = /(\/\/|(?=\n\n))/mg;
		}
	else if(config.formatters[i].name == "list")
		{
		config.formatters[i].match = "^[\\*#;:]+ ";
		}
	}

for(i in config.creoleFormatters)
	{// add new formatters
	config.formatters.push(config.creoleFormatters[i]);
	}

}// end of "install only once"
//}}}
