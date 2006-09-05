/***
|''Name:''|SocialTextFormatterPlugin|
|''Description:''|Pre-release - Allows Tiddlers to use [[SocialText|http://www.socialtext.com/]] text formatting|
|''Source:''|http://martinsplugins.tiddlywiki.com/index.html#SocialTextFormatterPlugin|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.1|
|''Status:''|alpha pre-release|
|''Date:''|Sep 5, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the SocialTextFormatterPlugin, which allows you to insert SocialText formated text
into a TiddlyWiki.

The aim is not to fully emulate SocialText, but to allow you to create SocialText content off-line and then paste
the content into your SocialText wiki later on, with the expectation that only minor edits will be required.

To use SocialText format in a Tiddler, tag the Tiddler with SocialTextFormat. See [[testSocialTextFormat]] for
an example.

This is an early alpha release and may contain defects.
Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev

See also:
http://www.eu.socialtext.net/exchange/index.cgi?new%20formatter%20features#

***/

//{{{

// Ensure that the SocialTextFormatter Plugin is only installed once.
if(!version.extensions.SocialTextFormatterPlugin) {
version.extensions.SocialTextFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	alertAndThrow("SocialTextFormatterPlugin requires TiddlyWiki 2.1 or later.");

stDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,"\\n").replace(/\r/mg,"RR"));
	createTiddlyElement(out,"br");
}

config.socialTextFormatters = [
{
	name: "socialTextHeading",
	match: "^\\^{1,6} ",
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
//stDebug(w.output,"wt:"+w.matchText+" ws:"+w.matchStart+" wn:"+w.nextMatch+" wl:"+w.matchLength);
		w.subWikifyTerm(createTiddlyElement(w.output,"h" + (w.matchLength-1)),this.termRegExp);
	}
},

{
	name: "socialTextTable",
	match: "^\\|(?:[^\\n]*)\\|$",
	lookaheadRegExp: /^\|([^\n]*)\|$/mg,
	rowTermRegExp: /(\|$\n?)/mg,
	cellRegExp: /(?:\|([^\n\|]*)\|)|(\|$\n?)/mg,
	cellTermRegExp: /((?:\x20*)\|)/mg,

	handler: function(w)
	{
		var table = createTiddlyElement(w.output,"table");
		var prevColumns = [];
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch)
			{
			var rowContainer = createTiddlyElement(table,"tbody");
			this.rowHandler(w,createTiddlyElement(rowContainer,"tr"),prevColumns);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			}
	},
	rowHandler: function(w,e,prevColumns)
	{
		var col = 0;
		this.cellRegExp.lastIndex = w.nextMatch;
		var cellMatch = this.cellRegExp.exec(w.source);
		while(cellMatch && cellMatch.index == w.nextMatch)
			{
			if(cellMatch[2])
				{// End of row
				w.nextMatch = this.cellRegExp.lastIndex;
				break;
				}
			else
				{// Cell
				w.nextMatch++;
				var styles = config.formatterHelpers.inlineCssHelper(w);
				var spaceLeft = false;
				var chr = w.source.substr(w.nextMatch,1);
				while(chr == " ")
					{
					spaceLeft = true;
					w.nextMatch++;
					chr = w.source.substr(w.nextMatch,1);
					}
				var cell = createTiddlyElement(e,"td");
				prevColumns[col] = {rowSpanCount:1, element:cell};
				config.formatterHelpers.applyCssHelper(cell,styles);
				w.subWikifyTerm(cell,this.cellTermRegExp);
				if(w.matchText.substr(w.matchText.length-2,1) == " ") // spaceRight
					cell.align = spaceLeft ? "center" : "left";
				else if(spaceLeft)
					cell.align = "right";
				w.nextMatch--;
				}
			col++;
			this.cellRegExp.lastIndex = w.nextMatch;
			cellMatch = this.cellRegExp.exec(w.source);
			}
	}
},

