/***
|''Name:''|SnipSnapFormatterPlugin|
|''Description:''|Pre-release - Allows Tiddlers to use [[SnipSnap|http://snipsnap.org/space/snipsnap-help]] text formatting|
|''Source:''|http://martinswiki.com/martinsprereleases.html#SnipSnapFormatterPlugin - for pre-release|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.8|
|''Status:''|alpha pre-release|
|''Date:''|Oct 28, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the SnipSnapFormatterPlugin, which allows you to insert SnipSnap formated text
into a TiddlyWiki.

The aim is not to fully emulate SnipSnap, but to allow you to create SnipSnap content off-line and then paste
the content into your SnipSnap later on, with the expectation that only minor edits will be required.

To use SnipSnap format in a Tiddler, tag the Tiddler with SnipSnapFormat. See [[testSnipSnapFormat]] for an 
example.

See http://snipsnap.org/theme/default.css and especially http://snipsnap.org/theme/css/wiki.css for css.

This is an early alpha release, with (at least) the following known issues:
#Tables not supported

***/

//{{{

// Ensure that the SnipSnapFormatterPlugin is only installed once.
if(!version.extensions.SnipSnapFormatterPlugin) {
version.extensions.SnipSnapFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("SnipSnapFormatterPlugin requires TiddlyWiki 2.1 or later.");}

snipSnapDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,"\\n").replace(/\r/mg,"RR"));
	createTiddlyElement(out,"br");
};

/*wikify = function(source,output,highlightRegExp,tiddler)
{
	if(source && source != "") {
		var w = new Wikifier(source,getParser(tiddler),highlightRegExp,tiddler);
		w.output = tiddler==null ? output : createTiddlyElement(output,"p");
		w.subWikifyUnterm(w.output);
	}
};*/

config.snipSnapFormatters = [
{
	name: "snipSnapHeading",
	match: "^(?:(?:1 )|(?:1\\.1 ))",
	lookaheadRegExp: /^(?:(1 )|(1\.1 ))/mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var h = "h1";
			if(lookaheadMatch[2]) {
				//1.1
				h = "h2";
			}
			w.subWikifyTerm(createTiddlyElement(w.output,h),this.termRegExp);
		}
	}
},

{
	name: "snipSnapList",
	match: "^(?:(?:\\* )|(?:\\- )|(?:1\\. )|(?:A\\. )|(?:a\\. )|(?:I\\. )|(?:i\\. )|(?:g\\. )|(?:h\\. )|(?:k\\. )|(?:j\\. ))",
	lookaheadRegExp: /^(?:(\* )|(\- )|(1\. )|(A\. )|(a\. )|(I\. )|(i\. )|(g\. )|(h\. )|(k\. )|(j\. ))/mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var placeStack = [w.output];
		var currLevel = 0;
		var currType = null;
		var listLevel, listType, itemType;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			listType = "ol";
			itemType = "li";
			listLevel = lookaheadMatch[0].length-2;
			var style = null;
			if(lookaheadMatch[1]) {
				//*
				listType = "ul";
				listLevel = lookaheadMatch[0].length-1;
				style = "circle";
			} else if(lookaheadMatch[2]) {
				//-
				listType = "ul";
				listLevel = lookaheadMatch[0].length-1;
				style = "square";
			} else if(lookaheadMatch[3]) {
				//1.
				style = "decimal";
			} else if(lookaheadMatch[4]) {
				//A.
				style = "upper-alpha";
			} else if(lookaheadMatch[5]) {
				//a.
				style = "lower-alpha";
			} else if(lookaheadMatch[6]) {
				//I.
				style = "upper-roman";
			} else if(lookaheadMatch[7]) {
				//i.
				style = "lower-roman";
			} else if(lookaheadMatch[8]) {
				//g.
				style = "lower-greek";
			} else if(lookaheadMatch[9]) {
				//h.
				style = "hiragana";
			} else if(lookaheadMatch[10]) {
				//k.
				style = "katakana";
			} else if(lookaheadMatch[11]) {
				//j.
				style = "hebrew";
			}
			w.nextMatch += lookaheadMatch[0].length;
			if(listLevel > currLevel) {
				for(var i=currLevel; i<listLevel; i++) {
					placeStack.push(createTiddlyElement(placeStack[placeStack.length-1],listType));
				}
			} else if(listLevel < currLevel) {
				for(i=currLevel; i>listLevel; i--) {
					placeStack.pop();
				}
			} else if(listLevel == currLevel && listType != currType) {
				placeStack.pop();
				placeStack.push(createTiddlyElement(placeStack[placeStack.length-1],listType));
			}
			currLevel = listLevel;
			currType = listType;
			var e = createTiddlyElement(placeStack[placeStack.length-1],itemType);
			if(config.browser.isIE)
				{
				e.style["list-style-type"] = style;
			} else {
				e.style["listStyleType"] = style;
			}
			w.subWikifyTerm(e,this.termRegExp);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
	}
},

{
	name: "snipSnapRule",
	match: "^----+$\\n?",
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
	name: "snipSnapExplicitLineBreak",
	match: "\\\\\\\\\\\\",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
	}
},

{
	name: "snipSnapEscapeChar",
	match: "\\\\.",
	handler: function(w)
	{
		w.outputText(w.output,w.matchStart+1,w.nextMatch);
	}
},

{
	name: "snipSnapExplicitLink",
	match: "\\[",
	lookaheadRegExp: /\[(.*?)\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var link = lookaheadMatch[1];
			var text = link;
			createTiddlyText(createTiddlyLink(w.output,link,false,null,w.isStatic),text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: "snipSnapExternalLink",
	match: "{link:",
	lookaheadRegExp: /\{link:(?:(.*?)\|)(.*?)\}/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var link = lookaheadMatch[2];
			var text = lookaheadMatch[1] ? lookaheadMatch[1] : link;
			var e = createExternalLink(w.output,link);
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: "snipSnapNotWikiLink",
	match: "!" + config.textPrimitives.wikiLink,
	handler: function(w)
	{
		w.outputText(w.output,w.matchStart+1,w.nextMatch);
	}
},

{
	name: "snipSnapWikiLink",
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
	name: "snipSnapUrlLink",
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: "snipSnapBoldByChar",
	match: "__",
	termRegExp: /(__)/mg,
	element: "strong",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "snipSnapItalicByChar",
	match: "~~",
	termRegExp: /(~~)/mg,
	element: "em",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "snipSnapStrikeByChar",
	match: "--(?!\\s|$)",
	termRegExp: /((?!\s)--|(?=\n\n))/mg,
	element: "strike",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "snipSnapMonospacedByChar",
	match: "\\{\\{\\{",
	lookaheadRegExp: /\{\{\{((?:.|\n)*?)\}\}\}/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			createTiddlyElement(w.output,"code",null,null,lookaheadMatch[1]);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: "snipSnapParagraph",
	match: "\\n{2,}",
	handler: function(w)
	{
		w.output = createTiddlyElement(w.output,"p");
	}
},

{
	name: "snipSnapHtmlEntitiesEncoding",
	match: "&#?[a-zA-Z0-9]{2,8};",
	handler: function(w)
		{
		createTiddlyElement(w.output,"span").innerHTML = w.matchText;
		}
}

];

config.parsers.snipSnapFormatter = new Formatter(config.snipSnapFormatters);
config.parsers.snipSnapFormatter.formatTag = "SnipSnapFormat";
} // end of "install only once"
//}}}
