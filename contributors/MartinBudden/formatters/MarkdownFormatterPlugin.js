/***
|''Name:''|MarkdownFormatterPlugin|
|''Description:''|Allows Tiddlers to use [[Markdown|http://daringfireball.net/projects/markdown/]] text formatting|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#MarkdownFormatterPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/MarkdownFormatterPlugin.js|
|''Version:''|0.0.3|
|''Date:''|Mar 25, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

***/

//{{{
// Ensure that the MarkdownFormatterPlugin is only installed once.
if(!version.extensions.MarkdownFormatterPlugin) {
version.extensions.MarkdownFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('MarkdownFormatterPlugin requires TiddlyWiki 2.1 or later.');}

markdownFormatter = {}; // 'namespace' for local functions
markdownFormatter.urls = {};
markdownFormatter.titles = {};

markdownDebug = function(out,str)
{
displayMessage("s:"+str);
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
};

config.formatterHelpers.setAttributesFromParams = function(e,p,w)
{
	var re = /\s*(.*?)=(?:(?:"(.*?)")|(?:'(.*?)')|((?:\w|%|#)*))/mg;
	var match = re.exec(p);
	while(match) {
		var s = match[1].unDash();
		var t = '';
		if(s=='id') {
			t = w.tiddler ? w.tiddler.title + ':' : '';
		}
		if(s=='bgcolor') {
			s = 'backgroundColor';
		}
		try {
			if(match[2]) {
				e.setAttribute(s,t+match[2]);
			} else if(match[3]) {
				e.setAttribute(s,t+match[3]);
			} else {
				e.setAttribute(s,t+match[4]);
			}
		}
		catch(ex) {}
		match = re.exec(p);
	}
};

config.markdownFormatters = [

// Setext-style headers:
{
	name: 'markdownSetextHeading1',
	match: '^(?:.+)[ \\t]*\\n=+[ \\t]*\\n+',
	lookaheadRegExp: /^(.+)[ \t]*\n=+[ \t]*\n+/gm,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			var e = createTiddlyElement(w.output,'h1');
			//# drop anchor
			var a = createTiddlyElement(e,'a');
			var t = w.tiddler ? w.tiddler.title + ':' : '';
			a.setAttribute('name',t+text);
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'markdownSetextHeading2',
	match: '^(?:.+)[ \\t]*\\n-+[ \\t]*\\n+',
	lookaheadRegExp: /^(.+)[ \t]*\n-+[ \t]*\n+/gm,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			var e = createTiddlyElement(w.output,'h2');
			//# drop anchor
			var a = createTiddlyElement(e,'a');
			var t = w.tiddler ? w.tiddler.title + ':' : '';
			a.setAttribute('name',t+text);
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'markdownAtxHeading',
	match: '^#{1,6}(?!#)',
	termRegExp: /(#{0,6}\n+)/mg,
	handler: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output,'h'+w.matchLength),this.termRegExp);
	}
},

/*{
	name: 'markdownList',
	match: '^[\\*\\+-]+ ',
	lookaheadRegExp: /^([\*\+-])+ /mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0, currType = null;
		var listType, itemType;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			switch(lookaheadMatch[1]) {
			case '*':
			case '-':
			case '+':
				listType = 'ul';
				itemType = 'li';
				break;
			case '#':
				listType = 'ol';
				itemType = 'li';
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
	}
},
*/
{
	name: "quoteByBlock",
	match: "^<<<\\n",
	termRegExp: /(^<<<(\n|$))/mg,
	element: "blockquote",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "quoteByLine",
	match: "^(?:> )+",
	lookaheadRegExp: /^(?:> )+/mg,
	termRegExp: /(\n)/mg,
	element: "blockquote",
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0;
		var newLevel = w.matchLength/2;
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
			createTiddlyElement(stack[stack.length-1],"br");
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			var matched = lookaheadMatch && lookaheadMatch.index == w.nextMatch;
			if(matched) {
				newLevel = lookaheadMatch[0].length/2;
				w.nextMatch += lookaheadMatch[0].length;
			}
		} while(matched);
	}
},

