/***
''HTML Formatting Plugin for TiddlyWiki version 1.2.x and 2.0''
^^author: Eric Shulman - ELS Design Studios
source: http://www.TiddlyTools.com/#HTMLFormattingPlugin
license: [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]^^

The shorthand Wiki-style formatting syntax of ~TiddlyWiki is very convenient and enables most content to be reasonably well presented. However, there are times when tried-and-true HTML formatting syntax allows more more precise control of the content display.

When HTML formatting syntax is embedded within a tiddler (in between {{{<}}}{{{html>}}} and {{{<}}}{{{/html>}}} markers) TiddlyWiki passes this content to the browser for processing as 'native' HTML.  However, TiddlyWiki does not also process the HTML source content for any embedded wiki-formatting syntax it may contain.  This means that while you can use HTML formatted content, you cannot mix wiki-formatted content within the HTML formatting.
!!!!!Usage
<<<
The ~HTMLFormatting plugin allows you to freely ''mix wiki-style formatting syntax within HTML formatted content'' by extending the action of the standard TiddlyWiki formatting handler.

When a tiddler is about to be displayed, ~TiddlyWiki looks for tiddler content contained within ''<{{{html}}}>'' and ''<{{{/html}}}>'' HTML tags.  This content (if any) is passed directly to the browser's internal "rendering engine" to process as ~HTML-formatted content.  Once the HTML formatting has been processed, all the pieces of text occuring in between the HTML formatting are then processed by the ~TiddlyWiki rendering engine, one piece at a time, so that normal wiki-style formatting can be applied to the individual text pieces.
<<<
!!!!!Line breaks
<<<
One major difference between Wiki formatting and HTML formatting is how "line breaks" are processed. Wiki formatting treats all line breaks as literal content to be displayed //as-is//. However, because HTML normally ignores line breaks and actually processes them as simple "word separators" instead, many people who write HTML include extra line breaks in their documents, just to make the "source code" easier to read.

Even though you can use HTML tags within your tiddler content, the default treatment for line breaks still follows the Wiki-style rule (i.e., all new lines are displayed as-is). When adding HTML content to a tiddler (especially if you cut-and-paste it from another web page), you should take care to avoid adding extra line breaks to the text.

If removing all the extra line breaks from your HTML content would be a big hassle, you can quickly //override the default Wiki-style line break rule// so that the line breaks use the standard HTML rules instead.  Placing a ''<{{{hide linebreaks}}}>'' tag within the tiddler's HTML content changes all line breaks to spaces before rendering the content, so that the literal line breaks will be processed as simple word-breaks instead.

Note: this does //not// alter the actual tiddler content that is stored in the document, just the manner in which it is displayed. Any line breaks contained in the tiddler will still be there when you edit its content. Also, to include a literal line break when the ''<{{{hide linebreaks}}}>'' tag is present, you will need to use a ''<{{{br}}}>'' or ''<{{{p}}}>'' HTML tag instead of simply typing a line break.
<<<
!!!!!How it works
<<<
The TW core support for HTML does not let you put ANY wiki-style syntax (including TW macros) *inside* the <html>...</html> block.  Everything
between <html> and </html> is handed to the browser for processing and that is it.  Fortunately, this plugin ADDS the ability to let you put wiki-syntax (including macros) inside the html.  It does this by first giving the tiddler source content to the browser to process the HTML, and then handling any wiki-based syntax that remains afterward.

However, not all wiki syntax can be safely passed through the browser's parser. Specifically, any TW macros inside the HTML will get 'eaten' by the browser since the macro brackets, """<<...>>""" use the "<" and ">" that normally delimit the HTML/XML syntax recognized by the browser's parser.

Similarly, you can't use InlineJavascript within the HTML because the """<script>...</script>""" syntax will also be consumed by the browser and there will be nothing left to process afterward.  Note: unfortunately, even though the browser removes the """<script>...</script>""" sequence, it doesn't actually execute the embedded javascript code that it removes, so any scripts contained inside of <html> blocks in TW are currently being ignored. :-(

As a work-around to allow TW *macros* (but not inline scripts) to exist inside of <html> formatted blocks of content, the plugin first converts the """<<""" and """>>""" into "%%(" and ")%%", making them "indigestible" so they can pass unchanged through the belly of the beast (the browser's HTML parser).

After the browser has done its job, the wiki syntax sequences (including the "undigested" macros) are contained in #text nodes in the browser-generated DOM elements.  The plugin then recursively locates and processes each #text node, converts the %%( and )%% back into """<< and >>""", passes the result to wikify() for further rendering of the wiki-formatted syntax into a containing SPAN that replaces the previous #text node.  At the end of this process, none of the encoded %%( and )%% sequences remain in the rendered tiddler output.
<<<
!!!!!Installation
<<<
import (or copy/paste) the following tiddlers into your document:
''HTMLFormattingPlugin'' (tagged with <<tag systemConfig>>)
^^documentation and javascript for HTMLFormatting handling^^
<<<
!!!!!Revision History
<<<
''2006.05.28 [2.1.3]''
in wikifyTextNodes(), decode the *value* of TEXTAREA nodes, but don't wikify() its children.  (thanks to "ayj" for bug report)
''2006.02.19 [2.1.2]''
in wikifyTextNodes(), put SPAN element into tiddler DOM (replacing text node), BEFORE wikifying the text content.  This ensures that the 'place' passed to any macros is correctly defined when the macro is evaluated, so that calls to story.findContainingTiddler(place) will work as expected. (Thanks for bug report from GeoffSlocock)
''2006.02.05 [2.1.1]''
wrapped wikifier hijack in init function to eliminate globals and avoid FireFox 1.5.0.1 crash bug when referencing globals
''2005.12.01 [2.1.0]''
don't wikify #TEXT nodes inside SELECT and TEXTAREA elements
''2005.11.06 [2.0.1]''
code cleanup
''2005.10.31 [2.0.0]''
replaced hijack wikify() with hijack config.formatters["html"] and simplified recursive WikifyTextNodes() code
''2005.10.09 [1.0.2]''
combined documentation and code into a single tiddler
''2005.08.05 [1.0.1]''
moved HTML and CSS definitions into plugin code instead of using separate tiddlers
''2005.07.26 [1.0.1]''
Re-released as a plugin.
Added <{{{html}}}>...</{{{nohtml}}}> and <{{{hide newlines}}}> handling
''2005.07.20 [1.0.0]''
Initial Release (as code adaptation)
<<<
!!!!!Credits
<<<
This feature was developed by EricShulman from [[ELS Design Studios|http:/www.elsdesign.com]]
<<<
!!!!!Code
***/
//{{{
version.extensions.HTMLFormatting = {major: 2, minor: 1, revision: 3, date: new Date(2006,5,28)};

