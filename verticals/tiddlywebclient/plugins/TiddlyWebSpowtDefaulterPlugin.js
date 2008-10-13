/***
|''Name:''|TiddlyWebSpowtDefaulterPlugin|
|''Description:''|Set some defauls for the TiddlyWebAutoSavePlugin when using spowt|
|''Author:''|Chris Dent (cdent (at) peermore (dot) com)|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.TiddlyWebSpowtDefaulterPlugin) {
version.extensions.TiddlyWebSpowtDefaulterPlugin = {installed:true};

tiddler = store.getTiddler('TiddlyWebAutoSavePlugin');

// the name of the recipe/workspace is the same name as the bag
// in which the user's content is stored.
config.defaultCustomFields = {
    'server.host': tiddler.fields['server.host'],
    'server.bag': tiddler.fields['server.workspace'],
    'server.workspace': tiddler.fields['server.workspace'],
    'server.type': tiddler.fields['server.type'],
    };

} //# end of 'install only once'
//}}}
