/***
|''Name:''|MediaWikiFormatterPlugin|
|''Description:''|Allows Tiddlers to use [[MediaWiki|http://meta.wikimedia.org/wiki/Help:Wikitext]] ([[WikiPedia|http://meta.wikipedia.org/]]) text formatting|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/prereleases.html#MediaWikiFormatterPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins|
|''Version:''|0.3.11|
|''Date:''|Dec 28, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

|''Display instrumentation''|<<option chkDisplayInstrumentation>>|
|''Display empty template links:''|<<option chkMediaWikiDisplayEmptyTemplateLinks>>|
|''Allow zooming of thumbnail images''|<<option chkMediaWikiDisplayEnableThumbZoom>>|
|''List references''|<<option chkMediaWikiListReferences>>|

This is the MediaWikiFormatterPlugin, which allows you to insert MediaWiki formated text into a TiddlyWiki.

The aim is not to fully emulate MediaWiki, but to allow you to create MediaWiki content off-line
and then paste the content into your MediaWiki later on, with the expectation that only minor
edits will be required.

To use MediaWiki format in a Tiddler, tag the Tiddler with MediaWikiFormat. See [[testMediaWikiFormat]]
for an example.

!!!Issues
There are (at least) the following known issues:
# Not all styles from http://meta.wikimedia.org/wiki/MediaWiki:Common.css incorporated
## Styles for tables don't yet match Wikipedia styles.
## Styles for image galleries don't yet match Wikipedia styles.
# Anchors not yet supported.

!!!Not supported
# Magic words and variables http://meta.wikimedia.org/wiki/Help:Magic_words
# Template substitution http://meta.wikimedia.org/wiki/Help:Substitution
# Template colon functions http://meta.wikimedia.org/wiki/Help:Colon_function
# Template parser functions (eg #if) http://meta.wikimedia.org/wiki/ParserFunctions
# {{{^''}}} (italic at start of line) indents, makes italic and quotes with guilmot quote
***/

//{{{
// Ensure that the MediaWikiFormatter Plugin is only installed once.
if(!version.extensions.MediaWikiFormatterPlugin) {
version.extensions.MediaWikiFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('MediaWikiFormatterPlugin requires TiddlyWiki 2.1 or later.');}

if(config.options.chkDisplayInstrumentation == undefined)
	{config.options.chkDisplayInstrumentation = false;}

if(config.options.chkMediaWikiDisplayEmptyTemplateLinks == undefined)
	{config.options.chkMediaWikiDisplayEmptyTemplateLinks = false;}
if(config.options.chkMediaWikiDisplayEnableThumbZoom == undefined)
	{config.options.chkMediaWikiDisplayEnableThumbZoom = false;}
if(config.options.chkMediaWikiListReferences == undefined)
	{config.options.chkMediaWikiListReferences = false;}

config.macros.list.templates = {};
config.macros.list.templates.handler = function(params)
{
	return store.getTemplates();
};

TiddlyWiki.prototype.getTemplates = function()
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(tiddler.title.substr(0,9)=='Template:')
			results.push(tiddler);
		});
	results.sort();
	return results;
};

TiddlyWiki.prototype.getMediaWikiArticles = function()
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(!tiddler.isTagged("excludeLists") && tiddler.title.substr(0,9)!='Template:')
			results.push(tiddler);
		});
	results.sort(function(a,b) {return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1);});
	return results;
};

wikify = function(source,output,highlightRegExp,tiddler)
{
	if(source && source != '') {
		var w = new Wikifier(source,getParser(tiddler),highlightRegExp,tiddler);
		w.linkCount = 0;
		w.tableDepth = 0;
		w.output = tiddler==null ? output : createTiddlyElement2(output,'p');
		var time1,time0 = new Date();
		w.subWikifyUnterm(w.output);
		if(tiddler && config.options.chkDisplayInstrumentation) {
			time1 = new Date();
			var t = tiddler ? tiddler.title : source.substr(0,10);
			displayMessage('Wikify "'+t+'" in ' + (time1-time0) + ' ms');
		}
	}
//#at point of usage can use:
//#var output = w.output.nodeType==1 && w.output.nodeName=='P' ? w.output.parentNode : w.output;
};

function createTiddlyElement2(parent,element)
{
	return parent.appendChild(document.createElement(element));
}

config.formatterHelpers.createElementAndWikify = function(w)
{
	w.subWikifyTerm(createTiddlyElement2(w.output,this.element),this.termRegExp);
};

MediaWikiFormatter = {}; // 'namespace' for local functions

mwDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,'\\n').replace(/\r/mg,'RR'));
	createTiddlyElement2(out,'br');
};

MediaWikiFormatter.hijackListAll = function ()
{
	MediaWikiFormatter.oldListAll = config.macros.list.all.handler;
	config.macros.list.all.handler = function(params) {
		return store.getMediaWikiArticles();
	};
};

MediaWikiFormatter.hijackListAll();

MediaWikiFormatter.getTemplateParams = function(w)
{
//#{{test|a|b}}
//#{{test|n=a|m=b}}
	var params = {};

	var i = 1;
	var text = w.source + '|';
	var pRegExp = /(?:([^\|]*)=)?([^\|]*)\|/mg;
	var match = pRegExp.exec(text);
	if(match) {
		// skip template name
		match = pRegExp.exec(text);
	}
	while(match) {
		//params[match[1] ? match[1] : i++] = match[2];
		if(match[1]) {
			params[match[1]] = match[2];
		} else {
			params[i] = match[2];
			i++;
		}
		match = pRegExp.exec(text);
	}
	return params;
};