// find the formatter for HTML and replace the handler
initHTMLFormatter();
function initHTMLFormatter()
{
	for (var i=0; i<config.formatters.length && config.formatters[i].name!="html"; i++);
	if (i<config.formatters.length)	config.formatters[i].handler=function(w) {
		var lookaheadRegExp = new RegExp(this.lookahead,"mg");
		lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var html=lookaheadMatch[1];
			// optionally suppress wiki-style literal handling of newlines
			// strip any carriage returns added by Internet Explorer's textarea edit field
			// encode newlines as \sn so Internet Explorer's HTML parser won't eat them
			// encode macro brackets (<< and >>) so HTML parser won't eat them
			if (html.indexOf('<hide linebreaks>')!=-1) html=html.replace(regexpNewLine,' ');
			html=html.replace(regexpCarriageReturn,'');
			html=html.replace(regexpNewLine,'\s\sn');
			html=html.replace(/<</g,'%%(').replace(/>>/g,')%%');
			// create span to hold HTML
			// parse HTML and normalize the results
			// walk node tree and call wikify() on each text node
			var e = createTiddlyElement(w.output,"span");
			e.innerHTML=html;
			e.normalize(); 
			wikifyTextNodes(e);
			// advance to next parse position
			w.nextMatch=lookaheadMatch.index + lookaheadMatch[0].length;
		}
	}
}

// wikify text nodes remaining after HTML content is processed (pre-order recursion)
function wikifyTextNodes(theNode)
{
	// textarea node doesn't get wikified, just decoded... 
	if (theNode.nodeName.toLowerCase()=='textarea')
		theNode.value=theNode.value.replace(/\s%%\s(/g,'<<').replace(/\s)\s%%/g,'>>').replace(regexpBackSlashEn,'\sn');
	else for (var i=0;i<theNode.childNodes.length;i++) {
		var theChild=theNode.childNodes.item(i);
		if (theChild.nodeName.toLowerCase()=='option') continue;
		if (theChild.nodeName.toLowerCase()=='select') continue;
		wikifyTextNodes(theChild);
		if (theChild.nodeName=='#text') {
			var txt=theChild.nodeValue;
			// decode macro brackets and newlines
			txt=txt.replace(/\s%%\s(/g,'<<').replace(/\s)\s%%/g,'>>').replace(regexpBackSlashEn,'\sn');
			// replace text node with wikified() span
			var newNode=createTiddlyElement(null,"span");
			theNode.replaceChild(newNode,theChild);
			wikify(txt,newNode);
		}
	}
}
//}}}
