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

	saveTiddler: function(tiddler) {
		var adaptor = new this.adaptor();
		context = {
			tiddler: tiddler,
			changecount: tiddler.fields.changecount,
			workspace: tiddler.fields["server.workspace"] // XXX: bag?
		};
		var req = adaptor.putTiddler(tiddler, context, {}, this.saveTiddlerCallback);
		return req ? tiddler : false;
	},

	saveTiddlerCallback: function(context, userParams) {
		var tiddler = context.tiddler;
		if(context.status) {
			displayMessage("Saved " + tiddler.title); // TODO: i18n
			if(tiddler.fields.changecount != context.changecount) {
				tiddler.clearChangeCount();
			}
		} else { // TODO: handle 412 etc.
			displayMessage("Error saving " + tiddler.title + ": " + context.statusText); // TODO: i18n
		}
	}
};

// override saveChanges to trigger server-side saving -- XXX: use hijacking instead
saveChanges = function(onlyIfDirty, tiddlers) {
	store.forEachTiddler(function(title, tiddler) {
		if(tiddler.fields.changecount > 0) {
			plugin.saveTiddler(tiddler); // TODO: handle return value
		}
	});
};

// hijack removeTiddler to trigger server-side deletion
plugin.removeTiddler = TiddlyWiki.prototype.removeTiddler;
TiddlyWiki.prototype.removeTiddler = function(title) {
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		var callback = function(context, userParams) {
			return context.status; // XXX: not sufficient (i.e. needs displayMessage)?
		};
		plugin.adaptor.deleteTiddler(tiddler, null, null, callback);
	}
	plugin.removeTiddler.apply(this, arguments);
};

})(config.extensions.ServerSideSavingPlugin); //# end of alias

} //# end of "install only once"
//}}}
