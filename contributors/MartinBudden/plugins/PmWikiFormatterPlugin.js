/***
|''Name:''|PmWikiFormatterPlugin|
|''Description:''|Pre-release - Allows Tiddlers to use [[PmWiki|http://pmwiki.org/wiki/PmWiki/TextFormattingRules]] text formatting|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/prereleases.html#PmWikiFormatterPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins|
|''Version:''|0.2.5|
|''Status:''|alpha pre-release|
|''Date:''|Oct 21, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the PmWikiFormatterPlugin, which allows you to insert PmWiki formated text
into a TiddlyWiki.

The aim is not to fully emulate PmWiki, but to allow you to create PmWiki content off-line and then paste
the content into your PmWiki later on, with the expectation that only minor edits will be required.

To use PmWiki format in a Tiddler, tag the Tiddler with PmWikiFormat. See [[testPmWikiFormat]] for an example.

See http://www.pmwiki.org/wiki/PmWiki/MarkupMasterIndex for PmWiki Markup.

This is an early alpha release, with (at least) the following known issues:
# Proper paragraph handling requires fix to TiddlyWiki that will be available in TiddlyWiki v2.2
# Tables not fully supported
## Table attributes not supported (eg || border=1)
## Table captions not supported
# Anchors not supported.
# Images not supported.
# Image links not supported
# Leading spaces to preserve formatting only work partially.
# Directives not supported eg (:directive (attr...):) - except for the (:markup:)...(:markupend:) directive
# White space list rules not supported
# Definition lists not supported

***/

//{{{

// Ensure that the PmWikiFormatter Plugin is only installed once.
if(!version.extensions.PmWikiFormatterPlugin) {
version.extensions.PmWikiFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("PmWikiFormatterPlugin requires TiddlyWiki 2.1 or later.");}

PmWikiFormatter = {}; // "namespace" for local functions

pmDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,"\\n").replace(/\r/mg,"RR"));
	createTiddlyElement(out,"br");
};

PmWikiFormatter.directives = function(w)
{
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
		var lm1 = lookaheadMatch[1];
		var lm2 = lookaheadMatch[2];
		switch(lm1) {
		case "directive":
			break;
		default:
			w.outputText(w.output,w.matchStart,w.nextMatch);
			return;
		}
		w.nextMatch = this.lookaheadRegExp.lastIndex;
	} else {
		w.outputText(w.output,w.matchStart,w.nextMatch);
	}
};

