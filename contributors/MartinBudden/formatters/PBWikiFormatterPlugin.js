/***
|''Name:''|PBWikiFormatterPlugin|
|''Description:''|Allows Tiddlers to use [[PBWiki|http://yummy.pbwiki.com/WikiStyle]] text formatting|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#PBWikiFormatterPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/PBWikiFormatterPlugin.js |
|''Version:''|0.2.1|
|''Date:''|May 7, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the PBWikiFormatterPlugin, which allows you to insert PBWiki formated text
into a TiddlyWiki.

The aim is not to fully emulate PBWiki, but to allow you to work with PBWiki content off-line and then resync the content with your PBWiki later on, with the expectation that only minor edits will be required.

To use PBWiki format in a Tiddler, tag the Tiddler with PBWikiFormat or set the tiddler's {{{wikiformat}}} extended field to {{{pbwiki}}}

Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev

!!!Issues
There are (at least) the following known issues:
# Strikethrough yet not supported.
# Vertical bars to create |boxes| not supported.
# Space at the begining of a line to create a box not supported.
# email links not supported.
# <top>, <toc>, <random> and <views> not supported.

***/

//{{{
// Ensure that the PBWikiFormatterPlugin is only installed once.
if(!version.extensions.PBWikiFormatterPlugin) {
version.extensions.PBWikiFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('PBWikiFormatterPlugin requires TiddlyWiki 2.1 or later.');}

PBWikiFormatter = {}; // 'namespace' for local functions

pbDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,'\\n').replace(/\r/mg,'RR'));
	createTiddlyElement(out,'br');
};

