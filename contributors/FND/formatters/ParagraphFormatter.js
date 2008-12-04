/***
|''Name''|ParagraphFormatter|
|''Description''|formatter modifying TiddlyWiki's handling of line breaks|
|''Author:''|FND|
|''Version''|0.1.1|
|''Status''|@@beta@@|
|''Source''|http://devpad.tiddlyspot.com/#ParagraphFormatter|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Description
This formatter modifies the way line breaks in wiki markup are rendered;
single line breaks are ignored, two line breaks result in a blank line being inserted.
!Usage
!!Examples
{{{
lorem
ipsum

dolor
sit
amet
}}}
<<<
lorem
ipsum

dolor
sit
amet
<<<
!Revision History
!!v0.1 (2008-12-03)
* initial release
!Code
***/
//{{{
(function(formatters) { //# set up alias

// modify line-break formatter
var lineBreak = formatters[formatters.findByField("name", "lineBreak")];
lineBreak.match = "<br ?/?>";
// create paragraph formatter
formatters.push({
	name: "paragraph",
	match: "\\n\\n",
	handler: function(w) {
		createTiddlyElement(w.output, "br");
		createTiddlyElement(w.output, "br");
	}
});

})(config.formatters); //# end of alias
//}}}
