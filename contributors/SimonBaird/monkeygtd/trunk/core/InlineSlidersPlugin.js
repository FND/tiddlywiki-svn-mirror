//{{{
config.formatters.unshift( {
    name: "inlinesliders",
    match: "\\+\\+\\+\\+|\\<slider",
    lookaheadRegExp: /(?:\+\+\+\+|<slider) ([\w\s]*)(?:>?)\n((?:.|\n)*?)\n(?:====|<\/slider>)/mg,
    handler: function(w)
    {
        this.lookaheadRegExp.lastIndex = w.matchStart;
        var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
        if(lookaheadMatch && lookaheadMatch.index == w.matchStart )
            {
            var btn = createTiddlyButton(w.output,lookaheadMatch[1] + " "+"\u00BB",lookaheadMatch[1],this.onClickSlider,"button sliderButton");
	        var panel = createTiddlyElement(w.output,"div",null,"sliderPanel");
	        panel.style.display = "none";
            wikify(lookaheadMatch[2],panel);
            w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
            }
    },
    onClickSlider : function(e)
    {
        if(!e) var e = window.event;
	    var n = this.nextSibling;
        n.style.display = (n.style.display=="none") ? "block" : "none";
        return false;
    }
});
//}}}