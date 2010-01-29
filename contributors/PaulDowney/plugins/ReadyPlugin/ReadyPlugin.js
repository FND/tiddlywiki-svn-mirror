/***
|''Name:''|ReadyPlugin|
|''Description:''|Attach a plugin to a tiddler from within a template |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ReadyPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ReadyPlugin/ |
|''Version:''|0.2|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin allows the author of a PageTemplate ViewTemplate or EditTemplate to attach one or more plugins to an element with a {{{macro}}} or {{{content}}} attribute. For example, the function {{{config.macros.DemoReady.ready}}} will be called each time the Hello element is refreshed with the following ViewTemplate:
{{{
    <div class='title' macro='view title' ready='readyDemo'></div>
}}}
This behaviour is useful for attaching jQuery effects to a tiddler as they are dynamically added to the story.
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config applyHtmlMacros refreshPageTemplate */
(function ($) {
    version.extensions.ReadyPlugin = {installed: true};

    function assertReady(root) {
        $(root).children(":first[ready]").each(function () {
            var macros = $(this).attr('ready').split(/[, ]/);
            for (var i = 0; i < macros.length; i++) {
                var m = config.macros[macros[i]];
                if (m && m.ready) {
                    m.ready.apply(this, arguments);
                }
            }
            $(this).removeAttr('ready');
        });
    };

    refreshElements = function (root,changeList,depth) {
        if (!depth) {
            assertReady(root);
        }

        // this is fugly but it's hard to hijack a recursive core function
        var nodes = root.childNodes;
        for(var c=0; c<nodes.length; c++) {
            var e = nodes[c], type = null;
            if(e.getAttribute && (e.tagName ? e.tagName != "IFRAME" : true))
                type = e.getAttribute("refresh");
            var refresher = config.refreshers[type];
            var refreshed = false;
            if(refresher != undefined)
                refreshed = refresher(e,changeList);
            if(e.hasChildNodes() && !refreshed)
                refreshElements(e,changeList,true);
        }
    }

})(jQuery);
//}}}
