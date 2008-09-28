//{{{
config.formatters.unshift( {
    match: "\\<slider",
     lookahead: "\\<slider(?: ((?:.|\\n)*?))?\\>\\n((?:.|\\n)*?)\\<\\/slider\\>",
    handler: function(w)
    {
        var lookaheadRegExp = new RegExp( this.lookahead,"mg");
        lookaheadRegExp.lastIndex = w.matchStart;
        var lookaheadMatch = lookaheadRegExp.exec(w.source)
        if(lookaheadMatch && lookaheadMatch.index == w.matchStart )
            {
            var btn = createTiddlyButton(w.output,lookaheadMatch[1] ,lookaheadMatch[1],this.onClickSlider,"tiddlyLink");
	    var panel = createTiddlyElement(w.output,"div",null,"sliderPanel");
	    panel.style.display = "none";
            //wikify(lookaheadMatch[2],panel);
            panel.setAttribute("raw",lookaheadMatch[2]);
            w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
            }
    },
    onClickSlider : function(e)
    {
        if(!e) var e = window.event;
	    var n = this.nextSibling;
        removeChildren(n);
        wikify(">"+n.getAttribute("raw"),n);
        n.style.display = (n.style.display=="none") ? "block" : "none";
        return false;
    }
})
//}}}