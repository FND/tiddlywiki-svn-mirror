/***
|''Name:''|MainMenuNavigatorPlugin|
|''Description:''| First/Next/Previous/Last Tiddler from the MainMenu |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/MainMenuNavigatorPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/MainMenuNavigatorPlugin/ |
|''Version:''|0.2|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Designed to work with the SinglePageMode, this plugin provides functions and macros which treat
the MainMenu as a list of tiddlers with the "current" tiddler as the first tiddler in the story.

<<firstTiddler>>
<<nextTiddler>>
<<prevTiddler>>
<<lastTiddler>>

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global console, config, createTiddlyButton store story Story */
(function($) {
    version.extensions.MainMenuNavigatorPlugin = {installed: true};

    /*
     *  navigation buttons 
     */
    Story.prototype.firstTiddler = function () {
        var nav = config.extensions.navigation;
        nav.load();
        this.displayTiddler(null, nav.list[0]);
    };

    Story.prototype.lastTiddler = function () {
        var nav = config.extensions.navigation;
        nav.load();
        this.displayTiddler(null, nav.list[nav.list.length - 1]);
    };

    Story.prototype.nextTiddler = function () {
        var nav = config.extensions.navigation;
        nav.load();
        this.displayTiddler(null, nav.relative(1));
    };

    Story.prototype.prevTiddler = function () {
        var nav = config.extensions.navigation;
        nav.load();
        this.displayTiddler(null, nav.relative(-1));
    };

    Story.prototype.firstTitle = function () {
        var place = this.getContainer();
        if (place) {
            return place.firstChild.getAttribute("tiddler");
        }
    };

    /*
     *  plugin
     */
    config.extensions.navigation = {
        list: [],
        parse: function (s) {
            s = s.trim();
            if (!s) {
                return [];
            }
            s = s.replace(/\]\]$/, "");
            s = s.replace(/[\s\*]*\[\[/g, "[[");
            var list = s.split(/\]\]\s*/);
            for (var i = 0; i < list.length; i++) {
                list[i] = list[i].startsWith("[[") ? 
                    list[i].substring(2)
                    : parseInt(list[i], 10);
            }
            return list;
        },

        load: function () {
            this.list = this.parse(store.getTiddler("MainMenu").text);
        },

		current : function () {
			return story.firstTitle();
		},

        relative : function (delta) {
            var title = this.current();
            var index = this.list.indexOf(title) + delta;
            index = index.clamp(0, this.list.length - 1);
            return this.list[index];
        },

        addButton : function (name) {
            config.macros[name + "Tiddler"] = {
                label : name,
                prompt : "Open the " + name + " Tiddler",
                handler: function (place, macroName, params, wikifier, paramString, tiddler) {
                    createTiddlyButton(place, params[1] || this.label, params[2] || this.prompt, function (ev) {
                        story[name + "Tiddler"]();
                    });
                }
            };
        },

        addButtons : function () {
            this.addButton("first");
            this.addButton("last");
            this.addButton("next");
            this.addButton("prev");
        }
    };

    config.extensions.navigation.addButtons();
})(jQuery);
//}}}
