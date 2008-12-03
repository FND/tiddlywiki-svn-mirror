/***
|''Name''|ServerSideSavingPlugin|
|''Description''|server-side saving|
|''Author''|FND|
|''Version''|0.2.3|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/plugins/ServerSideSavingPlugin.js|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''|[[ServerConfig]]|
|''Keywords''|serverSide|
!Notes
This plugin relies on a dedicated configuration plugin to be present.
The specific nature of this plugins depends on the respective server.
!Revision History
!!v0.1 (2008-11-24)
* initial release
!!v0.2 (2008-12-01)
* added support for local saving
!To Do
* SaveToWeb macro
* conflict detection/resolution
* rename to ServerLinkPlugin?
* attempt to determine default adaptor (and defaultCustomFields) from systemServer tiddlers
* handle deleting/renaming (e.g. by hijacking the respective commands and creating a log)
!Code
***/
//{{{
if(!version.extensions.ServerSideSavingPlugin) { //# ensure that the plugin is only installed once
version.extensions.ServerSideSavingPlugin = { installed: true };

if(!config.extensions) { config.extensions = {}; } //# obsolete from v2.4.2

(function(plugin) { //# set up alias

plugin = {
	adaptor: plugin.adaptor, //# N.B.: expects config.extensions.ServerSideSavingPlugin.adaptor to be set
	locale: {
		saved: "%0 saved successfully",
		saveError: "Error saving %0: %1",
		deleted: "Removed %0",
		deleteError: "Error removing %0: %1",
		deleteLocalError: "Error removing %0 locally",
		removedNotice: "This tiddler has been deleted."
	},

	saveTiddler: function(tiddler) {
		var adaptor = new this.adaptor();
		context = {
			tiddler: tiddler,
			changecount: tiddler.fields.changecount
		};
		var bag = tiddler.fields["server.bag"];
		if(bag) {
			context.bag = bag;
		} else {
			context.workspace = tiddler.fields["server.workspace"];
		}
		var req = adaptor.putTiddler(tiddler, context, {}, this.saveTiddlerCallback);
		return req ? tiddler : false;
	},

	saveTiddlerCallback: function(context, userParams) {
		var tiddler = context.tiddler;
		if(context.status) {
			if(tiddler.fields.changecount == context.changecount) { //# check for changes since save was triggered
				tiddler.clearChangeCount();
			} else if(tiddler.fields.changecount > 0) {
				tiddler.fields.changecount -= context.changecount;
			}
			displayMessage(plugin.locale.saved.format([tiddler.title]));
			store.setDirty(false);
		} else {
			displayMessage(plugin.locale.saveError.format([tiddler.title, context.statusText]));
		}
	},

	removeTiddler: function(tiddler) {
		var adaptor = new this.adaptor();
		context = {
			tiddler: tiddler
		};
		var bag = tiddler.fields["server.bag"];
		if(bag) {
			context.bag = bag;
		} else {
			context.workspace = tiddler.fields["server.workspace"];
		}
		var req = adaptor.deleteTiddler(tiddler, context, {}, this.removeTiddlerCallback);
		return req ? tiddler : false;
	},

	removeTiddlerCallback: function(context, userParams) {
		var tiddler = context.tiddler;
		if(context.status) {
			if(tiddler.fields.deleted) {
				store.deleteTiddler(tiddler.title);
			} else {
				displayMessage(plugin.locale.deleteError.format([tiddler.title]));
			}
			displayMessage(plugin.locale.deleted.format([tiddler.title]));
			store.setDirty(false);
		} else {
			displayMessage(plugin.locale.deleteLocalError.format([tiddler.title, context.statusText]));
		}
	}
};

// hijack saveChanges to trigger remote saving
plugin.saveChanges = saveChanges;
saveChanges = function(onlyIfDirty, tiddlers) {
	if(window.location.protocol == "file:") {
		plugin.saveChanges.apply(this, arguments);
	} else {
		store.forEachTiddler(function(title, tiddler) { // TODO: move to separate function
			if(tiddler.fields.deleted) {
				plugin.removeTiddler(tiddler);
			} else if(tiddler.fields.changecount > 0 && tiddler.getServerType() && tiddler.fields["server.host"]) {
				plugin.saveTiddler(tiddler);
			}
		});
	}
};

// override removeTiddler to flag tiddler as deleted
TiddlyWiki.prototype.removeTiddler = function(title) { // XXX: should override deleteTiddler instance method?
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		tiddler.tags = ["excludeLists", "excludeSearch", "excludeMissing"];
		tiddler.text = plugin.locale.removedNotice;
		tiddler.fields.deleted = true; // XXX: rename to removed/tiddlerRemoved?
		tiddler.incChangeCount();
		this.notify(title, true);
		this.setDirty(true);
	}
};

})(config.extensions.ServerSideSavingPlugin); //# end of alias

} //# end of "install only once"
//}}}
