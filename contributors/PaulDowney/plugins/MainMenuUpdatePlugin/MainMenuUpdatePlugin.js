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
/*global config story store refreshAll autoSaveChanges refreshPageTemplate */
(function ($) {
    version.extensions.MainMenuUpdatePlugin = {installed: true};

    config.options.txtMainMenuTag = "slide";
    config.optionsDesc.txtMainMenuTag = "Tag of items automatically added to the MainMenu";

    config.extensions.MainMenuUpdate = function (oldTitle, newTitle) {
        var t = store.getTiddler("MainMenu");
        var text = config.extensions.MainMenuUpdate.transform(t.text, oldTitle, newTitle);
        store.saveTiddler(t.title, t.title, text, t.modifier, t.modified, t.tags, t.fields, true, t.created, t.creator);

        // ideally this should really go, but MainMenu isn't a tiddler ..
        refreshPageTemplate();
        autoSaveChanges();
    };

    config.extensions.MainMenuUpdate.transform = function (text, oldTitle, newTitle) {
        if (!newTitle) {
            text = text.replace("*[[" + oldTitle + "]]\n", "");
        } else {
            if (oldTitle !== newTitle) {
                text = text.replace("[[" + oldTitle + "]]", "[[" + newTitle + "]]");
            } 
            if (text.indexOf("[[" + newTitle  + "]]") === -1) {
                text = text.replace(/([^\s])\s*$/, "$1\n"); // defense against ie6 glitches
                text = text + "*[[" + newTitle + "]]\n";
            }
        }
        return text;
    };

    // should be possible to remove these hi-jacks
    var saveTiddler = story.saveTiddler;
    story.saveTiddler = function (title, minorUpdate) {
        var newTitle = saveTiddler.apply(this, arguments);
        var tiddler = store.getTiddler(newTitle);
        if (tiddler.tags.indexOf(config.options.txtMainMenuTag) !== -1) {
            config.extensions.MainMenuUpdate(title, newTitle);
        }
        return newTitle;
    };

    var removeTiddler = store.removeTiddler;
    store.removeTiddler = function (title) {
        config.extensions.MainMenuUpdate(title);
        story.closeTiddler(title, true);
        return removeTiddler.apply(store, arguments);
    };

})(jQuery);
//}}}
