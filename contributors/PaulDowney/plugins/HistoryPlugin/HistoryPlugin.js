/***
|''Name:''|HistoryPlugin|
|''Description:''|Maintain a history of visited tiddlers |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/HistoryPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/HistoryPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin maintains a trail of visited tiddlers and may be used as the basis for other plugins such as a history viewer, a breadcrumbs trail or slideshow progress bar.
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config Story */
if (!version.extensions.HistoryPlugin) {
    version.extensions.HistoryPlugin = {installed: true};

    config.extensions.history = {

        list: [],
        visited: {},
        current: 0,
        toString: function () {
            return this.list.length ? 
                "[[" + this.list.join("]][[") + "]]" 
                : "";
        },
        parse: function (s) {
            s = s.trim();
            if (!s) {
                return [];
            }
            s = s.replace(/\]\]$/, "");
            var list = s.split(/\]\]\s*/);
            for (var i = 0; i < list.length; i++) {
                list[i] = list[i].startsWith("[[") ? 
                    list[i].substring(2)
                    : parseInt(list[i], 10);
            }
            return list;
        },
        position: function () {
            return this.current;
        },
        title: function () {
            return this.list[this.position()];
        },
        add: function (title) {
            this.current = this.list.push(title) - 1;
            this.visited[title] = this.position();
            return this.position();
        },
        back: function () {
        },
        forward: function () {
        },
        next: function () {
        },
        clear: function (title) {
            this.list = [];
            this.visited = {};
            this.current = undefined;
            return false;
        },
        _displayTiddler: Story.prototype.displayTiddler,
        displayTiddler: function (srcElement, tiddler) {
            config.extensions.history.add(tiddler.title || tiddler);
            config.extensions.history._displayTiddler.apply(this, arguments);
        },
        displayPreviousTiddler: function () {
        },
        displayNextTiddler: function (next) {
        }
    };

    Story.prototype.displayTiddler = config.extensions.history.displayTiddler;
    Story.prototype.displayNextTiddler = config.extensions.history.displayNextTiddler;
    Story.prototype.displayPreviousTiddler = config.extensions.history.displayPreviousTiddler;
}
//}}}
