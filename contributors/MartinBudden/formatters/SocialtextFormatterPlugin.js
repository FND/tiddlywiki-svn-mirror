/***
|''Name:''|SocialtextFormatterPlugin|
|''Description:''|Allows Tiddlers to use [[Socialtext|http://www.socialtext.com/]] text formatting|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#SocialtextFormatterPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/SocialtextFormatterPlugin.js|
|''Version:''|0.9.4|
|''Date:''|Jan 21, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

This is the SocialtextFormatterPlugin, which allows you to insert Socialtext formated text into a TiddlyWiki.

The aim is not to fully emulate Socialtext, but to allow you to work with Socialtext content off-line and then resync the content with your Socialtext wiki later on, with the expectation that only minor edits will be required.

To use Socialtext format in a Tiddler, tag the Tiddler with SocialtextFormat or set the tiddler's {{{wikiformat}}} extended field to {{{socialtext}}}

Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev
***/

//{{{
// Ensure that the SocialtextFormatter Plugin is only installed once.
if(!version.extensions.SocialtextFormatterPlugin) {
version.extensions.SocialtextFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('SocialtextFormatterPlugin requires TiddlyWiki 2.1 or later.');}

SocialtextFormatter = {}; // 'namespace' for local functions

wikify = function(source,output,highlightRegExp,tiddler)
{
	if(source && source != '') {
		var w = new Wikifier(source,getParser(tiddler),highlightRegExp,tiddler);
		var out = output;
		if(tiddler && (tiddler.isTagged(config.parsers.socialtextFormatter.formatTag) || (tiddler.fields.wikiformat==config.parsers.socialtextFormatter.format)) ) {
			var d1 = createTiddlyElement(output,'div','content-display-body','content-section-visible');
			var d2 = createTiddlyElement(d1,'div','wikipage');
			out = createTiddlyElement(d2,'div',null,'wiki');
		}
		var time1,time0 = new Date();
		w.subWikifyUnterm(out);
		if(tiddler && config.options.chkDisplayInstrumentation) {
			time1 = new Date();
			var t = tiddler ? tiddler.title : source.substr(0,10);
			displayMessage("Wikify '"+t+"' in " + (time1-time0) + " ms");
		}
	}
};

stDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,'\\n').replace(/\r/mg,'RR'));
	createTiddlyElement(out,'br');
};

