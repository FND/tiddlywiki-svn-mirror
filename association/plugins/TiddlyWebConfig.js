/***
|''Name''|TiddlyWebConfig|
|''Description''|configuration settings for TiddlyWeb|
|''Author''|FND|
|''Version''|0.2.3|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/plugins/TiddlyWebConfig.js|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Keywords''|serverSide TiddlyWeb|
!Revision History
!!v0.1 (2008-11-30)
* initial release
!!v0.2 (2009-01-15)
* removed obsolete dependencies
!Code
***/
//{{{
if(!version.extensions.TiddlyWebConfig) { //# ensure that the plugin is only installed once
version.extensions.TiddlyWebConfig = { installed: true };

(function() { //# set up local scope

if(window.location.protocol != "file:") {
	config.options.chkAutoSave = true;
}

var adaptor = new config.adaptors.tiddlyweb();
var minhost = store.getTiddler("TiddlyWebConfig").fields["server.host"];
config.defaultCustomFields = {
	"server.type": "tiddlyweb",
	"server.host": adaptor.fullHostName(minhost),
	"server.workspace": "bags/common"
};

})(); //# end of local scope

} //# end of "install only once"
//}}}
