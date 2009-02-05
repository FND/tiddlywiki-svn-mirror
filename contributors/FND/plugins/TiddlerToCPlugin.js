/***
|''Name''|TiddlerToCPlugin|
|''Description''|generates a table of contents for headings within a tiddler|
|''Author''|FND|
|''Version''|0.1.1|
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
* nested ULs based on heading level
* documentation (e.g. macro has to be below the last heading)
* optional marker for ToC position
!Code
***/
//{{{
(function($) { //# set up local scope

$.tw.fn.extend({
	ToC: function(args) {
		var headings = [];
		// add anchors to headings
		var tiddlerElem = story.findContainingTiddler(this[0]);
		$(tiddlerElem).find("h1, h2, h3, h4, h5, h6").attr("id", function() { // XXX: use A element with name instead of id?
			var tag = this.nodeName;
			var label = $(this).text();
			var name = tag + "_" + label.replace(" ", "_"); // XXX: replacing spaces not sufficient!?
			headings.push({
				level: parseInt(tag.substr(1), 10),
				label: label,
				name: name
			});
			return name;
		});
		// generate table of contents
		var parent = $(tiddlerElem).find(".viewer");
		var container = $("<ul />").addClass("ToC").prependTo(parent);
		$.each(headings, function(i, item) {
			var li = $("<li />").appendTo(container);
			$("<a />").attr("href", "#" + item.name).text(item.label).appendTo(li);
		});
		return this;
	}
});

})(jQuery); //# end of local scope
//}}}
