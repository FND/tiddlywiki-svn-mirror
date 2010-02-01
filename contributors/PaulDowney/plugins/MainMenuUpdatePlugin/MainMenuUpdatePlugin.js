/***
|''Name:''|MainMenuUpdatePlugin|
|''Description:''|Update MainMenu links when a tiddler is added, renamed or removed |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/MainMenuUpdatePlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/MainMenuUpdatePlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin treats the MainMenu as a list of tiddlers, and maintains its contents as tiddlers are saved and deleted from the story:
*Renaming a tiddler, results in the link being changed in the MainMenu.
*Deleting a tiddler mentioned in the MainMenu results in it being removed from the MainMenu.
*Saving a tiddler not mentioned in the MainMenu, causes it to be be added to the end of the MainMenu.
This plugin was developed for TiddlySlidy and has been designed to work with the MainMenuNavigation and MainMenuOrder plugins.
New items added to the MainMenu as a member of an unordered list, so as to work with the MainMenuReorder plugin. This may change in a future version.

!!Options
|<<option txtMainMenuTag>>|<<message config.optionsDesc.txtMainMenuTag>>|

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config */
(function() {
    version.extensions.MainMenuUpdatePlugin = {installed: true};

    config.options.txtMainMenuTag = "slide";
    config.optionsDesc.txtMainMenuTag = "Tag of items automatically added to the MainMenu";

    function updateMainMenu(transform) {
        var t = store.getTiddler("MainMenu");
        var text = transform(t.text);
        store.saveTiddler(t.title,t.title,text,t.modifier,t.modified,t.tags,t.fields,true,t.created,t.creator);
        story.refreshTiddler("MainMenu",null,true);
        refreshAll();
        autoSaveChanges();
    }

    var saveTiddler = story.saveTiddler;
    story.saveTiddler = function(title,minorUpdate) {
        var newTitle = saveTiddler.apply(this, arguments);
        var tiddler = store.getTiddler(newTitle);
        if (tiddler.tags.indexOf(config.options.txtMainMenuTag) != -1) {
            updateMainMenu(function(text) {
                if (newTitle != title) {
                    text = text.replace("[[" + title + "]]", "[[" + newTitle + "]]");
                }
                if (text.indexOf("[[" + newTitle  + "]]") == -1) {
                    text = text + "*[[" + newTitle + "]]\n";
                }
                return text;
            });
        }
        return newTitle;
    };

    var removeTiddler = store.removeTiddler;
    store.removeTiddler = function(title) {
        updateMainMenu(function(text) {
            return text.replace("*[[" + title + "]]\n", "");
        });

        // required when the view template has a delete command
        story.closeTiddler(title,true);
        story.refreshAllTiddlers(true);
        refreshAll();

        return removeTiddler.apply(store, arguments);
    }
})();
//}}}