PmWikiFormatter.setFromParams = function(w,p)
{
	var r = {};
	var re = /\s*(.*?)=(?:(?:"(.*?)")|(?:'(.*?)')|((?:\w|%|#)*))/mg;
	var match = re.exec(p);
	while(match) {
		var s = match[1].unDash();
		if(match[2]) {
			r[s] = match[2];
		} else if(match[3]) {
			r[s] = match[3];
		} else {
			r[s] = match[4];
		}
		match = re.exec(p);
	}
	return r;
};

config.formatterHelpers.setAttributesFromParams = function(e,p)
{
	var re = /\s*(.*?)=(?:(?:"(.*?)")|(?:'(.*?)')|((?:\w|%|#)*))/mg;
	var match = re.exec(p);
	while(match)
		{
		var s = match[1].unDash();
		if(s=="bgcolor") {
			s = "backgroundColor";
		}
		try {
			if(match[2]) {
				e.setAttribute(s,match[2]);
			} else if(match[3]) {
				e.setAttribute(s,match[3]);
			} else {
				e.setAttribute(s,match[4]);
			}
		}
		catch(ex) {}
		match = re.exec(p);
	}
};

config.pmWikiFormatters = [
{
/*<div class='vspace'></div>
<table class='markup vert' align='center'>
<tr><td class='markup1' valign='top'>
<pre>-&gt;Four score and seven years ago our fathers placed upon this continent
a new nation, conceived in liberty and dedicated to the proposition that
all men are created equal.
</pre>
</td></tr>
<tr><td class='markup2' valign='top'>
<div class='indent'>Four score and seven years ago our fathers placed upon this continent a new nation, conceived in liberty and dedicated to the proposition that all men are created equal.
</div>
</td></tr>
</table>*/
	name: "pmWikiMarkup",
	match: "\\(:markup:\\)\\s*\\n",
	lookaheadRegExp: /\(:markup:\)\s*\n((?:.|\n)*?)\(:markupend:\)/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			if(config.browser.isIE) {
				text = text.replace(/\n/g,"\r");
			}
			var t = createTiddlyElement(w.output,"table",null,"markup vert");
			var tr1 = createTiddlyElement(t,"tr");
			var td1 = createTiddlyElement(tr1,"td",null,"markup1");
			var tr2 = createTiddlyElement(t,"tr");
			var td2 = createTiddlyElement(tr2,"td",null,"markup2");

			createTiddlyElement(td1,"pre",null,null,text);
			var oldSource = w.source;
			w.source = text; w.nextMatch = 0;
			w.subWikifyUnterm(td2);
			w.source = oldSource;
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
	}
},

{
	name: "pmWikiHeading",
	match: "^!{1,6}",
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var e = createTiddlyElement(w.output,"h" + w.matchLength);
		w.subWikifyTerm(e,this.termRegExp);
	}
},

{
	name: "pmWikiTableParams",
	match: "^\\|\\|(?:[^\\n\\|]*)\\n",
	lookaheadRegExp: /^\|\|([^\n\|]*)\n/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			/*if(!w.tableParams)
				w.tableParams = {};
			w.tableParams = PmWikiFormatter.setFromParams(w,lookaheadMatch[1]);*/
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: "pmWikiTable",
	match: "^\\|\\|(?:[^\\n]*)\\|\\|$",
	lookaheadRegExp: /^\|\|([^\n]*)\|\|$/mg,
	rowTermRegExp: /(\|\|$\n?)/mg,
	cellRegExp: /(?:\|\|([^\n]*)\|\|)|(\|\|$\n?)/mg,
	cellTermRegExp: /((?:\x20*)\|\|)/mg,
	handler: function(w)
	{
//this.debug = createTiddlyElement(w.output,"p");
		var table = createTiddlyElement(w.output,"table");
		/*for(var i in w.tableParams) {
			table.setAttribut(i,w.tableParams[i])
		}*/
		var rowContainer = createTiddlyElement(table,"tbody");
		var rowCount = 0;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
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
		while(cellMatch && cellMatch.index == w.nextMatch) {
			if(w.source.substr(w.nextMatch,4) == "||||") {
				// Colspan
//pmDebug(this.debug,w.source.substr(w.nextMatch,10));
//pmDebug(this.debug,"nm:"+w.nextMatch+" li:"+this.cellRegExp.lastIndex);
				colSpanCount++;
				w.nextMatch += 2;
			} else if(cellMatch[2]) {// End of row
				if(colSpanCount > 1) {
					prevCell.setAttribute("colspan",colSpanCount);
					prevCell.setAttribute("colSpan",colSpanCount); // Needed for IE
				}
				w.nextMatch = this.cellRegExp.lastIndex;
				break;
			} else {
				// Cell
				w.nextMatch += 2; //skip over ||
				var chr = w.source.substr(w.nextMatch,1);
				var cell;
				if(chr == "!") {
					cell = createTiddlyElement(e,"th");
					w.nextMatch++;
					chr = w.source.substr(w.nextMatch,1);
				} else {
					cell = createTiddlyElement(e,"td");
				}
				var spaceLeft = false;
				while(chr == " ") {
					spaceLeft = true;
					w.nextMatch++;
					chr = w.source.substr(w.nextMatch,1);
				}
				if(colSpanCount > 1) {
					cell.setAttribute("colspan",colSpanCount);
					cell.setAttribute("colSpan",colSpanCount); // Needed for IE
					colSpanCount = 1;
				}
				w.subWikifyTerm(cell,this.cellTermRegExp);
				if(w.matchText.substr(w.matchText.length-3,1) == " ") {
					// spaceRight
					cell.align = spaceLeft ? "center" : "left";
				} else if(spaceLeft) {
					cell.align = "right";
				}
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
	name: "pmWikilist",
	match: "^(?:(?:(?:\\*)|(?:#))+)",
	lookaheadRegExp: /^(?:(?:(\*)|(#))+)/mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var placeStack = [w.output];
		var currLevel = 0, currType = null;
		var listLevel, listType, itemType;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			if(lookaheadMatch[1]) {
				listType = "ul";
				itemType = "li";
			} else if(lookaheadMatch[2]) {
				listType = "ol";
				itemType = "li";
			}
			listLevel = lookaheadMatch[0].length;
			w.nextMatch += lookaheadMatch[0].length;
			if(listLevel > currLevel) {
				for(var i=currLevel; i<listLevel; i++)
					{placeStack.push(createTiddlyElement(placeStack[placeStack.length-1],listType));}
			} else if(listLevel < currLevel) {
				for(i=currLevel; i>listLevel; i--)
					{placeStack.pop();}
			} else if(listLevel == currLevel && listType != currType) {
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
	name: "pmWikiRule",
	match: "^----+$\\n?",
	handler: function(w)
	{
		createTiddlyElement(w.output,"hr");
	}
},

{
//Multiple indents are dealt with in PmWiki as: <dl><dd><div class='indent'>indentedevenmore</div></dd></dl>
	name: "pmWikiIndent",
	match: "^-+>",
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var e = createTiddlyElement(w.output,"div",null,"indent");
		w.subWikifyTerm(e,this.termRegExp);
	}
},

{
	name: "pmWikiOutdent",
	match: "^-+<",
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var e = createTiddlyElement(w.output,"div",null,"outdent");
		w.subWikifyTerm(e,this.termRegExp);
	}
},

{
	name: "pmWikiLeadingSpaces",
	match: "^ ",
	lookaheadRegExp: /^ /mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var e = createTiddlyElement(w.output,"pre");
		while(true) {
			w.subWikifyTerm(e,this.termRegExp);
			createTiddlyElement(e,"br");
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
				w.nextMatch += lookaheadMatch[0].length;
			} else {
				break;
			}
		}
	}
},

{
	name: "pmWikiExplicitLink",
	match: "\\[\\[",
	lookaheadRegExp: /\[\[(.*?)(?:\|(.*?))?\]\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var link = lookaheadMatch[1];
			if(lookaheadMatch[2]) {
				//# Titled link
				var e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
				var text = lookaheadMatch[2];
			} else {
				//# Simple bracketted link
				e = createTiddlyLink(w.output,link,false,null,w.isStatic);
				text = link;
			}
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: "pmWikiNotWikiLink",
	match: "`" + config.textPrimitives.wikiLink,
	handler: function(w)
	{
		w.outputText(w.output,w.matchStart+1,w.nextMatch);
	}
},

{
	name: "pmWikiLink",
	match: config.textPrimitives.wikiLink,
	handler: function(w)
	{
		if(w.matchStart > 0) {
			var preRegExp = new RegExp(config.textPrimitives.anyLetter,"mg");
			preRegExp.lastIndex = w.matchStart-1;
			preMatch = preRegExp.exec(w.source);
			if(preMatch.index == w.matchStart-1) {
				w.outputText(w.output,w.matchStart,w.nextMatch);
				return;
			}
		}
		var output = w.output;
		if(w.autoLinkWikiWords == true || store.isShadowTiddler(w.matchText)) {
			output = createTiddlyLink(w.output,w.matchText,false,null,w.isStatic);
		}
		w.outputText(output,w.matchStart,w.nextMatch);
	}
},

{
	name: "urlLink",
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: "pmWikiBoldByChar",
	match: "'''",
	termRegExp: /('''|\n)/mg,
	element: "strong",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "pmWikiItalicByChar",
	match: "''",
	termRegExp: /(''|\n)/mg,
	element: "em",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "pmWikiMonospacedByChar",
	match: "@@",
	termRegExp: /(@@|\n)/mg,
	element: "code",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "pmWikiUnderlineByChar",
	match: "\\{\\+",
	termRegExp: /(\+\}|\n)/mg,
	element: "u",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "pmWikiStrikeByChar",
	match: "\\{-",
	termRegExp: /(-\}|\n)/mg,
	element: "strike",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "pmWikiSuperscriptByChar",
	match: "\\'\\^",
	termRegExp: /(\^\'|\n)/mg,
	element: "sup",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "pmWikiSubscriptByChar",
	match: "\\'_",
	termRegExp: /(_\'|\n)/mg,
	element: "sub",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "pmWikiBigByChar",
	match: "\\'\\+",
	termRegExp: /(\+\'|\n)/mg,
	element: "big",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "pmWikiSmallByChar",
	match: "\\'\\-",
	termRegExp: /(\-\'|\n)/mg,
	element: "small",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "pmWikiLargerFont",
	match: "\\[\\+{1,2}",
	termRegExp: /(\+{1,2}\]|\n)/mg,
	handler: function(w)
	{
		//# <span style='font-size:120%'>big</span>, <span style='font-size:144%'>bigger</span>,
		var e = createTiddlyElement(w.output,"span");
		e.style["fontSize"] = w.matchLength==2 ? "120%" : "144%";
		w.subWikifyTerm(e,this.termRegExp);
	}
},

{
	name: "pmWikiSmallerFont",
	match: "\\[\\-{1,2}",
	termRegExp: /(\-{1,2}\]|\n)/mg,
	element: "span",
	handler: function(w)
	{
		//# <span style='font-size:83%'>small</span>, <span style='font-size:69%'>smaller</span> text
		var e = createTiddlyElement(w.output,"span");
		e.style["fontSize"] = w.matchLength==2 ? "83%" : "69%";
		w.subWikifyTerm(e,this.termRegExp);
	}
},

{
	name: "pmWikiExplicitLineBreak",
	match: "\\{2,3}\\n",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
		if(w.matchLength==4) {
			createTiddlyElement(w.output,"br");
		}
	}
},

{
	name: "pmWikiParagraph",
	match: "\\n{2,}",
	handler: function(w)
	{
		createTiddlyElement(w.output,"p");
	}
},

{
	name: "pmWikiEscapedText",
	match: "\\[=",
	lookaheadRegExp: /\[=((?:.|\n)*?)=\]/mg,
	element: "span",
	cls: "escaped",
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: "pmWikiEscapedCode",
	match: "\\[@",
	lookaheadRegExp: /\[@((?:.|\n)*?)@\]/mg,
	element: "code",
	cls: "escaped",
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: "pmWikiComment",
	match: "<!\\-\\-",
	lookaheadRegExp: /<!\-\-((?:.|\n)*?)\-\-!>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: "pmWikiDirectives",
	match: "\\(:(?:[a-z]{2,16}):\\)",
	lookaheadRegExp: /\(:(?:[a-z]{2,16}):\)/mg,
	handler: PmWikiFormatter.directives
},

{
	name: "pmWikiHtmlEntitiesEncoding",
	match: "&#?[a-zA-Z0-9]{2,8};",
	handler: function(w)
	{
		createTiddlyElement(w.output,"span").innerHTML = w.matchText;
	}
}

];

config.parsers.pmWikiFormatter = new Formatter(config.pmWikiFormatters);
config.parsers.pmWikiFormatter.format = "PmWiki";
config.parsers.pmWikiFormatter.formatTag = "PmWikiFormat";
} // end of "install only once"
//}}}
