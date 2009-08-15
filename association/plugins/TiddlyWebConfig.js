/***
|''Name''|TiddlyWebConfig|
|''Description''|configuration settings for TiddlyWeb|
|''Author''|FND|
|''Version''|0.6.0|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/plugins/TiddlyWebConfig.js|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
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

// initialize configuration
var adaptor = tiddler.getAdaptor();
var host = tiddler.fields["server.host"];
var recipe = tiddler.fields["server.recipe"];
var workspace = recipe ? "recipes/" + recipe : "bags/common";
config.defaultCustomFields = {
	"server.type": tiddler.getServerType(),
	"server.host": adaptor.fullHostName(host),
	"server.workspace": workspace
};

// disable selected toolbar commands for unauthorized users

config.commands.saveTiddler.isEnabled = function(tiddler) {
	return hasPermission("write", tiddler);
};

config.commands.deleteTiddler.isEnabled = function(tiddler) {
	return hasPermission("delete", tiddler);
};

// hijack Tiddler.prototype.isReadOnly to use permissions
var original = Tiddler.prototype.isReadOnly;
Tiddler.prototype.isReadOnly = function() {
	var readOnly = original.apply(this, arguments); // global read-only mode
	return readOnly || !hasPermission("write", this);
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
	if(context.serverStatus) {
		// set username
		if(context.serverStatus.username) {
			config.macros.option.propagateOption("txtUserName",
				"value", context.serverStatus.username, "input");
		}
		// retrieve challengers
		if(context.serverStatus.challengers) {
			config.adaptors.tiddlyweb.challengers = context.serverStatus.challengers;
		}
	}
};
adaptor.getStatus({ host: host }, null, statusCallback);

})();
//}}}
