/***
|Name|Plugin: arXiv Links|
|Created by|BobMcElrath|
|Email|my first name at my last name dot org|
|Location|http://bob.mcelrath.org/tiddlyjsmath-2.0.3.html|
|Version|1.0|
|Requires|[[TiddlyWiki|http://www.tiddlywiki.com]] &ge; 2.0.3|
!Description
This formatting plugin will render links to the [[arXiv|http://www.arxiv.org]] preprint system.  If you type a paper reference such as hep-ph/0509024, it will be rendered as an external link to the abstract of that paper.
!Installation
Add this tiddler to your tiddlywiki, and give it the {{{systemConfig}}} tag.
!History
* 1-Feb-06, version 1.0, Initial release
!Code
***/
//{{{
config.formatters.push({
  name: "arXivLinks",
  match: "\\b(?:astro-ph|cond-mat|hep-ph|hep-th|hep-lat|gr-qc|nucl-ex|nucl-th|quant-ph|(?:cs|math|nlin|physics|q-bio)(?:\\.[A-Z]{2})?)/[0-9]{7}\\b",
  element: "a",
  handler: function(w) {
    var e = createExternalLink(w.output, "http://arxiv.org/abs/"+w.matchText);
    e.target = "_blank"; // open in new window
    w.outputText(e,w.matchStart,w.nextMatch);
  }
});
//}}}

