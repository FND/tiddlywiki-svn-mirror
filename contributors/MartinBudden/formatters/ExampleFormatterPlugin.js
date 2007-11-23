/***
|''Name:''|ExampleFormatterPlugin|
|''Description:''|Example Formatter which can be used as a basis for creating a new Formatter. Allows Tiddlers to use [[example|http://www.example.com/wikitext]] text formatting|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#ExampleFormatterPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/ExampleFormatterPlugin.js |
|''Version:''|0.1.10|
|''Status:''|Not for release - this is a template for creating new formatters|
|''Date:''|Nov 5, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.1.0|

To make this example into a real TiddlyWiki formatter, you need to:

# Globally search and replace ExampleAdpator with the name of your formatter
# Remove any format entries that are not required
# Change the existing format entries as required
# Add any new format entries that are required

***/

//{{{
// Ensure that the ExampleFormatterPlugin is only installed once.
if(!version.extensions.ExampleFormatterPlugin) {
version.extensions.ExampleFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('ExampleFormatterPlugin requires TiddlyWiki 2.1 or later.');}

exampleFormatter = {}; // 'namespace' for local functions

exampleDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,'\\n').replace(/\r/mg,'RR'));
	createTiddlyElement(out,'br');
};

wikify = function(source,output,highlightRegExp,tiddler)
{
	if(source && source !== '') {
		var w = new Wikifier(source,getParser(tiddler),highlightRegExp,tiddler);
		w.output = tiddler ? createTiddlyElement(output,'p') : output;
		w.subWikifyUnterm(w.output);
	}
//#at point of usage can use:
//#var output = w.output.nodeType==1 && w.output.nodeName=='P' ? w.output.parentNode : w.output;
};

config.formatterHelpers.setAttributesFromParams = function(e,p)
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

config.exampleFormatters = [
{
	name: 'exampleHeading',
	match: '^={1,6}',
	termRegExp: /(={1,6}$\n)/mg,
	handler: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output,'h'+w.matchLength),this.termRegExp);
	}
},

{
	name: 'exampleList',
	match: '^[\\*#;:]+ ',
	lookaheadRegExp: /^([\*#;:])+ /mg,
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
			switch(lookaheadMatch[1]) {
			case '*':
				listType = 'ul';
				itemType = 'li';
				break;
			case '#':
				listType = 'ol';
				itemType = 'li';
				break;
			case ';':
				listType = 'dl';
				itemType = 'dt';
				break;
			case ':':
				listType = 'dl';
				itemType = 'dd';
				break;
			default:
				break;
			}
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
	name: 'exampleRule',
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
	name: 'exampleExplicitLink',
	match: '\\[\\[',
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
	name: 'exampleNotWikiLink',
	match: '!' + config.textPrimitives.wikiLink,
	handler: function(w)
	{
		w.outputText(w.output,w.matchStart+1,w.nextMatch);
	}
},

{
	name: 'exampleWikiLink',
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
	name: 'exampleUrlLink',
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: 'exampleBold',
	match: '\\*\\*',
	termRegExp: /(\*\*|(?=\n\n))/mg,
	element: 'strong',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'exampleItalic',
	match: '//',
	termRegExp: /(\/\/|(?=\n\n))/mg,
	element: 'em',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'exampleUnderline',
	match: '__',
	termRegExp: /(__|(?=\n\n))/mg,
	element: 'u',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'exampleStrikeBy',
	match: '--(?!\\s|$)',
	termRegExp: /((?!\s)--|(?=\n\n))/mg,
	element: 'strike',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'exampleSuperscript',
	match: '\\^\\^',
	termRegExp: /(\^\^|(?=\n\n))/mg,
	element: 'sup',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'exampleSubscript',
	match: '~~',
	termRegExp: /(~~|(?=\n\n))/mg,
	element: 'sub',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'exampleMonospaced',
	match: '\\{\\{\\{',
	lookaheadRegExp: /\{\{\{((?:.|\n)*?)\}\}\}/mg,
	element: 'code',
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: 'exampleParagraph',
	match: '\\n{2,}',
	handler: function(w)
	{
		w.output = createTiddlyElement(w.output,'p');
	}
},

{
	name: 'exampleLineBreak',
	match: '\\n|<br ?/?>',
	handler: function(w)
	{
		createTiddlyElement(w.output,'br');
	}
},

{
	name: 'exampleComment',
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
	name: 'exampleHtmlEntitiesEncoding',
	match: '&#?[a-zA-Z0-9]{2,8};',
	handler: function(w)
	{
		createTiddlyElement(w.output,'span').innerHTML = w.matchText;
	}
},

{
	name: 'exampleHtmlTag',
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
				w.subWikify(e,'</'+lookaheadMatch[1]+'>');
			}
		}
	}
}
];

config.parsers.exampleFormatter = new Formatter(config.exampleFormatters);
config.parsers.exampleFormatter.format = 'example';
config.parsers.exampleFormatter.formatTag = 'ExampleFormat';
} // end of 'install only once'
//}}}
