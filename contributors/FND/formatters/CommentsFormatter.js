/***
|''Name''|CommentsFormatter|
|''Description''|formatter adding comments syntax|
|''Author:''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#CommentsFormatter|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
!Usage
!!Examples
{{{
lorem /# foo
}}}
<<<
lorem /# foo
<<<
!Revision History
!!v0.1 (2009-05-06)
* initial release
!Code
***/
//{{{
(function(formatters) {

formatters.push({
	name: "comment",
	match: "\/#.*?\n",
	handler: function(w) {
		createTiddlyElement(w.output, "span", null, "comment", w.matchText);
	}
});

})(config.formatters);
//}}}
