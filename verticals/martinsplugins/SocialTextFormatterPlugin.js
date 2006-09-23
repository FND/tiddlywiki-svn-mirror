/***
|''Name:''|SocialTextFormatterPlugin|
|''Description:''|Pre-release - Allows Tiddlers to use [[SocialText|http://www.socialtext.com/]] text formatting|
|''Source:''|http://martinsplugins.tiddlywiki.com/index.html#SocialTextFormatterPlugin|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.6|
|''Status:''|alpha pre-release|
|''Date:''|Sep 23, 2006|
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

This is an early alpha release, with (at least) the following known issues:

!!!Issues
# images not supported
# indented text not supported
# various other formats not supported

***/

//{{{

// Ensure that the SocialTextFormatter Plugin is only installed once.
if(!version.extensions.SocialTextFormatterPlugin) {
version.extensions.SocialTextFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("SocialTextFormatterPlugin requires TiddlyWiki 2.1 or later.");}

stDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,"\\n").replace(/\r/mg,"RR"));
	createTiddlyElement(out,"br");
};

if(!config.formatterHelpers.singleCharFormat) {
config.formatterHelpers.singleCharFormat = function(w)
{
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[0].substr(lookaheadMatch[0].length-2,1) != " ")
		{
		w.subWikifyTerm(createTiddlyElement(w.output,this.element),this.termRegExp);
		w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	else
		{
		w.outputText(w.output,w.matchStart,w.nextMatch);
		}
};
}

config.socialTextFormatters = [
{
	name: "socialTextHeading",
	match: "^\\^{1,6}",
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output,"h" + w.matchLength),this.termRegExp);
	}
},

{
	name: "socialTextTable",
	match: "^\\|(?:[^\\n]*)\\|$",
	lookaheadRegExp: /^\|(?:[^\n]*)\|$/mg,
	cellRegExp: /(?:\|(?:[^\n\|]*)\|)|(\|$\n?)/mg,
	cellTermRegExp: /((?:\x20*)\|)/mg,

	handler: function(w)
	{
		var table = createTiddlyElement(w.output,"table");
		var rowContainer = createTiddlyElement(table,"tbody");
		var prevColumns = [];
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch)
			{
			this.rowHandler(w,createTiddlyElement(rowContainer,"tr"),prevColumns);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			}
	},
	rowHandler: function(w,e,prevColumns)
	{
		this.cellRegExp.lastIndex = w.nextMatch;
		var cellMatch = this.cellRegExp.exec(w.source);
		while(cellMatch && cellMatch.index == w.nextMatch)
			{
			if(cellMatch[1])
				{// End of row
				w.nextMatch = this.cellRegExp.lastIndex;
				break;
				}
			else
				{// Cell
				w.nextMatch++;
				var cell = createTiddlyElement(e,"td");
				w.subWikifyTerm(cell,this.cellTermRegExp);
				w.nextMatch--;
				}
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
				for(var i=currLevel; i<listLevel; i++)
					{placeStack.push(createTiddlyElement(placeStack[placeStack.length-1],listType));}
				}
			else if(listLevel < currLevel)
				{
				for(i=currLevel; i>listLevel; i--)
					{placeStack.pop();}
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
	name: "quoteByLine",
	match: "^>+",
	lookaheadRegExp: /^>+/mg,
	termRegExp: /(\n)/mg,
	element: "blockquote",
	handler: function(w)
	{
		var placeStack = [w.output];
		var currLevel = 0;
		var newLevel = w.matchLength;
		var i;
		do {
			if(newLevel > currLevel)
				{
				for(i=currLevel; i<newLevel; i++)
					{placeStack.push(createTiddlyElement(placeStack[placeStack.length-1],this.element));}
				}
			else if(newLevel < currLevel)
				{
				for(i=currLevel; i>newLevel; i--)
					{placeStack.pop();}
				}
			currLevel = newLevel;
			w.subWikifyTerm(placeStack[placeStack.length-1],this.termRegExp);
			createTiddlyElement(placeStack[placeStack.length-1],"br");
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			var matched = lookaheadMatch && lookaheadMatch.index == w.nextMatch;
			if(matched)
				{
				newLevel = lookaheadMatch[0].length;
				w.nextMatch += lookaheadMatch[0].length;
				}
		} while(matched);
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
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[1])
			{
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			invokeMacro(w.output,lookaheadMatch[1],lookaheadMatch[2],w,w.tiddler);
			}
	}
},

{
	name: "socialTextExplicitLink",
	match: '(?:".*?" ?)?\\[',
	lookaheadRegExp: /(?:\"(.*?)\" ?)?\[([^\]]*?)\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var link = lookaheadMatch[2];
			var text = lookaheadMatch[1] ? lookaheadMatch[1] : link;
			createTiddlyText(createTiddlyLink(w.output,link,false,null,w.isStatic),text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "socialTextExternalLink",
	match: '(?:".*?" ?)?<',
	lookaheadRegExp: /(?:\"(.*?)\" ?)?<([^>]*?)>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var link = lookaheadMatch[2];
			var text = lookaheadMatch[1] ? lookaheadMatch[1] : link;
//stDebug(w.output,"ll:"+link+" tt:"+text);
			if(/\.(?:gif|ico|jpg|png)/g.exec(link))
				{
				var img = createTiddlyElement(w.output,"img");
				if(lookaheadMatch[1])
					{img.title = text;}
				img.src = link;
				}
			else
				{
				createTiddlyText(createExternalLink(w.output,link),text);
				}
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
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
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
	name: "socialTextBold",
	match: "\\*(?!\\s)",
	lookaheadRegExp: /\*(?!\s)(?:.*?)(?!\s)\*(?=\s)/mg,
	termRegExp: /((?!\s)\*(?=\s))/mg,
	element: "strong",
	handler: config.formatterHelpers.singleCharFormat
},

{
	name: "socialTextItalic",
	match: "_(?![\\s|_])",
	lookaheadRegExp: /_(?!\s)(?:.*?)(?!\s)_(?=\s)/mg,
	termRegExp: /((?!\s)_(?=\s))/mg,
	element: "em",
	handler: config.formatterHelpers.singleCharFormat
},

{
	name: "socialTextStrike",
	match: "-(?![\\s|-])",
	lookaheadRegExp: /-(?!\s)(?:.*?)(?!\s)-(?=\s)/mg,
	termRegExp: /((?!\s)-(?=\s))/mg,
	element: "strike",
	handler: config.formatterHelpers.singleCharFormat
},

{
	name: "socialTextMonoSpaced",
	match: "`(?![\\s|`])",
	lookaheadRegExp: /`(?!\s)(?:.*?)(?!\s)`(?=\s)/mg,
	termRegExp: /((?!\s)`(?=\s))/mg,
	element: "code",
	handler: config.formatterHelpers.singleCharFormat
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
	name: "socialTextLineBreak",
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

config.parsers.socialTextFormatter = new Formatter(config.socialTextFormatters);
config.parsers.socialTextFormatter.formatTag = "SocialTextFormat";
} // end of "install only once"
//}}}
