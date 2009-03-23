/***
|''Name''|ServerCommandsPlugin|
|''Description''|provides access to server-specific commands|
|''Author''|FND|
|''Version''|0.1.1|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#ServerCommandsPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.4.2|
|''Keywords''|serverSide|
!Description
<...>
!Notes
<...>
!Usage
{{{
<<...>>
}}}
!!Parameters
<...>
!!Examples
<<...>>
!Configuration Options
<...>
!Revision History
!!v0.1 (2009-02-26)
* initial release
!To Do
* strip server.* fields from revision tiddlers
* resolve naming conflicts
* placeholder message while loading
* i18n, l10n
* code sanitizing
* documentation
* rename?
!Code
***/
//{{{
(function() { //# set up local scope

if(!version.extensions.ServerCommandsPlugin) { //# ensure that the plugin is only installed once
version.extensions.ServerCommandsPlugin = { installed: true };

var cmd; //# alias
cmd = config.commands.revisions = {
	type: "popup",
	text: "revisions",
	tooltip: "display tiddler revisions",
	revLabel: "#%2 %1: %0 (%3)",
	revTooltip: "tooltip",
	revSuffix: " [rev. #%0]",
	dateFormat: "YYYY-0MM-0DD 0hh:0mm",

	handlePopup: function(popup, title) {
		var tiddler = store.getTiddler(title);
		var type = this._getField("server.type", tiddler);
		var adaptor = new config.adaptors[type]();
		var limit = null; // TODO: customizable
		var context = {
			host: this._getField("server.host", tiddler),
			workspace: this._getField("server.workspace", tiddler)
		};
		adaptor.getTiddlerRevisionList(title, limit, context, { popup: popup }, this.displayRevisions);
	},

	displayRevisions: function(context, userParams) {
		var list = userParams.popup; // XXX: popup already is an OL!?
		var callback = function(ev) {
			var e = ev || window.event;
			var revision = resolveTarget(e).getAttribute("revision");
			cmd.getTiddlerRevision(tiddler.title, revision, context, userParams);
		};
		for(var i = 0; i < context.revisions.length; i++) {
			var tiddler = context.revisions[i];
			var item = createTiddlyElement(list, "li");
			var timestamp = tiddler.modified.formatString(cmd.dateFormat);
			var revision = tiddler.fields["server.page.revision"];
			var label = cmd.revLabel.format([tiddler.title, tiddler.modifier, revision, timestamp]);
			createTiddlyButton(item, label, cmd.revTooltip, callback, null, null, null, { revision: revision });
		}
	},

	getTiddlerRevision: function(title, revision, context, userParams) {
		context.adaptor.getTiddlerRevision(title, revision, context, userParams, cmd.displayTiddlerRevision);
	},

	displayTiddlerRevision: function(context, userParams) {
		var tiddler = context.tiddler;
		var src = null; // TODO: pass through via userParams
		tiddler.fields.doNotSave = "true"; // XXX: correct?
		tiddler.title += cmd.revSuffix.format([tiddler.fields["server.page.revision"]]);
		if(!store.getTiddler(tiddler.title)) {
			store.addTiddler(tiddler);
		}
		story.displayTiddler(src, tiddler);
	},

	_getField: function(name, tiddler) {
		return tiddler.fields[name] || config.defaultCustomFields[name];
	}
};

} //# end of "install only once"

})(); //# end of local scope
//}}}
