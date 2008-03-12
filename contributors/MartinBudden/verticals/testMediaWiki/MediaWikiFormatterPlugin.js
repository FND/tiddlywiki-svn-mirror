/***
|''Name:''|MediaWikiFormatterPlugin|
|''Description:''|Allows Tiddlers to use [[MediaWiki|http://meta.wikimedia.org/wiki/Help:Wikitext]] ([[WikiPedia|http://meta.wikipedia.org/]]) text formatting|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#MediaWikiFormatterPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/MediaWikiFormatterPlugin.js |
|''Version:''|0.4.5|
|''Date:''|Jul 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.1.0|

|''Display instrumentation''|<<option chkDisplayInstrumentation>>|
|''Display empty template links:''|<<option chkMediaWikiDisplayEmptyTemplateLinks>>|
|''Allow zooming of thumbnail images''|<<option chkMediaWikiDisplayEnableThumbZoom>>|
|''List references''|<<option chkMediaWikiListReferences>>|
|''Display unsupported magic words''|<<option chkDisplayMediaWikiMagicWords>>|

This is the MediaWikiFormatterPlugin, which allows you to insert MediaWiki formated text into a TiddlyWiki.

The aim is not to fully emulate MediaWiki, but to allow you to work with MediaWiki content off-line and then resync the content with your MediaWiki later on, with the expectation that only minor edits will be required.

To use MediaWiki format in a Tiddler, tag the Tiddler with MediaWikiFormat or set the tiddler's {{{wikiformat}}} extended field to {{{mediawiki}}}.

!!!Issues
There are (at least) the following known issues:
# Not all styles from http://meta.wikimedia.org/wiki/MediaWiki:Common.css incorporated
## Styles for tables don't yet match Wikipedia styles.
## Styles for image galleries don't yet match Wikipedia styles.
# Anchors not yet supported.

!!!Not supported
# Template parser functions (also called colon functions) http://meta.wikimedia.org/wiki/ParserFunctions eg &#123;&#123; #functionname: argument 1 | argument 2 | argument 3... &#125;&#125;
# Magic words and variables http://meta.wikimedia.org/wiki/Help:Magic_words eg {{{__TOC__}}}, &#123;&#123;CURRENTDAY&#125;&#125;, &#123;&#123;PAGENAME&#125;&#125;
# {{{^''}}} (italic at start of line) indents, makes italic and quotes with guilmot quote

!!!No plans to support
# Template substitution on save http://meta.wikimedia.org/wiki/Help:Substitution eg &#123;&#123; subst: templatename &#125;&#125;

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
if(config.options.chkDisplayMediaWikiMagicWords == undefined)
	{config.options.chkDisplayMediaWikiMagicWords = false;}

//#config.textPrimitives.urlPattern = "(([a-zA-Z][0-9a-zA-Z+\\-\\.]*:)?/{0,2}[0-9a-zA-Z;/?:@&=+$\\.\\-_!~*'()%]+)?(#[0-9a-zA-Z;/?:@&=+$\\.\\-_!~*'()%]+)?";
//#config.textPrimitives.urlPattern = "[a-z]{3,8}:/{0,2}[^\\s:/<>'\"][^\\s/<>'\"]*(?:/|\\b)";

//<div class='viewer' macro='view text wikified'></div>;

config.macros.include = {};
config.macros.include.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if((tiddler instanceof Tiddler) && params[0]) {
		var host = store.getValue(tiddler,'server.host');
		if(host && host.indexOf('wikipedia')!=-1) {
			var t = store.fetchTiddler(params[0]);
			var text = store.getValue(t,'text');
			wikify(text,place,highlightHack,tiddler);
		}
	}
};


MediaWikiFormatter = {}; // 'namespace' for local functions

mwDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,'\\n').replace(/\r/mg,'RR'));
	createTiddlyElement2(out,'br');
};

MediaWikiFormatter.Tiddler_changed = Tiddler.prototype.changed;
Tiddler.prototype.changed = function()
{
	if((this.fields.wikiformat==config.parsers.mediawikiFormatter.format) || this.isTagged(config.parsers.mediawikiFormatter.formatTag)) {
		//# update the links array, by checking for MediaWiki format links
		this.links = [];
//#lookaheadRegExp: /\[\[(?:([a-z]{2,3}:)?)(#?)([^\|\]]*?)(?:(\]\](\w*))|(\|(.*?)\]\]))/mg,
		var tiddlerLinkRegExp = /\[\[(?::?([A-Za-z]{2,}:)?)(#?)([^\|\]]*?)(?:(\]\])|(\|(.*?)\]\]))/mg;
		tiddlerLinkRegExp.lastIndex = 0;
		var match = tiddlerLinkRegExp.exec(this.text);
		while(match) {
			if(!match[1] && !match[2])
				this.links.pushUnique(match[3]);
			match = tiddlerLinkRegExp.exec(this.text);
		}
	} else if(!this.isTagged('systemConfig')) {
		MediaWikiFormatter.Tiddler_changed.apply(this,arguments);
		return;
	}
	this.linksUpdated = true;
};

TiddlyWiki.prototype.getMediaWikiPagesInNamespace = function(namespace)
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(tiddler.title.indexOf(namespace)==0)
			results.push(tiddler);
		});
	results.sort(function(a,b) {return a.title < b.title ? -1 : +1;});
	return results;
};

TiddlyWiki.prototype.getMediaWikiPages = function()
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(!tiddler.isTagged('excludeLists') && tiddler.title.indexOf(':')==-1)
			results.push(tiddler);
		});
	results.sort(function(a,b) {return a.title < b.title ? -1 : +1;});
	return results;
};

TiddlyWiki.prototype.getMediaWikiOtherPages = function()
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(!tiddler.isTagged('excludeLists') && tiddler.title.indexOf(':')!=-1)
			results.push(tiddler);
		});
	results.sort(function(a,b) {return a.title < b.title ? -1 : +1;});
	return results;
};

config.macros.list.otherpages = {};
config.macros.list.otherpages.handler = function(params)
{
	return store.getMediaWikiOtherPages();
};

config.macros.list.templates = {};
config.macros.list.templates.handler = function(params)
{
	return store.getMediaWikiPagesInNamespace('Template:');
};

config.macros.list.categories = {};
config.macros.list.categories.handler = function(params)
{
	return store.getMediaWikiPagesInNamespace('Category:');
};

function createTiddlyElement2(parent,element)
{
	return parent.appendChild(document.createElement(element));
}

config.formatterHelpers.createElementAndWikify = function(w)
{
	w.subWikifyTerm(createTiddlyElement2(w.output,this.element),this.termRegExp);
};

MediaWikiFormatter.hijackListAll = function ()
{
	MediaWikiFormatter.oldListAll = config.macros.list.all.handler;
	config.macros.list.all.handler = function(params) {
		return store.getMediaWikiPages();
	};
};
MediaWikiFormatter.hijackListAll();

MediaWikiFormatter.normalizedTitle = function(title)
{
	title = title.trim();
	var n = title.charAt(0).toUpperCase() + title.substr(1);
	return n.replace(/\s/g,'_');
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
		//#mwDebug(w.output,'ERROR1');
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
		//# found eg [[, so look for ]]
		tRegExp.lastIndex = sRegExp.lastIndex;
		tMatch = tRegExp.exec(w.source);
//#mwDebug(w.output,'xti:'+tMatch.index+' tl:'+tRegExp.lastIndex);
		
		//# and look for another [[
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
	//#mwDebug(w.output,'ERROR2');
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

config.mediawiki = {};
config.mediawiki.formatters = [
{
	name: 'mediaWikiHeading',
	match: '^={1,6}(?!=)\\n?',
	termRegExp: /(={1,6}\n?)/mg,
	handler: function(w)
	{
		//#var output = w.output.nodeType==1 && w.output.nodeName=='P' ? w.output.parentNode : w.output;
		var output = w.output;
		var e = createTiddlyElement2(output,'h' + w.matchLength);
		//# drop anchor
		var a = createTiddlyElement2(e,'a');
		var t = w.tiddler ? MediaWikiFormatter.normalizedTitle(w.tiddler.title) + '#' : '';
		var len = w.source.substr(w.nextMatch).indexOf('=');
		a.setAttribute('name',t+MediaWikiFormatter.normalizedTitle(w.source.substr(w.nextMatch,len)));
		w.subWikifyTerm(e,this.termRegExp);
		//#w.output = createTiddlyElement2(output,'p');
	}
},

{
	name: 'mediaWikiTable',
	match: '^\\{\\|', // ^{|
	handler: function(w)
	{
		var pair = MediaWikiTemplate.findTableBracePair(w.source,w.matchStart);
		if(pair.start==w.matchStart) {
			w.nextMatch = w.matchStart;
			var table = createTiddlyElement2(w.output,'table');
			var mwt = new MediaWikiTemplate();
			mwt.wikifyTable(table,w,pair);
		}
	}
},

{
	name: 'mediaWikiList',
	match: '^[\\*#;:]+',
	lookaheadRegExp: /(?:(?:(\*)|(#)|(;)|(:))+)(?: ?)/mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
//#this.debug = createTiddlyElement2(w.output,'p');
//#mwDebug(this.debug,'start list');
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
//#mwDebug(this.debug,"b:"+w.source.substr(w.nextMatch,30));
			currLevel = listLevel;
			currType = listType;
			var e = createTiddlyElement2(stack[stack.length-1],itemType);
			var ci = w.source.indexOf(':',w.nextMatch);
			var ni = w.source.indexOf('\n',w.nextMatch);
			if(itemType=='dt' && (ni==-1 || (ci!=-1 && ci<ni))) {
				//# deal with ':' on same line as ';'
				w.subWikifyTerm(e,/(:)/mg);
				w.nextMatch--;
			} else {
				w.subWikifyTerm(e,this.termRegExp);
			}
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
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
				//# not pthumb
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
				//# not (eg) [[en:...]]
				var e;
				var link = lookaheadMatch[3];
				var text = link;
				//#var link2 = link;
				link = link.substr(0,1).toUpperCase() + link.substring(1);
				if(lookaheadMatch[4]) {
					//# Simple bracketted link
					if(lookaheadMatch[2]) {
						//# link to anchor
						var a = createTiddlyElement(w.output,'a');
						var t = w.tiddler ? MediaWikiFormatter.normalizedTitle(w.tiddler.title) + ':' : '';
						t = '#' + t + MediaWikiFormatter.normalizedTitle(link);
						a.setAttribute('href',t);
						a.title = '#' + MediaWikiFormatter.normalizedTitle(link);
						createTiddlyText(a,'#'+link);
					} else {
					//#mwDebug(w.output,'fm1:'+w.tiddler.title);
						e = createTiddlyLink(w.output,link,false,null,w.isStatic,w.tiddler);
						if(lookaheadMatch[5]) {
							//# add any non-space after the ]]
							text += lookaheadMatch[5];
						}
						createTiddlyText(e,text);
					}
				} else if(lookaheadMatch[6]) {
					//# Piped link
					if(link.charAt(0)==':')
						link = link.substring(1);
					//#if(config.formatterHelpers.isExternalLink(link)) {
					//#	e = createExternalLink(w.output,link);
					//#} else {
					//#mwDebug(w.output,'fm2:'+w.tiddler.title);
						e = createTiddlyLink(w.output,link,false,null,w.isStatic,w.tiddler);
					//#}
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
			if(lookaheadMatch[2]) {
				var e = createExternalLink(w.output,link);
				var oldSource = w.source; var oldMatch = w.nextMatch;
				w.source = lookaheadMatch[2].trim(); w.nextMatch = 0;
				w.subWikifyUnterm(e);
				w.source = oldSource; w.nextMatch = oldMatch;
			} else {
				e = createExternalLink(createTiddlyElement2(w.output,'sup'),link);
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
	name: "mediaWikiCharacterFormat",
	match: "'{2,5}|(?:<[usbi]>)",
	handler: function(w)
	{
		switch(w.matchText) {
		case "'''''":
			var e = createTiddlyElement(w.output,'strong');
			w.subWikifyTerm(createTiddlyElement(e,'em'),/('''''|(?=\n))/mg);
			break;
		case "'''":
			w.subWikifyTerm(createTiddlyElement(w.output,'strong'),/('''|(?=\n))/mg);
			break;
		case "''":
			w.subWikifyTerm(createTiddlyElement(w.output,'em'),/((?:''(?!'))|(?=\n))/mg);
			break;
		case '<u>':
			w.subWikifyTerm(createTiddlyElement(w.output,'u'),/(<\/u>|(?=\n))/mg);
			break;
		case '<s>':
			w.subWikifyTerm(createTiddlyElement(w.output,'del'),/(<\/s>|(?=\n))/mg);
			break;
		case '<b>':
			w.subWikifyTerm(createTiddlyElement(w.output,'b'),/(<\/b>|(?=\n))/mg);
			break;
		case '<i>':
			w.subWikifyTerm(createTiddlyElement(w.output,'i'),/(<\/i>|(?=\n))/mg);
			break;
		}
	}
},

/*{
	//# note, this only gets invoked when viewing the template
	name: 'mediaWikiTemplateParam',
	match: '\\{\\{\\{',
	lookaheadRegExp: /(\{\{\{(?:.|\n)*?\}\}\})/mg,
	element: 'span',
	handler: config.formatterHelpers.enclosedTextHelper
},
*/

