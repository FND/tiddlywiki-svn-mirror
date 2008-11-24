/***
|''Name''|ServerSideSavingPlugin|
|''Description''|server-side saving|
|''Author''|FND|
|''Version''|0.1.0|
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
* turn into generic server-side saving plugin, capable of using any adaptor
!Code
***/
//{{{
if(!version.extensions.ServerSideSavingPlugin) { //# ensure that the plugin is only installed once
version.extensions.ServerSideSavingPlugin = { installed: true };

config.options.chkAutoSave = true; // XXX: does not belong here!?

if(!config.extensions) { config.extensions = {}; } //# obsolete from v2.5

if(!config.adaptors.tiddlyweb) { // XXX: hardcoded; bad!
	throw "Missing dependency: TiddlyWebAdaptor";
}

config.extensions.ServerSideSavingPlugin = {
	adaptor: config.adaptors.tiddlyweb,

	saveTiddler: function(tiddler) {
		var adaptor = new this.adaptor();
		context = {
			tiddler: tiddler,
			workspace: tiddler.fields["server.workspace"] // XXX: bag?
		};
		var req = adaptor.putTiddler(tiddler, context, {}, this.saveTiddlerCallback);
		return req ? tiddler : false;
	},

	saveTiddlerCallback: function(context, userParams) {
		var tiddler = context.tiddler;
		if(context.status) { // TODO: handle 412 etc.
			displayMessage("Saved " + tiddler.title); // TODO: i18n
			tiddler.clearChangeCount(); // XXX: async => there could have been another change
		} else {
			displayMessage("Error saving " + tiddler.title + ": " + context.statusText); // TODO: i18n
			tiddler.incChangeCount(); // XXX: ?
		}
	}
};

// override saveChanges to trigger server-side saving -- XXX: use hijacking instead
saveChanges = function(onlyIfDirty, tiddlers) {
	store.forEachTiddler(function(title, tiddler) {
		if(tiddler.fields.changecount > 0) {
			config.extensions.ServerSideSavingPlugin.saveTiddler(tiddler); // TODO: handle return value
		}
	});
};

} //# end of "install only once"
//}}}
