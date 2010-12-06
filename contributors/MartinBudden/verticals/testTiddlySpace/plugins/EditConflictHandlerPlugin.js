/***
|''Name''|EditConflictHandlerPlugin|
|''Version''|0.1.5|
|''Author''|Jon Robson|
***/

//{{{
(function($) {
config.extensions.ServerSideSavingPlugin.reportFailure = function(msg, tiddler, context) {
	var title = tiddler.title;
	var myrev = "" + tiddler.fields["server.page.revision"];
	store.getTiddler(title).fields["server.page.revision"] = "false"; // this is done here as the user may then hit edit and will need to be able to save back
	// is this reset by saveTiddler ? (I think not)
	var el = story.getTiddler(title);
	if(!el) {
		el = story.displayTiddler(null, title);
	}
	var msg = $("<div />").addClass("error annotation").prependTo(el)[0];
	$("<div />").text("Resolution of issue required. A user has edited this tiddler at the same time as you").appendTo(msg);

	var diffBtn = createTiddlyButton(msg, "review difference","", function(ev) {
		var target = $(ev.target);
		var title = target.attr("tiddler-title");
		target.text("loading...");
		var tiddler = store.getTiddler(title);
		var adaptor = tiddler.getAdaptor();
		var callback = function(context, userParams) {
			var diffTitle = "Diff of EditConflict %0".format([new Date().formatString("0hh:0mm:0ss")]);
			var newTiddler = new Tiddler(diffTitle);
			newTiddler.fields = tiddler.fields;
			newTiddler.tags = ["excludeLists", "excludeMissing", "diff"];
			newTiddler.text = "{{diff{\n%0%\n}}}".format([context.diff]);
			store.saveTiddler(newTiddler);
			story.displayTiddler(target, diffTitle);
		};
		adaptor.getTiddlerDiff(title, {}, null, callback);
	});
	$(diffBtn).attr("tiddler-title", title);
	var saveBtn = createTiddlyButton(msg, "save anyway","", function(ev) {
			var title = $(ev.target).attr("tiddler-title");
			var tiddler = store.getTiddler(title);
			var tid = store.saveTiddler(tiddler);
			autoSaveChanges(null, [tid]);
		});
	$(saveBtn).attr("tiddler-title", title);
	var ignoreBtn = createTiddlyButton(msg, "discard this change","", function(ev) {
		var target = $(ev.target);
		var title = target.attr("tiddler-title");
		var adaptor = tiddler.getAdaptor();
		target.text("updating your version...")
		adaptor.getTiddler(title, { host: tiddler.fields["server.host"], workspace: "bags/" + tiddler.fields["server.bag"]}, null, function(context) {
			store.saveTiddler(context.tiddler);
			story.refreshTiddler(title);
			store.setDirty(false);
		});
	});
	$(ignoreBtn).attr("tiddler-title", title);
	$(el).addClass("annotation");
};
})(jQuery);
//}}}