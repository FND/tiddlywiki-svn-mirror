/***
|''Name:''|KnobPlugin|
|''Description:''| @@@Description@@@ |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/KnobPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/KnobPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin is used by TiddlySlidy to produce the TV control panel buttons.

<<knob "1">>
<<knob |&#x25c4; >>

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config */
(function ($) {
    version.extensions.KnobPlugin = {installed: true};

    config.macros.knob = {};
    config.macros.knob.handler = function (place, macroName, params) {
        var symbol = params[0] || "*";
        var link = params[1] || "";
        var title = params[2] || "";
        var classes = params[3] || "";

        var classes = classes + " knob" + (symbol.length === 1 ? "" : " squeeze");

        $('<div class="' + classes + '"><a href="' + link + '"' + 
            (title.length ? ' title="' + title + '"': "") + 
            '><div><div>' + symbol + '</div></div></a></div>').appendTo(place);
    };

})(jQuery);
//}}}
