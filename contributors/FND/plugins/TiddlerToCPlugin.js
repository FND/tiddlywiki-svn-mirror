/***
|''Name''|TiddlerToCPlugin|
|''Description''|generates a table of contents for headings within a tiddler|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#TableOfContentsPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5|
!Description
<...>
!Notes
This plugin supersedes an earlier plugin of the same name.
!Usage
{{{
<<ToC>>
}}}
!!Parameters
<...>
!!Examples
<<ToC>>
!Configuration Options
<...>
!Revision History
!!v0.1 (2009-01-19)
* initial release
!To Do
* documentation (e.g. macro has to be below the last heading)
* optional marker for ToC position
!Code
***/
//{{{
(function($) { //# set up local scope

$.tw.fn.extend({
	ToC: function(args) {
		var names = [];
		// add anchors to headings
		var tiddlerElem = story.findContainingTiddler(this[0]);
		$(tiddlerElem).find("h1, h2, h3, h4, h5, h6").attr("name", function() {
			var name = this.nodeName + "_" + $(this).text().replace(" ", "_"); // XXX: replacing spaces not sufficient!?
			names.push(name);
			return name;
		});
		// generate table of contents
		var container = $(tiddlerElem).find(".viewer").prepend("<ul class='ToC'></ul>"); // XXX: don't use string!? -- does not return prepended element
		console.log(container, container[0]);
		$.each(names, function() {
			container.append("<li><a href='#" + this + "'>" + this + "</a></li>"); // XXX: don't use string!? -- does not scroll to anchor
		});
		return this;
	}
});

})(jQuery); //# end of local scope
//}}}
