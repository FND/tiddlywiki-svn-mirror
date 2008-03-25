/***
|''Name:''|WikispacesFormatterPlugin|
|''Description:''|Allows Tiddlers to use [[wikispaces|http://www.wikispaces.com/wikitext]] text formatting|
|''Description:''|Wikispaces Formatter|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/WikispacesFormatterPlugin.js |
|''Version:''|0.0.7|
|''Date:''|Nov 23, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.1.0|

***/

//{{{
// Ensure that the WikispacesFormatterPlugin is only installed once.
if(!version.extensions.WikispacesFormatterPlugin) {
version.extensions.WikispacesFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('WikispacesFormatterPlugin requires TiddlyWiki 2.1 or later.');}

wikispacesFormatter = {}; // 'namespace' for local functions

wikispacesDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,'\\n').replace(/\r/mg,'RR'));
	createTiddlyElement(out,'br');
};

wikispacesFormatter.normalizedTitle = function(title)
{
	title = title.trim();
	return title.replace(/\s/g,'_');
};

wikispacesFormatter.baseUri = function(space,host)
{
	if(!space)
		space = 'www';
	if(!host)
		host = 'wikispaces.com';
	return 'http://' + space + '.' + host;
};

wikispacesFormatter.processLink = function(link)
{
	if(config.formatterHelpers.isExternalLink(link))
		return link;
	var space = null;
	var pos = link.indexOf(':');
	if(pos!=-1) {
		space = link.substr(0,pos);
		link = link.substring(pos+1);
	}
	return wikispacesFormatter.baseUri(space) + '/' + link.replace(/\s/g,'+');
};

config.wikispacesFormatters = [
{
	name: 'wikispacesHeading',
	match: '^={1,3}(?!=)',
	termRegExp: /(={0,3} *\n+)/mg,
	handler: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output,'h'+w.matchLength),this.termRegExp);
	}
},

{
	name: 'wikispacesTable',
	match: '^\\|\\|(?:(?:.|\n)*)\\|\\|$',
	lookaheadRegExp: /^\|\|((?:.|\n)*)\|\|$/mg,
	rowTermRegExp: /(\|\|$\n?)/mg,
	cellRegExp: /(?:\|\|((?:.|\n)*)\|\|)/mg,
	cellTermRegExp: /((?:\x20*)\|\|)/mg,

	handler: function(w)
	{
		var table = createTiddlyElement(w.output,'table');
		var prevColumns = [];
		var rowCount = 0;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			this.rowHandler(w,createTiddlyElement(table,'tr',null,(rowCount&1)?'oddRow':'evenRow'),prevColumns);
			rowCount++;
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
	},//# end handler
	rowHandler: function(w,e,prevColumns)
	{
		var col = 0;
		var colSpanCount = 1;
		var prevCell = null;
		this.cellRegExp.lastIndex = w.nextMatch;
		var cellMatch = this.cellRegExp.exec(w.source);
//#console.log('len:'+w.source.length);
//#console.log('t1:'+w.source.substr(w.nextMatch,40));
//#console.log(cellMatch);
		while(cellMatch && cellMatch.index == w.nextMatch) {
//#console.log('n:'+w.nextMatch);
			if(w.source.substr(w.nextMatch,4) == '||||') {
				// Colspan
				colSpanCount++;
				w.nextMatch += 2;
			} else if(w.source.substr(w.nextMatch+2,1)=='^') {
				// Rowspan
				var last = prevColumns[col];
				if(last) {
					last.rowSpanCount++;
					last.element.setAttribute("rowspan",last.rowSpanCount);
					last.element.setAttribute("rowSpan",last.rowSpanCount); // Needed for IE
					last.element.valign = "center";
				}
				var n = w.source.indexOf('||',w.nextMatch+2);
				if(n!=-1)
					w.nextMatch = n;
				else
					w.nextMatch += 3;
			} else if(w.source.substr(w.nextMatch,3)=='||\n') {
				// End of row
				if(colSpanCount > 1) {
					prevCell.setAttribute('colspan',colSpanCount);
					prevCell.setAttribute('colSpan',colSpanCount); // Needed for IE
				}
				w.nextMatch += 3;
//#console.log('tr:'+w.source.substr(w.nextMatch,40));
//#console.log('nr:'+w.nextMatch);
				//#w.nextMatch = this.cellRegExp.lastIndex;
				break;
			} else {
				// Cell
				w.nextMatch += 2; //skip over ||
				var chr = w.source.substr(w.nextMatch,1);
				var cell;
				if(chr == '~') {
					cell = createTiddlyElement(e,'th');
					w.nextMatch++;
				} else {
					cell = createTiddlyElement(e,'td');
					if(chr == '>') {
						cell.align = 'right';
						w.nextMatch++;
					} else if(chr == '=') {
						cell.align = 'center';
						w.nextMatch++;
					} else {
						cell.align = 'left';
					}
				}
				prevCell = cell;
				prevColumns[col] = {rowSpanCount:1,element:cell};
				if(colSpanCount > 1) {
					cell.setAttribute('colspan',colSpanCount);
					cell.setAttribute('colSpan',colSpanCount); // Needed for IE
					colSpanCount = 1;
				}
				w.subWikifyTerm(cell,this.cellTermRegExp);
				prevCell = cell;
				w.nextMatch -= 2;
			}
			col++;
			if(w.source.substr(w.nextMatch,3)=='||\n') {
				w.nextMatch += 3;
				break;
			}
			if(w.nextMatch==w.source.length-2) {
				// table ends at end of tiddler
				w.nextMatch += 2;
				break;
			}
			
			this.cellRegExp.lastIndex = w.nextMatch;
			cellMatch = this.cellRegExp.exec(w.source);
//#console.log('tn:'+w.nextMatch);
//#console.log('t2:'+w.source.substr(w.nextMatch,40));
//#console.log(cellMatch);
			col++;
		}
	}//# end rowHandler
},

