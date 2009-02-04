/***
|''Name''|TiddlyViPlugin|
|''Description''|mouseless navigation and editing|
|''Author''|FND|
|''Version''|0.3.0|
|''Status''|@@experimental@@|
|''Source''|http://fnd.tiddlyspot.com/#TiddlyViPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5|
|''Requires''|[[Viewport|http://www.appelsiini.net/projects/viewport]] [[jQuery.CLI|http://github.com/FND/jquery/]]|
|''Keywords''|navigation usability|
!Description
<...>
!Usage
The following keyboard commands are supported:
* {{{k}}}: previous tiddler
* {{{j}}}: next tiddler
* {{{:}}}: enter command mode
* {{{ESC}}}: exit command mode
!!Command Mode
The following commands are supported:
* {{{open <tiddler>}}}
* {{{close <tiddler>}}}
!Revision History
!!v0.1 (2009-01-11)
* initial release
!!v0.2 (2009-01-30)
* implemented command mode
!!v0.3 (2009-02-04)
* refactored to use jQuery.CLI for command mode
!To Do
* commands for triggering toolbar commands
* command aliases
* implement navigation as generic jQuery plugin
* CLI styling
* re-implement $.inviewport to avoid Viewport dependency
!Code
***/
//{{{
(function($) { //# set up local scope

if(!$.inviewport) { // XXX: check for $.expr[":"]["in-viewport"]?
	throw "Missing dependency: Viewport";
}
if(!$.CLI) {
	throw "Missing dependency: jQuery.CLI";
}

if(!version.extensions.TiddlyViPlugin) { //# ensure that the plugin is only installed once
version.extensions.TiddlyViPlugin = { installed: true };

/*
 * command mode
 */

var commands = { // XXX: expose as non-private
	open: function(params) {
		story.displayTiddler(null, params[0], null, true, null, null, false, document.body);
	},
	close: function(params) {
		story.closeTiddler(params[0], true);
	}
};

// hijack restart to initialize command mode -- XXX: hijack refreshDisplay?
var restart_orig = restart;
restart = function() {
	restart_orig.apply(this, arguments);
	jQuery.CLI(commands);
};

// TODO: hijack edit macro to suppress custom keyboard events for dynamically-created input fields

/*
 * navigation mode
 */

var keys = {
	up: 107, // k (charCode)
	down: 106, // j (charCode)
};

var selectNextItem = function(reverse) { // TODO: rename
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

// detect active edit session
var editing = function() { // TODO: rename
	if($("#displayArea .selected[dirty=true]:in-viewport").length) { // XXX: excessively complicated (performance implications!)
		return true;
	} else {
		return false;
	}
};

// keyboard initialization
$(document).bind("keypress", null, function(e) {
	if(editing()) { // XXX: hacky?
		return true;
	}
	switch(e.which) {
		case keys.up:
			selectNextItem(true);
			break;
		case keys.down:
			selectNextItem(false);
			break;
		default:
			break;
	}
});

} //# end of "install only once"

})(jQuery); //# end of local scope
//}}}
