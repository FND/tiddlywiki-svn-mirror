/***
|''Name:''|SocialTextFormatterPlugin|
|''Description:''|Pre-release - Allows Tiddlers to use [[SocialText|http://www.socialtext.com/]] text formatting|
|''Source:''|http://martinsplugins.tiddlywiki.com/index.html#SocialTextFormatterPlugin|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.8|
|''Status:''|alpha pre-release|
|''Date:''|Oct 1, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the SocialTextFormatterPlugin, which allows you to insert SocialText formated text into a TiddlyWiki.

The aim is not to fully emulate SocialText, but to allow you to create SocialText content off-line and then paste the content into your SocialText wiki later on, with the expectation that only minor edits will be required.

To use SocialText format in a Tiddler, tag the Tiddler with SocialTextFormat. See [[testSocialTextFormat]] for an example.

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

wikify = function(source,output,highlightRegExp,tiddler)
{
	if(source && source != "")
		{
		var w = new Wikifier(source,getParser(tiddler),highlightRegExp,tiddler);
		w.linkCount = 0;
		w.tableDepth = 0;
		var out = output;
		if(tiddler && tiddler.isTagged("SocialTextFormat"))
			{
//function createTiddlyElement(theParent,theElement,theID,theClass,theText)
//<div id="content-display-body" class="content-section-visible">
//<div id='wikipage'><div class="wiki">
			var d1 = createTiddlyElement(output,"div","content-display-body","content-section-visible");
			var d2 = createTiddlyElement(d1,"div","wikipage");
			out = createTiddlyElement(d2,"div",null,"wiki");
			}
		w.output = tiddler==null ? out : createTiddlyElement(out,"p");

		var time1,time0 = new Date();
		w.subWikifyUnterm(w.output);
		if(config.options.chkDisplayInstrumentation)
			{
			time1 = new Date();
			var t = tiddler ? tiddler.title : source.substr(0,10);
			if(tiddler!=null) 
				{displayMessage("Wikify '"+t+"' in " + (time1-time0) + " ms");}
			}
		}
//at point of usage can use:
//var output = w.output.nodeType==1 && w.output.nodeName=="P" ? w.output.parentNode : w.output;
};

stDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,"\\n").replace(/\r/mg,"RR"));
	createTiddlyElement(out,"br");
};

config.formatterHelpers.singleCharFormat = function(w)
{
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[0].substr(lookaheadMatch[0].length-2,1) != " ")
		{
		w.subWikifyTerm(createTiddlyElement(w.output,this.element),this.termRegExp);
		//w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	else
		{
		w.outputText(w.output,w.matchStart,w.nextMatch);
		}
};

config.socialTextFormatters = [
{
	name: "socialTextHeading",
	match: "^\\^{1,6} ?",
	termRegExp: /(\n+)/mg,
	handler: function(w)
	{
		var output = w.output.nodeType==1 && w.output.nodeName=="P" ? w.output.parentNode : w.output;
		var len = w.matchText.trim().length;
		w.subWikifyTerm(createTiddlyElement(output,"h" + len),this.termRegExp);
		w.output = createTiddlyElement(output,"p");
	}
},

{
	name: "socialTextTable",
	match: "^\\|(?:(?:.|\n)*)\\|$",
	lookaheadRegExp: /^\|(?:(?:.|\n)*)\|$/mg,
	cellRegExp: /(?:\|(?:[^\|]*)\|)(\n|$)?/mg,
	cellTermRegExp: /((?:\x20*)\|)/mg,

	handler: function(w)
	{
//	w.debug = w.output;
		var table = createTiddlyElement(w.output,"table");
		var rowContainer = createTiddlyElement(table,"tbody");
		var prevColumns = [];
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch)
			{
			var r = this.rowHandler(w,createTiddlyElement(rowContainer,"tr"),prevColumns);
			if(!r)
				{
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
		while(cellMatch && cellMatch.index == w.nextMatch)
			{
//stDebug(w.debug,"ws:"+w.source.substr(w.nextMatch,50));
//stDebug(w.debug,"mt:"+w.matchText);
			w.nextMatch++;
			var cell = createTiddlyElement(e,"td");
			w.subWikifyTerm(cell,this.cellTermRegExp);
			if(cellMatch[1])
				{// End of row
				w.nextMatch = this.cellRegExp.lastIndex;
//stDebug(w.debug,"nmcm:"+w.nextMatch);
				return true;
				}
			else
				{// Cell
				w.nextMatch--;
//stDebug(w.debug,"nm:"+w.nextMatch);
				}
			this.cellRegExp.lastIndex = w.nextMatch;
			cellMatch = this.cellRegExp.exec(w.source);
			}
		return false;
	}
},

{
	name: "socialTextWikilist",
	match: "^(?:(?:(?:\\*)|(?:#))+) ",
	lookaheadRegExp: /^(?:(?:(\*)|(#))+) /mg,
	termRegExp: /(\n+)/mg,
	handler: function(w)
	{
		var output = w.output.parentNode;
		var placeStack = [output];
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
		w.output = createTiddlyElement(output,"p");
	}
},

{
	name: "socialTextQuoteByLine",
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
	match: "^----+$\\n+",
	handler: function(w)
	{
		var output = w.output.parentNode;
		createTiddlyElement(output,"hr");
		w.output = createTiddlyElement(output,"p");
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
	name: "socialTextHtml",
	match: "^\\.html",
	lookaheadRegExp: /\.html((?:.|\n)*?)\.html/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			createTiddlyElement(w.output,"span").innerHTML = lookaheadMatch[1];
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
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
	match: '(?:".*?" ?)?<[a-z]{2,8}:',
	lookaheadRegExp: /(?:\"(.*?)\" ?)?<([a-z]{2,8}:.*?)>/mg,
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
	name: "socialTextMailTo",
	match: "[a-z]+\.[a-z\.]+@[a-z]+\.[a-z\.]+",
	lookaheadRegExp: /([a-z]+\.[a-z\.]+@[a-z]+\.[a-z\.]+)/mg,
	handler: function(w)
	{
//<a href="mailto:casey.west@socialtext.com">casey.west@socialtext.com</a>
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var text = lookaheadMatch[1];
			createTiddlyText(createExternalLink(w.output,"mailto:"+text),text);
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
	match: "\\*(?![\\s\\*])",
	lookaheadRegExp: /\*(?!\s)(?:.*?)(?!\s)\*(?=[\s\._\-])/mg,
	termRegExp: /((?!\s)\*(?=[\s\.\-_]))/mg,
	element: "strong",
	handler: config.formatterHelpers.singleCharFormat
},

{
	name: "socialTextItalic",
	match: "_(?![\\s_])",
	lookaheadRegExp: /_(?!\s)(?:.*?)(?!\s)_(?=[\s\.\*\-])/mg,
	termRegExp: /((?!\s)_(?=[\s\.\*\-]))/mg,
	element: "em",
	handler: config.formatterHelpers.singleCharFormat
},

{
	name: "socialTextStrike",
	match: "-(?![\\s\\-])",
	lookaheadRegExp: /-(?!\s)(?:.*?)(?!\s)-(?=[\s\.\*_])/mg,
	termRegExp: /((?!\s)-(?=[\s\.\*_]))/mg,
	element: "del",
	handler: config.formatterHelpers.singleCharFormat
},

{
	name: "socialTextMonoSpaced",
	match: "`(?![\\s`])",
	lookaheadRegExp: /`(?!\s)(?:.*?)(?!\s)`(?=[\s\.\*\-_])/mg,
	termRegExp: /((?!\s)`(?=[\s\.\*\-_]))/mg,
	element: "tt",
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
	name: "socialTextImage",
	match: "\\{image:",
	lookaheadRegExp: /\{image: ?(.*?)\}/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var s = createTiddlyElement(w.output,"span",null,"wafl_existence_error");
			//var img = createTiddlyElement(w.output,"img");
			//img.src = lookaheadMatch[1];
			createTiddlyText(s,lookaheadMatch[1]);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "socialTextFile",
	match: "\\{file: ?.*?\\}",
	lookaheadRegExp: /\{file: ?(.*?)\}/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var s = createTiddlyElement(w.output,"span",null,"nlw_phrase");
			createTiddlyText(createTiddlyElement(s,"span",null,"wafl_existence_error"),lookaheadMatch[1]);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "socialTextLink",
	match: "\\{link: ?.*?\\}",
	lookaheadRegExp: /\{link: ?(.*?)\}/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var s = createTiddlyElement(w.output,"span",null,"nlw_phrase");
			var a = createExternalLink(s,"#"+lookaheadMatch[1]);
			a.title = "section link";
			createTiddlyText(a,lookaheadMatch[1]);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "socialTextLink",
	match: "\\{weblog: ?.*?\\}",
	lookaheadRegExp: /\{weblog: ?(.*?)\}/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var s = createTiddlyElement(w.output,"span",null,"nlw_phrase");
			//var a = createExternalLink(s,"/tiddlytext/index.cgi?action=weblog_display;category="+lookaheadMatch[1]);
			//a.title = "weblog link";
			createTiddlyText(s,lookaheadMatch[1]);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "socialTextSection",
	match: "\\{section: ?.*?\\}",
	lookaheadRegExp: /\{section: ?(.*?)\}/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "socialTextRt",
	match: "\\{rt: ?\\d+\\}",
	lookaheadRegExp: /\{rt: ?(\d*?)\}/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var s = createTiddlyElement(w.output,"span",null,"nlw_phrase");
			var a = createExternalLink(s,"http://rt.socialtext.net/Ticket/Display.html?id="+lookaheadMatch[1]);
			createTiddlyText(a,lookaheadMatch[1]);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "socialTextPresence",
	match: "(?:aim|yahoo|ymsgr|skype|callto|asap):[a-z]+",
	lookaheadRegExp: /(aim|yahoo|ymsgr|skype|callto|asap):([a-z]+)/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var p = lookaheadMatch[1];
			var text = lookaheadMatch[2];
			var link;
			var src;
			if(p=="aim")
				{
				link = "aim:goim?screenname=" + text + "&message=hello";
				src = "http://big.oscar.aol.com/sleepleft?on_url=http://www.aim.com/remote/gr/MNB_online.gif&amp;off_url=http://www.aim.com/remote/gr/MNB_offline.gif";
				}
			else if(p=="yahoo"||p=="ymsgr")
				{
				link = "ymsgr:sendIM?"+text;
				src = "http://opi.yahoo.com/online?u=chrislondonbridge&f=.gif";
				}
			else if(p=="skype"||p=="callto")
				{
				link = "callto:"+text;
				src = "http://goodies.skype.com/graphics/skypeme_btn_small_green.gif";
				}
			else if(p=="asap")
				{
				link = "http://asap2.convoq.com/AsapLinks/Meet.aspx?l="+text;
				src = "http://asap2.convoq.com/AsapLinks/Presence.aspx?l="+text;
				}
			var s = createTiddlyElement(w.output,"span",null,"nlw_phrase");
			var a = createExternalLink(s,link);
			var img = createTiddlyElement(a,"img");
			createTiddlyText(a,text);
			img.src = src;
			img.border="0";
			img.alt = "(" + lookaheadMatch[1] + ")";
			if(p=="aim")
				{img.width="11"; img.height="13";}
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
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
