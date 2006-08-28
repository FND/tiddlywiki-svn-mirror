/***
|''Name:''|TracFormatterPlugin|
|''Description:''|Pre-release - Allows Tiddlers to use [[Trac|http://trac.edgewall.org/wiki/WikiFormatting]] text formatting|
|''Source:''|http://martinswiki.com/martinsprereleases.html#TracFormatterPlugin - for pre-release|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.4|
|''Status:''|alpha pre-release|
|''Date:''|Aug 12, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the TracFormatterPlugin, which allows you to insert Trac formated text into a TiddlyWiki.

The aim is not to fully emulate Trac, but to allow you to create Trac content off-line and then paste the content
into your Trac wiki later on, with the expectation that only minor edits will be required.

To use Trac format in a Tiddler, tag the Tiddler with TracFormat. See [[testTracFormat]] for an example.

This is an early alpha release and may contain defects.
Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev
***/

//{{{
// Ensure that the TracFormatter Plugin is only installed once.
if(!version.extensions.TracFormatterPlugin) {
version.extensions.TracFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	alertAndThrow("TracFormatterPlugin requires TiddlyWiki 2.1 or later.");

tracDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,"\\n").replace(/\r/mg,"RR"));
	createTiddlyElement(out,"br");
}

config.tracFormatters = [
{
	name: "tracTable",
	match: "^\\|\\|(?:[^\\n]*)\\|\\|$",
	lookaheadRegExp: /^\|\|([^\n]*)\|\|$/mg,
	rowTermRegExp: /(\|\|$\n?)/mg,
	cellRegExp: /(?:\|\|([^\n]*)\|\|)|(\|\|$\n?)/mg,
	cellTermRegExp: /((?:\x20*)\|\|)/mg,

	handler: function(w)
	{
		var table = createTiddlyElement(w.output,"table");
		var rowContainer = createTiddlyElement(table,"tbody");
		var rowCount = 0;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch)
			{
			this.rowHandler(w,createTiddlyElement(rowContainer,"tr",null,(rowCount&1)?"oddRow":"evenRow"));
			rowCount++;
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			}
	},//# end handler
	rowHandler: function(w,e)
	{
		var col = 0;
		var colSpanCount = 1;
		var prevCell = null;
		this.cellRegExp.lastIndex = w.nextMatch;
		var cellMatch = this.cellRegExp.exec(w.source);
		while(cellMatch && cellMatch.index == w.nextMatch)
			{
			if(w.source.substr(w.nextMatch,4) == "||||")
				{// Colspan
				colSpanCount++;
				w.nextMatch += 2;
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
				w.nextMatch += 2; //skip over ||
				var chr = w.source.substr(w.nextMatch,1);
				var cell;
				if(chr == "!")
					{
					cell = createTiddlyElement(e,"th");
					w.nextMatch++;
					chr = w.source.substr(w.nextMatch,1);
					}
				else
					cell = createTiddlyElement(e,"td");
				var spaceLeft = false;
				while(chr == " ")
					{
					spaceLeft = true;
					w.nextMatch++;
					chr = w.source.substr(w.nextMatch,1);
					}
				if(colSpanCount > 1)
					{
					cell.setAttribute("colspan",colSpanCount);
					cell.setAttribute("colSpan",colSpanCount); // Needed for IE
					colSpanCount = 1;
					}
				w.subWikifyTerm(cell,this.cellTermRegExp);
				if(w.matchText.substr(w.matchText.length-3,1) == " ") // spaceRight
					cell.align = spaceLeft ? "center" : "left";
				else if(spaceLeft)
					cell.align = "right";
				prevCell = cell;
				w.nextMatch -= 2;
				}
			col++;
			this.cellRegExp.lastIndex = w.nextMatch;
			cellMatch = this.cellRegExp.exec(w.source);
			}
	}//# end rowHandler
},

{
	name: "tracHeading",
	match: "^={1,6} ",
	termRegExp: /( ={1,6}$\n?)/mg,
	handler: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output,"h" + (w.matchLength-1)),this.termRegExp);
	}
},