{
	name: 'wikispaceslist',
	match: '^[\\*#]+ ',
	lookaheadRegExp: /^([\*#])+ /mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0, currType = null;
		var listLevel, listType, itemType, baseType;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			itemType = 'li';
			listType = lookaheadMatch[1] == '*' ? 'ul' : 'ol';
			if(!baseType)
				baseType = listType;
			listLevel = lookaheadMatch[0].length;
			w.nextMatch += lookaheadMatch[0].length;
			var t;
			if(listLevel > currLevel) {
				for(t=currLevel; t<listLevel; t++) {
					var target = (currLevel == 0) ? stack[stack.length-1] : stack[stack.length-1].lastChild;
					stack.push(createTiddlyElement(target,listType));
				}
			} else if(listType!=baseType && listLevel==1) {
				w.nextMatch -= lookaheadMatch[0].length;
				return;
			} else if(listLevel < currLevel) {
				for(t=currLevel; t>listLevel; t--)
					stack.pop();
			} else if(listLevel == currLevel && listType != currType) {
				stack.pop();
				stack.push(createTiddlyElement(stack[stack.length-1].lastChild,listType));
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
	name: 'wikispacesQuoteByLine',
	match: '^>+',
	lookaheadRegExp: /^>+/mg,
	termRegExp: /(\n)/mg,
	element: 'blockquote',
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0;
		var newLevel = w.matchLength;
		var t;
		do {
			if(newLevel > currLevel) {
				for(t=currLevel; t<newLevel; t++)
					stack.push(createTiddlyElement(stack[stack.length-1],this.element));
			} else if(newLevel < currLevel) {
				for(t=currLevel; t>newLevel; t--)
					stack.pop();
			}
			currLevel = newLevel;
			w.subWikifyTerm(stack[stack.length-1],this.termRegExp);
			createTiddlyElement(stack[stack.length-1],'br');
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			var matched = lookaheadMatch && lookaheadMatch.index == w.nextMatch;
			if(matched) {
				newLevel = lookaheadMatch[0].length;
				w.nextMatch += lookaheadMatch[0].length;
			}
		} while(matched);
	}
},

{
	name: 'wikispacesRule',
	match: '^---+$\\n?',
	handler: function(w)
	{
		createTiddlyElement(w.output,'hr');
	}
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
	name: 'wikispacesImage',
	match: '\\[\\[image:',
	lookaheadRegExp: /\[\[image:(.*?)(?: +(.*?)=\"(.*?)")*\]\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var img = createTiddlyElement(w.output,'img');
			//#img.src = wikispacesFormatter.baseUri()+ '/space/showimage/' + lookaheadMatch[1];
			img.src = 'images/' + lookaheadMatch[1];
			img.title = lookaheadMatch[1];
			img.alt = lookaheadMatch[1];
			var i = 2;
			var a = lookaheadMatch[i];
			while(a) {
				if(a=='width' || a=='height' || a=='align') {
					if(lookaheadMatch[i+1]) {
						img[a] = lookaheadMatch[i+1];
						//#console.log('a:'+a+' v:'+lookaheadMatch[i+1]);
					}
				} else if(a=='link') {
					var link = createTiddlyElement(w.output,'a');
					link.href = wikispacesFormatter.processLink(lookaheadMatch[i+1]);
					img = w.output.removeChild(img);
					link.appendChild(img);
				//} else if(a=='caption') {
				}
				i += 2;
				a = lookaheadMatch[i];
			}
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

//#The syntax for the anchor on the page is [[#AnchorName]] or [[#AnchorName|DisplayText]]
//#The syntax for the link is [[PageName#AnchorName|DisplayText]]
{
	name: 'wikispacesAnchor',
	match: '\\[\\[#',
	lookaheadRegExp: /\[\[#(.*?)(?:\|~?(.*?))?\]\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			//# drop anchor
			var a = createTiddlyElement(w.output,'a',null,null,lookaheadMatch[2]? lookaheadMatch[2]:null);
			var t = w.tiddler ? wikispacesFormatter.normalizedTitle(w.tiddler.title) + '#' : '';
			a.setAttribute('name',t+lookaheadMatch[1]);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'wikispacesExplicitLink',
	match: '\\[\\[',
	lookaheadRegExp: /\[\[(.*?)(?:\|(.*?))?\]\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var link = lookaheadMatch[1];
			var text = lookaheadMatch[2] ? lookaheadMatch[2] : link;
			var e = link.indexOf(':')==-1 ?
				createTiddlyLink(w.output,link,false,null,w.isStatic) :
				createExternalLink(w.output,wikispacesFormatter.processLink(link));
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'wikispacesUrlLink',
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: 'wikispacesCharacterFormat',
	match: '\\*\\*|//|__|\\{\\{|``',
	handler: function(w)
	{
		switch(w.matchText) {
		case '**':
			w.subWikifyTerm(createTiddlyElement(w.output,'b'),/(\*\*|(?=\n\n))/mg);
			break;
		case '//':
			w.subWikifyTerm(createTiddlyElement(w.output,'i'),/(\/\/|(?=\n\n))/mg);
			break;
		case '__':
			var e = createTiddlyElement(w.output,"span");
			e.setAttribute("style","text-decoration:underline");
			w.subWikifyTerm(e,/(__|(?=\n\n))/mg);
			break;
		case '{{':
			this.lookaheadRegExp = /\{\{((?:.|\n)*?)\}\}/mg;
			this.element = 'code';
			config.formatterHelpers.enclosedTextHelper.call(this,w);
			break;
		case '``':
			var lookaheadRegExp = /``((?:.|\n)*?)``/mg;
			lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
				createTiddlyElement(w.output,'span',null,null,lookaheadMatch[1]);
				w.nextMatch = lookaheadRegExp.lastIndex;
			}
			break;
		}
	}
},

/*{
	name: 'wikispacesParagraph',
	match: '\\n{2,}',
	handler: function(w)
	{
		w.output = createTiddlyElement(w.output,'p');
	}
},
*/
{
	name: 'wikispacesLineBreak',
	match: '\\n|<br ?/?>',
	handler: function(w)
	{
		createTiddlyElement(w.output,'br');
	}
},

{
	name: 'wikispacesComment',
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
	name: 'wikispacesMailTo',
	match: '[\\w\.]+@[\\w]+\.[\\w\.]+',
	lookaheadRegExp: /([\w\.]+@[\w]+\.[\w\.]+)/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			createTiddlyText(createExternalLink(w.output,'mailto:'+text),text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'wikispacesHtmlEntitiesEncoding',
	match: '&#?[a-zA-Z0-9]{2,8};',
	handler: function(w)
	{
		createTiddlyElement(w.output,'span').innerHTML = w.matchText;
	}
}
];

config.parsers.wikispacesFormatter = new Formatter(config.wikispacesFormatters);
config.parsers.wikispacesFormatter.format = 'wikispaces';
config.parsers.wikispacesFormatter.formatTag = 'wikispacesFormat';
} // end of 'install only once'
//}}}