{
	name: 'markdownRule',
	match: '^[ ]{0,2}(?:[ ]?[\\*\\-\\_][ ]?){3,}[ \\t]*$',
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
	// Link definitions are in the form: ^[id]: url "optional title"
	name: 'markdownLinkDefinition',
	//match: '^[ ]{0,3}\\[(.+)\\]:',
	match: '^\\[id\\]:',
	lookaheadRegExp: /^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm,
	handler: function(w)
	{
//markdownDebug(w.output,"mld:"+w.source.substr(w.matchStart,50));
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {

/*markdownDebug(w.output,"markdownLinkDefinition");
markdownDebug(w.output,"lm:"+lookaheadMatch);
markdownDebug(w.output,"lm1:"+lookaheadMatch[1]);
markdownDebug(w.output,"lm2:"+lookaheadMatch[2]);
markdownDebug(w.output,"lm3:"+lookaheadMatch[3]);
markdownDebug(w.output,"lm4:"+lookaheadMatch[4]);*/
			if(!lookaheadMatch[3]) {
				var id = lookaheadMatch[1].toLowerCase();
				markdownFormatter.urls[id] = lookaheadMatch[2];
				if(lookaheadMatch[4])
					markdownFormatter.titles[id] = lookaheadMatch[4].replace(/"/g,"&quot;");
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	}
},

{
	//' First, handle reference-style links: [link text] [id]
	name: 'markdownReferenceLink',
	match: '\\[(?:(?:\\[[^\\]]*\\]|[^\\[\\]])*)\\][ ]?(?:\\n[ ]*)?\\[',
	lookaheadRegExp: /(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])/mg,
	handler: function(w)
	{
//	if (m7 == undefined) m7 = "";
//	var whole_match = m1;
//	var link_text   = m2;
//	var link_id	 = m3.toLowerCase();
//	var url		= m4;
//	var title	= m7;

		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
/*markdownDebug(w.output,"markdownReferenceLink");
markdownDebug(w.output,"lm:"+lookaheadMatch);
markdownDebug(w.output,"lm1:"+lookaheadMatch[1]);
markdownDebug(w.output,"lm2:"+lookaheadMatch[2]);
markdownDebug(w.output,"lm3:"+lookaheadMatch[3]);
markdownDebug(w.output,"lm4:"+lookaheadMatch[4]);*/
			var id = lookaheadMatch[3].toLowerCase();
			var link = markdownFormatter.urls[id];
/*markdownDebug(w.output,"id:"+id);
markdownDebug(w.output,"link:"+link);*/
			var text = lookaheadMatch[2];
			if(link) {
				var e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
				createTiddlyText(e,text);
			}
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	//# inline-style link: [link text](url "optional title")
	name: 'markdownInlineLink',
	match: '\\[.*?\\]\\(',
	lookaheadRegExp: /(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
/*markdownDebug(w.output,"lm:"+lookaheadMatch);
markdownDebug(w.output,"lm1:"+lookaheadMatch[1]);
markdownDebug(w.output,"lm2:"+lookaheadMatch[2]);
markdownDebug(w.output,"lm3:"+lookaheadMatch[3]);
markdownDebug(w.output,"lm4:"+lookaheadMatch[4]);*/
			var link = lookaheadMatch[4];
			var text = lookaheadMatch[2];
			if(link) {
				if(link.substr(0,1)=='#') {
					var t = w.tiddler ? w.tiddler.title + ':' : '';
					link = link.substr(1);
					//displayMessage("ll:"+t+link);
					var e = createTiddlyElement(w.output,'a');
					e.setAttribute('href','#' + t + link);
					e.title = text;
				} else {
					e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
				}
				createTiddlyText(e,text);
			}
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	// reference-style labeled images: ![alt text][id]
	name: 'markdownReferenceImage',
	match: '!\\[.*?\\]\\[',
	lookaheadRegExp: /(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var link = lookaheadMatch[4];
			var text = lookaheadMatch[2];
			var e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic);
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	// inline images: ![alt text](url "optional title")
	name: 'markdownInlineImage',
	match: '!\\[.*?\\]\\(',
	lookaheadRegExp: /(!\[(.*?)\]\s?\([ \t]*<?(\S+?)>?[ \t]*((['"])(.*?)\5[ \t]*)?\))/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var img = createTiddlyElement(w.output,"img");
			if(lookaheadMatch[2])
				img.alt = lookaheadMatch[2];
			if(lookaheadMatch[6])
				img.title = lookaheadMatch[6];
			img.src = lookaheadMatch[3];
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

/*{
	name: 'markdownUrlLink',
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},*/

/*{
	name: 'markdownBackslashAsterisk',
	match: '\\*',
	handler: function(w)
	{
		createTiddlyElement(w.output,'span').innerHTML = '&#42;';
	}
},

{
	name: 'markdownBackslashUnderscore',
	match: '\\_',
	handler: function(w)
	{
		createTiddlyElement(w.output,'span').innerHTML = '&#95;';
	}
},*/

{
	name: 'markdownBold',
	match: '\\*\\*|__',
	lookaheadRegExp: /(\*\*|__)(?=\S)([^\n]*?\S[*_]*)\1/mg,
	element: 'strong',
	handler: function(w)
	{
//markdownDebug(w.output,"dd:"+w.source.substr(w.matchStart,50));
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[2];
			if(config.browser.isIE)
				text = text.replace(/\n/g,'\r');
			createTiddlyElement(w.output,this.element,null,null,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'markdownItalic',
	match: '\\*|_',
	lookaheadRegExp: /(\*|_)(?=\S)([^\n]*?\S)\1/mg,
	element: 'em',
	handler: function(w)
	{
//displayMessage("hello");
//markdownDebug(w.output,"s:"+w.source.substr(w.matchStart,50));
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
//markdownDebug(w.output,"lm:"+lookaheadMatch);
//markdownDebug(w.output,"lm1:"+lookaheadMatch[1]);
//markdownDebug(w.output,"lm2:"+lookaheadMatch[2]);
//markdownDebug(w.output,"lm3:"+lookaheadMatch[3]);
			var text = lookaheadMatch[2];
			if(config.browser.isIE)
				text = text.replace(/\n/g,'\r');
			createTiddlyElement(w.output,this.element,null,null,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'markdownCode',
	match: '`(?![\\s`])',
	lookaheadRegExp: /(`+)([^\r]*?[^`])\1(?!`)/mg,
	element: 'code',
	handler: function(w)
	{
//displayMessage("hello");
//markdownDebug(w.output,"s:"+w.source.substr(w.matchStart,50));
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
//markdownDebug(w.output,"lm:"+lookaheadMatch);
//markdownDebug(w.output,"lm1:"+lookaheadMatch[1]);
//markdownDebug(w.output,"lm2:"+lookaheadMatch[2]);
//markdownDebug(w.output,"lm3:"+lookaheadMatch[3]);
			var text = lookaheadMatch[2];
			if(config.browser.isIE)
				text = text.replace(/\n/g,'\r');
			createTiddlyElement(w.output,this.element,null,null,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'markdownParagraph',
	match: '\\n{2,}',
	handler: function(w)
	{
		w.output = createTiddlyElement(w.output,'p');
	}
},

{
	name: "lineBreak",
	match: "\\n|<br ?/?>",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
	}
},

{
	name: 'markdownLineBreak',
	match: ' {2,}\\n',
	handler: function(w)
	{
		createTiddlyElement(w.output,'br');
	}
},

{
	name: 'markdownComment',
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
	name: 'markdownMailto',
	match: '<(?:mailto:)?[-.\\w]+\\@[-a-z0-9]+\\.',
	lookaheadRegExp: /<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/mgi,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			var link = 'mailto:' + text;
			createTiddlyText(createExternalLink(w.output,link),text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'markdownHtmlEntitiesEncoding',
	match: '&#?[a-zA-Z0-9]{2,8};',
	handler: function(w)
	{
		createTiddlyElement(w.output,'span').innerHTML = w.matchText;
	}
},

{
	name: 'markdownHtmlTag',
	match: "<(?:[a-zA-Z1-6]{2,}|a)(?:\\s*(?:[a-z]*?=[\"']?[^>]*?[\"']?))*?>",
	//lookaheadRegExp: /<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>/mg,
	lookaheadRegExp: /<([a-zA-Z1-6]+)(>?)((?:\s+[a-z]*?=["']?[^>\"\']*?["']?)*?)?\s*(\/)?>/mg,
	handler: function(w)
	{
//markdownDebug(w.output,"s:"+w.source.substr(w.matchStart,50));
//displayMessage("s:"+w.source.substr(w.matchStart,80));
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
//markdownDebug(w.output,"lm:"+lookaheadMatch);
//markdownDebug(w.output,"lm1:"+lookaheadMatch[1]);
//markdownDebug(w.output,"lm2:"+lookaheadMatch[2]);
//markdownDebug(w.output,"lm3:"+lookaheadMatch[3]);
			var e =createTiddlyElement(w.output,lookaheadMatch[1]);
			if(lookaheadMatch[3]) {
				config.formatterHelpers.setAttributesFromParams(e,lookaheadMatch[3],w);
			}
			if(lookaheadMatch[4]) {
				w.nextMatch = this.lookaheadRegExp.lastIndex;// empty tag
			} else {
				w.subWikify(e,'</'+lookaheadMatch[1]+'>');
			}
		}
	}
},

{
	name: 'markdownPreCodeBlock',
	match: '(?:\\n\\n|^)(?:(?:[ ]{4}|\t)[^<\\*\\-\\+]*\\n+)',
	lookaheadRegExp: /(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/mg,
	element: 'code',
	handler: function(w)
	{
//markdownDebug(w.output,"s:"+w.source.substr(w.matchStart,50));
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
//markdownDebug(w.output,"lm:"+lookaheadMatch);
//markdownDebug(w.output,"lm1:"+lookaheadMatch[1]);
//markdownDebug(w.output,"lm2:"+lookaheadMatch[2]);
//markdownDebug(w.output,"lm3:"+lookaheadMatch[3]);
			var text = lookaheadMatch[1];
			if(config.browser.isIE)
				text = text.replace(/\n/g,'\r');
			//# trim leading and trailing newlines
			//text = text.replace(/^\n+/g,'').replace(/\n+$/g,'');
			var e = createTiddlyElement(w.output,'pre');
			createTiddlyElement(e,this.element,null,null,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex-1;
		}
	}
}
];

config.parsers.markdownFormatter = new Formatter(config.markdownFormatters);
config.parsers.markdownFormatter.format = 'markdown';
config.parsers.markdownFormatter.formatTag = 'MarkdownFormat';
} // end of 'install only once'
//}}}