MediaWikiFormatter.expandTemplate = function(w,tiddler,params)
// see http://meta.wikimedia.org/wiki/Help:Template
{
	var text = tiddler.text;
	text = text.replace(/<noinclude>((?:.|\n)*?)<\/noinclude>/mg,'');// remove text between noinclude tags
	var ioRegExp = /<includeonly>((?:.|\n)*?)<\/includeonly>/mg;
	var t = '';
	var match = ioRegExp.exec(text);
	while(match) {
		t += match[1];
		match = ioRegExp.exec(text);
	}
	text = t == '' ? text : t;

	var paramsRegExp = /\{\{\{(.*?)(?:\|(.*?))?\}\}\}/mg;
	t = '';
	var pi = 0;
	match = paramsRegExp.exec(text);
	while(match) {
		var name = match[1];
		var def = match[2];
		var val = params[name];
		if(!val) {
			val = def;
		}
		if(!val) {
			val = match[0];
		}
		t += text.substring(pi,match.index) + val;
		pi = paramsRegExp.lastIndex;
		match = paramsRegExp.exec(text);
	}
	return t == '' ? text : t;
};

MediaWikiFormatter.endOfParams = function(w,text)
{
	var p = 0;
	var i = text.indexOf('|');
	if(i==-1) {return -1;}
	var n = text.indexOf('\n');
	if(n!=-1 && n<i) {return -1;}
	var b = text.indexOf('[[');
	if(b!=-1 && b<i) {return -1;}// can't have [[ in parameters
	
	b = text.indexOf('{{');
	while(b!=-1 && b<i) {
		// have {{ before |, so need to find first '|' after '{{..}}' pairs
		//cut off the ..{{, find the }} cut off and repeat
		p += b;
		text = text.substr(b);
		var c = text.indexOf('}}');
		p += c;
		text = text.substr(c);
		i = text.indexOf('|');
		if(i==-1) {return -1;}
		n = text.indexOf('\n');
		if(n!=-1 && n<i) {return -1;}
		b = text.indexOf('{{');
		i = -1;
	}
	return i;
};

MediaWikiFormatter.readToDelim = function(w)
//!!! this is a bit rubish, needs doing properly.
{
//#delimiter, startBracket terminatorBracket
	var dRegExp = /\|/mg;
	var sRegExp = /\[\[/mg;
	var tRegExp = /\]\]/mg;

	dRegExp.lastIndex = w.startMatch;
	var dMatch = dRegExp.exec(w.source);
	sRegExp.lastIndex = w.startMatch;
	var sMatch = sRegExp.exec(w.source);
	tRegExp.lastIndex = w.startMatch;
	var tMatch = tRegExp.exec(w.source);
	if(!tMatch) {
		//mwDebug(w.output,'ERROR1');
		return false;
	}

	while(sMatch && sMatch.index<tMatch.index) {
		if(dMatch && dMatch.index<sMatch.index) {
			//# delim is before startBracket, so return it
//#mwDebug(w.output,'di:'+dMatch.index+' dl:'+sRegExp.lastIndex);
			w.nextMatch = dRegExp.lastIndex;
			w.matchLength = dMatch.index - w.startMatch;
			return true;
		}
//#mwDebug(w.output,'si:'+sMatch.index+' sl:'+sRegExp.lastIndex);
//#mwDebug(w.output,'ti:'+tMatch.index+' tl:'+tRegExp.lastIndex);
		//# startBracket before termBracket, so skip over bracket pairs
		// found eg [[, so look for ]]
		tRegExp.lastIndex = sRegExp.lastIndex;
		tMatch = tRegExp.exec(w.source);
//#mwDebug(w.output,'xti:'+tMatch.index+' tl:'+tRegExp.lastIndex);
		
		// and look for another [[
		w.nextMatch = tRegExp.lastIndex;
		dRegExp.lastIndex = w.nextMatch;
		dMatch = dRegExp.exec(w.source);
		sRegExp.lastIndex = w.nextMatch;
		sMatch = sRegExp.exec(w.source);
		tRegExp.lastIndex = w.nextMatch;
		tMatch = tRegExp.exec(w.source);
	}
		
	if(dMatch && dMatch.index<tMatch.index) {
		//# delim is before term, so return it
//#mwDebug(w.output,'2di:'+dMatch.index+' dl:'+sRegExp.lastIndex);
		w.nextMatch = dRegExp.lastIndex;
		w.matchLength = dMatch.index - w.startMatch;
		return true;
	}
	if(tMatch) {
		//# delim is before term, so return it
//#mwDebug(w.output,'2ti:'+tMatch.index+' tl:'+tRegExp.lastIndex);
		w.nextMatch = tRegExp.lastIndex;
		w.matchLength = tMatch.index - w.startMatch;
		return false;
	}
	//mwDebug(w.output,'ERROR2');
	//# return term
	w.nextMatch = tRegExp.lastIndex;
	w.matchLength = -1;
	return false;
};

MediaWikiFormatter.getParams = function(w)
{
	var params = [];
	var i = 1;
	w.startMatch = w.nextMatch;
	var read = MediaWikiFormatter.readToDelim(w);
	if(w.matchLength!=-1) {
		params[i] = w.source.substr(w.startMatch,w.matchLength);
	}
	while(read) {
		i++;
		w.startMatch = w.nextMatch;
		read = MediaWikiFormatter.readToDelim(w);
		if(w.matchLength!=-1) {
			params[i] = w.source.substr(w.startMatch,w.matchLength);
		}
	}
	return params;
};

