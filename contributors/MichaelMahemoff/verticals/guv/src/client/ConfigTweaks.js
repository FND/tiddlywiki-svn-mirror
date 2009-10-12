/***
|''Name''|ConfigTweaks|
|''Requires''|[[TiddlyWebAdaptor]]|
!Code
***/

// From TiddlyWebConfig
if(!config.extensions) { config.extensions = {}; } //# obsolete from v2.4.2
config.extensions.ServerSideSavingPlugin = {
	adaptor: config.adaptors.tiddlyweb
};

config.options.chkSinglePageMode=true;
config.options.chkAnimate=false;
config.options.chkAutoSave=true;

config.shadowTiddlers["StyleSheetLicensePortal"] =
".expandLink { cursor: pointer; text-decoration: underline; color: #008; }" +
".expandLink:hover { background: #bbf; }";
store.addNotification("StyleSheetLicensePortal", refreshStyles);

/*
config.defaultCustomFields = {
  "server.host": 'http://tiddlyguv.dev:9090/',
  "server.type": 'tiddlyweb'
}
*/

// Temporary etag fix
config.adaptors.tiddlyweb.generateETag = function() { return null; }
