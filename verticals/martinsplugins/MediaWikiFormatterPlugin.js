/***
|''Name:''|MediaWikiFormatterPlugin|
|''Description:''|Pre-release - Allows Tiddlers to use [[MediaWiki|http://en.wikipedia.org/wiki/Help:Wikitext_quick_reference#Basic_text_formatting]] (WikiPedia) text formatting|
|''Source:''|http://martinswiki.com/martinsprereleases.html#MediaWikiFormatterPlugin - for pre-release|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.3|
|''Status:''|alpha pre-release|
|''Date:''|Aug 17, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|

|''Display empty template links:''|<<option chkDisplayEmptyTemplateLinks>>|
|''Allow zooming of thumbnail images''|<<option chkDisplayEnableThumbZoom>>|


This is an early release of the MediaWikiFormatterPlugin, which allows you to insert MediaWiki formated
text into a TiddlyWiki.

The aim is not to fully emulate MediaWiki, but to allow you to create MediaWiki content off-line and
then paste the content into your MediaWiki later on, with the expectation that only minor edits will be required.

To use MediaWiki format in a Tiddler, tag the Tiddler with MediaWikiFormat. See [[testMediaWikiFormat]] for an example.

This is an early alpha release, with (at least) the following known issues:
#Table code is incomplete.
## Nested tables not yet supported
# Anchors not yet supported.
# Images options not fully supported.
# Image galleries not supported
# Templates not supported
***/

