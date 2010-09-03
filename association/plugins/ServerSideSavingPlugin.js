/***
|''Name''|ServerSideSavingPlugin|
|''Description''|server-side saving|
|''Author''|FND|
|''Version''|0.7.0dev|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/plugins/ServerSideSavingPlugin.js|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5.3|
|''Keywords''|serverSide|
!Notes
This plugin relies on a dedicated adaptor to be present.
The specific nature of this plugin depends on the respective server.
!To Do
* conflict detection/resolution
* document deletion/renaming convention
!StyleSheet
.cloak {
	height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
	z-index: 9999;
	background-color: #000;
	opacity: 0.5;
}

.error {
	background-color: [[ColorPalette::Error]];
}
!Code
***/
//{{{
(function($) {

readOnly = false; //# enable editing over HTTP

var name = "StyleSheetServerSideSaving";
config.shadowTiddlers[name] = store.getRecursiveTiddlerText(tiddler.title +
	"##StyleSheet", "", 1);
store.addNotification(name, refreshStyles);

var plugin = config.extensions.ServerSideSavingPlugin = {};

plugin.locale = {
	saved: "%0 saved successfully",
	saveError: "Error saving %0: %1",
	saveConflict: "Error saving %0: edit conflict",
	deleted: "Removed %0",
	deleteError: "Error removing %0: %1",
	deleteLocalError: "Error removing %0 locally",
	removedNotice: "This tiddler has been deleted.",
	connectionError: "connection could not be established",
	hostError: "Unable to import from this location due to cross-domain restrictions."
};

plugin.sync = function(tiddlers) {
	tiddlers = tiddlers && tiddlers[0] ? tiddlers : store.getTiddlers();
	$.each(tiddlers, function(i, tiddler) {
		var changecount = parseInt(tiddler.fields.changecount, 10);
		if(tiddler.fields.deleted === "true" && changecount === 1) {
			plugin.removeTiddler(tiddler);
		} else if(tiddler.isTouched() && !tiddler.doNotSave() &&
				tiddler.getServerType() && tiddler.fields["server.host"]) {
			delete tiddler.fields.deleted;
			plugin.saveTiddler(tiddler);
		}
	});
};

plugin.saveTiddler = function(tiddler) {
	var el = disable(tiddler);
	try {
		var adaptor = this.getTiddlerServerAdaptor(tiddler);
	} catch(ex) {
		return false;
	}
	var context = {
		tiddler: tiddler,
		changecount: tiddler.fields.changecount,
		workspace: tiddler.fields["server.workspace"]
	};
	var serverTitle = tiddler.fields["server.title"]; // indicates renames
	if(!serverTitle) {
		tiddler.fields["server.title"] = tiddler.title;
	} else if(tiddler.title != serverTitle) {
		return adaptor.moveTiddler({ title: serverTitle },
			{ title: tiddler.title }, context, null, this.saveTiddlerCallback);
	}
	var req = adaptor.putTiddler(tiddler, context, {}, this.saveTiddlerCallback);
	return req ? tiddler : false;
};

plugin.saveTiddlerCallback = function(context, userParams) {
	var tiddler = context.tiddler;
	var el = enable(tiddler);
	context.storyTiddler = el;
	if(context.status) {
		if(tiddler.fields.changecount == context.changecount) { //# check for changes since save was triggered
			tiddler.clearChangeCount();
		} else if(tiddler.fields.changecount > 0) {
			tiddler.fields.changecount -= context.changecount;
		}
		plugin.reportSuccess("saved", tiddler, context);
		store.setDirty(false);
	} else {
		if(context.httpStatus == 412) {
			plugin.reportFailure("saveConflict", tiddler, context);
		} else {
			plugin.reportFailure("saveError", tiddler, context);
		}
	}
	var queue = refreshQueue[tiddler.title];
	if(queue !== undefined) {
		delete refreshQueue[tiddler.title];
		var oldTitle = queue.shift();
		for(var i = 0; i < queue.length; i++) {
			var self = queue[i][0];
			var args = queue[i][1];
			_refreshTiddler.apply(self, args);
		}
	}
};

plugin.removeTiddler = function(tiddler) {
	try {
		var adaptor = this.getTiddlerServerAdaptor(tiddler);
	} catch(ex) {
		return false;
	}
	context = { tiddler: tiddler };
	context.workspace = tiddler.fields["server.workspace"];
	var req = adaptor.deleteTiddler(tiddler, context, {}, this.removeTiddlerCallback);
	return req ? tiddler : false;
};

plugin.removeTiddlerCallback = function(context, userParams) {
	var tiddler = context.tiddler;
	if(context.status) {
		if(tiddler.fields.deleted === "true") {
			store.deleteTiddler(tiddler.title);
		} else {
			plugin.reportFailure("deleteLocalError", tiddler, context);
		}
		plugin.reportSuccess("deleted", tiddler, context);
		store.setDirty(false);
	} else {
		plugin.reportFailure("deleteError", tiddler, context);
	}
};

plugin.getTiddlerServerAdaptor = function(tiddler) { // XXX: rename?
	var type = tiddler.fields["server.type"] || config.defaultCustomFields["server.type"];
	return new config.adaptors[type]();
};

plugin.reportSuccess = function(msg, tiddler, context) {
	if(!context.storyTiddler) {
		displayMessage(plugin.locale[msg].format([tiddler.title]));
	}
};

plugin.reportFailure = function(msg, tiddler, context) {
	var desc = (context && context.httpStatus) ? context.statusText :
		plugin.locale.connectionError;
	if(context.storyTiddler) {
		var el = $(context.storyTiddler).addClass("error")[0];
		window.scrollTo(0, ensureVisible(el)); // TODO: use animation?
		$('<div class="annotation" />').text(desc).hide().prependTo(el).slideDown();
	} else {
		displayMessage(plugin.locale[msg].format([tiddler.title, desc]));
	}
};

config.macros.saveToWeb = { // XXX: hijack existing sync macro?
	locale: { // TODO: merge with plugin.locale?
		btnLabel: "save to web",
		btnTooltip: "synchronize changes",
		btnAccessKey: null
	},

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		createTiddlyButton(place, this.locale.btnLabel, this.locale.btnTooltip,
			plugin.sync, null, null, this.locale.btnAccessKey);
	}
};

// hijack saveChanges to trigger remote saving
var _saveChanges = saveChanges;
saveChanges = function(onlyIfDirty, tiddlers) {
	if(window.location.protocol == "file:") {
		_saveChanges.apply(this, arguments);
	} else {
		plugin.sync(tiddlers);
	}
};

// hijack core methods to defer mode-switching (asynchronous)
var refreshQueue = {};
var _storeSave = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title, newTitle, newBody, modifier,
		modified, tags, fields, clearChangeCount, created, creator) {
	refreshQueue[newTitle] = [title];
	return _storeSave.apply(this, arguments);
};
var _refreshTiddler = Story.prototype.refreshTiddler;
Story.prototype.refreshTiddler = function(title, template, force, customFields, defaultText) {
	var queue = refreshQueue[title];
	if(queue === undefined || window.location.protocol == "file:") {
		return _refreshTiddler.apply(this, arguments);
	} else {
		queue.push([this, arguments]);
	}
};

