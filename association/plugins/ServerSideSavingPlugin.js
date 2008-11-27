/***
|''Name''|ServerSideSavingPlugin|
|''Description''|server-side saving|
|''Author''|FND|
|''Version''|0.1.1|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/ServerSideSavingPlugin.js|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''|TiddlyWebAdaptorPlugin|
|''Overrides''|<...>|
|''Feedback''|<...>|
|''Documentation''|<...>|
|''Keywords''|<...>|
!Description
<...>
!Revision History
!!v0.1 (2008-11-24)
* initial release
!To Do
* handle offline vs. online experience (saving locally and/or to server)
* rename to ServerLinkPlugin?
* attempt to determine default adaptor (and defaultCustomFields) from systemServer tiddlers
* handle deleting/renaming (e.g. by hijacking the respective commands and creating a log)
!Code
***/
//{{{
if(!version.extensions.ServerSideSavingPlugin) { //# ensure that the plugin is only installed once
version.extensions.ServerSideSavingPlugin = { installed: true };

config.options.chkAutoSave = true; // XXX: does not belong here!?

if(!config.extensions) { config.extensions = {}; } //# obsolete from v2.5

(function(plugin) { //# set up alias

plugin = {
	adaptor: null, // no default adaptor -- XXX: wrong way to pass in adaptor?
	msgDeleted: "This tiddler has been deleted.",

	saveTiddler: function(tiddler) {
		var adaptor = new this.adaptor();
		context = {
			changecount: tiddler.fields.changecount,
			workspace: tiddler.fields["server.workspace"] // XXX: bag?
		};
		var req = adaptor.putTiddler(tiddler, context, {}, this.saveTiddlerCallback);
		return req ? tiddler : false;
	},

	saveTiddlerCallback: function(context, userParams) {
		var tiddler = context.tiddler;
		if(context.status) {
			if(tiddler.fields.changecount == context.changecount) { //# check for changes since save was triggered
				tiddler.clearChangeCount();
			} else {
				tiddler.fields.changecount -= context.changecount;
			}
			displayMessage("Saved " + tiddler.title); // TODO: i18n
		} else { // TODO: handle 412 etc.
			displayMessage("Error saving " + tiddler.title + ": " + context.statusText); // TODO: i18n
		}
	},

	removeTiddler: function(tiddler) {
		var adaptor = new this.adaptor();
		context = {
			workspace: tiddler.fields["server.workspace"] // XXX: bag?
		};
		var req = adaptor.deleteTiddler(tiddler, context, {}, this.removeTiddlerCallback);
		return req ? tiddler : false;
	},

	removeTiddlerCallback: function(context, userParams) {
		var tiddler = context.tiddler;
		if(context.status) {
			store.deleteTiddler(tiddler.title); // XXX: might have been renamed in the meantime!?
			displayMessage("Removed " + tiddler.title); // TODO: i18n
		} else { // TODO: handle 412 etc.
			displayMessage("Error removing " + tiddler.title + ": " + context.statusText); // TODO: i18n
		}
	}
};

// override saveChanges to trigger server-side saving -- XXX: use hijacking instead (crucial for offline experience)
saveChanges = function(onlyIfDirty, tiddlers) {
	store.forEachTiddler(function(title, tiddler) {
		if(tiddler.fields.deleted) {
			plugin.removeTiddler(tiddler);
		} else if(tiddler.fields.changecount > 0) {
			plugin.saveTiddler(tiddler); // TODO: handle return value
		}
	});
};

// override removeTiddler to flag tiddler as deleted
TiddlyWiki.prototype.removeTiddler = function(title) { // XXX: should override deleteTiddler instance method?
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		tiddler.tags = ["excludeLists", "excludeSearch", "excludeMissing"];
		tiddler.text = plugin.msgDeleted;
		tiddler.fields.deleted = true;
		tiddler.incChangeCount();
		this.notify(title, true);
		this.setDirty(true);
	}
};

})(config.extensions.ServerSideSavingPlugin); //# end of alias

} //# end of "install only once"
//}}}