//# See http://en.wikipedia.org/wiki/Wikipedia:Footnotes
//# for an explanation of how to generate footnotes using the <ref(erences/)> tags
{
	name: 'mediaWikiInsertReference',
	match: '<ref[^/]*>',
	lookaheadRegExp: /<ref(\s+(?:.*?)=["']?(?:.*?)["']?)?>([^<]*?)<\/ref>/mg,
	//#lookaheadRegExp: /<ref(\s+(?:.*?)=["']?(?:.*?)["']?)?>([.\n]*?)<\/ref>/mg,
	handler: function(w)
	{
		if(config.browser.isIE) {
			refRegExp = /<ref[^\/]*>((?:.|\n)*?)<\/ref>/mg;
			refRegExp.lastIndex = w.matchStart;
			var refMatch = refRegExp.exec(w.source);
			if(refMatch && refMatch.index == w.matchStart) {
				w.nextMatch = refRegExp.lastIndex;
				return;
			}
		}
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
			var name;
			if(lookaheadMatch[1]) {
				//# <ref params>
				//#var r = {};
				var r = MediaWikiFormatter.setFromParams(w,lookaheadMatch[1]);
				name = r.name ? r.name.trim() : '';
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
		if(config.browser.isIE) {
			refRegExp = /<ref.*?\/>/mg;
			refRegExp.lastIndex = w.matchStart;
			var refMatch = refRegExp.exec(w.source);
			if(refMatch && refMatch.index == w.matchStart) {
				w.nextMatch = refRegExp.lastIndex;
				return;
			}
		}
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
		if(!config.browser.isIE)
			createTiddlyElement(w.output,"span").innerHTML = w.matchText;
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
	name: 'mediaWikiMagicWords',
	match: '__',
	lookaheadRegExp: /__([A-Z]*?)__/mg,
	//# see http://meta.wikimedia.org/wiki/Help:Magic_words
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			//# deal with variables by name here
			if(lookaheadMatch[1]=='NOTOC') {
				//# do nothing
			} else if(config.options.chkDisplayMediaWikiMagicWords) {
				//# just output the text of any variables that are not understood
				w.outputText(w.output,w.matchStart,w.nextMatch);
			}
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
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
				//# right, left, center, none, sizepx, thumbnail (thumb), frame, and alternate (caption) text.
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
			//#ptitle;
			img.alt = '';

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
				//# empty tag
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			} else {
				w.subWikify(e,'</'+lookaheadMatch[1]+'>');
			}
		}
	}
}
];

config.parsers.mediawikiFormatter = new Formatter(config.mediawiki.formatters);
config.parsers.mediawikiFormatter.format = 'mediawiki';
config.parsers.mediawikiFormatter.formatTag = 'MediaWikiFormat';
} //# end of 'install only once'
//}}}
