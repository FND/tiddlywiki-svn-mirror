/***
|''Name:''|BaseFormatterPlugin|
|''Description:''|Allows Tiddlers to use Base text formatting|
|''Source:''|http://martinswiki.com/prereleases.html#BaseFormatterPlugin|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.8|
|''Status:''|alpha pre-release|
|''Date:''|Nov 5, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the BaseFormatterPlugin, which allows you to insert Base formated text into
a TiddlyWiki.

The aim is not to fully emulate Base, but to allow you to create Base content off-line and then paste
the content into your Base wiki later on, with the expectation that only minor edits will be required.

To use Base format in a Tiddler, tag the Tiddler with BaseFormat. See [[testBaseFormat]] for an example.

Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev

This is an early alpha release, with (at least) the following known issues:
***/

//{{{
// Ensure that the BaseFormatterPlugin is only installed once.
if(!version.extensions.BaseFormatterPlugin) {
version.extensions.BaseFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("BaseFormatterPlugin requires TiddlyWiki 2.1 or later.");}

baseFormatter = {}; // "namespace" for local functions

baseDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,"\\n").replace(/\r/mg,"RR"));
	createTiddlyElement(out,"br");
};

wikify = function(source,output,highlightRegExp,tiddler)
{
	if(source && source !== "") {
		var w = new Wikifier(source,getParser(tiddler),highlightRegExp,tiddler);
		w.output = tiddler ? createTiddlyElement(output,"p") : output;
		w.subWikifyUnterm(w.output);
	}
//at point of usage can use:
//var output = w.output.nodeType==1 && w.output.nodeName=="P" ? w.output.parentNode : w.output;
};

config.formatterHelpers.setAttributesFromParams = function(e,p)
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

config.baseFormatters = [
{
	name: "baseHeading",
	match: "^={1,6}",
	termRegExp: /(={1,6}$\n)/mg,
	handler: function(w)
	{
		var output = w.output.nodeType==1 && w.output.nodeName=="P" ? w.output.parentNode : w.output;
		w.subWikifyTerm(createTiddlyElement(output,"h"+w.matchLength),this.termRegExp);
		w.output = createTiddlyElement(output,"p");
	}
},

{
	name: "baseList",
	match: "^[\\*#;:]+ ",
	lookaheadRegExp: /^([\*#;:])+ /mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var output = w.output.nodeType==1 && w.output.nodeName=="P" ? w.output.parentNode : w.output;
		var stack = [output];
		var currLevel = 0, currType = null;
		var listType, itemType;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			switch(lookaheadMatch[1]) {
			case "*":
				listType = "ul";
				itemType = "li";
				break;
			case "#":
				listType = "ol";
				itemType = "li";
				break;
			case ";":
				listType = "dl";
				itemType = "dt";
				break;
			case ":":
				listType = "dl";
				itemType = "dd";
				break;
			default:
				break;
			}
			var listLevel = lookaheadMatch[0].length;
			w.nextMatch += listLevel;
			if(listLevel > currLevel) {
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
			var e = createTiddlyElement(stack[stack.length-1],itemType);
			w.subWikifyTerm(e,this.termRegExp);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
		w.output = createTiddlyElement(output,"p");
	}
},
{
	name: "baseRule",
	match: "^---+$\\n?",
	handler: function(w)
	{
		var output = w.output.nodeType==1 && w.output.nodeName=="P" ? w.output.parentNode : w.output;
		createTiddlyElement(output,"hr");
		w.output = createTiddlyElement(output,"p");
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
	name: "baseExplicitLink",
	match: "\\[\\[",
	lookaheadRegExp: /\[\[(.*?)(?:\|(.*?))?\]\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var link = lookaheadMatch[1];
			var text = lookaheadMatch[2] ? lookaheadMatch[2] : link;
			var e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
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
		if(w.matchStart > 0) {
			var preRegExp = new RegExp(config.textPrimitives.anyLetter,"mg");
			preRegExp.lastIndex = w.matchStart-1;
			var preMatch = preRegExp.exec(w.source);
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
	name: "baseUrlLink",
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: "baseBoldByChar",
	match: "\\*\\*",
	termRegExp: /(\*\*|(?=\n\n))/mg,
	element: "strong",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseItalicByChar",
	match: "//",
	termRegExp: /(\/\/|(?=\n\n))/mg,
	element: "em",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseUnderlineByChar",
	match: "__",
	termRegExp: /(__|(?=\n\n))/mg,
	element: "u",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseStrikeByChar",
	match: "--(?!\\s|$)",
	termRegExp: /((?!\s)--|(?=\n\n))/mg,
	element: "strike",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseSuperscriptByChar",
	match: "\\^\\^",
	termRegExp: /(\^\^|(?=\n\n))/mg,
	element: "sup",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseSubscriptByChar",
	match: "~~",
	termRegExp: /(~~|(?=\n\n))/mg,
	element: "sub",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "baseMonospacedByChar",
	match: "\\{\\{\\{",
	lookaheadRegExp: /\{\{\{((?:.|\n)*?)\}\}\}/mg,
	element: "code",
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: "baseParagraph",
	match: "\\n{2,}",
	handler: function(w)
	{
		w.output = createTiddlyElement(w.output.parentNode,"p");
	}
},

{
	name: "baseLineBreak",
	match: "\\n|<br ?/?>",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
	}
},

//# note . is anything except \n, so (?:.|\n) matches anything. I think [] is equivalent.
{
	name: "baseComment",
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
	name: "baseHtmlEntitiesEncoding",
	match: "&#?[a-zA-Z0-9]{2,8};",
	handler: function(w)
	{
		createTiddlyElement(w.output,"span").innerHTML = w.matchText;
	}
},

{
	name: "baseHtmlTag",
	match: "<(?:[a-zA-Z]{2,}|a)(?:\\s*(?:[a-z]*?=[\"']?[^>]*?[\"']?))*?>",
	lookaheadRegExp: /<([a-zA-Z]+)((?:\s+[a-z]*?=["']?[^>\/\"\']*?["']?)*?)?\s*(\/)?>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var e =createTiddlyElement(w.output,lookaheadMatch[1]);
			if(lookaheadMatch[2]) {
				config.formatterHelpers.setAttributesFromParams(e,lookaheadMatch[2]);
			}
			if(lookaheadMatch[3]) {
				w.nextMatch = this.lookaheadRegExp.lastIndex;// empty tag
			} else {
				w.subWikify(e,"</"+lookaheadMatch[1]+">");
			}
		}
	}
}
];

config.parsers.baseFormatter = new Formatter(config.baseFormatters);
config.parsers.baseFormatter.formatTag = "BaseFormat";
} // end of "install only once"
//}}}
