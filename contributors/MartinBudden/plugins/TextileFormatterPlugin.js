/***
|''Name:''|TextileFormatterPlugin|
|''Description:''|Allows Tiddlers to use Textile text formatting|
|''Source:''|http://martinswiki.com/prereleases.html#TextileFormatterPlugin - for pre-release|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.2|
|''Status:''|alpha pre-release|
|''Date:''|Oct 26, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the TextileFormatterPlugin, which allows you to insert Textile formated text into a
TiddlyWiki.

The aim is not to fully emulate Textile, but to allow you to create Textile content off-line
and then paste the content into your Textile wiki later on, with the expectation that only minor
edits will be required.

To use Textile format in a Tiddler, tag the Tiddler with TextileFormat.
See [[testTextileFormat]] for an example.

Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev

This is an early alpha release, with (at least) the following known issues:

***/

//{{{
// Ensure that the TextileFormatterPlugin is only installed once.
if(!version.extensions.TextileFormatterPlugin) {
version.extensions.TextileFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("TextileFormatterPlugin requires TiddlyWiki 2.1 or later.");}

textileFormatter = {}; // "namespace" for local functions

textileDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,"\\n").replace(/\r/mg,"RR"));
	createTiddlyElement(out,"br");
};

config.formatterHelpers.singleCharFormat = function(w)
{
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[0].substr(lookaheadMatch[0].length-2,1) != " ") {
		w.subWikifyTerm(createTiddlyElement(w.output,this.element),this.termRegExp);
		w.nextMatch = this.lookaheadRegExp.lastIndex;
	} else {
		w.outputText(w.output,w.matchStart,w.nextMatch);
	}
};