{
	name: "socialTextWikilist",
	match: "^(?:(?:(?:\\*)|(?:#))+) ",
	lookaheadRegExp: /^(?:(?:(\*)|(#))+) /mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var placeStack = [w.output];
		var currLevel = 0, currType = null;
		var listLevel, listType, itemType;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch)
			{
			if(lookaheadMatch[1])
				{
				listType = "ul";
				itemType = "li";
				}
			else if(lookaheadMatch[2])
				{
				listType = "ol";
				itemType = "li";
				}
			listLevel = lookaheadMatch[0].length;
			w.nextMatch += lookaheadMatch[0].length;
			if(listLevel > currLevel)
				{
				for(var t=currLevel; t<listLevel; t++)
					placeStack.push(createTiddlyElement(placeStack[placeStack.length-1],listType));
				}
			else if(listLevel < currLevel)
				{
				for(var t=currLevel; t>listLevel; t--)
					placeStack.pop();
				}
			else if(listLevel == currLevel && listType != currType)
				{
				placeStack.pop();
				placeStack.push(createTiddlyElement(placeStack[placeStack.length-1],listType));
				}
			currLevel = listLevel;
			currType = listType;
			var e = createTiddlyElement(placeStack[placeStack.length-1],itemType);
			w.subWikifyTerm(e,this.termRegExp);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			}
	}
},

{
	name: "socialTextRule",
	match: "^----+$\\n?",
	handler: function(w)
	{
		createTiddlyElement(w.output,"hr");
	}
},

{
	name: "socialTextPreformatted",
	match: "^\\.pre\\s*\\n",
	lookaheadRegExp: /^.pre\s*\n((?:.|\n)*?)\n.pre\s*\n/mg,
	element: "pre",
	handler: config.formatterHelpers.enclosedTextHelper
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
	name: "socialTextExplicitLink",
	match: "\\[",
	lookaheadRegExp: /\[([^\|\]]*?)(?:(\])|(?:\|(.*?))\])/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var link = lookaheadMatch[1];
			var text = lookaheadMatch[3] ? lookaheadMatch[3] : link;
			var e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "socialTextImage",
	match: "\\{image:",
	lookaheadRegExp: /\{image: ?(.*?)\}/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var img = createTiddlyElement(w.output,"img");
			img.src = lookaheadMatch[1];
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "socialTextUrlLink",
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: "socialTextBoldByChar",
	match: "\\*(?!\\s)",
	lookaheadRegExp: /\*(?!\s)(?:(?:.|\n)*?)(?!\s)\*(?=\s)/mg,
	termRegExp: /((?!\s)\*(?=\s))/mg,
	element: "strong",
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[0].substr(lookaheadMatch[0].length-2,1) != " ")
			{
			w.subWikifyTerm(createTiddlyElement(w.output,this.element),this.termRegExp);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		else
			{
			w.outputText(w.output,w.matchStart,w.nextMatch);
			}
	}
},

{
	name: "socialTextItalicByChar",
	match: "_(?![\\s|_])",
	lookaheadRegExp: /_(?!\s)(?:(?:.|\n)*?)(?!\s)_(?=\s)/mg,
	termRegExp: /((?!\s)_(?=\s))/mg,
	element: "em",
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[0].substr(lookaheadMatch[0].length-2,1) != " ")
			{
			w.subWikifyTerm(createTiddlyElement(w.output,this.element),this.termRegExp);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		else
			{
			w.outputText(w.output,w.matchStart,w.nextMatch);
			}
	}
},

{
	name: "socialTextStrikeByChar",
	match: "_(?![\\s|_])",
	lookaheadRegExp: /_(?!\s)(?:(?:.|\n)*?)(?!\s)_(?=\s)/mg,
	termRegExp: /((?!\s)_(?=\s))/mg,
	element: "em",
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[0].substr(lookaheadMatch[0].length-2,1) != " ")
			{
			w.subWikifyTerm(createTiddlyElement(w.output,this.element),this.termRegExp);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		else
			{
			w.outputText(w.output,w.matchStart,w.nextMatch);
			}
	}
},

{
	name: "socialTextMonoSpacedByChar",
	match: "`(?![\\s|`])",
	lookaheadRegExp: /`(?!\s)(?:(?:.|\n)*?)(?!\s)`(?=\s)/mg,
	termRegExp: /((?!\s)`(?=\s))/mg,
	element: "code",
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[0].substr(lookaheadMatch[0].length-2,1) != " ")
			{
			w.subWikifyTerm(createTiddlyElement(w.output,this.element),this.termRegExp);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		else
			{
			w.outputText(w.output,w.matchStart,w.nextMatch);
			}
	}
},

{
	name: "socialTextParagraph",
	match: "\\n{2,}",
	handler: function(w)
	{
		createTiddlyElement(w.output,"p");
	}
},

{
	name: "socialTextExplicitLineBreak",
	match: "\\n",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
	}
},

{
	name: "socialTextNoWiki",
	match: "\\{\\{",
	lookaheadRegExp: /\{\{((?:.|\n)*?)\}\}/mg,
	element: "span",
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: "socialTextTrademark",
	match: "\\{tm\\}",
	handler: function(w)
		{
		createTiddlyElement(w.output,"span").innerHTML = "&trade;";
		}
},

{
	name: "socialTextHtmlEntitiesEncoding",
	match: "&#?[a-zA-Z0-9]{2,8};",
	handler: function(w)
		{
		createTiddlyElement(w.output,"span").innerHTML = w.matchText;
		}
}

];

if(config.parsers)
	{
	config.parsers.socialTextFormatter = new Formatter(config.socialTextFormatters);
	config.parsers.socialTextFormatter.formatTag = "SocialTextFormat";
	}
else
	{
	formatters.socialTextFormatter = new Formatter(config.socialTextFormatters);
	formatters.socialTextFormatter.formatTag = "SocialTextFormat";
	}

} // end of "install only once"
//}}}
