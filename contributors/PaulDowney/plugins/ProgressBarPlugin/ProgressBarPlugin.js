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
    var macro = config.macros.progressBar;

    macro.handler = function (place, macroName, params) {
        var list = params[0] || "MainMenu";
        var link = params[1] || "#";

        place = $('<div class="progressBar"></div>').appendTo(place)[0];

        var tiddler = store.getTiddler(list);
        wikify(tiddler.text, place, null, tiddler);

        var current = story.firstTitle();
        $(place).find('a[tiddlyLink="' + current + '"]').addClass("selected");
        $(place).find('a').each(function () {
            macro.popup(this, $(this).attr('tiddlylink'));
        });
    };

    macro.popup = function (place, text) {
        $(place).html('&nbsp;');
        $(place).hover(function () {
            $('#balloonHook').remove();
            $(this).append('<div id="balloonHook" class="balloonHook">' +
            '<div class="balloon"><div class="content"></div>' +
            '<div class="pointer"><span class="left"></span><span class="right"></span>' +
            '</div></div>')
            .attr("title", "")
            .find('.content').append(text);
            $('#balloonHook').fadeIn(100);
        },
        function () {
            $('#balloonHook').fadeOut(100, function () {
            });
        });
    };

})(jQuery);
//}}}
