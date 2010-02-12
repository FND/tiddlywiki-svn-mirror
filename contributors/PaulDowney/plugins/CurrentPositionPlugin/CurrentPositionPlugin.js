/***
|''Name:''|CurrentPositionPlugin|
|''Description:''| Display current position n/n in a list of tiddlers |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/CurrentPositionPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/CurrentPositionPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Developed for TiddlySlidy, this Macro to displays the position of the current slide (the most recently displayed tiddler) in a list of tiddlyLinks in the form n/n.

<<currentPosition>>
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config */
(function ($) {
    version.extensions.CurrentPositionPlugin = {installed: true};

    config.macros.currentPosition = {};
    config.macros.currentPosition.handler = function (place, macroName, params) {
        var symbol = params[0] || "MainMenu";
        var tiddlylink = params[1] || symbol;

        var text = store.fetchTiddler('MainMenu').text;
        text = text.replace(/\**\s*\[\[/g, "");
        text = text.replace(/\]\]\s*$/, "");
        var items = text.split(/\]\]\s*/);

        var total = items.length;
        var first = $('#tiddlerDisplay .tiddler').attr('tiddler');
        var current = items.indexOf(first) + 1;

        $(  '<div class="contents">' +
            '<a class="tiddlyLink" href="javascript:;" tiddlyLink="' + tiddlylink + '">' +
            '<span class="current">' + current + '</span>' + 
            '<span class="spacer">/</span>' +
            '<span class="total">' + total + '</span>' +
            '</a></div>'
        ).appendTo(place);
        $(place).find('a.tiddlyLink').click(onClickTiddlerLink);
    };

})(jQuery);
//}}}
