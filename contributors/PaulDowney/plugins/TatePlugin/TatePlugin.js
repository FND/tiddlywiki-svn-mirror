/***
|''Name:''|TatePlugin|
|''Description:''| @@@Description@@@ |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/TatePlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TatePlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
@@@blah blah@@@
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config */
(function ($) {
    version.extensions.TatePlugin = {installed: true};

    config.macros.tate = {};
    var macro = config.macros.tate;

    macro.image = 'images/image.png';

    macro.handler = function (place, macroName, params, wikifier, paramString, tiddler) {
        $('<div>')
            .css('background', 'transparent url(' + macro.image + ') top left no-repeat')
            .css('background-position', '-' + tiddler.fields.left + 'px -' + tiddler.fields.top + 'px')
            .css('width', tiddler.fields.width + 'px')
            .css('height', tiddler.fields.height + 'px')
            .appendTo(place);
    };

})(jQuery);
//}}}