MediaWikiFormatter.setFromParams = function(w,p)
{
	var r = {};
	var re = /\s*(.*?)=(?:(?:"(.*?)")|(?:'(.*?)')|((?:\w|%|#)*))/mg;
	var match = re.exec(p);
	while(match)
		{
		var s = match[1].unDash();
		if(match[2]) {
			r[s] = match[2];
		} else if(match[3]) {
			r[s] = match[3];
		} else {
			r[s] = match[4];
		}
		match = re.exec(p);
	}
	return r;
};

MediaWikiFormatter.setAttributesFromParams = function(e,p)
{
	var re = /\s*(.*?)=(?:(?:"(.*?)")|(?:'(.*?)')|((?:\w|%|#)*))/mg;
	var match = re.exec(p);
	while(match) {
		var s = match[1].unDash();
		if(s == 'bgcolor') {
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

config.mediaWikiFormatters = [
{
	name: 'mediaWikiHeading',
	match: '^={2,6}(?!=)\\n?',
	termRegExp: /(={2,6}\n?)/mg,
	handler: function(w)
	{
		//#var output = w.output.nodeType==1 && w.output.nodeName=='P' ? w.output.parentNode : w.output;
		var output = w.output;
		var e = createTiddlyElement2(output,'h' + w.matchLength);
		var a = createTiddlyElement2(e,'a');// drop anchor
		var t = w.tiddler ? w.tiddler.title + ':' : '';
		var len = w.source.substr(w.nextMatch).indexOf('=');
		a.setAttribute('name',t+w.source.substr(w.nextMatch,len));
		w.subWikifyTerm(e,this.termRegExp);
		//#w.output = createTiddlyElement2(output,'p');
	}
},

{
	name: 'mediaWikiTable',
	match: "^\\{\\|", // ^{|
	tableTerm: "\\n\\|\\}", // |}
	rowStart: "\\n\\|\\-", // \n|-
	cellStart: "\\n!|!!|\\|\\||\\n\\|", //\n! or !! or || or \n|
	caption: "\\n\\|\\+",
	rowTerm: null,
	cellTerm: null,
	inCellTerm: null,
	tt: 0,
	debug: null,
	rowTermRegExp: null,
	handler: function(w)
	{
		if(!this.rowTermRegExp) {
			this.rowTerm = '(' + this.tableTerm +')|(' + this.rowStart + ')';
			this.cellTerm = this.rowTerm + '|(' + this.cellStart + ')';
			this.inCellTerm = '(' + this.match + ')|' + this.rowTerm + '|(' + this.cellStart + ')';
			this.caption = '(' + this.caption + ')|' + this.cellTerm;

			this.rowTermRegExp = new RegExp(this.rowTerm,'mg');
			this.cellTermRegExp = new RegExp(this.cellTerm,'mg');
			this.inCellTermRegExp = new RegExp(this.inCellTerm,'mg');
			this.captionRegExp = new RegExp(this.caption,'mg');
		}
//#this.debug = createTiddlyElement2(w.output,'p');
//#mwDebug(this.debug,'start table');
		this.captionRegExp.lastIndex = w.nextMatch;
		var match = this.captionRegExp.exec(w.source);
		if(!match) {return;}
		//#var inPara = w.output.nodeType==1 && w.output.nodeName=='P' ? true : false;
		//#var output = inPara ? w.output.parentNode : w.output;
		var output = w.output;
		var table = createTiddlyElement2(output,'table');
		var rowContainer = table;

		var i = w.source.indexOf('\n',w.nextMatch);
		if(i>w.nextMatch) {
			MediaWikiFormatter.setAttributesFromParams(table,w.source.substring(w.nextMatch,i));
			w.nextMatch = i;
		}

		var rowCount = 0;
		var eot = false;
		if(match[1]) {
			// caption
			var caption = createTiddlyElement2(table,'caption');
			w.nextMatch = this.captionRegExp.lastIndex;
			var captionText = w.source.substring(w.nextMatch);
			var n = captionText.indexOf('\n');
			captionText = captionText.substr(0,n);
			i = MediaWikiFormatter.endOfParams(w,captionText);
			if(i!=-1) {
				captionText = w.source.substr(w.nextMatch,i);
				//captionText = captionText.replace(/^\+/mg,'')//!!hack until I fix this properly
				//MediaWikiFormatter.setAttributesFromParams(caption,captionText);
				w.nextMatch += i+1;
			}
			if(caption != table.firstChild) {
				table.insertBefore(caption,table.firstChild);
			}
			w.subWikify(caption,this.cellTerm);
			w.nextMatch -= w.matchLength;// rewind to before the match
			this.cellTermRegExp.lastIndex = w.nextMatch;
			var match2 = this.cellTermRegExp.exec(w.source);
			if(match2) {
				if(match2[3]) {
					// no first row marker
					eot = this.rowHandler(w,createTiddlyElement2(rowContainer,'tr'));
					rowCount++;
				}
			}
		} else if(match[3]) {
			// row
			w.nextMatch = this.captionRegExp.lastIndex-match[3].length;// rewind to before the match
		} else if(match[4]) {
			// cell, no first row marker in table
			w.nextMatch = this.captionRegExp.lastIndex-match[4].length;// rewind to before the match
			eot = this.rowHandler(w,createTiddlyElement2(rowContainer,'tr'));
			rowCount++;
		}

		this.rowTermRegExp.lastIndex = w.nextMatch;
		match = this.rowTermRegExp.exec(w.source);
		while(match && eot==false) {
			if(match[1]) {
				// end table
				w.nextMatch = this.rowTermRegExp.lastIndex;
				if(w.tableDepth==0) {
					return;
				}
			} else if(match[2]) {
				// row
				var rowElement = createTiddlyElement2(rowContainer,'tr');
				w.nextMatch += match[2].length;// skip over the match
				i = w.source.indexOf('\n',w.nextMatch);
				if(i>w.nextMatch) {
					MediaWikiFormatter.setAttributesFromParams(rowElement,w.source.substring(w.nextMatch,i));
					w.nextMatch = i;
				}
				eot = this.rowHandler(w,rowElement);
			}
			rowCount++;
			this.rowTermRegExp.lastIndex = w.nextMatch;
			match = this.rowTermRegExp.exec(w.source);
		}//# end while
		if(w.tableDepth==0) {
			w.nextMatch +=3;// skip over tableterm, \n|}
		}
		//#if(inPara)
		//#	w.output = createTiddlyElement2(output,'p');
	},//# end handler

	rowHandler: function(w,e)
	{
		//# assumes w.nextMatch points to first cell terminator, returns false if any improperly terminated element
		var cell;
		this.inCellTermRegExp.lastIndex = w.nextMatch;
		var match = this.inCellTermRegExp.exec(w.source);
		while(match) {
			if(match[1])
				{// nested table
				w.tableDepth++;
				w.subWikify(cell,this.tableTerm);
				w.nextMatch = this.tt;
				w.tableDepth--;
				return false;
			} else if(match[2]) {
				//# end table
				this.tt = this.inCellTermRegExp.lastIndex;
				return true;
			} else if(match[3]) {
				//# end row
				return false;
			} else if(match[4]) {
				//# cell
				var len = match[4].length;
				cell = createTiddlyElement2(e,match[4].substr(len-1)=='!'?'th':'td');
				w.nextMatch += len;//skip over the match

				this.inCellTermRegExp.lastIndex = w.nextMatch;
				var lookahead = this.inCellTermRegExp.exec(w.source);
				if(!lookahead) {
					//# improperly terminated table
					return false;
				}
				var cellText = w.source.substr(w.nextMatch,lookahead.index-w.nextMatch);
				var oldSource = w.source;
				var i = MediaWikiFormatter.endOfParams(w,cellText);//cellText.indexOf('|');
				if(i!=-1) {
					cellText = cellText.replace(/^\+/mg,'');  //!!hack until I fix this properly
					MediaWikiFormatter.setAttributesFromParams(cell,cellText.substr(0,i-1));
					cellText = cellText.substring(i+1);
				}
				cellText = cellText.replace(/^\s*/mg,''); //# remove leading spaces so not treated as preformatted
				w.source = cellText;
				w.nextMatch = 0;
				w.subWikifyUnterm(cell);
				w.source = oldSource;
				w.nextMatch = lookahead.index;
			}
			this.inCellTermRegExp.lastIndex = w.nextMatch;
			match = this.inCellTermRegExp.exec(w.source);
		}//# end while
		return false;
	}//# end rowHandler
},

{
	name: 'mediaWikiList',
	match: '^[\\*#;:]+',
	lookaheadRegExp: /^(?:(?:(\*)|(#)|(;)|(:))+)(?: ?)/mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		//#var output = w.output.parentNode;
		var stack = [w.output];
		var currLevel = 0, currType = null;
		var listType, itemType;
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
			var listLevel = lookaheadMatch[0].length;
			w.nextMatch += listLevel;
			if(listLevel > currLevel) {
				for(var i=currLevel; i<listLevel; i++) {
					stack.push(createTiddlyElement2(stack[stack.length-1],listType));
				}
			} else if(listLevel < currLevel) {
				for(i=currLevel; i>listLevel; i--) {
					stack.pop();
				}
			} else if(listLevel == currLevel && listType != currType) {
				stack.pop();
				stack.push(createTiddlyElement2(stack[stack.length-1],listType));
			}
			currLevel = listLevel;
			currType = listType;
			var e = createTiddlyElement2(stack[stack.length-1],itemType);
			w.subWikifyTerm(e,this.termRegExp);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
		//#w.output = createTiddlyElement2(output,'p');
	}
},

{
	name: 'mediaWikiRule',
	match: '^----+$\\n?',
	handler: function(w)
	{
		//#var output = w.output.parentNode;
		createTiddlyElement2(w.output,'hr');
		//#w.output = createTiddlyElement2(output,'p');
	}
},

{
	name: 'mediaWikiLeadingSpaces',
	match: '^ ',
	lookaheadRegExp: /^ /mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var e = createTiddlyElement2(w.output,'pre');
		while(true) {
			w.subWikifyTerm(e,this.termRegExp);
			createTiddlyElement2(e,'br');
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
				w.nextMatch += lookaheadMatch[0].length;
			} else {
				break;
			}
		}
	}
},

//# [[Image:Westminstpalace.jpg|frame|none|caption text]]
//# //http://en.wikipedia.org/wiki/Image:Westminstpalace.jpg
//# <a href="/wiki/Image:Westminstpalace.jpg" class="internal" title="caption text">
//# <img src="http://upload.wikimedia.org/wikipedia/commons/3/39/Westminstpalace.jpg"
//#  alt="caption text" width="400" height="300" longdesc="/wiki/Image:Westminstpalace.jpg" />
//# </a>

//# [[image:Stockholm.jpg|right|350px|thumb|Stockholm panorama from the City Hall]]
//# <div class="thumb tright">
//# 	<div style="width:352px;">
//# 		<a href="/wiki/Image:Stockholm.jpg" class="internal" title="Stockholm panorama from the City Hall">
//# 			<img src="http://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Stockholm.jpg/350px-Stockholm.jpg" alt="Stockholm panorama from the City Hall" width="350" height="84" longdesc="/wiki/Image:Stockholm.jpg" />
//# 		</a>
//# 		<div class="thumbcaption">
//# 			<div class="magnify" style="float:right">
//# 				<a href="/wiki/Image:Stockholm.jpg" class="internal" title="Enlarge">
//# 				<img src="/skins-1.5/common/images/magnify-clip.png" width="15" height="11" alt="Enlarge" />
//# 				</a>
//# 			</div>
//# 			Stockholm panorama from the City Hall
//# 		</div>
//# 	</div>
//# </div>
{
	name: 'mediaWikiImage',
	match: '\\[\\[(?:[Ii]mage|Bild):',
	lookaheadRegExp: /\[\[(?:[Ii]mage|Bild):/mg,
	defaultPx: 180,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var params = MediaWikiFormatter.getParams(w);
			var src = params[1];
			src = src.trim().replace(/ /mg,'_');
			src = src.substr(0,1).toUpperCase() + src.substring(1);
			var palign = null;
			var ptitle = null;
			var psrc = false;
			var px = null;
			var pthumb = false;
			var pframed = false;
			for(var i=2;i<params.length;i++) {
				//# right, left, center, none, sizepx, thumbnail (thumb), frame, and alternate (caption) text.
				var p = params[i];
				if(p=='right'||p=='left'||p=='center'||p=='none') {
					palign = p;
				} else if(p=='thumbnail'||p=='thumb') {
					pthumb = true;
				} else if(p=='framed') {
					pframed = true;
				} else if(/\d{1,4} ?px/.exec(p)) {
					px = p.substr(0,p.length-2).trim();
				} else {
					ptitle = p;
				}
			}//#end for
			if(pthumb) {
				//#var output = w.output.nodeType==1 && w.output.nodeName=='P' ? w.output.parentNode : w.output;
				var output = w.output;
				if(!palign) {
					palign = 'right';
				}
				if(!px) {
					px = 180;
				}
				psrc = px + 'px-' + src;
				var t = createTiddlyElement(output,'div',null,'thumb'+(palign?' t'+palign:''));
				var s = createTiddlyElement2(t,'div');
				s.style['width'] = Number(px) + 2 + 'px';
				var a = createTiddlyElement(s,'a',null,'internal');
				if(config.options.chkMediaWikiDisplayEnableThumbZoom) {
					a.href = src;
				}
				a.title = ptitle;
				var img = createTiddlyElement2(a,'img');
				img.src = 'images/' + psrc;
//#mwDebug(w.output,'s1:'+img.src);
				img.width = px;
				img.longdesc = 'Image:' + src;
				img.alt = ptitle;

				var tc = createTiddlyElement(s,'div',null,'thumbcaption');
				var oldSource = w.source; var oldMatch = w.nextMatch;
				w.source = ptitle; w.nextMatch = 0;
				w.subWikifyUnterm(tc);
				w.source = oldSource; w.nextMatch = oldMatch;

				if(config.options.chkMediaWikiDisplayEnableThumbZoom) {
					var tm = createTiddlyElement(tc,'div',null,'magnify');
					tm.style['float'] = 'right';
					var ta = createTiddlyElement(tm,'a',null,'internal');
					ta.title = 'Enlarge';
					timg = createTiddlyElement2(ta,'img'); timg.src = 'magnify-clip.png'; timg.alt = 'Enlarge'; timg.width = '15'; timg.height = '11';
					ta.href = src;
				}
			} else {
				// not pthumb
				a = createTiddlyElement(w.output,'a',null,'image');
				a.title = ptitle;
				img = createTiddlyElement2(a,'img');
				if(palign) {img.align = palign;}
				img.src = px ? 'images/' + px + 'px-' + src : 'images/' + src;
//#mwDebug(w.output,'s2:'+img.src);
				if(px) {img.width = px;}
				img.longdesc = 'Image:' + src;
				img.alt = ptitle;
			}
		}
	}//#end image handler
},

{
	name: 'mediaWikiExplicitLink',
	match: '\\[\\[',
	lookaheadRegExp: /\[\[(?:([a-z]{2,3}:)?)(#?)([^\|\]]*?)(?:(\]\](\w*))|(\|(.*?)\]\]))/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			if(!lookaheadMatch[1]) {
				// not (eg) [[en:...]]
				var e;
				var link = lookaheadMatch[3];
				var text = link;
				link = link.substr(0,1).toUpperCase() + link.substring(1);
				if(lookaheadMatch[4]) {
					// Simple bracketted link
					if(lookaheadMatch[2]) {
						var a = createTiddlyElement2(e,'a');// drop anchor
						a.setAttribute('name',link);
					} else {
						e = createTiddlyLink(w.output,link,false,null,w.isStatic);
						if(lookaheadMatch[5]) {
							text += lookaheadMatch[5];//add any non-space after the ]]
						}
						createTiddlyText(e,text);
					}
				} else if(lookaheadMatch[6]) {
					// Piped link
					if(config.formatterHelpers.isExternalLink(link)) {
						e = createExternalLink(w.output,link);
					} else {
						e = createTiddlyLink(w.output,link,false,null,w.isStatic);
					}
					var oldSource = w.source; var oldMatch = w.nextMatch;
					w.source = lookaheadMatch[7].trim(); w.nextMatch = 0;
					w.subWikifyUnterm(e);
					w.source = oldSource; w.nextMatch = oldMatch;
				}
			}
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

//#{{Audio|sv-Stockholm.ogg|Stockholm}}
//**tem//
{
	name: 'mediaWikiTemplate',
	match: '\\{\\{[^\\{]',
	lookaheadRegExp: /\{\{((?:.|\n)*?)\}\}/mg,
	handler: function(w)
	{
//# mwDebug(w.output,'wt:'+w.matchText+' ws:'+w.matchStart+' wn:'+w.nextMatch+' wl:'+w.matchLength);
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
//# mwDebug(w.output,'lm:'+lookaheadMatch);
//# mwDebug(w.output,'lmi:'+lookaheadMatch.index+' lI:'+this.lookaheadRegExp.lastIndex);
//# mwDebug(w.output,'lm1:'+lookaheadMatch[1]);
//# mwDebug(w.output,'lm2:'+lookaheadMatch[2]);
			var lastIndex = this.lookaheadRegExp.lastIndex;
			var contents = lookaheadMatch[1];
			// see http://meta.wikimedia.org/wiki/Help:Variable
			if(contents=='PAGENAME') {
				createTiddlyText(w.output,w.tiddler.title);
				w.nextMatch = lastIndex;
				return;
			}
			var i = contents.indexOf('|');
			var title = i==-1 ? contents : contents.substr(0,i);
			title = title.trim().replace(/_/mg,' ');// Underscore in template name is equivalent to space
			title = 'Template:' + title.substr(0,1).toUpperCase() + title.substring(1);
			var tiddler = store.fetchTiddler(title);
			var oldSource = w.source;
			if(tiddler) {
				params = {};
				w.source = lookaheadMatch[1];
				if(i!=-1) {
					w.nextMatch = 0;
					params = MediaWikiFormatter.getTemplateParams(w);
				}
				w.source = MediaWikiFormatter.expandTemplate(w,tiddler,params);
				w.nextMatch = 0;
				w.subWikifyUnterm(w.output);
			} else {
				if(config.options.chkMediaWikiDisplayEmptyTemplateLinks) {
					// for conveniece, output the name of the template so can click on it and create tiddler
					w.source = '[['+title+']]';
					w.nextMatch = 0;
					w.subWikifyUnterm(w.output);
				}
			}
			w.source = oldSource;
			w.nextMatch = lastIndex;
		}
	}
},

{
	name: 'mediaWikiParagraph',
	match: '\\n{2,}',
	handler: function(w)
	{
		//#var output = w.output.nodeType==1 && w.output.nodeName=='P' ? w.output.parentNode : w.output;
		w.output = createTiddlyElement2(w.output,'p');
	}
},

{
	name: 'mediaWikiExplicitLineBreak',
	match: '<br ?/?>',
	handler: function(w)
	{
		createTiddlyElement2(w.output,'br');
	}
},

{
	name: 'mediaWikiExplicitLineBreakWithParams',
	match: "<br(?:\\s*(?:(?:.*?)=[\"']?(?:.*?)[\"']?))*?\\s*/?>",
	lookaheadRegExp: /<br((?:\s+(?:.*?)=["']?(?:.*?)["']?)*?)?\s*\/?>/mg,
	handler: function(w)
	{
		//# copes with erroneous <br clear='right'>
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var e =createTiddlyElement2(w.output,'br');
			if(lookaheadMatch[1]) {
				MediaWikiFormatter.setAttributesFromParams(e,lookaheadMatch[1]);
			}
			w.nextMatch = this.lookaheadRegExp.lastIndex;// empty tag
		}
	}
},

{
	name: 'mediaWikiTitledUrlLink',
	match: '\\[' + config.textPrimitives.urlPattern + '(?:\\s+[^\\]]+)?' + '\\]',
	//# eg [http://www.nupedia.com] or [http://www.nupedia.com Nupedia]
	//# <sup id='_ref-1' class='reference'><a href='#_note-1' title=''>[2]</a>
	handler: function(w)
	{
		var lookaheadRegExp = new RegExp('\\[(' + config.textPrimitives.urlPattern + ')(?:\\s+([^\[]+))?' + '\\]','mg');
		lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index==w.matchStart) {
			var link = lookaheadMatch[1];
			var s = createTiddlyElement2(w.output,'sup');
			var e = createExternalLink(s,link);
			if(lookaheadMatch[2]) {
				var oldSource = w.source; var oldMatch = w.nextMatch;
				w.source = lookaheadMatch[2].trim(); w.nextMatch = 0;
				w.subWikifyUnterm(e);
				w.source = oldSource; w.nextMatch = oldMatch;
			} else {
				w.linkCount++;
				createTiddlyText(e,'['+w.linkCount+']');
			}
			w.nextMatch = lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: 'mediaWikiUrlLink',
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: 'mediaWikiBoldItalic',
	match: "'''''",
	termRegExp: /('''''|(?=\n))/mg,
	element: 'strong',
	handler: function(w)
	{
		var e = createTiddlyElement(w.output,this.element);
		w.subWikifyTerm(createTiddlyElement(e,'em'),this.termRegExp);
	}
},

{
	name: 'mediaWikiBold',
	match: "'''",
	termRegExp: /('''|(?=\n))/mg,
	element: 'strong',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'mediaWikiItalic',
	match: "''",
	termRegExp: /((?:[^']''(?!'))|(?=\n))/mg,
	element: 'em',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'mediaWikiUnderline',
	match: '<u>',
	termRegExp: /(<\/u>|(?=\n))/mg,
	element: 'u',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'mediaWikiStrike',
	match: '<s>',
	termRegExp: /(<\/s>|(?=\n))/mg,
	element: 'strike',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'mediaWikiBoldTag',
	match: '<b>',
	termRegExp: /(<\/b>|(?=\n))/mg,
	element: 'b',
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: 'mediaWikiTemplateParam',// note, this only gets invoked when viewing the template
	match: '\\{\\{\\{',
	lookaheadRegExp: /(\{\{\{(?:.|\n)*?\}\}\})/mg,
	element: 'span',
	handler: config.formatterHelpers.enclosedTextHelper
},

//# See http://en.wikipedia.org/wiki/Wikipedia:Footnotes
//# for an explanation of how to generate footnotes using the <ref(erences/)> tags
{
	name: 'mediaWikiInsertReference',
	match: '<ref[^/]*>',
	lookaheadRegExp: /<ref(\s+(?:.*?)=["']?(?:.*?)["']?)?>([^<]*?)<\/ref>/mg,
	//#lookaheadRegExp: /<ref(\s+(?:.*?)=["']?(?:.*?)["']?)?>([.\n]*?)<\/ref>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var x = {id:'',value:''};
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			if(!w.referenceCount) {
				w.referenceCount = 0;
				w.references = {};
			}
			var s = createTiddlyElement(w.output,'sup',null,'reference');
			var a = createTiddlyElement2(s,'a');
			var prefix = w.tiddler ? w.tiddler.title + ':' : '';
			if(lookaheadMatch[1]) {
				//# <ref params>
				var r = {};
				r = MediaWikiFormatter.setFromParams(w,lookaheadMatch[1]);
				var name = r.name ? r.name.trim() : '';
				name = name.replace(/ /g,'_');
				s.id = prefix + '_ref-' + name;// + '_' + nameCount;(w.referenceCount+1);
				if(!w.references[name]) {
					w.references[name] = x;
					w.references[name].id = w.referenceCount;
					w.references[name].value = lookaheadMatch[2].trim();
				}
			} else {
				//# <ref>, repeat reference
				w.references[w.referenceCount] = x;
				w.references[w.referenceCount].id = w.referenceCount;
				w.references[w.referenceCount].value = lookaheadMatch[2].trim();
				name = w.referenceCount;
				s.id = prefix + '_ref-' + w.referenceCount;
			}
			w.referenceCount++;
			a.title = lookaheadMatch[2].trim();//mb, extra to wikipedia
			a.href = '#' + prefix + '_note-' + name;
			a.innerHTML = '['+w.referenceCount+']';
//#<sup id='_ref-0' class='reference'><a href='#_note-0' title=''>[1]</a></sup>
//#<sup id='_ref-foreign_ministry_0' class='reference'><a href='#_note-foreign_ministry' title=''>[2]</a></sup>
		}
	}
},

{
	name: 'mediaWikiListReferences',
	match: '<references ?/>',
	lookaheadRegExp: /<references ?\/>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(config.options.chkMediaWikiListReferences && w.referenceCount) {
			var ol = createTiddlyElement(w.output,'ol',null,'references');
			var oldSource = w.source;
			if(w.referenceCount>0) {
				for(var i in w.references) {
					var li = createTiddlyElement2(ol,'li');
					var prefix = w.tiddler ? w.tiddler.title + ':' : '';
					var b = createTiddlyElement2(li,'b');
					var a = createTiddlyElement2(b,'a');
					li.id = prefix + '_note-' + i;
					a.href = '#' + prefix + '_ref-' + i;
					a.innerHTML = '^';
					w.source = w.references[i].value;
					w.nextMatch = 0;
					w.subWikifyUnterm(li);
				}
			}
			w.source = oldSource;
		}
		w.nextMatch = this.lookaheadRegExp.lastIndex;
	}
},

{
	name: 'mediaWikiRepeatReference',
	match: '<ref[^/]*/>',
	lookaheadRegExp: /<ref(\s+(?:.*?)=["'](?:.*?)["'])?\s*\/>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var x = {id:'',value:''};
			w.nextMatch = this.lookaheadRegExp.lastIndex;
//#<ref name="foreign ministry">
//#<sup id="_ref-foreign_ministry_1" class="reference"><a href="#_note-foreign_ministry" title="">[2]</a></sup>
			var s = createTiddlyElement(w.output,"sup",null,"reference");
			var a = createTiddlyElement2(s,"a");
			var prefix = w.tiddler ? w.tiddler.title : '';
			if(lookaheadMatch[1]) {
				var r = {};
				r = MediaWikiFormatter.setFromParams(w,lookaheadMatch[1]);
				var name = r.name ? r.name.trim() : '';
				name = name.replace(/ /g,'_');
				s.id = prefix + '_ref-' + name +'_' + (w.referenceCount+1);
				var count = w.references && w.references[name] ? (w.references[name].id+1) : '?';
			}
			a.href = '#' + prefix + '_note-' + name;
			a.innerHTML = '['+count+']';
			a.title = name;
		}
	}//# end handler
},

{
	name: 'mediaWikiHtmlEntitiesEncoding',
	match: '&#?[a-zA-Z0-9]{2,8};',
	handler: function(w)
	{
		createTiddlyElement2(w.output,'span').innerHTML = w.matchText;
	}
},

{
	name: 'mediaWikiComment',
	match: '<!\\-\\-',
	lookaheadRegExp: /<!\-\-((?:.|\n)*?)\-\->/mg,
	//#lookaheadRegExp: /<!\-\-([.\n]*?)\-\->/mg,
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
	name: 'mediaWikiIncludeOnly',
	match: '<includeonly>',
	lookaheadRegExp: /<includeonly>((?:.|\n)*?)<\/includeonly>/mg,
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
	name: 'mediaWikiNoWiki',
	match: '<nowiki>',
	lookaheadRegExp: /<nowiki>((?:.|\n)*?)<\/nowiki>/mg,
	element: 'span',
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: 'mediaWikiPreNoWiki',
	match: '<pre>\s*<nowiki>',
	lookaheadRegExp: /<pre>\s*<nowiki>((?:.|\n)*?)<\/nowiki>\s*<\/pre>/mg,
	element: 'pre',
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: 'mediaWikiPre',
	match: '<pre>',
	lookaheadRegExp: /<pre>((?:.|\n)*?)<\/pre>/mg,
	element: 'pre',
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: 'mediaWikiGallery',
	match: '<gallery>',
	lookaheadRegExp: /[Ii]mage:(.*?)\n/mg,
	handler: function(w)
	{
//#basic syntax is:
//#<gallery>
//#Image:Wiki.png
//#Image:Wiki.png|Captioned
//#Image:Wiki.png|[[Help:Contents/Links|Links]] can be put in captions.
//#Image:Wiki.png|Full [[MediaWiki]]<br />[[syntax]] may now be used…
//#</gallery>
//#<table class="gallery" cellspacing="0" cellpadding="0">
//#<tr>
//#...
//#</tr>
//#</table>
		var table = createTiddlyElement(w.output,'table',null,'gallery');
		table.cellspacing = '0';
		table.cellpadding = '0';
		var rowElem = createTiddlyElement2(table,'tr');
		var col = 0;
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var nM = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		var oldSource = w.source;
		while(lookaheadMatch) {
			nM += lookaheadMatch[1].length;
			w.source = lookaheadMatch[1] +']]';//!! ]] is hack until getParams is working
			w.nextMatch = 0;
			var params = MediaWikiFormatter.getParams(w);
			var src = params[1];
			src = src.trim().replace(/ /mg,'_');
			src = src.substr(0,1).toUpperCase() + src.substring(1);
			var palign = 'right'; 
			var psrc = '120px-'+src;
			var px = 120;
			var pframed = false;
			ptitle = null;
			for(var i=2;i<params.length;i++) {
				//right, left, center, none, sizepx, thumbnail (thumb), frame, and alternate (caption) text.
				var p = params[i];
				if(p=='right'||p=='left'||p=='center'||p=='none') {
					palign = p;
				} else if(p=='framed') {
					pframed = true;
				} else if(/\d{1,4}px/.exec(p)) {
					px = p.substr(0,p.length-2).trim();
					psrc = px + 'px-' + src;
				} else {
					ptitle = p;
				}
			}//#end for
//#<td>
//#<div class="gallerybox">
//#	<div class="thumb" style="padding: 26px 0;">
//#		<a href="/wiki/Image:Paul_C%C3%A9zanne_184.jpg" title="Image:Paul Cézanne 184.jpg">
//#		<img src="http://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Paul_C%C3%A9zanne_184.jpg/120px-Paul_C%C3%A9zanne_184.jpg" width="120" height="94" alt="" />
//#		</a>
//#	</div>
//#	<div class="gallerytext">
//#		<p><i>La Pain et les Oeufs</i> (Bread and Eggs), thought to present austerity, 1865. Signed and dated. Possibly in Spanish style.</p>
//#	</div>
//#</div>
//#</td>
			var td = createTiddlyElement2(rowElem,'td');
			var gb = createTiddlyElement(td,'div',null,'gallerybox');
			var t = createTiddlyElement(gb,'div',null,'thumb');
			t.style['padding'] = '26px 0';

			var a = createTiddlyElement2(t,'a');
			if(config.options.chkMediaWikiDisplayEnableThumbZoom) {
				a.href = src;
			}
			a.title = ptitle;
			var img = createTiddlyElement2(a,'img');
			img.src = psrc;
			img.width = px;
			img.alt = '';//ptitle;

			var gt = createTiddlyElement(gb,'div',null,'gallerytext');
			p = createTiddlyElement2(gt,'p');
			var oldSource2 = w.source; var oldMatch = w.nextMatch;
			w.source = ptitle; w.nextMatch = 0;
			w.subWikifyUnterm(p);
			w.source = oldSource2; w.nextMatch = oldMatch;

			col++;
			if(col>3) {
				rowElem = createTiddlyElement2(table,'tr');
				col = 0;
			}
			w.source = oldSource;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
		w.nextMatch = nM + '<gallery>'.length*2+1+'Image:'.length;//!! hack
	}
},

{
	name: 'mediaWikiHtmlTag',
	match: "<[a-zA-Z]{2,}(?:\\s*(?:(?:.*?)=[\"']?(?:.*?)[\"']?))*?>",
	lookaheadRegExp: /<([a-zA-Z]{2,})((?:\s+(?:.*?)=["']?(?:.*?)["']?)*?)?\s*(\/)?>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var e =createTiddlyElement2(w.output,lookaheadMatch[1]);
			if(lookaheadMatch[2]) {
				MediaWikiFormatter.setAttributesFromParams(e,lookaheadMatch[2]);
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

config.parsers.mediaWikiFormatter = new Formatter(config.mediaWikiFormatters);
config.parsers.mediaWikiFormatter.format = 'MediaWiki';
config.parsers.mediaWikiFormatter.formatTag = 'MediaWikiFormat';
} // end of 'install only once'
//}}}
