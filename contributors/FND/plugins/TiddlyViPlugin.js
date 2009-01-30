/***
|''Name''|TiddlyViPlugin|
|''Description''|mouseless navigation and editing|
|''Author''|FND|
|''Version''|0.2.1|
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
* CLI styling
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
	up: 107, // k (charCode)
	down: 106, // j (charCode)
	confirm: 13, // ENTER (keyCode) -- XXX: TiddlyWiki also uses keycode 10!?
	abort: 27, // ESC (keyCode)
	cmd: 58 // colon (charCode)
};

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
				var key = e.keyCode || e.which; // XXX: keyCode required for ESC!?
				switch(key) {
					case keys.confirm:
						commandMode.dispatch(this.value);
					case keys.confirm:
					case keys.abort:
						$(this).parent().remove();
						break;
					default:
						break;
				}
			}).appendTo(container).focus();
		} // XXX: else focus CLI?
	},

	dispatch: function(cmd) {
		var params = String.prototype.readBracketedList ? cmd.readBracketedList() : cmd.split(" "); // XXX: required only if fully TW-agnostic
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

// detect active edit session
var editing = function() { // XXX: rename
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
		case keys.cmd:
			commandMode.init();
			break;
		default:
			break;
	}
});

} //# end of "install only once"

})(jQuery); //# end of local scope
//}}}
