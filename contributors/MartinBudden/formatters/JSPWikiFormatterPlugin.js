/***
|''Name:''|JSPWikiFormatterPlugin|
|''Description:''|Allows Tiddlers to use [[JSPWiki|http://www.jspwiki.org/wiki/TextFormattingRules]] text formatting|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#JSPWikiFormatterPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/JSPWikiFormatterPlugin.js |
|''Version:''|0.1.2|
|''Date:''|May 7, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

|''Display unsupported macros''|<<option chkJSPWikiFormatterDisplayUnsupportedMacros>>|

This is an early release of the JSPWikiFormatterPlugin, which allows you to insert JSPWiki formated text into
a TiddlyWiki.

The aim is not to fully emulate JSPWiki, but to allow you to work with JSPWiki content off-line and then resync the content with your JSPWiki later on, with the expectation that only minor edits will be required.

To use JSPWiki format in a Tiddler, tag the Tiddler with JSPWikiFormat or set the tiddler's {{{wikiformat}}} extended field to {{{jspwiki}}}.

Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev
***/

//{{{
// Ensure that the JSPWikiFormatterPlugin is only installed once.
if(!version.extensions.JSPWikiFormatterPlugin) {
version.extensions.JSPWikiFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('JSPWikiFormatterPlugin requires TiddlyWiki 2.1 or later.');}

if(config.options.chkJspFormatterDisplayUnsupportedMacros == undefined)
	{config.options.chkJspFormatterDisplayUnsupportedMacros = false;}

JSPWikiFormatter = {}; // 'namespace' for local functions

config.macros.list.jspWikiTalkPages = {};
config.macros.list.jspWikiTalkPages.handler = function(params)
{
	return store.getJSPWikiTalkPages();
};

TiddlyWiki.prototype.getJSPWikiTalkPages = function()
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(tiddler.title.substr(0,5)=='Talk.')
			results.push(tiddler);
		});
	results.sort(function(a,b) {return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1);});
	return results;
};

TiddlyWiki.prototype.getJSPWikiPages = function()
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(!tiddler.isTagged("excludeLists") && tiddler.title.substr(0,5)!='Talk.')
			results.push(tiddler);
		});
	results.sort(function(a,b) {return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1);});
	return results;
};


config.commands.jspWikiDiscussion = {};

merge(config.commands.jspWikiDiscussion,{
	text: "discussion",
	tooltip: "Discussion",
	readOnlyText: "discussion",
	readOnlyTooltip: "Discussion"});

config.commands.jspWikiDiscussion.handler = function(event,src,title)
{
	clearMessage();
	story.displayTiddler(null,"Talk."+title,DEFAULT_VIEW_TEMPLATE);
	//story.focusTiddler(title,"text");
	return false;
};

config.commands.jspWikiDiscussion.isEnabled = function(tiddler)
{
	if(!tiddler)
		return false;
	if(tiddler.isTagged(config.parsers.jspwikiFormatter.formatTag)||(tiddler.fields&&config.parsers.jspwikiFormatter.format&&tiddler.fields["wikiformat"]==config.parsers.jspwikiFormatter.format)) {
		if(tiddler.title.indexOf("Talk.") != 0)
			return true;
	}
	return false;
};

JSPWikiFormatter.hijackListAll = function ()
{
	JSPWikiFormatter.oldListAll = config.macros.list.all.handler;
	config.macros.list.all.handler = function(params) {
		return store.getJSPWikiPages();
	};
};

JSPWikiFormatter.hijackListAll();

jspDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,'\\n').replace(/\r/mg,'RR'));
	createTiddlyElement(out,'br');
};

JSPWikiFormatter.isExternalLink = function(link)
{
	if(store.tiddlerExists(link) || store.isShadowTiddler(link)) {
		//# Definitely not an external link
		return false;
	}
	var urlRegExp = new RegExp(config.textPrimitives.urlPattern,'mg');
	if(urlRegExp.exec(link)) {
		//# Definitely an external link
		return true;
	}
	if (link.indexOf('\\')!=-1){
		//# Link contains \ so is probably an external link
		return true;
	}
	//# Otherwise assume it is not an external link
	return false;
};

JSPWikiFormatter.inlineCssHelper = function(e,fm)
{
	cssRegExp = /(?:([a-z_\-]+):([^;\|\n]+);)/mg;
	var nm = 0;
	cssRegExp.lastIndex = nm;
	var lookaheadMatch = cssRegExp.exec(fm);
	while(lookaheadMatch && lookaheadMatch.index == nm) {
		var s = lookaheadMatch[1];
		var v = lookaheadMatch[2];
		s = s=='bgcolor' ? 'backgroundColor' : s.unDash();
		e.style[s] = v;
		nm = cssRegExp.lastIndex;
		lookaheadMatch = cssRegExp.exec(fm);
	}
};

