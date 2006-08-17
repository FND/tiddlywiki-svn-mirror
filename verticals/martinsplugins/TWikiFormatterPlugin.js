/***
|''Name:''|TWikiFormatterPlugin|
|''Description:''|Pre-release - Allows Tiddlers to use [[TWiki|http://twiki.org/cgi-bin/view/TWiki/TextFormattingRules]] text formatting|
|''Source:''|http://martinswiki.com/martinsprereleases.html#TWikiFormatterPlugin - for pre-release|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.1|
|''Status:''|alpha pre-release|
|''Date:''|Aug 5, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the TWikiFormatterPlugin, which allows you to insert TWiki formated text into a TiddlyWiki.

The aim is not to fully emulate TWiki, but to allow you to create TWiki content off-line and then paste the content
into your TWiki later on, with the expectation that only minor edits will be required.

To use TWiki format in a Tiddler, tag the Tiddler with TWikiFormat. See [[testTwikiFormat]] for an example.

Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev

This is an early alpha release, with (at least) the following known issues:
#Table code is incomplete.
## Table headings not yet supported.
## Rowspans and colspans not yet supported.
# Anchors not yet supported.
# Spaces in forced links (ie [[link title]] ) not supported. [[link][title]] is supported.

***/

//{{{
// Ensure that the TWikiFormatter Plugin is only installed once.
if(!version.extensions.TWikiFormatterPlugin) {
version.extensions.TWikiFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	alertAndThrow("TWikiFormatterPlugin requires TiddlyWiki 2.1 or later.");

//# single character adjacent to the wikitext, eg *bold*
config.formatterHelpers.singleCharFormat = function(w)
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

config.formatterHelpers.doubleCharFormat = function(w)
{
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[0].substr(lookaheadMatch[0].length-3,1) != " ")
		{
		var e = createTiddlyElement(w.output,this.element);
		w.subWikifyTerm(createTiddlyElement(e,this.element2),this.termRegExp);
		w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	else
		{
		w.outputText(w.output,w.matchStart,w.nextMatch);
		}
}

config.twikiFormatters = [
{
	name: "twikiTable",
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
		var colSpanCount = 1;
		this.cellRegExp.lastIndex = w.nextMatch;
		var cellMatch = this.cellRegExp.exec(w.source);
		while(cellMatch && cellMatch.index == w.nextMatch)
			{
			if(cellMatch[1] == "^")
				{// Rowspan
				var last = prevColumns[col];
				if(last)
					{
					last.rowSpanCount++;
					last.element.setAttribute("rowspan",last.rowSpanCount);
					last.element.setAttribute("rowSpan",last.rowSpanCount); // Needed for IE
					last.element.valign = "center";
					}
				w.nextMatch = this.cellRegExp.lastIndex-1;
				}
			else if(cellMatch[1] == "")
				{// Colspan
				colSpanCount++;
				w.nextMatch = this.cellRegExp.lastIndex-1;
				}
			else if(cellMatch[2])
				{// End of row
				if(colSpanCount > 1)
					{
					prevCell.setAttribute("colspan",colSpanCount);
					prevCell.setAttribute("colSpan",colSpanCount); // Needed for IE
					}
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
				if(colSpanCount > 1)
					{
					cell.setAttribute("colspan",colSpanCount);
					cell.setAttribute("colSpan",colSpanCount); // Needed for IE
					colSpanCount = 1;
					}
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
	name: "twikiHeading",
	match: "^---\\+{1,6}",
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output,"h" + (w.matchLength-3)),this.termRegExp);
	}
},

{
	name: "twikiDefinitionList",
	match: "^   \\$ [a-zA-Z ]+:[a-zA-Z ]+\\n",
	lookaheadRegExp: /^   \$ ([a-zA-Z ]+):([a-zA-Z ]+)\n/mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var li = createTiddlyElement(w.output,"dl");
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch)
			{
			w.nextMatch += 5;
			w.subWikifyTerm(createTiddlyElement(li,"dt"),/(:)/mg);
			w.subWikifyTerm(createTiddlyElement(li,"dd"),this.termRegExp);
			lookaheadMatch = this.lookaheadRegExp.exec(w.source)
			}
	}
},