PBWikiFormatter.setAttributesFromParams = function(e,p)
{
	var re = /\s*(.*?)=(?:(?:"(.*?)")|(?:'(.*?)')|((?:\w|%|#)*))/mg;
	var match = re.exec(p);
	while(match) {
		var s = match[1].unDash();
		if(s=='bgcolor') {
			s = 'backgroundColor';
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

config.pbwiki = {};
config.pbwiki.formatters = [
{
	name: 'PBWikiHeading',
	match: '^!{1,6}',
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output,'h' + w.matchLength),this.termRegExp);
	}
},
{
	name: 'PBWikiTable',
	match: '^\\|(?:[^\\n]*)\\|$',
	lookaheadRegExp: /^\|([^\n]*)\|$/mg,
	rowTermRegExp: /(\|$\n?)/mg,
	cellRegExp: /(?:\|([^\n\|]*)\|)|(\|$\n?)/mg,
	cellTermRegExp: /((?:\x20*)\|)/mg,
	handler: function(w)
	{
		var table = createTiddlyElement(w.output,'table');
		var rowContainer = createTiddlyElement(table,'tbody');
		var prevColumns = [];
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			this.rowHandler(w,createTiddlyElement(rowContainer,'tr'),prevColumns);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
	},
	rowHandler: function(w,e,prevColumns)
	{
		var col = 0;
		this.cellRegExp.lastIndex = w.nextMatch;
		var cellMatch = this.cellRegExp.exec(w.source);
		while(cellMatch && cellMatch.index == w.nextMatch) {
			if(cellMatch[2]) {
				// End of row
				w.nextMatch = this.cellRegExp.lastIndex;
				break;
			} else {
				// Cell
				w.nextMatch++;
				var spaceLeft = false;
				var chr = w.source.substr(w.nextMatch,1);
				while(chr == ' ') {
					spaceLeft = true;
					w.nextMatch++;
					chr = w.source.substr(w.nextMatch,1);
				}
				var cell = createTiddlyElement(e,'td');
				prevColumns[col] = {rowSpanCount:1, element:cell};
				w.subWikifyTerm(cell,this.cellTermRegExp);
				if(w.matchText.substr(w.matchText.length-2,1) == ' ') {
					// spaceRight
					cell.align = spaceLeft ? 'center' : 'left';
				} else if(spaceLeft) {
					cell.align = 'right';
				}
				w.nextMatch--;
			}
			col++;
			this.cellRegExp.lastIndex = w.nextMatch;
			cellMatch = this.cellRegExp.exec(w.source);
		}
	}
},
{
	name: 'PBWikiList',
	match: '^[\\*#]+ ',
	lookaheadRegExp: /^([\*#])+ /mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0, currType = null;
		var listLevel, listType;
		var itemType = 'li';
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			listType = lookaheadMatch[1] == '*' ? 'ul' : 'ol';
			listLevel = lookaheadMatch[0].length;
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
	}
},
{
	name: 'PBWikiRule',
	match: '^---+$\\n?',
	handler: function(w) {createTiddlyElement(w.output,'hr');}
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
	name: 'PBWikiExplicitLink',
	match: '\\[',
	lookaheadRegExp: /\[(.*?)(?:\|(.*?))?\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var link = lookaheadMatch[1];
			var text = lookaheadMatch[2] ? lookaheadMatch[2] : link;
			if(/.*\.(?:gif|jpg|png)/g.exec(link)) {
				var img = createTiddlyElement(w.output,'img');
				if(lookaheadMatch[2]) {
					img.title = text;
				}
				img.src = link;
			} else {
				var e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
				createTiddlyText(e,text);
			}
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},
{
	name: 'PBWikiNotWikiLink',
	match: '~' + config.textPrimitives.wikiLink,
	handler: function(w) {w.outputText(w.output,w.matchStart+1,w.nextMatch);}
},
{
	name: 'PBWikiWikiLink',
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
			output = createTiddlyLink(w.output,w.matchText,false,null,w.isStatic);
		}
		w.outputText(output,w.matchStart,w.nextMatch);
	}
},
{
	name: 'PBWikiUrlLink',
	match: config.textPrimitives.urlPattern,
	handler: function(w) {w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);}
},
{
	name: 'PBWikiBoldByChar',
	match: '\\*\\*',
	termRegExp: /(\*\*)/mg,
	element: 'strong',
	handler: config.formatterHelpers.createElementAndWikify
},
{
	name: 'PBWikiItalicByChar',
	match: "''",
	termRegExp: /('')/mg,
	element: 'em',
	handler: config.formatterHelpers.createElementAndWikify
},
{
	name: 'PBWikiUnderlineByChar',
	match: '__',
	termRegExp: /(__)/mg,
	element: 'u',
	handler: config.formatterHelpers.createElementAndWikify
},
/*{
	name: 'PBWikiStrikeByChar',
	match: ' -',
	termRegExp: /(- )/mg,
	element: 'strike',
	handler: config.formatterHelpers.createElementAndWikify
},*/
{
	name: 'PBWikiParagraph',
	match: '\\n{2,}',
	handler: function(w) {createTiddlyElement(w.output,'p');}
},
{
	name: 'PBWikiExplicitLineBreak',
	match: '<br ?/?>',
	handler: function(w) {createTiddlyElement(w.output,'br');}
},
{
	name: 'PBWikiLineBreak',
	match: '\\n',
	handler: function(w) {createTiddlyElement(w.output,'br');}
},
{
	name: 'PBWikiHtmlEntitiesEncoding',
	match: '&#?[a-zA-Z0-9]{2,8};',
	handler: function(w) {createTiddlyElement(w.output,'span').innerHTML = w.matchText;}
},
{
	name: 'PBWikiNotSupported',
	match: '<(?:toc|top|random|views).*?>',
	handler: function(w) {createTiddlyText(w.output,w.matchText);}
},
{
	name: 'PBWikiRaw',
	match: '<raw>',
	lookaheadRegExp: /<raw>((?:.|\n)*?)<\/raw>/mg,
	element: 'span',
	handler: config.formatterHelpers.enclosedTextHelper
},
{
	name: 'PBWikiVerbatim',
	match: '<verbatim>',
	lookaheadRegExp: /<verbatim>((?:.|\n)*?)<\/verbatim>/mg,
	element: 'span',
	handler: config.formatterHelpers.enclosedTextHelper
},
{
	name: 'PBWikiHtmlTag',
	match: "<[a-zA-Z]{2,}(?:\\s*(?:(?:.*?)=[\"']?(?:.*?)[\"']?))*?>",
	lookaheadRegExp: /<([a-zA-Z]{2,})((?:\s+(?:.*?)=["']?(?:.*?)["']?)*?)?\s*(\/)?>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var e =createTiddlyElement(w.output,lookaheadMatch[1]);
			if(lookaheadMatch[2]) {
				PBWikiFormatter.setAttributesFromParams(e,lookaheadMatch[2]);
			}
			if(lookaheadMatch[3]) {
				w.nextMatch = this.lookaheadRegExp.lastIndex;// empty tag
			} else {
				w.subWikify(e,'</'+lookaheadMatch[1]+'>');
			}
		}
	}
}
];

config.parsers.pbwikiFormatter = new Formatter(config.pbwiki.formatters);
config.parsers.pbwikiFormatter.format = 'pbwiki';
config.parsers.pbwikiFormatter.formatTag = 'PBWikiFormat';
} // end of 'install only once'
//}}}