SocialtextFormatter.Tiddler_changed = Tiddler.prototype.changed;
Tiddler.prototype.changed = function()
{
	if((this.fields.wikiformat==config.parsers.socialtextFormatter.format) || this.isTagged(config.parsers.socialtextFormatter.formatTag)) {
		// update the links array, by checking for Socialtext format links
		this.links = [];
		var tiddlerLinkRegExp = /(?:\"(.*?)\" ?)?\[([^\]]*?)\]/mg;
		tiddlerLinkRegExp.lastIndex = 0;
		var match = tiddlerLinkRegExp.exec(this.text);
		while(match) {
			var link = match[2];
			this.links.pushUnique(link);
			match = tiddlerLinkRegExp.exec(this.text);
		}
	}/* else {
		return SocialtextFormatter.Tiddler_changed.apply(this,arguments);
	}*/
	this.linksUpdated = true;
};

SocialtextFormatter.wafl = function(w)
{
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
		var lm2 = lookaheadMatch[2];
		switch(lookaheadMatch[1]) {
		case 'image':
			var img = createTiddlyElement(w.output,'img');
			img.src = w.tiddler.title + '/' + lm2;
			createTiddlyText(img,lm2);
			break;
		case 'file':
			var s = createTiddlyElement(w.output,'span',null,'nlw_phrase');
			var a = createTiddlyElement(s,'a');
			a.href = w.tiddler.title + '/' + lm2;
			createTiddlyText(a,lm2);
			break;
		case 'link':
//#Test: link to header: <span class='nlw_phrase'><a title='section link' href='#googlesoap'>googlesoap</a><!-- wiki: {link: googlesoap} --></span></p>
			s = createTiddlyElement(w.output,'span',null,'nlw_phrase');
			a = createTiddlyElement(s,'a');
			var t = w.tiddler ? w.tiddler.title + ':' : '';
			a.setAttribute('href','#' + t + lm2);
			a.title = 'section link';
			createTiddlyText(a,lm2);
			break;
		case 'weblog':
			s = createTiddlyElement(w.output,'span',null,'nlw_phrase');
			var text = lm2;
			var link = 'Weblog: ' + lm2;
			createTiddlyText(createTiddlyLink(s,link,false,null,w.isStatic),text);
			break;
		case 'section':
			a = createTiddlyElement(w.output,'a');// drop anchor
			t = w.tiddler ? w.tiddler.title + ':' : '';
			a.setAttribute('name',t + lm2);
			break;
		case 'date':
			createTiddlyText(w.output,lm2);
			break;
		case 'user':
			var oldSource = w.source;
			w.source = lm2;
			w.nextMatch = 0;
			w.subWikifyUnterm(w.output);
			w.source = oldSource;
			break;
// Shortcut expansions - not strictly syntax
		case 'google':
//# google: http://www.google.com/search?q=%s
			s = createTiddlyElement(w.output,'span',null,'nlw_phrase');
			a = createExternalLink(s,'http://www.google.com/search?q='+lm2);
			createTiddlyText(a,lm2);
			break;
		case 'fedex':
//# fedex: http://www.fedex.com/Tracking?tracknumbers=%s
			s = createTiddlyElement(w.output,'span',null,'nlw_phrase');
			a = createExternalLink(s,'http://www.fedex.com/Tracking?tracknumbers='+lm2);
			createTiddlyText(a,lm2);
			break;
		case 'map':
//# map: http://maps.google.com/maps?q=%s
			s = createTiddlyElement(w.output,'span',null,'nlw_phrase');
			a = createExternalLink(s,'http://maps.google.com/maps?q='+lm2);
			createTiddlyText(a,lm2);
			break;
		case 'wikipedia':
//# wikipedia: http://en.wikipedia.org/wiki/%s
			s = createTiddlyElement(w.output,'span',null,'nlw_phrase');
			a = createExternalLink(s,'http://en.wikipedia.org/wiki/'+lm2);
			createTiddlyText(a,lm2);
			break;
		case 'rt':
//# rt: http://rt.socialtext.net/Ticket/Display.html?id=%s
			s = createTiddlyElement(w.output,'span',null,'nlw_phrase');
			a = createExternalLink(s,'http://rt.socialtext.net/Ticket/Display.html?id='+lm2);
			createTiddlyText(a,lm2);
			break;
		case 'stcal':
//# stcal: https://calendar.socialtext.net:445/view_t.php?timeb=1&id=3&date=%s
			s = createTiddlyElement(w.output,'span',null,'nlw_phrase');
			a = createExternalLink(s,'https://calendar.socialtext.net:445/view_t.php?timeb=1&id=3&date='+lm2);
			createTiddlyText(a,lm2);
			break;
		case 'svn':
//# svn: https://repo.socialtext.net/listing.php?rev=%s&sc=1
			s = createTiddlyElement(w.output,'span',null,'nlw_phrase');
			a = createExternalLink(s,'https://repo.socialtext.net/listing.php?rev='+lm2+'sc=1');
			createTiddlyText(a,lm2);
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

SocialtextFormatter.presence = function(w)
{
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
		var p = lookaheadMatch[1];
		var text = lookaheadMatch[2];
		var link;
		var src;
		if(p=='aim') {
			link = 'aim:goim?screenname=' + text + '&message=hello';
			src = 'http://big.oscar.aol.com/sleepleft?on_url=http://www.aim.com/remote/gr/MNB_online.gif&amp;off_url=http://www.aim.com/remote/gr/MNB_offline.gif';
		} else if(p=='yahoo'||p=='ymsgr') {
			link = 'ymsgr:sendIM?'+text;
			src = 'http://opi.yahoo.com/online?u=chrislondonbridge&f=.gif';
		} else if(p=='skype'||p=='callto') {
			link = 'callto:'+text;
			src = 'http://goodies.skype.com/graphics/skypeme_btn_small_green.gif';
		} else if(p=='asap') {
			link = 'http://asap2.convoq.com/AsapLinks/Meet.aspx?l='+text;
			src = 'http://asap2.convoq.com/AsapLinks/Presence.aspx?l='+text;
		}
		var s = createTiddlyElement(w.output,'span',null,'nlw_phrase');
		var a = createExternalLink(s,link);
		var img = createTiddlyElement(a,'img');
		createTiddlyText(a,text);
		img.src = src;
		img.border='0';
		img.alt = '(' + lookaheadMatch[1] + ')';
		if(p=='aim') {
			img.width='11'; img.height='13';
		}
		w.nextMatch = this.lookaheadRegExp.lastIndex;
	}
};

config.formatterHelpers.singleCharFormat = function(w)
{
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[0].substr(lookaheadMatch[0].length-2,1) != ' ') {
		w.subWikifyTerm(createTiddlyElement(w.output,this.element),this.termRegExp);
	} else {
		w.outputText(w.output,w.matchStart,w.nextMatch);
	}
};

config.socialtext = {};
config.socialtext.formatters = [
{
	name: 'socialtextHeading',
	match: '^\\^{1,6} ?',
	termRegExp: /(\n+)/mg,
	handler: function(w)
	{
		var len = w.matchText.trim().length;
		var e = createTiddlyElement(w.output,'h' + len);
		var a = createTiddlyElement(e,'a');// drop anchor
		var t = w.tiddler ? w.tiddler.title + ':' : '';
		len = w.source.substr(w.nextMatch).indexOf('\n');
		a.setAttribute('name',t+w.source.substr(w.nextMatch,len));
		w.subWikifyTerm(e,this.termRegExp);
	}
},

{
	name: 'socialtextTable',
	match: '^\\|(?:(?:.|\n)*)\\|$',
	lookaheadRegExp: /^\|(?:(?:.|\n)*)\|$/mg,
	cellRegExp: /(?:\|(?:[^\|]*)\|)(\n|$)?/mg,
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
			var r = this.rowHandler(w,createTiddlyElement(rowContainer,'tr'),prevColumns);
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
			var cell = createTiddlyElement(e,'td');
			w.subWikifyTerm(cell,this.cellTermRegExp);
			if(cellMatch[1]) {
				// End of row
				w.nextMatch = this.cellRegExp.lastIndex;
				return true;
			}
			// Cell
			w.nextMatch--;
			this.cellRegExp.lastIndex = w.nextMatch;
			cellMatch = this.cellRegExp.exec(w.source);
		}
		return false;
	}
},

