/***
|''Name:''|InlineSlidersPlugin|
|''Description:''|super light weight plugin for inline sliders|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#InlineSlidersPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.2|

!!Usage
* Create sliders inline using a {{{<slider label>text of slider</slider>}}} syntax
* Also supports a {{{+++++ =====}}} syntax
* Please note
* Example:
+++++ Demo
This is an example slider
=====
***/
// /%
//!BEGIN-PLUGIN-CODE
config.formatters.unshift( {
	name: "inlinesliders",
	match: "\\+\\+\\+\\+\\+|\\<slider",
	lookaheadRegExp: /(?:\+\+\+\+\+|<slider) (.*?)(?:>?)\n((?:.|\n)*?)\n(?:=====|<\/slider>)/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart )
			{
			var btn = createTiddlyButton(w.output,lookaheadMatch[1] + " "+"\u00BB",lookaheadMatch[1],this.onClickSlider,"button sliderButton");
			var panel = createTiddlyElement(w.output,"div",null,"sliderPanel inlineSlider");
			panel.style.display = "none";
			panel.raw = lookaheadMatch[2];
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
			}
	},
	onClickSlider : function(e)
	{
		if(!e) var e = window.event;
		var n = this.nextSibling;
		removeChildren(n);
		wikify(n.raw,n);
		n.style.display = (n.style.display=="none") ? "block" : "none";
		return false;
	}
});
setStylesheet("div.inlineSlider {margin-left:1em; padding:0 0.5em;}","InlineSliderStyles");
//!END-PLUGIN-CODE
// %/