//#(?:([a-z_\-]+)\(([^\)\|\n]+)(?:\):))|(?:([a-z_\-]+):([^;\|\n]+);)
JSPWikiFormatter.wikiStyle = function(w)
// see http://www.jspwiki.org/wiki/JSPWikiStyles
{
//#jspDebug(w.output,"w:"+w.source.substr(w.matchStart,50));
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
//#jspDebug(w.output,"lm:"+lookaheadMatch);
//#jspDebug(w.output,"lm1:"+lookaheadMatch[1]);
//#jspDebug(w.output,"lm2:"+lookaheadMatch[2]);
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
		var lm1 = lookaheadMatch[1];
		var lm2 = lookaheadMatch[2];
		if(lm2) {
//#jspDebug(w.output,"c:"+config.textPrimitives.cssLookahead);
//#jspDebug(w.output,"lm2:"+lookaheadMatch[2]);
			e = createTiddlyElement(w.output,'span');
			JSPWikiFormatter.inlineCssHelper(e,lm2);
			w.subWikifyTerm(e,this.termRegExp);
			return;
		}
		switch(lm1) {
		case 'sortable':
			w.subWikifyTerm(w.output,this.termRegExp);
			break;
		case 'information':
		case 'warning':
		case 'error':
		case 'commentbox':
		case 'center':
		case 'ltr':
		case 'rtl':
		case 'small':
			w.subWikifyTerm(createTiddlyElement(w.output,'span',null,lm1),this.termRegExp);
			break;
		case 'sup':
			w.subWikifyTerm(createTiddlyElement(w.output,'sup'),this.termRegExp);
			break;
		case 'sub':
			w.subWikifyTerm(createTiddlyElement(w.output,'sub'),this.termRegExp);
			break;
		case 'strike':
			w.subWikifyTerm(createTiddlyElement(w.output,'strike'),this.termRegExp);
			break;
		default:
			w.outputText(w.output,w.matchStart,w.nextMatch);
			break;
		}
		//#w.nextMatch = this.lookaheadRegExp.lastIndex;
	} else {
		w.outputText(w.output,w.matchStart,w.nextMatch);
	}
};

JSPWikiFormatter.macros = function(w)
// see http://www.jspwiki.org/wiki/JSPWikiPlugins
{
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
		var lm1 = lookaheadMatch[1];
		switch(lm1) {
		default:
			if(config.options.chkJspFormatterDisplayUnsupportedMacros)
				w.outputText(w.output,w.matchStart,w.nextMatch);
			else
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			break;
		}
	}
};

config.jspwiki = {};
config.jspwiki.formatters = [
{
	name: 'jspHeading',
	match: '^!{1,3}',
	termRegExp: /($\n)/mg,
	handler: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output,'h'+(4-w.matchLength)),this.termRegExp);
	}
},

