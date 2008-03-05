/***
|Name|HTMLFormattingPlugin|
|Source|http://www.TiddlyTools.com/#HTMLFormattingPlugin|
|Documentation|http://www.TiddlyTools.com/#HTMLFormattingPluginInfo|
|Version|2.1.5|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides|'HTML' formatter|
|Description|embed wiki syntax formatting inside of HTML content|
The shorthand Wiki-style formatting syntax of ~TiddlyWiki is very convenient and enables most content to be reasonably well presented. However, there are times when tried-and-true HTML formatting syntax allows more more precise control of the content display.  When HTML formatting syntax is embedded within a tiddler (in between {{{<}}}{{{html>}}} and {{{<}}}{{{/html>}}} markers) TiddlyWiki passes this content to the browser for processing as 'native' HTML.  However, TiddlyWiki does not also process the HTML source content for any embedded wiki-formatting syntax it may contain.  This means that while you can use HTML formatted content, you cannot mix wiki-formatted content within the HTML formatting.

The ~HTMLFormatting plugin allows you to freely ''mix wiki-style formatting syntax within HTML formatted content'' by extending the action of the standard TiddlyWiki formatting handler.
!!!!!Documentation
>see [[HTMLFormattingPluginInfo]]
!!!!!Revisions
<<<
2008.01.08 [*.*.*] plugin size reduction: documentation moved to HTMLFormattingInfo
2007.12.04 [*.*.*] update for TW2.3.0: replaced deprecated core functions, regexps, and macros
2007.06.14 [2.1.5] in formatter, removed call to e.normalize().  Creates an INFINITE RECURSION error in Safari!!!!
2006.09.10 [2.1.4] update formatter for 2.1 compatibility (use this.lookaheadRegExp instead of temp variable)
2006.05.28 [2.1.3] in wikifyTextNodes(), decode the *value* of TEXTAREA nodes, but don't wikify() its children.  (thanks to "ayj" for bug report)
2006.02.19 [2.1.2] in wikifyTextNodes(), put SPAN element into tiddler DOM (replacing text node), BEFORE wikifying the text content.  This ensures that the 'place' passed to any macros is correctly defined when the macro is evaluated, so that calls to story.findContainingTiddler(place) will work as expected. (Thanks for bug report from GeoffSlocock)
2006.02.05 [2.1.1] wrapped wikifier hijack in init function to eliminate globals and avoid FireFox 1.5.0.1 crash bug when referencing globals
2005.12.01 [2.1.0] don't wikify #TEXT nodes inside SELECT and TEXTAREA elements
2005.11.06 [2.0.1] code cleanup
2005.10.31 [2.0.0] replaced hijack wikify() with hijack config.formatters["html"] and simplified recursive WikifyTextNodes() code
2005.10.09 [1.0.2] combined documentation and code into a single tiddler
2005.08.05 [1.0.1] moved HTML and CSS definitions into plugin code instead of using separate tiddlers
2005.07.26 [1.0.1] Re-released as a plugin. Added <{{{html}}}>...</{{{nohtml}}}> and <{{{hide newlines}}}> handling
2005.06.26 [1.0.0] Initial Release (as code adaptation - pre-dates TiddlyWiki plugin architecture!!)
<<<
!!!!!Code
***/
//{{{
version.extensions.HTMLFormatting = {major: 2, minor: 1, revision: 5, date: new Date(2007,6,14)};

// find the formatter for HTML and replace the handler
initHTMLFormatter();
function initHTMLFormatter()
{
	for (var i=0; i<config.formatters.length && config.formatters[i].name!="html"; i++);
	if (i<config.formatters.length)	config.formatters[i].handler=function(w) {
		if (!this.lookaheadRegExp)  // fixup for TW2.0.x
			this.lookaheadRegExp = new RegExp(this.lookahead,"mg");
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var html=lookaheadMatch[1];
			// optionally suppress wiki-style literal handling of newlines
			// strip any carriage returns added by Internet Explorer's textarea edit field
			// encode newlines as \n so Internet Explorer's HTML parser won't eat them
			// encode macro brackets (<< and >>) so HTML parser won't eat them
			if (html.indexOf('<hide linebreaks>')!=-1) html=html.replace(/\n/g,' ');
			html=html.replace(/\r/g,'');
			html=html.replace(/\n/g,'\\n');
			html=html.replace(/<</g,'%%(').replace(/>>/g,')%%');
			// create span to hold HTML
			// parse HTML and normalize the results
			// walk node tree and call wikify() on each text node
			var e = createTiddlyElement(w.output,"span");
			e.innerHTML=html;
			// REMOVED: e.normalize();  // THIS CAUSED INFINITE RECURSION IN SAFARI
			wikifyTextNodes(e);
			// advance to next parse position
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
}

// wikify text nodes remaining after HTML content is processed (pre-order recursion)
function wikifyTextNodes(theNode)
{
	// textarea node doesn't get wikified, just decoded... 
	if (theNode.nodeName.toLowerCase()=='textarea')
		theNode.value=theNode.value.replace(/\%%\(/g,'<<').replace(/\)\%%/g,'>>').replace(/\\n/g,'\n');
	else for (var i=0;i<theNode.childNodes.length;i++) {
		var theChild=theNode.childNodes.item(i);
		if (theChild.nodeName.toLowerCase()=='option') continue;
		if (theChild.nodeName.toLowerCase()=='select') continue;
		wikifyTextNodes(theChild);
		if (theChild.nodeName=='#text') {
			var txt=theChild.nodeValue;
			// decode macro brackets and newlines
			txt=txt.replace(/\%%\(/g,'<<').replace(/\)\%%/g,'>>').replace(/\\n/g,'\n');
			// replace text node with wikified() span
			var newNode=createTiddlyElement(null,"span");
			theNode.replaceChild(newNode,theChild);
			wikify(txt,newNode);
		}
	}
}
//}}}