//{{{
// Ensure that the MediaWikiFormatter Plugin is only installed once.
if(!version.extensions.MediaWikiFormatterPlugin) {
version.extensions.MediaWikiFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	alertAndThrow("MediaWikiFormatterPlugin requires TiddlyWiki 2.1 or later.");

mwDebug = function(out,str)
{
	createTiddlyText(out,str.replace(/\n/mg,"\\n").replace(/\r/mg,"RR"));
	createTiddlyElement(out,"br");
}

wikify = function (source,output,highlightRegExp,tiddler)
{
	if(source && source != "")
		{
		var w = new Wikifier(source,getFormatter(source,tiddler),highlightRegExp,tiddler);
		w.output = tiddler==null ? output : createTiddlyElement(output,"p");
		//w.output = createTiddlyElement(output,"p");
		w.subWikifyUnterm(w.output);
		}
}

if(config.options.chkDisplayEmptyTemplateLinks == undefined)
	config.options.chkDisplayEmptyTemplateLinks = false;
if(config.options.chkDisplayEnableThumbZoom == undefined)
	config.options.chkDisplayEnableThumbZoom = false;

endOfParams = function(text)
{
	var i = text.indexOf("|");
	if(i=-1) return -1;
	var n = text.indexOf("\n");
	if(n!=-1 & n<i) return -1;
	var b = text.indexOf("\\[");
	if(b!=-1 & b<i) return -1;
	return i;
}

applyParams = function(text,params)
{
	var ret = text.replace(/\{\{\{/mg,"").replace(/\}\}\}/mg,"");
	ret = ret.replace(/<noinclude>((?:.|\n)*?)</noinclude>/mg,"");
	return ret;
}

readToDelim = function(w,dRegExp,sRegExp,tRegExp)
{
	dRegExp.lastIndex = w.startMatch;
	var dMatch = dRegExp.exec(w.source);
	sRegExp.lastIndex = w.startMatch;
	var sMatch = sRegExp.exec(w.source);
	tRegExp.lastIndex = w.startMatch;
	var tMatch = tRegExp.exec(w.source);
	if(!tMatch)
		{
		mwDebug(w.output,"ERROR1");
		return false;
		}

	while(sMatch && sMatch.index<tMatch.index)
		{
		if(dMatch && dMatch.index<sMatch.index)
			{//# delim is before startBracket, so return it
//mwDebug(w.output,"di:"+dMatch.index+" dl:"+sRegExp.lastIndex);
			w.nextMatch = dRegExp.lastIndex;
			w.matchLength = dMatch.index - w.startMatch;
			return true;
			}
//mwDebug(w.output,"si:"+sMatch.index+" sl:"+sRegExp.lastIndex);
//mwDebug(w.output,"ti:"+tMatch.index+" tl:"+tRegExp.lastIndex);
		//# startBracket before termBracket, so skip over bracket pairs
		// found eg [[, so look for ]]
		tRegExp.lastIndex = sRegExp.lastIndex;
		tMatch = tRegExp.exec(w.source);
//mwDebug(w.output,"xti:"+tMatch.index+" tl:"+tRegExp.lastIndex);
		
		// and look for another [[
		w.nextMatch = tRegExp.lastIndex;
		dRegExp.lastIndex = w.nextMatch;
		dMatch = dRegExp.exec(w.source);
		sRegExp.lastIndex = w.nextMatch;
		sMatch = sRegExp.exec(w.source);
		tRegExp.lastIndex = w.nextMatch;
		tMatch = tRegExp.exec(w.source);
		}
		
	if(dMatch && dMatch.index<tMatch.index)
		{//# delim is before term, so return it
//mwDebug(w.output,"2di:"+dMatch.index+" dl:"+sRegExp.lastIndex);
		w.nextMatch = dRegExp.lastIndex;
		w.matchLength = dMatch.index - w.startMatch;
		return true;
		}
	if(tMatch)
		{//# delim is before term, so return it
//mwDebug(w.output,"2ti:"+tMatch.index+" tl:"+tRegExp.lastIndex);
		w.nextMatch = tRegExp.lastIndex;
		w.matchLength = tMatch.index - w.startMatch;
		return false;
		}
mwDebug(w.output,"ERROR2");
	//# return term
	w.nextMatch = tRegExp.lastIndex;
	w.matchLength = -1;
	return false;
}

getParams = function(w)
{
	var params = [];
	var nm = w.nextMatch;
//#delimiter, startBracket terminatorBracket
	var dRegExp = new RegExp("\\|","mg");
	var sRegExp = new RegExp("\\[\\[","mg");
	var tRegExp = new RegExp("\\]\\]","mg");

	var i = 1;
	w.startMatch = w.nextMatch;
	var read = readToDelim(w,dRegExp,sRegExp,tRegExp);
	if(w.matchLength!=-1) params[i] = w.source.substr(w.startMatch,w.matchLength);
//mwDebug(w.output,"p"+i+":"+params[i]);
	while(read)
		{
		i++;
		w.startMatch = w.nextMatch;
		var read = readToDelim(w,dRegExp,sRegExp,tRegExp);
		if(w.matchLength!=-1) params[i] = w.source.substr(w.startMatch,w.matchLength);
//mwDebug(w.output,"p"+i+":"+params[i]);
		}
	return params;
}

config.formatterHelpers.setAttributesFromParams = function(e,p)
{
	var re = /(\s*(.*?)=(?:["'](.*?)["']|((?:\w|%|#)+)))/mg;
	var match = re.exec(p);
	while(match)
		{
		var s = match[2].unDash();
		if (s=="bgcolor")
			s = "backgroundColor";
		var v = match[3];
		e.setAttribute(s,v?v:match[4]);
		match = re.exec(p);
		}
}

config.mediaWikiFormatters = [
{
	name: "mediaWikiTable",
	match: "^\\{\\|", // ^{|
	tableTerm: "\\n\\|\\}", // |}
	rowStart: "\\n\\|\\-", // \n|-
	cellStart: "\\n!|!!|\\|\\||\\n\\|", //\n! or !! or || or \n|
	caption: "\\n\\|\\+",
	rowTerm: null,
	cellTerm: null,
	inCellTerm: null,
	depth:0,
	tt: 0,
	//debug: null,
	rowTermRegExp: null,
	handler: function(w)
		{
		if (this.rowTermRegExp==null)
			{
			this.rowTerm = "(" + this.tableTerm +")|(" + this.rowStart + ")";
			this.cellTerm = this.rowTerm + "|(" + this.cellStart + ")";
			this.inCellTerm = "(" + this.match + ")|" + this.rowTerm + "|(" + this.cellStart + ")";
			this.caption = "(" + this.caption + ")|" + this.cellTerm;

			this.rowTermRegExp = new RegExp(this.rowTerm,"mg");
			this.cellTermRegExp = new RegExp(this.cellTerm,"mg");
			this.inCellTermRegExp = new RegExp(this.inCellTerm,"mg");
			this.captionRegExp = new RegExp(this.caption,"mg");
			}
//this.debug = createTiddlyElement(w.output,"p");
//mwDebug(this.debug,"start table");
		this.captionRegExp.lastIndex = w.nextMatch;
		var match = this.captionRegExp.exec(w.source);
		if (!match)
			return;
		var table = createTiddlyElement(w.output,"table");
		var rowContainer = table;

		var i = w.source.indexOf("\n",w.nextMatch);
		if (i>w.nextMatch)
			{
			config.formatterHelpers.setAttributesFromParams(table,w.source.substring(w.nextMatch,i));
			w.nextMatch = i;
			}

		var rowCount = 0;
		var eot = false;
		if(match[1])
			{// caption
			var caption = createTiddlyElement(table,"caption");
			table.insertBefore(caption,table.firstChild);
			
			w.nextMatch = this.captionRegExp.lastIndex;
			var captionText = w.source.substring(w.nextMatch);
			var i = endOfParams()
			if (i!=-1)
				{
				captionText = captionText.replace(/^\+/mg,"")//!!hack until I fix this properly
				config.formatterHelpers.setAttributesFromParams(cell,captionText.substr(0,i-1));
				w.nextMatch = i+1;
				}

			w.subWikify(caption,this.cellTerm);
			w.nextMatch -= w.matchLength;// rewind to before the match
			this.cellTermRegExp.lastIndex = w.nextMatch;
			var match2 = this.cellTermRegExp.exec(w.source);
			if (match2)
				{
				if (match2[3])
					{// no first row marker
					eot = this.rowHandler(w,createTiddlyElement(rowContainer,"tr",null,(rowCount&1)?"oddRow":"evenRow"));
					rowCount++;
					}
				}
			}
		else if (match[3])
			{// row
			w.nextMatch = this.captionRegExp.lastIndex-match[3].length;// rewind to before the match
			}
		else if (match[4])
			{// cell, no first row marker in table
			w.nextMatch = this.captionRegExp.lastIndex-match[4].length;// rewind to before the match
			eot = this.rowHandler(w,createTiddlyElement(rowContainer,"tr",null,(rowCount&1)?"oddRow":"evenRow"));
			rowCount++;
			}

		this.rowTermRegExp.lastIndex = w.nextMatch;
		match = this.rowTermRegExp.exec(w.source);
		while (match && eot==false)
			{
			if(match[1])
				{// end table
//mwDebug(this.debug,"end table"); 
				w.nextMatch = this.rowTermRegExp.lastIndex;
				if (this.depth==0)
					return;
				this.depth--;
				}
			else if(match[2])
				{// row
				var rowElement = createTiddlyElement(rowContainer,"tr",null,(rowCount&1)?"oddRow":"evenRow");
				w.nextMatch += match[2].length;// skip over the match
				var i = w.source.indexOf("\n",w.nextMatch);
				if (i>w.nextMatch)
					{
					config.formatterHelpers.setAttributesFromParams(rowElement,w.source.substring(w.nextMatch,i));
					w.nextMatch = i;
					}
				eot = this.rowHandler(w,rowElement);
				}
			rowCount++;
//mwDebug(this.debug,"ts:"+w.source.substring(w.nextMatch,30));
			this.rowTermRegExp.lastIndex = w.nextMatch;
			match = this.rowTermRegExp.exec(w.source);
//mwDebug(this.debug,"tm:"+match);
			}//# end while
		},//# end handler

	rowHandler: function(w,e)
		{// assumes w.nextMatch points to first cell terminator, returns false if any improperly terminated element
		var cell;
		this.inCellTermRegExp.lastIndex = w.nextMatch;
		var match = this.inCellTermRegExp.exec(w.source);
		while (match)
			{
			if (match[1])
				{// nested table
				this.depth++;
				w.subWikify(cell,this.tableTerm);
				w.nextMatch = this.tt;
				}
			else if (match[2])
				{//# end table
				w.nextMatch = this.inCellTermRegExp.lastIndex;
				this.tt = w.nextMatch;
				return true;
				}
			else if (match[3])
				{//# end row
				return false;
				}
			else if (match[4])
				{//# cell
				var len = match[4].length;
				var cell = createTiddlyElement(e,match[4].substr(len-1)=="!"?"th":"td");
				w.nextMatch += len;//skip over the match

				this.inCellTermRegExp.lastIndex = w.nextMatch;
				var lookahead = this.inCellTermRegExp.exec(w.source);
				if (lookahead==null)
					return false;// improperly terminated table
				var cellText = w.source.substr(w.nextMatch,lookahead.index-w.nextMatch);
				var oldSource = w.source;
				var i = endOfParams(cellText);//cellText.indexOf("|");
				if (i!=-1)
					{
					cellText = cellText.replace(/^\+/mg,"")//!!hack until I fix this properly
					config.formatterHelpers.setAttributesFromParams(cell,cellText.substr(0,i-1));
					cellText = cellText.substring(i+1);
					}
				cellText = cellText.replace(/^\s*/mg,""); //# remove leading spaces so not treated as preformatted
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
	name: "mediaWikiHeading",
	match: "^={2,6}(?!=)",
	termRegExp: /(={2,6})/mg,
	handler: function(w)
	{
		//var output = w.output.nodeType==1 && w.output.nodeName=="P" ? w.output.parentNode : w.output;
		var output = w.output.parentNode;
		var e = createTiddlyElement(output,"h" + w.matchLength);
		var a = createTiddlyElement(e,"a");// drop anchor
		var t = w.tiddler ? w.tiddler.title + "#" : "";
		var len = w.source.substr(w.nextMatch).indexOf("=");
		a.setAttribute("name",t+w.source.substr(w.nextMatch,len));
		w.subWikifyTerm(e,this.termRegExp);
		w.output = createTiddlyElement(output,"p");
	}
},

{
	name: "mediaWikilist",
	match: "^(?:(?:(?:\\*)|(?:#)|(?:;)|(?::))+)",
	lookaheadRegExp: /^(?:(?:(\*)|(#)|(;)|(:))+)/mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var placeStack = [w.output];
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
			else if(lookaheadMatch[3])
				{
				listType = "dl";
				itemType = "dt";
				}
			else if(lookaheadMatch[4])
				{
				listType = "dl";
				itemType = "dd";
				}
			listLevel = lookaheadMatch[0].length;
			w.nextMatch += lookaheadMatch[0].length;
			if(listLevel > currLevel)
				{
				for(var t=currLevel; t<listLevel; t++)
					placeStack.push(createTiddlyElement(placeStack[placeStack.length-1],listType));
				}
			else if(listLevel < currLevel)
				{
				for(var t=currLevel; t>listLevel; t--)
					placeStack.pop();
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
	}
},

{
	name: "mediaWikiRule",
	match: "^----+$\\n?",
	handler: function(w)
	{
		var output = w.output.parentNode;
		//var output = w.output.nodeType==1 && w.output.nodeName=="P" ? w.output.parentNode : w.output;
		createTiddlyElement(output,"hr");
		w.output = createTiddlyElement(output,"p");
	}
},

{
	name: "mediaWikiLeadingSpaces",
	match: "^ ",
	lookaheadRegExp: /^ /mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var e = createTiddlyElement(w.output,"pre");
		while(true)
			{
			w.subWikifyTerm(e,this.termRegExp);
			createTiddlyElement(e,"br");
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.nextMatch)
				w.nextMatch += lookaheadMatch[0].length;
			else
				break;
			}
	}
},

/*
[[Image:Westminstpalace.jpg|frame|none|caption text]]
//http://en.wikipedia.org/wiki/Image:Westminstpalace.jpg
<a href="/wiki/Image:Westminstpalace.jpg" class="internal" title="caption text">
<img src="http://upload.wikimedia.org/wikipedia/commons/3/39/Westminstpalace.jpg"
 alt="caption text" width="400" height="300" longdesc="/wiki/Image:Westminstpalace.jpg" />
</a>
*/
/*
[[Image:Reprocessed Mariner 10 image of Mercury.jpg|300px|Mercury]]
<a href="/wiki/Image:Reprocessed_Mariner_10_image_of_Mercury.jpg" class="image" title="Mercury">
<img src="300px-Reprocessed_Mariner_10_image_of_Mercury.jpg"
	alt="Mercury"
	width="300"
	height="281"
	longdesc="/wiki/Image:Reprocessed_Mariner_10_image_of_Mercury.jpg"
/>
</a>
*/

{
//http://commons.wikimedia.org/wiki/Image:Westminster_palace.jpg
//[[Image:{name}|{type}|{location}|{size}|{caption}]]
//[[Image:Westminstpalace.jpg|frame|none|caption text]]
//From MediaWiki 1.3, it is also possible to include links in the caption text, e.g.:
//[[Image:Westminstpalace.jpg|right|thumbnail|This is the [[Palace of Westminster]] in London]]


	name: "mediaWikiImage",
	match: "\\[\\[(?:[Ii]mage|Bild):",
	lookaheadRegExp: /\[\[(?:[Ii]mage|Bild):/mg,
	handler: function(w)
	{
//mwDebug(w.output,"mT:"+w.matchText);
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
//mwDebug(w.output,"img:"+w.source.substr(w.matchStart,80));
			var params = getParams(w);
			var src = params[1];
			src = src.replace(/ /mg,"_");
			var palign = null; var psrc = false; var pthumb = false; var pframed = false; var px = null; ptitle = null;
			for(var i=2;i<params.length;i++)
				{//right, left, center, none, sizepx, thumbnail (thumb), frame, and alternate (caption) text.
				var p = params[i];
				if(p=="right"||p=="left"||p=="center"||p=="none")
					{
					palign = p;
					}
				else if(p=="thumbnail"||p=="thumb")
					{
					pthumb = true;
					}
				else if(p=="framed")
					{
					pframed = true;
					}
				else if(/\d{2,4}px/.exec(p))
					{
					psrc = p + "-" + src;
					px = p.substr(0,p.length-2);
					}
				else
					{
					ptitle = p;
					}
				}
			if(pthumb)
				{
/*[[image:Stockholm.jpg|right|350px|thumb|Stockholm panorama from the City Hall]]

<div class="thumb tright">
	<div style="width:352px;">
		<a href="/wiki/Image:Stockholm.jpg" class="internal" title="Stockholm panorama from the City Hall">
			<img src="http://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Stockholm.jpg/350px-Stockholm.jpg" alt="Stockholm panorama from the City Hall" width="350" height="84" longdesc="/wiki/Image:Stockholm.jpg" />
		</a>
		<div class="thumbcaption">
			<div class="magnify" style="float:right">
				<a href="/wiki/Image:Stockholm.jpg" class="internal" title="Enlarge">
				<img src="/skins-1.5/common/images/magnify-clip.png" width="15" height="11" alt="Enlarge" />
				</a>
			</div>
			Stockholm panorama from the City Hall
		</div>
	</div>
</div>*/
/*mbimagemb*/
		//var output = w.output.nodeType==1 && w.output.nodeName=="P" ? w.output.parentNode : w.output;
		var output = w.output.parentNode;
				if(!px) px = 180;
				var t = createTiddlyElement(output,"div",null,"thumb"+(palign?" t"+palign:""));
				var s = createTiddlyElement(t,"div");
				s.style["width"] = Number(px) + 2 + "px";
				var a = createTiddlyElement(s,"a",null,"internal");
				if(config.options.chkDisplayEnableThumbZoom)
					 a.href = src;
				a.title = ptitle;
				var img = createTiddlyElement(a,"img");
				img.src = psrc ? psrc : "180px-"+src;
				img.width = px;
				img.longdesc = "Image:" + src;
				img.alt = ptitle;

				var tc = createTiddlyElement(s,"div",null,"thumbcaption");
//mwDebug(w.output,"pt:"+ptitle);
				var oldSource = w.source;
				var oldMatch = w.nextMatch;
				w.source = ptitle;
				w.nextMatch = 0;
				w.subWikifyUnterm(tc);
				w.source = oldSource;
				w.nextMatch = oldMatch;

				if(config.options.chkDisplayEnableThumbZoom)
					{
					var tm = createTiddlyElement(tc,"div",null,"magnify");
					tm.style["float"] = "right";
					var ta = createTiddlyElement(tm,"a",null,"internal");
					ta.title = "Enlarge";
					timg = createTiddlyElement(ta,"img"); timg.src = "magnify-clip.png"; timg.alt = "Enlarge"; timg.width = "15"; timg.height = "11";
					ta.href = src;
					}
				}
			else
				{
				var a = createTiddlyElement(w.output,"a",null,"image");
				a.title = ptitle;
				var img = createTiddlyElement(a,"img");
				img.src = psrc ? psrc : src;
				if(px) img.width = px;
				img.longdesc = "Image:" + src;
				img.alt = ptitle;
				if(palign)
					img.align = palign;
				}
			}
	}//#end handler
},

{
	name: "mediaWikiExplicitLink",
	match: "\\[\\[",
	lookaheadRegExp: /\[\[(?:([a-z]{2,3}:)?)(#?)([^\|\]]*?)(?:(\]\](\w)*)|(\|(.*?)\]\]))/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			if(!lookaheadMatch[1])
				{// no (eg) en:
				var e;
				var link = lookaheadMatch[3];
				if(lookaheadMatch[4])
					{// Simple bracketted link
					if(lookaheadMatch[2])
						{//anchor
						var a = createTiddlyElement(e,"a");// drop anchor
						a.setAttribute("name",link);
						}
					else
						{
						e = createTiddlyLink(w.output,link,false);
						if(lookaheadMatch[5])
							link += lookaheadMatch[5];//add any non-space after the ]]
						createTiddlyText(e,link);
						}
					}
				else if(lookaheadMatch[6])
					{// Piped link
					if(config.formatterHelpers.isExternalLink(link))
						{
						e = createExternalLink(w.output,link);
						}
					else
						{
						var t = w.tiddler ? w.tiddler.title : "";
						e = createTiddlyLink(w.output,link,false);
						//e.setAttribute("title",link)
						}
					createTiddlyText(e,lookaheadMatch[7]);
					}
				}
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "mediaWikiLink",
	match: config.textPrimitives.wikiLink,
	handler: function(w)
	{
		if(w.matchStart > 0)
			{
			var preRegExp = new RegExp(config.textPrimitives.anyLetter,"mg");
			preRegExp.lastIndex = w.matchStart-1;
			preMatch = preRegExp.exec(w.source);
			if(preMatch.index == w.matchStart-1)
				{
				w.outputText(w.output,w.matchStart,w.nextMatch);
				return;
				}
			}
		var out = (w.autoLinkWikiWords == true || store.isShadowTiddler(w.matchText))
			? createTiddlyLink(w.output,w.matchText,false) : w.output;
		w.outputText(out,w.matchStart,w.nextMatch);
	}
},

{
	name: "mediaWikiTitledUrlLink",
	//# eg [http://www.nupedia.com] or [http://www.nupedia.com Nupedia]
	match: "\\[" + config.textPrimitives.urlPattern + "(?:\\s+[^\\]]+)?" + "\\]",
	handler: function(w)
	{
		var lookaheadRegExp = new RegExp("\\[(" + config.textPrimitives.urlPattern + ")(?:\\s+([^\[]+))?" + "\\]","mg");
		lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index==w.matchStart)
			{
			var link = lookaheadMatch[1];
			var e = createExternalLink(w.output,link);
			createTiddlyText(e,lookaheadMatch[2] ? lookaheadMatch[2] : link);
			w.nextMatch = lookaheadRegExp.lastIndex;
			}
	}
},

{
	name: "mediaWikiUrlLink",
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: "mediaWikiBold",
	match: "'''",
	termRegExp: /('''|\n)/mg,
	element: "strong",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "mediaWikiBoldTag",
	match: "<b>",
	termRegExp: /(<\/b>)/mg,
	element: "b",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "mediaWikiItalic",
	match: "''",
	termRegExp: /(''|\n)/mg,
	element: "em",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "mediaWikiUnderline",
	match: "<u>",
	termRegExp: /(<\/u>)/mg,
	element: "u",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "mediaWikiStrike",
	match: "<s>",
	termRegExp: /(<\/s>)/mg,
	element: "strike",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "mediaWikiExplicitLineBreak",
	//match: "<br>|<br/>|<br />",
	match: "<br ?/?>",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
	}
},

{
	name: "mediaWikiParagraph",
	match: "\\n{2,}",
	handler: function(w)
	{
		var output = w.output.nodeType==1 && w.output.nodeName=="P" ? w.output.parentNode : w.output;
		w.output = createTiddlyElement(output,"p");
		//createTiddlyElement(w.output,"p");
	}
},

{
	name: "mediaWikiNoWiki",
	match: "<nowiki>",
	lookaheadRegExp: /<nowiki>((?:.|\n)*?)<\/nowiki>/mg,
	element: "span",
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: "mediaWikiPreNoWiki",
	match: "<pre>\s*<nowiki>",
	lookaheadRegExp: /<pre>\s*<nowiki>((?:.|\n)*?)<\/nowiki>\s*<\/pre>/mg,
	element: "pre",
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: "mediaWikiPre",
	match: "<pre>",
	lookaheadRegExp: /<pre>((?:.|\n)*?)<\/pre>/mg,
	element: "pre",
	handler: config.formatterHelpers.enclosedTextHelper
},

{
	name: "mediaWikiGallery",
	match: "<gallery>",
	lookaheadRegExp: /<gallery>((?:.|\n)*?)<\/gallery>/mg,
	element: "span",
	handler: config.formatterHelpers.enclosedTextHelper
//basic syntax is:
//<gallery>
//Image:Wiki.png
//Image:Wiki.png|Captioned
//Image:Wiki.png|[[Help:Contents/Links|Links]] can be put in captions.
//Image:Wiki.png|Full [[MediaWiki]]<br />[[syntax]] may now be used…
//</gallery>
},

{
	name: "mediaWikiTemplateParam",
	match: "\\{\\{\\{",
	lookaheadRegExp: /(\{\{\{(?:.|\n)*?\}\}\})/mg,
	element: "span",
	handler: config.formatterHelpers.enclosedTextHelper
},

/*{{Infobox_Stad|
name=Stockholm|
...
}}*/
//*{{Audio|sv-Stockholm.ogg|Stockholm}}*/

{
	name: "mediaWikiTemplate",
	match: "\\{\\{",
	lookaheadRegExp: /\{\{((?:.|\n)*?)\}\}/mg,
	handler: function(w)
	{
//mwDebug(w.output,"aawm:"+w.matchText+" ws:"+w.matchStart+" wn:"+w.nextMatch+" wl:"+w.matchLength);
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
//mwDebug(w.output,"lm:"+lookaheadMatch+" lmi:"+lookaheadMatch.index+" lI:"+this.lookaheadRegExp.lastIndex);
//mwDebug(w.output,"lm1:"+lookaheadMatch[1]);
			var lastIndex = this.lookaheadRegExp.lastIndex;
			var contents = lookaheadMatch[1];
			var i = contents.indexOf("|");
			var title = i==-1 ? contents : contents.substr(0,i);
			title = "Template:" + title.substr(0,1).toUpperCase() + title.substring(1);
			var tiddler = store.fetchTiddler(title)
			var oldSource = w.source;
			if(!tiddler)
				{
				if(config.options.chkDisplayEmptyTemplateLinks)
					{// for conveniece, output the name of the template so can click on it and create tiddler
					w.source = "[["+title+"]]";
					w.nextMatch = 0;
					w.subWikifyUnterm(w.output);
					}
				}
			else
				{
//mwDebug(w.output,"wm:"+w.matchText+" ws:"+w.matchStart+" wn:"+w.nextMatch+" wl:"+w.matchLength);
				params = [];
				w.source = lookaheadMatch[1];
				w.nextMatch = 0;
				if(i!=-1)
					params = getParams(w, "\\|", "\\[\\[", "\\]\\]" );
				params[0] = title;
//mwDebug(w.output,"pl:"+params.length);
//for(var ii=0;ii<params.length;ii++) mwDebug(w.output,"p"+ii+params[ii]);
				w.source = applyParams(tiddler.text,params);
				w.nextMatch = 0;
				w.subWikifyUnterm(w.output);
				}
			w.source = oldSource;
			w.nextMatch = lastIndex;
			}
	}
},

{
	name: "mediaWikiComment",
	match: "<!\\-\\-",
	lookaheadRegExp: /<!\-\-((?:.|\n)*?)\-\->/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			w.nextMatch = this.lookaheadRegExp.lastIndex;
	}
},

//# See http://en.wikipedia.org/wiki/Wikipedia:Footnotes
//# for an explanation of how to generate footnotes using the <ref(erences/)> tags
{
	name: "mediaWikiInsertReference",
	match: "<ref[^/]*>",
	lookaheadRegExp: /<ref(?:\s+(?:.*?)="(?:.*?)")?>((?:.|\n)*?)<\/ref>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			if(!w.referenceCount)
				{
				w.referenceCount = 0;
				w.references = [];
				}
			w.references[w.referenceCount++] = lookaheadMatch[1];
			}
	}
},

{
	name: "mediaWikiRepeatReference",
	match: "<ref[^/]*/>",
	lookaheadRegExp: /<ref(?:\s+(?:.*?)="(?:.*?)")?>((?:.|\n)*?)<\/ref>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			w.nextMatch = this.lookaheadRegExp.lastIndex;
	}
},

{
	name: "mediaWikiListReferences",
	match: "<references/>",
	lookaheadRegExp: /<references\/>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(w.referenceCount)
			{
			var olist = createTiddlyElement(w.output,"ol");
			var oldSource = w.source;
			for(var i=0;i<w.referenceCount;i++)
				{
				w.source = w.references[i];
				w.nextMatch = 0;
				w.subWikifyUnterm(createTiddlyElement(olist,"li"));
				}
			w.source = oldSource;
			}
		w.nextMatch = this.lookaheadRegExp.lastIndex;
	}
},

{
	name: "mediaWikiDiv",
	match: "<div(?:\\s*(?:.*?)=\"(?:.*?)\")>",
	lookaheadRegExp: /<div(\s+(.*?)="(.*?)")>/mg,
	termRegExp: /(<\/div>)/mg,
	element: "div",
	handler: function(w)
	{
		var e =createTiddlyElement(w.output,"div");
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			config.formatterHelpers.setAttributesFromParams(e,lookaheadMatch[1])
		w.subWikifyTerm(e,this.termRegExp);
	}
},

{
	name: "mediaWikiSpan",
	match: "<span(?:\\s*(?:.*?)=\"(?:.*?)\")>",
	lookaheadRegExp: /<span(\s+(.*?)="(.*?)")>/mg,
	termRegExp: /(<\/span>)/mg,
	element: "span",
	handler: function(w)
	{
		var e =createTiddlyElement(w.output,"span");
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			config.formatterHelpers.setAttributesFromParams(e,lookaheadMatch[1])
		w.subWikifyTerm(e,this.termRegExp);
	}
},

{
	name: "mediaWikiFont",
	match: "<font(?:\\s*(?:.*?)=\"(?:.*?)\")>",
	lookaheadRegExp: /<font(\s+(.*?)="(.*?)")>/mg,
	termRegExp: /(<\/font>)/mg,
	element: "span",
	handler: function(w)
	{
		var e =createTiddlyElement(w.output,"span");
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			config.formatterHelpers.setAttributesFromParams(e,lookaheadMatch[1])
		w.subWikifyTerm(e,this.termRegExp);
	}
},

{
	name: "mediaWikiTag",
	match: "<[a-zA-Z]{2,}(?:\\s*(?:(?:.*?)=\"(?:.*?)\"))?>",
	lookaheadRegExp: /<([a-zA-Z]{2,})(\s+(.*?)="(.*?)")?>/mg,
	handler: function(w)
	{
//!!!! need while loop here to allow multiple attributes
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
			var e =createTiddlyElement(w.output,lookaheadMatch[1]);
			if(lookaheadMatch[2])
				config.formatterHelpers.setAttributesFromParams(e,lookaheadMatch[2])
			w.subWikify(e,"</"+lookaheadMatch[1]+">");
			}
	}
},

{
	name: "mediaWikiHtmlEntitiesEncoding",
	match: "&#?[a-zA-Z0-9]{2,8};",
	handler: function(w)
		{
		createTiddlyElement(w.output,"span").innerHTML = w.matchText;
		}
}

];

formatters.mediaWikiFormatter = new Formatter(config.mediaWikiFormatters);
formatters.mediaWikiFormatter.formatTag = "MediaWikiFormat";

} // end of "install only once"
//}}}
