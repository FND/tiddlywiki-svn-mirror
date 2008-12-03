/***
|''Name''|ParagraphFormatter|
|''Description''|formatter modifying TiddlyWiki's handling of line breaks|
|''Author:''|FND|
|''Version''|0.1.0|
|''Status''|@@beta@@|
|''Source''|http://devpad.tiddlyspot.com/#ParagraphFormatter|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Description
This formatter modifies the way line breaks in wiki markup are rendered;
single line breaks are ignored, two line breaks result in a blank line being inserted.
!Revision History
!!v0.1 (2008-12-03)
* initial release
!Code
***/
//{{{
(function() {
    // modify line-break formatter
    for(var i = 0; i < config.formatters.length; i++) {
        var obj = config.formatters[i];
        if(obj.name == "lineBreak") {
            obj.match = "<br ?/?>";
        }
    }
    // create paragraph formatter
    config.formatters.push({
        name: "paragraph",
        match: "\\n\\n",
        handler: function(w) {
            createTiddlyElement(w.output, "br");
            createTiddlyElement(w.output, "br");
        }
    });
})();
//}}}