/***
|''Name''|TiddlyWebConfig|
|''Description''|configuration settings for TiddlyWeb|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/plugins/TiddlyWebConfig.js|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''|ServerSideSavingPlugin|
|''Feedback''|<...>|
|''Documentation''|<...>|
|''Keywords''|<...>|
!Revision History
!!v0.1 (2008-11-30)
* initial release
!To Do
* resolve load-order issues (ServerSideSavingPlugin must be loaded after this config)
* fallback in case [[TiddlyWebConfig]] has been renamed
!Code
***/
//{{{
if(!version.extensions.TiddlyWebConfig) { //# ensure that the plugin is only installed once
version.extensions.TiddlyWebConfig = { installed: true };

config.options.chkAutoSave = true;

config.extensions.ServerSideSavingPlugin.adaptor = config.adaptors.tiddlyweb;

config.defaultCustomFields = {
	"server.type": "tiddlyweb",
	"server.host": store.getTiddler("TiddlyWebConfig").fields["server.host"], // XXX: fallback?
	"server.bag": "common"
};

} //# end of "install only once"
//}}}