{
	name: 'jspList',
	match: '^(?:[\\*#;:]+)',
	lookaheadRegExp: /^(?:(?:(\*)|(#)|(;)|(:))+)/mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0, currType = null;
		var listLevel, listType, itemType;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			if(lookaheadMatch[1]) {
				listType = 'ul';
				itemType = 'li';
			} else if(lookaheadMatch[2]) {
				listType = 'ol';
				itemType = 'li';
			} else if(lookaheadMatch[3]) {
				listType = 'dl';
				itemType = 'dt';
			} else if(lookaheadMatch[4]) {
				listType = 'dl';
				itemType = 'dd';
			}
			listLevel = lookaheadMatch[0].length;
			w.nextMatch += lookaheadMatch[0].length;
			var t;
			if(listLevel > currLevel) {
				for(t=currLevel; t<listLevel; t++)
					stack.push(createTiddlyElement(stack[stack.length-1],listType));
			} else if(listLevel < currLevel) {
				for(t=currLevel; t>listLevel; t--)
					stack.pop();
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
	}
},

{
	name: 'jspTable',
	match: '^\\|',
	lookaheadRegExp: /^\|/mg,
//#	cellRegExp: /(\|(?:[^\|\n]*)\|?)($|\n)?/mg,
	cellRegExp: /\|.*?\|?[$\n]?/mg,
	cellTermRegExp: /($|\n|\|)/mg,
	debug: null,
	handler: function(w)
	{
		//# this.debug = createTiddlyElement(w.output,'p');
		var table = createTiddlyElement(w.output,'table',null,'wikitable');
		var prevColumns = [];
		var rowContainer = createTiddlyElement(table,'tbody');
		var rowIndex = 0;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			rowIndex++;
			var r = this.rowHandler(w,createTiddlyElement(rowContainer,'tr',null,rowIndex&1?'odd':null),prevColumns);
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
			w.nextMatch++;// skip the |
			var chr = w.source.substr(w.nextMatch,1);
			// another | indicates a table heading
			if(chr == '|') {
				cell = createTiddlyElement(e,'th');
				w.nextMatch++;
			} else {
				cell = createTiddlyElement(e,'td');
			}
			w.subWikifyTerm(cell,this.cellTermRegExp);
			chr = w.source.substr(w.nextMatch,1);
//#jspDebug(this.debug,"code:"+chr.charCodeAt(0));
			if(!chr||chr=='\n') {
				// End of row
				w.nextMatch++; // skip over the \n
				return true;
			}
			// Cell
			w.nextMatch--;// rewind to before the |
			this.cellRegExp.lastIndex = w.nextMatch;
			cellMatch = this.cellRegExp.exec(w.source);
		}
		return false;
	}
},

{
	name: 'jspRule',
	match: '^---+$\\n?',
	handler: function(w)
	{
		createTiddlyElement(w.output,'hr');
	}
},

{
	name: 'jspMonospacedByLine',
	match: '^\\{\\{\\{\\n',
	lookaheadRegExp: /^\{\{\{\n((?:^[^\n]*\n)+?)(^\}\}\}$\n?)/mg,
	element: 'pre',
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: 'macro',
	match: '<<',
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
	name: 'jspMacro',
	match: '\\[\\{',
	lookaheadRegExp: /\[\{(.*?)\}\]/mg,
	handler: JSPWikiFormatter.macros
},

{
	name: 'jspExplicitLink',
	match: '\\[',
	lookaheadRegExp: /\[(.*?)(?:\|(.*?))?\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			var link = lookaheadMatch[2] ? lookaheadMatch[2] : text;
			var e = JSPWikiFormatter.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic,w.tiddler);
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'jspUnWikiLink',
	match: config.textPrimitives.unWikiLink+config.textPrimitives.wikiLink,
	handler: function(w)
	{
		w.outputText(w.output,w.matchStart+1,w.nextMatch);
	}
},

{
	name: 'jspWikiLink',
	match: config.textPrimitives.wikiLink,
	handler: function(w)
	{
		if(w.matchStart > 0) {
			var preRegExp = new RegExp(config.textPrimitives.anyLetter,'mg');
			preRegExp.lastIndex = w.matchStart-1;
			var preMatch = preRegExp.exec(w.source);
			if(preMatch.index == w.matchStart-1) {
				w.outputText(w.output,w.matchStart,w.nextMatch);
				return;
			}
		}
		var output = w.output;
		if(w.autoLinkWikiWords == true || store.isShadowTiddler(w.matchText)) {
			output = createTiddlyLink(w.output,w.matchText,false,null,w.isStatic,w.tiddler);
		}
		w.outputText(output,w.matchStart,w.nextMatch);
	}
},

{
	name: 'jspUrlLink',
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: 'jspBold',
	match: '__',
	termRegExp: /(__|(?=\n\n))/mg,
	element: 'strong',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'jspItalic',
	match: "''",
	termRegExp: /(''|(?=\n\n))/mg,
	element: 'em',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'jspMonospaced',
	match: '\\{\\{\\{',
	lookaheadRegExp: /\{\{\{((?:.|\n)*?)\}\}\}/mg,
	element: 'code',
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: 'jspWikiStyle',
	match: '%%(?:(?:[a-z]+)|(?:\\([a-z:;\\-]+\\)))',
	lookaheadRegExp: /%%(?:([a-z]+)|(?:\(([a-z:;\-]+)\)))/mg,
	termRegExp: /(\%\%)/mg,
	handler: JSPWikiFormatter.wikiStyle
},

{
	name: 'jspParagraph',
	match: '\\n\\n',
	handler: function(w)
	{
		w.output = createTiddlyElement(w.output,'p');
	}
},

{
	name: 'jspLineBreak',
	match: '\\\\|<br ?/?>',
	handler: function(w)
	{
		createTiddlyElement(w.output,'br');
	}
},

{
	name: 'jspComment',
	match: '<!\\-\\-',
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
	name: 'jspHtmlEntitiesEncoding',
	match: '&#?[a-zA-Z0-9]{2,8};',
	handler: function(w)
	{
		createTiddlyElement(w.output,'span').innerHTML = w.matchText;
	}
}
];

config.parsers.jspwikiFormatter = new Formatter(config.jspwiki.formatters);
config.parsers.jspwikiFormatter.format = 'jspwiki';
config.parsers.jspwikiFormatter.formatTag = 'JSPWikiFormat';
} // end of 'install only once'
//}}}