{
	name: 'socialtextList',
	match: '^[\\*#]+ ',
	lookaheadRegExp: /^([\*#])+ /mg,
	termRegExp: /(\n+)/mg,
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0, currType = null;
		var itemType = 'li';
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			var listType = lookaheadMatch[1] == '*' ? 'ul' : 'ol';
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

{
	name: 'socialtextQuoteByLine',
	match: '^>+',
	lookaheadRegExp: /^>+/mg,
	termRegExp: /(\n)/mg,
	element: 'blockquote',
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0;
		var newLevel = w.matchLength;
		var i;
		do {
			if(newLevel > currLevel) {
				for(i=currLevel; i<newLevel; i++) {
					stack.push(createTiddlyElement(stack[stack.length-1],this.element));
				}
			} else if(newLevel < currLevel) {
				for(i=currLevel; i>newLevel; i--) {
					stack.pop();
				}
			}
			currLevel = newLevel;
			w.subWikifyTerm(stack[stack.length-1],this.termRegExp);
			createTiddlyElement(stack[stack.length-1],'br');
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			var matched = lookaheadMatch && lookaheadMatch.index == w.nextMatch;
			if(matched) {
				newLevel = lookaheadMatch[0].length;
				w.nextMatch += newLevel;
			}
		} while(matched);
	}
},

{
	name: 'socialtextRule',
	match: '^----+$\\n+',
	handler: function(w)
	{
		createTiddlyElement(w.output,'hr');
	}
},

{
	name: 'socialtextPreformatted',
	match: '^\\.pre\\s*\\n',
	lookaheadRegExp: /^.pre\s*\n((?:.|\n)*?)\n.pre\s*\n/mg,
	element: 'pre',
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: 'socialtextHtml',
	match: '^\\.html',
	lookaheadRegExp: /\.html((?:.|\n)*?)\.html/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			createTiddlyElement(w.output,'span').innerHTML = lookaheadMatch[1];
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
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
	name: 'socialtextExplicitLink',
	match: '(?:".*?" ?)?\\[',
	lookaheadRegExp: /(?:\"(.*?)\" ?)?\[([^\]]*?)\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var link = lookaheadMatch[2];
			var text = lookaheadMatch[1] ? lookaheadMatch[1] : link;
			createTiddlyText(createTiddlyLink(w.output,link,false,null,w.isStatic,w.tiddler),text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'socialtextExternalLink',
	match: '(?:".*?" ?)?<[a-z]{2,8}:',
	lookaheadRegExp: /(?:\"(.*?)\" ?)?<([a-z]{2,8}:.*?)>/mg,
	imgRegExp: /\.(?:gif|ico|jpg|png)/g,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var link = lookaheadMatch[2];
			var text = lookaheadMatch[1] ? lookaheadMatch[1] : link;
			this.imgRegExp.lastIndex = 0;
			if(this.imgRegExp.exec(link)) {
				var img = createTiddlyElement(w.output,'img');
				if(lookaheadMatch[1]) {
					img.title = text;
				}
				img.alt = text;
				img.src = link;
			} else {
				createTiddlyText(createExternalLink(w.output,link),text);
			}
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'socialtextUrlLink',
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: 'socialtextBold',
	match: '\\*(?![\\s\\*])',
	lookaheadRegExp: /\*(?!\s)(?:.*?)(?!\s)\*(?=[$\s\|\._\-,])/mg,
	termRegExp: /((?!\s)\*(?=[$\s\|\.\-_,]))/mg,
	element: 'strong',
	handler: config.formatterHelpers.singleCharFormat
},

{
	name: 'socialtextItalic',
	match: '_(?![\\s_])',
	lookaheadRegExp: /_(?!\s)(?:.*?)(?!\s)_(?=[$\s\|\.\*\-,])/mg,
	termRegExp: /((?!\s)_(?=[$\s\|\.\*\-,]))/mg,
	element: 'em',
	handler: config.formatterHelpers.singleCharFormat
},

{
	name: 'socialtextStrike',
	match: '-(?![\\s\\-])',
	lookaheadRegExp: /-(?!\s)(?:.*?)(?!\s)-(?=[$\s\|\.\*_,])/mg,
	termRegExp: /((?!\s)-(?=[$\s\|\.\*_,]))/mg,
	element: 'del',
	handler: config.formatterHelpers.singleCharFormat
},

{
	name: 'socialtextMonoSpaced',
	match: '`(?![\\s`])',
	lookaheadRegExp: /`(?!\s)(?:.*?)(?!\s)`(?=[$\s\.\*\-_,])/mg,
	termRegExp: /((?!\s)`(?=[$\s\.\*\-_,]))/mg,
	element: 'tt',
	handler: config.formatterHelpers.singleCharFormat
},

{
	name: 'socialtextParagraph',
	match: '\\n{2,}',
	handler: function(w)
	{
		createTiddlyElement(w.output,'p');
	}
},

{
	name: 'socialtextLineBreak',
	match: '\\n',
	handler: function(w)
	{
		createTiddlyElement(w.output,'br');
	}
},

{
	name: 'socialtextNoWiki',
	match: '\\{\\{',
	lookaheadRegExp: /\{\{((?:.|\n)*?)\}\}/mg,
	element: 'span',
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: 'socialtextTrademark',
	match: '\\{tm\\}',
	handler: function(w)
	{
		createTiddlyElement(w.output,'span').innerHTML = '&trade;';
	}
},

{
	name: 'socialtextWafl',
	match: '\\{(?:[a-z]{2,16}): ?.*?\\}',
	lookaheadRegExp: /\{([a-z]{2,16}): ?(.*?)\}/mg,
	handler: SocialtextFormatter.wafl
},

{
	name: 'socialtextPresence',
	match: '(?:aim|yahoo|ymsgr|skype|callto|asap):\\w+',
	lookaheadRegExp: /(aim|yahoo|ymsgr|skype|callto|asap):(\w+)/mg,
	handler: SocialtextFormatter.presence
},

{
	name: 'socialtextMailTo',
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
	name: 'socialtextHtmlEntitiesEncoding',
	match: '&#?[a-zA-Z0-9]{2,8};',
	handler: function(w)
	{
		createTiddlyElement(w.output,'span').innerHTML = w.matchText;
	}
}
];

config.parsers.socialtextFormatter = new Formatter(config.socialtext.formatters);
config.parsers.socialtextFormatter.format = 'socialtext';
config.parsers.socialtextFormatter.formatTag = 'SocialtextFormat';

} // end of 'install only once'
//}}}
