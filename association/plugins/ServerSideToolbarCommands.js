/***
|''Name''|ServerSideToolbarCommands|
|''Description''|dynamically modifies toolbar commands based on permissions|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/plugins/ServerSideToolbarCommands.js|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Keywords''|serverSide|
!Revision History
!!v0.1 (2009-10-09)
* initial release
!Code
***/
//{{{
(function($) {

// hijack to trigger on-demand loading
_displayTiddler = Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement, tiddler, template,
	animate, unused, customFields, toggle, animationSrc) {
	var status = _displayTiddler.apply(this, arguments);
	var tiddler = (tiddler instanceof Tiddler) ? tiddler : store.getTiddler(tiddler);
	if(tiddler) {
		refreshTiddler(tiddler);
	}
	return status;
};

var refreshTiddler = function(tiddler) {
	var adaptor = tiddler.getAdaptor();
	//if(tiddler.fields["server.permissions"]) { // XXX: redundant? -- XXX: DEBUG'd
	//	updateToolbar(tiddler);
	//}
	if(adaptor) { // XXX: don't re-request if server.permissions already present?
		var context = {
			host: tiddler.fields["server.host"],
			workspace: tiddler.fields["server.workspace"]
		};
		adaptor.getTiddler(tiddler.title, context, null, updateTiddler); // XXX/TODO: only request skinny!
	}
	return false;
};

var updateTiddler = function(context, params) {
	if(context.status) {
		var t = context.tiddler;
		var tiddler = store.getTiddler(t.title);
		tiddler.fields["server.permissions"] = t.fields["server.permissions"];

		// XXX: not relevant in this context, but helps with subsequent PUTs -- XXX: obsolete?
		delete tiddler.fields["server.bag"]; // unused; prevent mismatches -- XXX: really?
		tiddler.fields["server.workspace"] = t.fields["server.workspace"];

		updateToolbar(tiddler);
	}
};

var updateToolbar = function(tiddler) { // XXX: TiddlyWeb-specific!?
	var tEl = story.getTiddler(tiddler.title);
	var toolbar = $(".toolbar", tEl);
	// deactivate commands
	if(!hasPermission("write", tiddler)) {
		disableCommand("saveTiddler", toolbar);
		var cmd = config.commands.editTiddler;
		toolbar.find(".command_editTiddler").
			attr("title", cmd.readOnlyTooltip).text(cmd.readOnlyText);
	}
	if(!hasPermission("delete", tiddler)) {
		disableCommand("deleteTiddler", toolbar);
	}
};

// hijack Tiddler.prototype.isReadOnly to use permissions
var original = Tiddler.prototype.isReadOnly;
Tiddler.prototype.isReadOnly = function() {
	var readOnly = original.apply(this, arguments); // global read-only mode
	return readOnly || !hasPermission("write", this);
};

var hasPermission = function(type, tiddler) {
	var perms = tiddler.fields["server.permissions"];
	if(perms) {
		return perms.split(", ").contains(type);
	} else {
		return true;
	}
};

var disableCommand = function(name, toolbar) {
	var btn = toolbar.find(".command_" + name).
		attr("title", "unauthorized"). // TODO: i18n
		addClass("disabled").
		css("color", "#EEE"). // TODO: customizable
		get(0);
	if(btn) {
		btn.onclick = null; // TODO: popup with explanatory message?
	}
};

})(jQuery);
//}}}