textileFormatter.setAttributesFromParams = function(e,p)
{
	var re = /\s*(.*?)=(?:(?:"(.*?)")|(?:'(.*?)')|((?:\w|%|#)*))/mg;
	var match = re.exec(p);
	while(match) {
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

config.textileFormatters = [
{
	name: "textileHeading",
	match: "^h[1-6](?:(?:\\(.*?\\))|(?:\\{.*?\\})|(?:\\[.*?\\]))?\\. ",
	lookaheadRegExp: /^h([1-6])(?:(?:\((.*?)\))|(?:\{(.*?)\})|(?:\[(.*?)\]))?\. /mg,
//	match: "^h[1-6]. ",
//	lookaheadRegExp: /^h([1-6])\. /mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			w.subWikifyTerm(createTiddlyElement(w.output,"h"+lookaheadMatch[1]),this.termRegExp);
		}
	}
},
{
	name: "textiletTable",
	match: "^\\|(?:(?:.|\n)*)\\|$",
	lookaheadRegExp: /^\|(?:(?:.|\n)*)\|$/mg,
	cellRegExp: /(?:\|(?:[^\|]*)\|)(\n|$)?/mg,
	cellTermRegExp: /((?:\x20*)\|)/mg,
	handler: function(w)
	{
		var table = createTiddlyElement(w.output,"table");
		var rowContainer = createTiddlyElement(table,"tbody");
		var prevColumns = [];
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			var r = this.rowHandler(w,createTiddlyElement(rowContainer,"tr"),prevColumns);
			if(!r) {
				w.nextMatch++;
				break;
			}
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
	},
	rowHandler: function(w,e,prevColumns)
	{
		this.cellRegExp.lastIndex = w.nextMatch;
		var cellMatch = this.cellRegExp.exec(w.source);
		while(cellMatch && cellMatch.index == w.nextMatch) {
			w.nextMatch++;
			var cell = createTiddlyElement(e,"td");
			w.subWikifyTerm(cell,this.cellTermRegExp);
			if(cellMatch[1]) {
				// End of row
				w.nextMatch = this.cellRegExp.lastIndex;
				return true;
			} else {
				// Cell
				w.nextMatch--;
			}
			this.cellRegExp.lastIndex = w.nextMatch;
			cellMatch = this.cellRegExp.exec(w.source);
		}
		return false;
	}
},
{
	name: "textileList",
	match: "^[\\*#]+ ",
	lookaheadRegExp: /^([\*#])+ /mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0, currType = null;
		var listLevel, listType;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			listType = lookaheadMatch[1] == "*" ? "ul" : "ol";
			listLevel = lookaheadMatch[0].length;
			w.nextMatch += listLevel;
			if(listLevel > currLevel){
				for(var i=currLevel; i<listLevel; i++) {
					stack.push(createTiddlyElement(stack[stack.length-1],listType));
				}
			} else if(listLevel < currLevel) {
				for(i=currLevel; i>listLevel; i--) {
					stack.pop();
				}
			} else if(listLevel == currLevel && listType != currType) {
				stack.pop();
				stack.push(createTiddlyElement(stack[stack.length-1],listType));
			}
			currLevel = listLevel;
			currType = listType;
			var e = createTiddlyElement(stack[stack.length-1],"li");
			w.subWikifyTerm(e,this.termRegExp);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
	}
},
{
//(class)(#id){style}[language]
	name: "textileBlockQuote",
	match: "^bq(?:(?:\\(.*?\\))|(?:\\{.*?\\})|(?:\\[.*?\\]))?\\. ",
	lookaheadRegExp: /^bq(?:(?:\((#?)(.*?)\))|(?:\{(.*?)\})|(?:\[(.*?)\]))?\. /mg,
	termRegExp: /(\n)/mg,
	element: "blockquote",
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var e = createTiddlyElement(w.output,this.element);
			w.subWikifyTerm(e,this.termRegExp);
		}
	}
},
{
	name: "textileRule",
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
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[1]) {
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			invokeMacro(w.output,lookaheadMatch[1],lookaheadMatch[2],w,w.tiddler);
		}
	}
},
{
//"This is a link (optional title)":http://www.textism.com
	name: "textileExternalLink",
	match: '(?:".*?" ?):?[a-z]{2,8}:',
	lookaheadRegExp: /(?:\"(.*?)(?:\((.*?)\))?\" ?):?(.*?)(?=\s|$)/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var link = lookaheadMatch[3];
			var text = lookaheadMatch[1] ? lookaheadMatch[1] : link;
			var e = createExternalLink(w.output,link);
			if(lookaheadMatch[2])
				e.title = lookaheadMatch[2];
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},
{
	name: "textileUrlLink",
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},
{
// !/common/textist.gif(optional alt text)!
	name: "textileImage",
	match: "!.*?!",
	lookaheadRegExp: /!(.*?)(?:\((.*?)\))?!/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var img = createTiddlyElement(w.output,"img");
			img.src = lookaheadMatch[1];
			if(lookaheadMatch[2]) {
				img.title = lookaheadMatch[2];
			}
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},
{
	name: "textileBold",//checked
	match: "\\*(?![\\s\\*])",
	lookaheadRegExp: /\*(?!\s)(?:.*?)(?!\s)\*(?=[\s\._\-])/mg,
	termRegExp: /((?!\s)\*(?=[\s\.\-_]))/mg,
	element: "strong",
	handler: config.formatterHelpers.singleCharFormat
},
{
	name: "textileItalic",//checked
	match: "_(?![\\s_])",
	lookaheadRegExp: /_(?!\s)(?:.*?)(?!\s)_(?=[\s\.\*\-])/mg,
	termRegExp: /((?!\s)_(?=[\s\.\*\-]))/mg,
	element: "em",
	handler: config.formatterHelpers.singleCharFormat
},
{
	name: "textileUnderline",
	match: "_(?![\\s|_])",
	lookaheadRegExp: /_(?!\s)(?:.*?)(?!\s)_(?=\s)/mg,
	termRegExp: /((?!\s)_(?=\s))/mg,
	element: "u",
	handler: config.formatterHelpers.singleCharFormat
},
{
	name: "textileStrike",//checked
	match: "-(?![\\s\\-])",
	lookaheadRegExp: /-(?!\s)(?:.*?)(?!\s)-(?=[\s\.\*_])/mg,
	termRegExp: /((?!\s)-(?=[\s\.\*_]))/mg,
	element: "strike",
	handler: config.formatterHelpers.singleCharFormat
},
{
	name: "textileSuperscript",
	match: "\\^(?![\\s|\\^])",
	lookaheadRegExp: /\^(?!\s)(?:.*?)(?!\s)\^(?=\s)/mg,
	termRegExp: /((?!\s)\^(?=\s))/mg,
	element: "sup",
	handler: config.formatterHelpers.singleCharFormat
},
{
	name: "textileSubscript",
	match: "~(?![\\s|~])",
	lookaheadRegExp: /~(?!\s)(?:.*?)(?!\s)~(?=\s)/mg,
	termRegExp: /((?!\s)~(?=\s))/mg,
	element: "sub",
	handler: config.formatterHelpers.singleCharFormat
},
{
	name: "textileCitation",
	match: "\\?\\?",
	termRegExp: /(\?\?)/mg,
	element: "cite",
	handler: config.formatterHelpers.createElementAndWikify
},
{
	name: "textileMonospacedByChar",
	match: "\\{\\{",
	lookaheadRegExp: /\{\{((?:.|\n)*?)\}\}/mg,
	element: "code",
	handler: config.formatterHelpers.enclosedTextHelper
},
{
	name: "textileParagraph",
	match: "\\n{2,}",
	handler: function(w)
	{
		createTiddlyElement(w.output,"p");
	}
},
{
	name: "textileExplicitLineBreak",
	match: "<br ?/?>|\\n",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
	}
},
{
	name: "textileComment",
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
	name: "textilemdash",
	match: "--",
	handler: function(w) {createTiddlyElement(w.output,"span").innerHTML = "&mdash;";}
},
{
	name: "textilendash",
	match: " - ",
	handler: function(w) {createTiddlyElement(w.output,"span").innerHTML = " &ndash; ";}
},
{
	name: "textileTrademark",
	match: "\\(TM\\)",
	handler: function(w) {createTiddlyElement(w.output,"span").innerHTML = "&trade;";}
},
{
	name: "textileRegistered",
	match: "\\(R\\)",
	handler: function(w) {createTiddlyElement(w.output,"span").innerHTML = "&reg;";}
},
{
	name: "textileCopyright",
	match: "\\(C\\)",
	handler: function(w) {createTiddlyElement(w.output,"span").innerHTML = "&copy;";}
},
{
	name: "textileElipsis",
	match: "\\.\\.\\.",
	handler: function(w) {createTiddlyElement(w.output,"span").innerHTML = "&hellip;";}
},
{
	name: "textileHtmlEntitiesEncoding",
	match: "&#?[a-zA-Z0-9]{2,8};",
	handler: function(w)
	{
		createTiddlyElement(w.output,"span").innerHTML = w.matchText;
	}
},
{
	name: "textileHtmlTag",
	match: "<(?:[a-zA-Z]{2,}|a)(?:\\s*(?:(?:.*?)=[\"']?(?:.*?)[\"']?))*?>",
	lookaheadRegExp: /<([a-zA-Z]+)((?:\s+(?:.*?)=["']?(?:.*?)["']?)*?)?\s*(\/)?>(?:\n?)/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var e =createTiddlyElement(w.output,lookaheadMatch[1]);
			if(lookaheadMatch[2]) {
				textileFormatter.setAttributesFromParams(e,lookaheadMatch[2]);
			}
			if(lookaheadMatch[3]) {
				w.nextMatch = this.lookaheadRegExp.lastIndex;// empty tag
			} else {
				w.subWikify(e,"</"+lookaheadMatch[1]+">");
			}
		}
	}
}/*,
{
	name: "textileMatchedQuotes",
	match: '(?=\s)"',
	lookaheadRegExp: /\"((?:.|\n)*?)\"/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			createTiddlyElement(w.output,"span").innerHTML = "&ldquo;" + lookaheadMatch[1] + "&rdquo;";
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
}*/
];

config.parsers.textileFormatter = new Formatter(config.textileFormatters);
config.parsers.textileFormatter.format = 'Textile';
config.parsers.textileFormatter.formatTag = 'TextileFormat';
} // end of "install only once"
//}}}
