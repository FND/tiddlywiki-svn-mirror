/***
|''Name''|ServerCommandsPlugin|
|''Description''|provides access to server-specific commands|
|''Author''|FND|
|''Version''|0.1.0|
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
	type: "popup", // XXX: move to locale object?
	text: "revisions", // XXX: move to locale object?
	tooltip: "display tiddler revisions", // XXX: move to locale object?
	revLabel: "%0 [%2: %1]", // XXX: move to locale object?
	revTooltip: "tooltip", // TODO -- XXX: move to locale object?
	revSuffix: " [rev. #%0]",

	handlePopup: function(popup, title) {
		var tiddler = store.getTiddler(title);
		var type = this._getField("server.type", tiddler);
		var adaptor = new config.adaptors[type]();
		var limit = null; // TODO: customizable?
		var context = {
			host: this._getField("server.host", tiddler),
			workspace: this._getField("server.workspace", tiddler)
		};
		adaptor.getTiddlerRevisionList(title, limit, context, { popup: popup }, this.displayRevisions);
	},

	displayRevisions: function(context, userParams) {
		var list = userParams.popup; // XXX: popup already is an OL!?
		for(var i = 0; i < context.revisions.length; i++) {
			var tiddler = context.revisions[i];
			var item = createTiddlyElement(list, "li");
			createTiddlyButton(item,
				cmd.revLabel.format([tiddler.title, tiddler.modifier, tiddler.modified]),
				cmd.revTooltip, function() {
					cmd.getTiddlerRevision(tiddler.title,
						tiddler.fields["server.page.revision"],
						context, userParams);
				});
		}
	},

	getTiddlerRevision: function(title, revision, context, userParams) {
		context.adaptor.getTiddlerRevision(title, revision, context, userParams, cmd.displayTiddlerRevision);
	},

	displayTiddlerRevision: function(context, userParams) {
		var tiddler = context.tiddler;
		var src = null; // TODO: pass through via userParams
		tiddler.fields.donotsave = "true"; // XXX: correct?
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
