/***
|''Name:''|FootnotesPlugin|
|''Description:''|Create automated tiddler footnotes.|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#FootnotesPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.01|
|''Date:''|10/25/07|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.2|

!!Usage:
*To create a footnote, just put the footnote text inside triple backticks.
*Footnotes are numbered automatically, and listed at the bottom of the tiddler.
*{{{Creating a footnote is easy. ```This is the text for my footnote```}}}
*[[Example|FootnotesDemo]]
***/
// /%
//!BEGIN-PLUGIN-CODE
config.footnotesPlugin = {
	backLabel: "back",
	prompt:"show footnote"
};

config.formatters.unshift( {
    name: "footnotes",
    match: "```",
    lookaheadRegExp: /```((?:.|\n)*?)```/g,
    handler: function(w)
    {
        this.lookaheadRegExp.lastIndex = w.matchStart;
        var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
        if(lookaheadMatch && lookaheadMatch.index == w.matchStart )
            {
			var tiddler = story.findContainingTiddler(w.output);
			if (!tiddler.notes)
				tiddler.notes = [];
			var title = tiddler.getAttribute("tiddler");
			tiddler.notes.pushUnique(lookaheadMatch[1]);
			var pos = tiddler.notes.indexOf(lookaheadMatch[1]) + 1;
			createTiddlyButton(w.output,pos,config.footnotesPlugin.prompt,function(){var x = document.getElementById(title+"ftn"+pos);window.scrollTo(0,ensureVisible(x)+(ensureVisible(x)<findScrollY()?(findWindowHeight()-x.offsetHeight):0));return false;},"ftnlink",title+"ftnlink"+pos);			
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
            }
    }
});

old_footnotes_refreshTiddler = Story.prototype.refreshTiddler;
Story.prototype.refreshTiddler = function(title,template,force)
{
    var tiddler = old_footnotes_refreshTiddler.apply(this,arguments);
	if (tiddler.notes && tiddler.notes.length)
	{
		var holder = createTiddlyElement(null,"div",null,"footnoteholder");
		var list = createTiddlyElement(holder,"ol",title+"footnoteholder");
		for (var i=0; i<tiddler.notes.length; i++)
		{
			var ftn = createTiddlyElement(list,"li",title+"ftn"+(i+1),"footnote");
			wikify(tiddler.notes[i]+" ",ftn);
			createTiddlyButton(ftn,"["+config.footnotesPlugin.backLabel+"]",config.footnotesPlugin.backLabel,function(){window.scrollTo(0,ensureVisible(document.getElementById(this.parentNode.id.replace("ftn","ftnlink"))));return false;},"ftnbklink");
		}
		var count = tiddler.childNodes.length;
		for (var j=0; j<count; j++){
			if(hasClass(tiddler.childNodes[j],"viewer")){
				var viewer = tiddler.childNodes[j];	
			}
		}
		viewer.appendChild(holder);
		tiddler.notes = [];
	}
    return tiddler;
};

setStylesheet(
".tiddler a.ftnlink {vertical-align: super; font-size: 0.8em; color:red;}\n"+
".tiddler a.ftnlink:hover, .tiddler .footnoteholder a.ftnbklink:hover{color:#fff;background:red;}\n"+
".tiddler div.footnoteholder{margin:1.8em 1.0em; padding:0.1em 1.0em 0.1em 1.0em ;border-left: 1px solid #ccc;}"+
".tiddler footnoteholder ol {font-size: 0.9em; line-height: 1.2em;}\n"+
".tiddler .footnoteholder li.footnote {margin: 0 0 5px 0;}\n"+
".tiddler .footnoteholder a.ftnbklink{color:red;}\n","FootNotesStyles");
//!END-PLUGIN-CODE
// %/