/***
|Name|ImageSizePlugin|
|Source|http://www.TiddlyTools.com/#ImageSizePlugin|
|Version|1.1.0|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin,formatter|
|Requires||
|Overrides|'image' formatter|
|Description|extends image syntax to add optional CSS width/height values|
!!!!!Usage
<<<
Extends standard TiddlyWiki image syntax, ''{{{[img[...]]}}}'', so you can specify CSS width/height values.

The extended syntax is:
>''{{{[img(x,y)[...]]}}}''
>where x and y are the desired width and height of the image, specified using CSS units of measurement (e.g., px, em, cm, in, or %).  Use ''auto'' (or omit the value) for width or height to scale image proportionally (i.e., maintain aspect ratio).  You may also calculate a CSS value on-the-fly by using //evaluated javascript//, enclosed between """{{""" and """}}""", e.g, {{{({{widthFunction()}},{{heightFunction()}})}}}.

Note: this plugin also includes enhancements to support:
*[[AttachFilePluginFormatters]] (embed image files as text-encoded tiddlers)
* [[ImagePathPlugin]] (fallback locations for missing images)
Please refer to those plugins for details...
<<<
!!!!!Examples
<<<
{{{
[<img(34%,auto)[images/meow.gif]]
[<img(21%,auto)[images/meow.gif]]
[<img(13%,auto)[images/meow.gif]]
[<img(8%,auto)[images/meow.gif]]
[<img(5%,auto)[images/meow.gif]]
[<img(3%,auto)[images/meow.gif]]
[<img(2%,auto)[images/meow.gif]]
[img(1%,auto)[images/meow.gif]]
}}}
[<img(34%,auto)[images/meow.gif]]
[<img(21%,auto)[images/meow.gif]]
[<img(13%,auto)[images/meow.gif]]
[<img(8%,auto)[images/meow.gif]]
[<img(5%,auto)[images/meow.gif]]
[<img(3%,auto)[images/meow.gif]]
[<img(2%,auto)[images/meow.gif]]
[img(1%,auto)[images/meow.gif]]
{{clear block{}}}
<<<
!!!!!Revisions
<<<
2008.01.19 [1.1.0] added support for evaluated width/height values!!
2008.01.18 [1.0.1] code cleanup plus improved regexp for matching "(width,height)" by eliminating hard-coded recognition of [px,em,cm,in,%] CSS units.  Syntax now accepts ANY values for width/height, and leaves it to the browser's CSS processing to handle any invalid values.
2008.01.17 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.imageSize = {major: 1, minor: 1, revision: 0, date: new Date(2008,1,19)};

// replace standard handler for image formatter
// note: includes modifications for [[AttachFilePluginFormatters]] AND [[ImagePathPlugin]]
var f=config.formatters.findByField("name","image");
config.formatters[f].match="\\[[<>]?[Ii][Mm][Gg](?:\\([^,]*,[^\\)]*\\))?\\[";
config.formatters[f].lookaheadRegExp=/\[([<]?)(>?)[Ii][Mm][Gg](\([^,]*,[^\)]*\))?\[(?:([^\|\]]+)\|)?([^\[\]\|]+)\](?:\[([^\]]*)\])?\]/mg;
config.formatters[f].handler=function(w) {
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
		var floatLeft=lookaheadMatch[1];
		var floatRight=lookaheadMatch[2];
		var XY=lookaheadMatch[3];
		var tooltip=lookaheadMatch[4];
		var src=lookaheadMatch[5];
		var link=lookaheadMatch[6];
		// Simple bracketted link
		var e = w.output;
		if(link) { // LINKED IMAGE
			if (config.formatterHelpers.isExternalLink(link)) {
				if (config.macros.attach && config.macros.attach.isAttachment(link)) {
					// see [[AttachFilePluginFormatters]]
					e = createExternalLink(w.output,link);
					e.href=config.macros.attach.getAttachment(link);
					e.title = config.macros.attach.linkTooltip + link;
				} else
					e = createExternalLink(w.output,link);
			} else 
				e = createTiddlyLink(w.output,link,false,null,w.isStatic);
			addClass(e,"imageLink");
		}
		var img = createTiddlyElement(e,"img");
		if(floatLeft) img.align="left"; else if(floatRight) img.align="right"; // FLOAT LEFT/RIGHT
		if(XY) { // CUSTOM SIZE with optional EVAL'ED width/height ({{...}},{{...}})
			var parts=XY.replace(/[\(\)]/g,'').split(","); var x=parts[0]; var y=parts[1];
			if (x.substr(0,2)=="{{") {
				try{img.style.width=eval(x.substr(2,x.length-4));}
				catch(e){displayMessage(e.description||e.toString())}
			} else img.style.width=x;

			if (y.substr(0,2)=="{{") {
				try{img.style.height=eval(y.substr(2,y.length-4));}
				catch(e){displayMessage(e.description||e.toString())}
			} else img.style.height=y;
		}
		if(tooltip) img.title = tooltip; // TOOLTIP
		// GET IMAGE SOURCE (get attachment or resolve fallback path as needed)
		if (config.macros.attach && config.macros.attach.isAttachment(src))
			src=config.macros.attach.getAttachment(src); // see [[AttachFilePluginFormatters]]
		else if (config.formatterHelpers.resolvePath) { // see [[ImagePathPlugin]]
			// Note: IE and Safari use onError to call resolvePath() only if initial lookup fails
			// (avoids security messages for initial filesystem access)... otherwise, attempt to
			// resolve the original path/file before initial rendering
			if (config.browser.isIE || config.browser.isSafari) {
				img.onerror=(function(){
					this.src=config.formatterHelpers.resolvePath(this.src,false);
					return false;
				});
			} else
				src=config.formatterHelpers.resolvePath(lookaheadMatch[5],true);
		}
		img.src=src; // RENDER IMAGE
		w.nextMatch = this.lookaheadRegExp.lastIndex;
	}
}
//}}}