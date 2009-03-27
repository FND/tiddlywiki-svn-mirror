/***
|''Name''|TiddlyWebConfig|
|''Description''|configuration settings for TiddlyWeb|
|''Author''|FND|
|''Version''|0.3.3|
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
!Code
***/
//{{{
if(!version.extensions.TiddlyWebConfig) { //# ensure that the plugin is only installed once
version.extensions.TiddlyWebConfig = { installed: true };

if(!config.adaptors.tiddlyweb) {
        throw "Missing dependency: TiddlyWebAdaptor";
}

(function() { //# set up local scope

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

// set username
var statusCallback = function(context, userParams) {
	if(context.serverStatus && context.serverStatus.username) {
 		config.macros.option.propagateOption("txtUserName",
			"value", context.serverStatus.username, "input");
	}
};
adaptor.getStatus({ host: host }, null, statusCallback);

})(); //# end of local scope

} //# end of "install only once"
//}}}
