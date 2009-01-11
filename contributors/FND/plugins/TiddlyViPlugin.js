/***
|''Name''|TiddlyViPlugin|
|''Description''|enables mouseless navigation|
|''Author''|FND|
|''Version''|0.1.1|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#TiddlyViPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5|
|''Keywords''|navigation usability|
!Description
<...>
!Usage
The following keyboard commands are supported:
* {{{k}}}: previous tiddler
* {{{j}}}: next tiddler
!Revision History
!!v0.1 (2009-01-11)
* initial release
!To Do
* trigger for edit mode
* Ex-like commands for triggering toolbar commands
!Code
***/
//{{{
(function() { //# set up local scope

if(!version.extensions.TiddlyViPlugin) { //# ensure that the plugin is only installed once
version.extensions.TiddlyViPlugin = { installed: true };

var keys = {
	up: 75, // k
	down: 74 // j
};
var chars = {
	up: 107, // k
	down: 106 // j
}; // XXX: hacky!?

var selectNextItem = function(reverse) { // XXX: rename
	var el = $("#displayArea .selected:in-viewport");
	if(el.length === 0) { // select top element
		$("#displayArea .tiddler:in-viewport:first").addClass("selected"); // first element isn't necessarily the top element!? -- XXX: includes elements partially above the fold
	} else { // select next element
		var next = reverse ? $(el).prev() : $(el).next();
		if(next.length) {
			el.removeClass("selected");
			next.addClass("selected");
		}
	}
	el = $("#displayArea .selected")[0]; // XXX: redundant; element already known!?
	window.scrollTo(0, ensureVisible(el)); // TODO: use jQuery (animations?)
};

$(document).bind("keypress", null, function(ev) {
	// do not intercept keypress when in edit mode -- XXX: hacky
	if($("#displayArea .selected[dirty=true]:in-viewport").length) { // XXX: excessively complicated (performance implications!)
		return true;
	}
	// detect keyboard commands
	var key = ev.charCode || ev.keyCode || 0; // XXX: charCode != keyCode!?
	switch(key) {
		case keys.up:
		case chars.up:
			selectNextItem(true);
			break;
		case keys.down:
		case chars.down:
			selectNextItem(false);
			break;
		default:
			break;
	}
});

} //# end of "install only once"

})(); //# end of local scope
//}}}
