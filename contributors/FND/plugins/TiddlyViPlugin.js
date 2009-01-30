/***
|''Name''|TiddlyViPlugin|
|''Description''|mouseless navigation and editing|
|''Author''|FND|
|''Version''|0.2.0|
|''Status''|@@experimental@@|
|''Source''|http://fnd.tiddlyspot.com/#TiddlyViPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5|
|''Requires''|[[Viewport|http://www.appelsiini.net/projects/viewport]]|
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
!To Do
* commands for triggering toolbar commands
* command aliases
* implement as generic jQuery plugin
!Code
***/
//{{{
(function($) { //# set up local scope

if(!$.inviewport) { // XXX: check for $.expr[":"]["in-viewport"]?
	throw "Missing dependency: Viewport";
}

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

var commandMode = {
	cmds: {
		open: function(params) {
			story.displayTiddler(null, params[0], null, true, null, null, false, document.body);
		},
		close: function(params) {
			story.closeTiddler(params[0], true);
		}
	},

	init: function() {
		var container = $("#CLI");
		if(!container.length) {
			container = $("<div id='CLI' />").appendTo(document.body);
			$("<input type='text' />").keypress(function(e) {
					if(e.which == 13) { // ENTER -- XXX: TiddlyWiki also says keycode 10?
						commandMode.dispatch(this.value);
						$(this).parent().remove();
					} else if(e.which === 0) { // ESC -- XXX: TiddlyWiki says keycode 27?
						$(this).parent().remove();
					}
				}).appendTo(container).focus();
		} // XXX: else focus CLI?
	},

	dispatch: function(cmd) {
		var params = String.prototype.readBracketedList ? cmd.readBracketedList() : cmd.split(" "); // XXX: required only if fully TW-agnostic
		console.log(this);
		cmd = this.cmds[params.shift()];
		if(cmd) {
			cmd(params);
		} // XXX: else?
	}
};

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

$(window).keypress(function(e) { // XXX: performance imact!?
	if(e.which == 58) { // colon -- XXX: interferes with editing -- XXX: cross-browser?
		commandMode.init();
	}
});

} //# end of "install only once"

})(jQuery); //# end of local scope
//}}}
