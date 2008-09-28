/***
|Name|HTMLFormattingPlugin|
|Source|http://www.TiddlyTools.com/#HTMLFormattingPlugin|
|Documentation|http://www.TiddlyTools.com/#HTMLFormattingPluginInfo|
|Version|2.2.0|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides|'HTML' formatter|
|Description|embed wiki syntax formatting inside of HTML content|
The ~HTMLFormatting plugin allows you to ''mix wiki-style formatting syntax within HTML formatted content'' by extending the action of the standard TiddlyWiki formatting handler.
!!!!!Documentation
>see [[HTMLFormattingPluginInfo]]
!!!!!Revisions
<<<
2008.09.19 [2.2.0] in wikifyTextNodes(), don't wikify the contents of STYLE nodes (thanks to MorrisGray for bug report)
| see [[HTMLFormattingPluginInfo]] for additional revision details |
2005.06.26 [1.0.0] Initial Release (as code adaptation - pre-dates TiddlyWiki plugin architecture!!)
<<<
!!!!!Code
***/
//{{{
version.extensions.HTMLFormattingPlugin= {major: 2, minor: 2, revision: 0, date: new Date(2008,9,19)};

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
			// if <hide linebreaks> is present, suppress wiki-style literal handling of newlines
			if (html.indexOf('<hide linebreaks>')!=-1) html=html.replace(/\n/g,' ');
			// remove all \r's added by IE textarea and mask newlines and macro brackets
			html=html.replace(/\r/g,'').replace(/\n/g,'\\n').replace(/<</g,'%%(').replace(/>>/g,')%%');
			// create span, let browser parse HTML
			var e=createTiddlyElement(w.output,"span"); e.innerHTML=html;
			// re-render text nodes as wiki-formatted content
			wikifyTextNodes(e);
			// continue parsing
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
}

// wikify text nodes remaining after HTML content is processed (pre-order recursion)
function wikifyTextNodes(theNode)
{
	function unmask(s) { return s.replace(/\%%\(/g,'<<').replace(/\)\%%/g,'>>').replace(/\\n/g,'\n'); }
	switch (theNode.nodeName.toLowerCase()) {
		case 'style': case 'option': case 'select':
			theNode.innerHTML=unmask(theNode.innerHTML);
			break;
		case 'textarea':
			theNode.value=unmask(theNode.value);
			break;
		case '#text':
			var txt=unmask(theNode.nodeValue);
			var newNode=createTiddlyElement(null,"span");
			theNode.parentNode.replaceChild(newNode,theNode);
			wikify(txt,newNode);
			break;
		default:
			for (var i=0;i<theNode.childNodes.length;i++)
				wikifyTextNodes(theNode.childNodes.item(i)); // recursion
			break;
	}
}
//}}}