{
	name: "twikiList",
	match: "^(?:   )+(?:(?:\\* )|(?:1\\. )|(?:A\\. )|(?:a\\. )|(?:I\\. )|(?:i\\. ))",
	lookaheadRegExp: /^(?:   )+(?:(\* )|(1\. )|(A\. )|(a\. )|(I\. )|(i\. ))/mg,
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
			listType = "ol";
			itemType = "li";
			listLevel = (lookaheadMatch[0].length-3)/3;
			var style = null;
			if(lookaheadMatch[1])
				{//*
				listType = "ul";
				listLevel = (lookaheadMatch[0].length-2)/3;
				}
			else if(lookaheadMatch[2])
				{//1.
				style = "decimal";
				}
			else if(lookaheadMatch[3])
				{//A.
				style = "upper-alpha";
				}
			else if(lookaheadMatch[4])
				{//a.
				style = "lower-alpha";
				}
			else if(lookaheadMatch[5])
				{//I.
				style = "upper-roman";
				}
			else if(lookaheadMatch[6])
				{//i.
				style = "lower-roman";
				}
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
			//e.style["list-style-type"] = style;
			e.style["listStyleType"] = style;
			w.subWikifyTerm(e,this.termRegExp);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			}
	}
},

{
	name: "twikiRule",
	match: "^---+$\\n?",
	handler: function(w)
	{
		createTiddlyElement(w.output,"hr");
	}
},

{
	name: "twikiNoAutoLink",
	match: "^<noautolink>",
	lookaheadRegExp: /<noautolink>((?:.|\n)*?)<\/noautolink>/mg,
	termRegExp: /(<\/noautolink>)/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var autoLinkWikiWords = w.autoLinkWikiWords;
			w.autoLinkWikiWords = false;
			w.subWikifyTerm(w.output,this.termRegExp);
			w.autoLinkWikiWords = autoLinkWikiWords;
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		else
			w.outputText(w.output,w.matchStart,w.nextMatch);
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
	name: "twikiNotExplicitLink",
	match: "!\\[\\[",
	handler: function(w)
	{
		w.outputText(w.output,w.matchStart+1,w.nextMatch);
	}
},

{
	name: "twikiExplicitLink",
	match: "\\[\\[",
	lookaheadRegExp: /\[\[([^\[\]]*?)(?:(\]\])|(\]\[(.*?)\]\]))/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var e;
			var text = lookaheadMatch[1];
			if (lookaheadMatch[2]) // Simple bracketted link
				{
				e = createTiddlyLink(w.output,text,false);
				}
			else if(lookaheadMatch[3]) // Titled bracketted link
				{
				var link = text;
				text = lookaheadMatch[4];
				e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false);
				}
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "twikiNotWikiLink",
	match: "(?:!|<nop>)" + config.textPrimitives.wikiLink,
	handler: function(w)
	{
		w.outputText(w.output,w.matchStart+(w.matchText.substr(0,1)=="!"?1:5),w.nextMatch);
	}
},

{
	name: "twikiWikiLink",
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
		if(w.autoLinkWikiWords == true || store.isShadowTiddler(w.matchText))
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
	name: "twikiUrlLink",
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: "twikiBoldByChar",
	//match: "\\*\\b",
	//lookaheadRegExp: /\*\b((?:.|\n)*?)\b\*\B/mg,
	//termRegExp: /(\b\*\B)/mg,
	match: "\\*(?!\\s)",
	lookaheadRegExp: /\*(?!\s)(?:(?:.|\n)*?)(?!\s)\*(?=\s)/mg,
	termRegExp: /((?!\s)\*(?=\s))/mg,
	element: "strong",
	handler: singleCharFormat
},

