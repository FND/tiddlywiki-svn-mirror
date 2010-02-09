/***
|''Name:''|ProgressBarPlugin|
|''Description:''| @@@Description@@@ |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ProgressBarPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ProgressBarPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation

<<progressBar ListOfTiddlers>>

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config */
(function ($) {
    version.extensions.ProgressBarPlugin = {installed: true};

    Story.prototype.firstTitle = function () {
        var place = this.getContainer();
        if (place) {
            return place.firstChild.getAttribute("tiddler");
        }
    };

    config.macros.progressBar = {};
    config.macros.progressBar.handler = function (place, macroName, params) {
        var list = params[0] || "MainMenu";
        var link = params[1] || "#MainMenu";
        var title = params[2] || "MainMenu";

        place = $('<div class="progressBar"></div>').appendTo(place)[0];

        var tiddler = store.getTiddler(list);
        wikify(tiddler.text, place, null, tiddler);

        var current = story.firstTitle();
        $(place).find('a[tiddlyLink="' + current + '"]').addClass("selected");
        $(place).find('a').attr('title', '').html('&nbsp;');
    };

})(jQuery);
//}}}
