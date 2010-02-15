/***
|''Name:''|DefaultTiddlerListPlugin|
|''Description:''|DefaultTiddlers taken from a list of tiddler references |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/DefaultTiddlerListPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/DefaultTiddlerListPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin constructs the default tiddlers from the MainMenu or other tiddler containing a list of tiddler references.
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config */
(function ($) {
    version.extensions.DefaultTiddlerListPlugin = {installed: true};

    config.extensions.DefaultTiddlersListPlugin = {
        list: 'MainMenu',
        max: 1,
        filter: function(list, max) {
            var list = store.getTiddlerText("MainMenu");
            list = list.replace(/^[^\[]*\[\[/, "[[");
            list = list.replace(/\]\][^\[]*(\[\[|$)/g, "]]$1");
            return store.filterTiddlers(list).slice(0,max);
        }
    };
    var macro = config.extensions.DefaultTiddlersListPlugin;

    Story.prototype.displayDefaultTiddlers = function()
    {
        this.displayTiddlers(null, macro.filter(macro.list, macro.max));
    };

})(jQuery);
//}}}
