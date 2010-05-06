/***
|''Name''|TiddlyWebConfig|
|''Description''|configuration settings for TiddlyWebWiki|
|''Author''|FND|
|''Version''|0.8.1|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/plugins/TiddlyWebConfig.js|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Requires''|TiddlyWebAdaptor|
|''Keywords''|serverSide TiddlyWeb|
!Revision History
!!v0.1 (2008-11-30)
* initial release
!!v0.2 (2009-01-15)
* removed obsolete dependencies
!!v0.3 (2009-03-16)
* sync username with server
!!v0.4 (2009-05-23)
* cache list of available login challengers
!!v0.5 (2009-07-10)
* disabled save and delete toolbar commands for unauthorized users
!!v0.6 (2009-08-15)
* disabled edit toolbar command for unauthorized users
!!v0.7 (2009-09-11)
* added revisions toolbar command
!!v0.8 (2010-04-28)
* added extension namespace caching state and providing getUserInfo function
!Code
***/
//{{{
if(!config.adaptors.tiddlyweb) {
	throw "Missing dependency: TiddlyWebAdaptor";
}

(function() {

if(window.location.protocol != "file:") {
	config.options.chkAutoSave = true;
}

var adaptor = tiddler.getAdaptor();
var recipe = tiddler.fields["server.recipe"];
var workspace = recipe ? "recipes/" + recipe : "bags/common";

var plugin = config.extensions.tiddlyweb = {
	serverVersion: null,
	host: tiddler.fields["server.host"].replace(/\/$/, ""),
	challengers: null,
	username: null,

	getUserInfo: function(callback) {
		var _callback = function() {
			callback({
				name: plugin.username,
				anon: plugin.username == "GUEST"
			});
		};
		if(this.username) {
			_callback();
		} else {
			var _statusCallback = function(context, userParams) {
				statusCallback(context, userParams);
				_callback();
			};
			adaptor.getStatus({ host: this.host }, null, _statusCallback);
		}
	}
};

config.defaultCustomFields = {
	"server.type": tiddler.getServerType(),
	"server.host": plugin.host,
	"server.workspace": workspace
};

// modify toolbar commands

config.shadowTiddlers.ToolbarCommands = config.shadowTiddlers.ToolbarCommands.
	replace("syncing ", "revisions syncing ");

config.commands.saveTiddler.isEnabled = function(tiddler) {
	return hasPermission("write", tiddler);
};

config.commands.deleteTiddler.isEnabled = function(tiddler) {
	return hasPermission("delete", tiddler);
};

// hijack isReadOnly to take into account permissions and content type
var _isReadOnly = Tiddler.prototype.isReadOnly;
Tiddler.prototype.isReadOnly = function() {
	var readOnly = _isReadOnly.apply(this, arguments); // global read-only mode
	var type = this.fields["server.content-type"] || ""; // defaults to non-binary
	return readOnly || type != "" || !hasPermission("write", this);
};

var hasPermission = function(type, tiddler) {
	var perms = tiddler.fields["server.permissions"];
	if(perms) {
		return perms.split(", ").contains(type);
	} else {
		return true;
	}
};

// retrieve server info
var statusCallback = function(context, userParams) {
	var status = context.serverStatus;
	if(status) {
		plugin.serverVersion = status.version;
		if(status.username) {
			plugin.username = status.username;
			config.macros.option.propagateOption("txtUserName",
				"value", plugin.username, "input");
		}
		if(status.challengers) {
			plugin.challengers = status.challengers;
		}
	}
};
adaptor.getStatus({ host: plugin.host }, null, statusCallback);

})();
//}}}