{
	name: "tracDefinitionList",
	match: "^\\s+\\S+::\\s*\\n",
	lookaheadRegExp: /^\s+\S+::\s*\n/mg,
	l2RegExp: /^\s{2,}\S+/mg,
	handler: function(w)
	{
		var li = createTiddlyElement(w.output,"dl");
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch)
			{
			w.subWikifyTerm(createTiddlyElement(li,"dt"),/(::\s*\n)/mg);
			var dd = createTiddlyElement(li,"dd");
			this.l2RegExp.lastIndex = w.nextMatch;
			var l2Match = this.l2RegExp.exec(w.source);
			while(l2Match && l2Match.index == w.nextMatch)
				{
				while(w.source.substr(w.nextMatch,1) == " ")
					{//# skip past any leading spaces which would be rendered as blockquote
					w.nextMatch++;
					}
				w.subWikifyTerm(dd,/(\n)/mg);
				l2Match = this.l2RegExp.exec(w.source)
				if(l2Match)
					createTiddlyText(dd," ");
				}
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source)
			}
	}
},

{
	name: "tracList",
	match: "^(?: )+(?:(?:\\* )|(?:1\\. )|(?:a\\. )|(?:i\\. ))",
	lookaheadRegExp: /^(?: )+(?:(\* )|(1\. )|(a\. )|(i\. ))/mg,
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
				{//a.
				style = "lower-alpha";
				}
			else if(lookaheadMatch[4])
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
			e.style["list-style-type"] = style;
			w.subWikifyTerm(e,this.termRegExp);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			}
	}
},

{
	name: "tracQuoteByLine",
	match: "^  ",
	lookaheadRegExp: /^  /mg,
	termRegExp: /(\n)/mg,
	element: "blockquote",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "tracRule",
	match: "^---+$\\n?",
	handler: function(w)
	{
		createTiddlyElement(w.output,"hr");
	}
},

// {{{
// #!html
// <h1 style="text-align: right; color: blue">HTML Test</h1>
// }}}
{
	name: "tracHtml",
	match: "^\\{\\{\\{\n#!html",
	lookaheadRegExp: /^\{\{\{\n#!html\n((?:.|\n)*?)\}\}\}/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			createTiddlyElement(w.output,"span").innerHTML = lookaheadMatch[1];
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "tracMonospacedByLine",
	match: "^\\{\\{\\{\\n",
	lookaheadRegExp: /^\{\{\{\n((?:^[^\n]*\n)+?)(^\}\}\}$\n?)/mg,
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
	name: "tracExplicitLineBreak",
	match: "\\[\\[BR\\]\\]",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
	}
},

{
	name: "tracExplicitLink",
	match: "\\[",
	lookaheadRegExp: /\[([^\s\]]*?)(?:(\])|(\s(.*?))\])/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var e;
			var link = lookaheadMatch[1];
			var text = link;
			if(lookaheadMatch[2]) // Titled bracketted link
				{
				e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false);
				}
			else// Titled bracketted link
				{
				text = lookaheadMatch[4];
				e = createTiddlyLink(w.output,link,false); // Simple bracketted link
				}
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "tracNotWikiLink",
	match: "!" + config.textPrimitives.wikiLink,
	handler: function(w)
	{
		w.outputText(w.output,w.matchStart+1,w.nextMatch);
	}
},

{
	name: "tracWikiLink",
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
	name: "tracUrlLink",
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: "tracBoldByChar",
	match: "'''",
	termRegExp: /(''')/mg,
	element: "strong",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "tracItalicByChar",
	match: "''",
	termRegExp: /('')/mg,
	element: "em",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "tracUnderlineByChar",
	match: "__",
	termRegExp: /(__)/mg,
	element: "u",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "tracStrikeByChar",
	match: "~~",
	termRegExp: /(~~)/mg,
	element: "strike",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "tracSuperscriptByChar",
	match: "\\^",
	termRegExp: /(\^)/mg,
	element: "sup",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "tracSubscriptByChar",
	match: ",,",
	termRegExp: /(,,)/mg,
	element: "sub",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "tracMonospacedByChar0",
	match: "`",
	lookaheadRegExp: /`((?:.|\n)*?)`/mg,
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
	name: "tracMonospacedByChar",
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
	name: "tracParagraph",
	match: "\\n{2,}",
	handler: function(w)
	{
		createTiddlyElement(w.output,"p");
	}
},

{
	name: "tracLineBreak",
	match: "\\n",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
	}
},

{
	name: "tracHtmlEntitiesEncoding",
	match: "&#?[a-zA-Z0-9]{2,8};",
	handler: function(w)
		{
		createTiddlyElement(w.output,"span").innerHTML = w.matchText;
		}
}

];


if(config.parsers)
	{
	config.parsers.tracFormatter = new Formatter(config.tracFormatters);
	config.parsers.tracFormatter.formatTag = "TracFormat";
	}
else
	{
	formatters.tracFormatter = new Formatter(config.tracFormatters);
	formatters.tracFormatter.formatTag = "TracFormat";
	}

} // end of "install only once"
//}}}
