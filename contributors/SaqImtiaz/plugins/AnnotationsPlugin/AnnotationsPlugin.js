/***
|''Name:''|AnnotationsPlugin|
|''Description:''|Inline annotations for tiddler text.|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#AnnotationsPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|

!!Usage:
*{{{((text to annotate(annotation goes here)}}}
* To include the text being annotated, in the popup as a title, put {{{^}}} as the first letter of the annotation text.
** {{{((text to annotate(^annotation goes here)}}}

!!Examples:
Mouse over, the text below:
* ((banana(the best fruit in the world)))
* ((banana(^ the best fruit in the world)))

***/
// /%
//!BEGIN-PLUGIN-CODE
config.formatters.unshift( {
    name: "annotations",
    match: "\\(\\(",
    lookaheadRegExp: /\(\((.*?)\((\^?)((?:.|\n)*?)\)\)\)/g,
    handler: function(w)
    {
        this.lookaheadRegExp.lastIndex = w.matchStart;
        var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
        if(lookaheadMatch && lookaheadMatch.index == w.matchStart )
            {
				var container = createTiddlyElement(w.output,"span",null,"annosub",lookaheadMatch[1]);
				container.anno = lookaheadMatch[3];
				if (lookaheadMatch[2])
					container.subject = lookaheadMatch[1];
				container.onmouseover = this.onmouseover;
				container.onmouseout = this.onmouseout;
				container.ondblclick = this.onmouseout;	
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
            }
    },
	onmouseover : function(e){
		popup = createTiddlyElement(document.body,"div",null,"anno");
		this.popup = popup;
		if (this.subject)
			wikify ("!"+this.subject+"\n",popup); 
		wikify(this.anno,popup);
		addClass(this,"annosubover");
		Popup.place(this,popup,{x:25,y:7});
	},
	onmouseout : function(e){
		removeNode(this.popup);
		this.popup = null;
		removeClass(this,"annosubover");
	}
});

setStylesheet(
	".anno{position:absolute;border:2px solid #000;background-color:#DFDFFF; color:#000;padding:0.5em;max-width:15em;width:expression(document.body.clientWidth > (255/12) *parseInt(document.body.currentStyle.fontSize)?'15em':'auto' );}\n"+//
	".anno h1, .anno h2{margin-top:0;color:#000;}\n"+//
	".annosub{background:#ccc;}\n"+//
	".annosubover{z-index:25; background-color:#DFDFFF;cursor:help;}\n",//
	"AnnotationStyles");
//!END-PLUGIN-CODE
// %/