{
	name: "twikiBoldItalicByChar",
	//match: "__(?!\\s)",
	//lookaheadRegExp: /__(?!\s)(?:(?:.|\n)*?)((?!\s))__(?=\s)/mg,
	//termRegExp: /((?!\s)__(?=\s))/mg,
	match: "__(?!\\s)",
	lookaheadRegExp: /__(?!\s)(?:(?:.|\n)*?)(?!\s)__(?=\s)/mg,
	termRegExp: /((?!\s)__(?=\s))/mg,
	element: "strong",
	element2: "em",
	handler: doubleCharFormat
},

{
	name: "twikiItalicByChar",
	match: "_(?![\\s|_])",
	lookaheadRegExp: /_(?!\s)(?:(?:.|\n)*?)(?!\s)_(?=\s)/mg,
	termRegExp: /((?!\s)_(?=\s))/mg,
	element: "em",
	handler: singleCharFormat
},

{
	name: "twikiBoldMonoSpacedByChar",
	match: "==(?!\\s)",
	lookaheadRegExp: /==(?!\s)(?:(?:.|\n)*?)(?!\s)==(?=\s)/mg,
	termRegExp: /((?!\s)==(?=\s))/mg,
	element: "strong",
	element2: "code",
	handler: doubleCharFormat
},

{
	name: "twikiMonoSpacedByChar",
	match: "=(?![\\s|=])",
	lookaheadRegExp: /=(?!\s)(?:(?:.|\n)*?)(?!\s)=(?=\s)/mg,
	termRegExp: /((?!\s)=(?=\s))/mg,
	element: "code",
	handler: singleCharFormat
},

{
	name: "twikiPreByChar",
	match: "<pre>",
	lookaheadRegExp: /<pre>((?:.|\n)*?)<\/pre>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			createTiddlyElement(w.output,"pre",null,null,lookaheadMatch[1]);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "twikiVerbatimByChar",
	match: "<verbatim>",
	lookaheadRegExp: /\<verbatim>((?:.|\n)*?)<\/verbatim>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			createTiddlyElement(w.output,"span",null,null,lookaheadMatch[1]);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "twikiParagraph",
	match: "\\n{2,}",
	handler: function(w)
	{
		createTiddlyElement(w.output,"p");
	}
},

{
	name: "twikiNotVariable",
	match: "!%",
	handler: function(w)
	{
		w.outputText(w.output,w.matchStart+1,w.nextMatch);
	}
},

{
	name: "twikiColorByChar",
	match: "%(?:YELLOW|ORANGE|RED|PINK|PURPLE|TEAL|NAVY|BLUE|AQUA|LIME|GREEN|OLIVE|MAROON|BROWN|BLACK|GRAY|SILVER|WHITE)%",
	lookaheadRegExp: /%(YELLOW|ORANGE|RED|PINK|PURPLE|TEAL|NAVY|BLUE|AQUA|LIME|GREEN|OLIVE|MAROON|BROWN|BLACK|GRAY|SILVER|WHITE)/mg,
	termRegExp: /(%ENDCOLOR%)/mg,
	handler:  function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var e = createTiddlyElement(w.output,"span");
			e.style.color = lookaheadMatch[1];
			w.subWikifyTerm(e,this.termRegExp);
			}
	}
},

{
	name: "twikiExplicitLineBreak",
	match: "%BR%",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
	}
},

{
	name: "twikiHtmlEntitiesEncoding",
	match: "&#?[a-zA-Z0-9]{2,8};",
	handler: function(w)
		{
		createTiddlyElement(w.output,"span").innerHTML = w.matchText;
		}
}

];

formatters.twikiFormatter = new Formatter(config.twikiFormatters);
formatters.twikiFormatter.formatTag = "TWikiFormat";

} // end of "install only once"
//}}}