// override removeTiddler to flag tiddler as deleted -- XXX: use hijack to preserve compatibility?
TiddlyWiki.prototype.removeTiddler = function(title) { // XXX: should override deleteTiddler instance method?
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		tiddler.tags = ["excludeLists", "excludeSearch", "excludeMissing"];
		tiddler.text = plugin.locale.removedNotice;
		tiddler.fields.deleted = "true"; // XXX: rename to removed/tiddlerRemoved?
		tiddler.fields.changecount = "1";
		this.notify(title, true);
		this.setDirty(true);
	}
};

// hijack ImportTiddlers wizard to handle cross-domain restrictions
var _onOpen = config.macros.importTiddlers.onOpen;
config.macros.importTiddlers.onOpen = function(ev) {
	var btn = $(resolveTarget(ev));
	var url = btn.closest(".wizard").find("input[name=txtPath]").val();
	if(window.location.protocol != "file:" && url.indexOf("://") != -1) {
		var host = url.split("/")[2];
		var macro = config.macros.importTiddlers;
		if(host != window.location.host) {
			btn.text(macro.cancelLabel).attr("title", macro.cancelPrompt);
			btn[0].onclick = macro.onCancel;
			$('<span class="status" />').text(plugin.locale.hostError).insertAfter(btn);
			return false;
		}
	}
	return _onOpen.apply(this, arguments);
};

var cache = {};

var disable = function(tiddler) {
	tiddler.isReadOnly = function() { return true; };
	var el = story.getTiddler(tiddler.title);
	if(el) {
		var _el = $(el);
		cache[tiddler.title] = {
			storyEl: el,
			styles: _el.attr("style") // XXX: cross-browser compatible?
		};
		_el.css("position", "relative");
		$('<div class="cloak" />').appendTo(el);
	}
	return el;
};

var enable = function(tiddler) {
	delete tiddler.isReadOnly; // TODO: restore previous instance method if any
	var el = cache[tiddler.title].storyEl;
	var styles = cache[tiddler.title].styles;
	delete cache[tiddler.title];
	if(el) {
		var _el = $(el);
		_el.removeAttr("style").
			children(".cloak").remove();
		if(styles) {
			_el.attr("style", styles);
		}
	}
	return el;
};

})(jQuery);
//}}}
