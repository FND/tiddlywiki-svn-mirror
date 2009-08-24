/***
|''Name''|RevisionsCommandPlugin|
|''Description''|provides access to tiddler revisions|
|''Author''|FND|
|''Contributors''|Martin Budden|
|''Version''|0.1.4|
|''Status''|@@beta@@|
|''Source''|http://devpad.tiddlyspot.com/#RevisionsCommandPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/plugins/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.4.2|
|''Keywords''|serverSide|
!Usage
Extend [[ToolbarCommands]] with {{{revisions}}}.
!Revision History
!!v0.1 (2009-07-23)
* initial release (renamed from experimental ServerCommandsPlugin)
!To Do
* strip server.* fields from revision tiddlers
* resolve naming conflicts
* i18n, l10n
* code sanitizing
* documentation
* rename?
!Code
***/
//{{{
(function() {

if(!version.extensions.ServerCommandsPlugin) { //# ensure that the plugin is only installed once
version.extensions.ServerCommandsPlugin = { installed: true };

var cmd; //# alias
cmd = config.commands.revisions = {
	type: "popup",
	hideShadow: true,
	text: "revisions",
	tooltip: "display tiddler revisions",
	revLabel: "#%2 %1: %0 (%3)",
	revLabel2: "#%0 %1",
	revTooltip: "", // TODO: populate dynamically?
	loadLabel: "loading...",
	loadTooltip: "loading revision list",
	revSuffix: " [rev. #%0]",
	diffSuffix: " [diff: #%0 #%1]",
	dateFormat: "YYYY-0MM-0DD 0hh:0mm",
	select: "select",
	selectTip: "select tip",
	selected: "selected",
	compare: "compare",

	handlePopup: function(popup, title) {
		// remove revSuffix from title if it exists
		var i = cmd.revSuffix.indexOf("%0");
		i = title.indexOf(cmd.revSuffix.substr(0, i));
		if(i != -1) {
			title = title.substr(0, i);
		}
		// remove diffSuffix from title if it exists
		i = cmd.diffSuffix.indexOf("%0");
		i = title.indexOf(cmd.revSuffix.substr(0, i));
		if(i != -1) {
			title = title.substr(0, i);
		}
		var tiddler = store.getTiddler(title);
		var type = this._getField("server.type", tiddler);
		var adaptor = new config.adaptors[type]();
		var limit = null; // TODO: customizable
		var context = {
			host: this._getField("server.host", tiddler),
			workspace: this._getField("server.workspace", tiddler)
		};
		var loading = createTiddlyButton(popup, cmd.loadLabel, cmd.loadTooltip);
		var params = { popup: popup, loading: loading, origin: title };
		adaptor.getTiddlerRevisionList(title, limit, context, params, this.displayRevisions);
	},

	displayRevisions: function(context, userParams) {
		var callback = function(ev) {
			var e = ev || window.event;
			var revision = resolveTarget(e).getAttribute("revision");
			context.adaptor.getTiddlerRevision(tiddler.title, revision, context, userParams, cmd.displayTiddlerRevision);
		};
		removeNode(userParams.loading);
		//var table = createTiddlyElement(userParams.popup,'table');
		for(var i = 0; i < context.revisions.length; i++) {
			var tiddler = context.revisions[i];
			var item = createTiddlyElement(userParams.popup, "li");
			//var row = createTiddlyElement(table,'tr');
			var timestamp = tiddler.modified.formatString(cmd.dateFormat);
			var revision = tiddler.fields["server.page.revision"];
			var label = cmd.revLabel.format([tiddler.title, tiddler.modifier, revision, timestamp]);
			//var label = cmd.revLabel2.format([timestamp,tiddler.modifier]);
			createTiddlyButton(item, label, cmd.revTooltip, callback, null, null, null, { revision: revision });
			//cmd.context = context;
			//createTiddlyButton(row, cmd.select, cmd.selectTip, cmd.revisionSelected, null, null, null, { index:i, revision: revision, context: context });
		}
	},

	revisionSelected: function(ev) {
		var e = ev || window.event;
		e.cancelBubble = true;
		if(e.stopPropagation) e.stopPropagation();
		var n = resolveTarget(e);
		var index = n.getAttribute('index');
		cmd.revision = n.getAttribute("revision");
		var table = n.parentNode.parentNode;
		var rows = table.childNodes;
		for(var i=0;i<rows.length;i++) {
			var c = rows[i].childNodes;
			if(i==index) {
				c[1].textContent = cmd.selected;
			} else {
				c[1].textContent = cmd.compare;
				c[1].onclick = cmd.compareSelected;
			}
		}
	},

	compareSelected: function(ev) {
		var e = ev || window.event;
		var n = resolveTarget(e);
		var context = cmd.context;
		context.rev1 = n.getAttribute("revision");
		context.rev2 = cmd.revision;
		context.tiddler = context.revisions[n.getAttribute('index')];
		cmd.displayTiddlerDiffs(context, context.userParams);
	},

	displayTiddlerDiffs: function(context, userParams) {
		var tiddler = context.tiddler;
		tiddler.title += cmd.diffSuffix.format([context.rev1,context.rev2]);
		tiddler.text = context.diff;
		tiddler.fields.doNotSave = "true"; // XXX: correct?
		if(!store.getTiddler(tiddler.title)) {
			store.addTiddler(tiddler);
		}
		var src = story.getTiddler(userParams.origin);
		story.displayTiddler(src, tiddler);
	},

	displayTiddlerRevision: function(context, userParams) {
		var tiddler = context.tiddler;
		tiddler.title += cmd.revSuffix.format([tiddler.fields["server.page.revision"]]);
		tiddler.fields.doNotSave = "true"; // XXX: correct?
		if(!store.getTiddler(tiddler.title)) {
			store.addTiddler(tiddler);
		}
		var src = story.getTiddler(userParams.origin);
		story.displayTiddler(src, tiddler);
	},

	_getField: function(name, tiddler) {
		return tiddler.fields[name] || config.defaultCustomFields[name];
	}
};

} //# end of "install only once"

})();
//}}}
