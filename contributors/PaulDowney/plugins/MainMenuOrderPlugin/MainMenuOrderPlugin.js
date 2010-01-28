/***
|''Name:''|MainMenuOrderPlugin|
|''Description:''|MainMenu reorderable using drag and drop |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/MainMenuOrderPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/MainMenuOrderPlugin/ |
|''Version:''|0.2|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin is Very much the subject of work in progress, has no automatic tests, 
and has only tried in Safari and Firefox.
The DragSort plugin is very buggy, may be replaced with jquery.ui "sortable".
The MainMenu currently must be an unordered bullet list.
It is planned to support nested lists in a later version.
Attach it to the page template as follows:
{{{
<div id='mainMenu' macro='MainMenuOrder'></div>
}}}
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global document config jQuery */
if (!version.extensions.MainMenuOrderPlugin) {
    version.extensions.MainMenuOrderPlugin = {installed: true};

/*
    jQuery List DragSort v0.3.8 pre-release
    Website: http://dragsort.codeplex.com/
    License: http://dragsort.codeplex.com/license
*/
(function($) {

    $.fn.dragsort = function(options) {
        var opts = $.extend({}, $.fn.dragsort.defaults, options);
        var lists = new Array();
        var list = null, lastPos = null;

        this.each(function(i, cont) {

            var newList = {
                draggedItem: null,
                placeHolderItem: null,
                pos: null,
                offset: null,
                offsetLimit: null,
                container: cont,

                init: function() {
                    $(this.container).attr("listIdx", i).find(opts.dragSelector).css("cursor", "move").mousedown(this.grabItem);
                },

                grabItem: function(e) {
                    var target = e.srcElement || e.target;
                    if (e.button == 2 || target.tagName == "INPUT" || target.tagName == "A" && target.getAttribute("href") != null)
                        return;
                    
                    if (list != null && list.draggedItem != null)
                        list.dropItem();

                    $(this).css("cursor", "move");

                    list = lists[$(this).parents("*[listIdx]").attr("listIdx")];
                    list.draggedItem = $(this).is(opts.itemSelector) ? $(this) : $(this).closest(opts.itemSelector);
                    list.offset = list.draggedItem.offset();
                    list.offset.top = e.pageY - list.offset.top;
                    list.offset.left = e.pageX - list.offset.left;

                    var containerHeight = $(list.container).outerHeight() == 0 ? Math.max(1, Math.round(0.5 + $(list.container).children(opts.itemSelector).size() * list.draggedItem.outerWidth() / $(list.container).outerWidth())) * list.draggedItem.outerHeight() : $(list.container).outerHeight();
                    list.offsetLimit = $(list.container).offset();
                    list.offsetLimit.right = list.offsetLimit.left + $(list.container).outerWidth() - list.draggedItem.outerWidth();
                    list.offsetLimit.bottom = list.offsetLimit.top + containerHeight - list.draggedItem.outerHeight();

                    list.placeHolderItem = list.draggedItem.clone().html(opts.placeHolderTemplate).addClass(opts.placeHolderClass).css("height", list.draggedItem.height()).attr("placeHolder", true);
                    list.draggedItem.after(list.placeHolderItem);
                    list.draggedItem.css({ position: "absolute", opacity: 0.8 });

                    $(lists).each(function(i, l) { l.ensureNotEmpty(); l.buildPositionTable(); });

                    list.setPos(e.pageX, e.pageY);
                    $(document).bind("selectstart", list.stopBubble); //stop ie text selection
                    $(document).bind("mousemove", list.swapItems);
                    $(document).bind("mouseup", list.dropItem);
                    return false; //stop moz text selection
                },

                setPos: function(x, y) {
                    var top = y - this.offset.top;
                    var left = x - this.offset.left;

                    if (!opts.dragBetween) {
                        top = Math.min(this.offsetLimit.bottom, Math.max(top, this.offsetLimit.top));
                        left = Math.min(this.offsetLimit.right, Math.max(left, this.offsetLimit.left));
                    }

                    this.draggedItem.parents().each(function() {
                        if ($(this).css("position") != "static"  && (!$.browser.mozilla || $(this).css("display") != "table")) {
                            var offset = $(this).offset();
                            top -= offset.top;
                            left -= offset.left;
                            return false;
                        }
                    });

                    this.draggedItem.css({ top: top, left: left });
                },

                buildPositionTable: function() {
                    var item = this.draggedItem == null ? null : this.draggedItem.get(0);
                    var pos = new Array();
                    $(this.container).children(opts.itemSelector).each(function(i, elm) {
                        if (elm != item) {
                            var loc = $(elm).offset();
                            loc.right = loc.left + $(elm).width();
                            loc.bottom = loc.top + $(elm).height();
                            loc.elm = elm;
                            pos.push(loc);
                        }
                    });
                    this.pos = pos;
                },

                dropItem: function() {
                    if (list.draggedItem == null)
                        return;

                    $(list.container).find(opts.dragSelector).css("cursor", "move");
                    list.placeHolderItem.before(list.draggedItem);

                    list.draggedItem.css({ position: "", top: "", left: "", opacity: "" });
                    list.placeHolderItem.remove();
                    
                    $("*[emptyPlaceHolder]").remove();

                    $(document).unbind("selectstart", list.stopBubble);
                    $(document).unbind("mousemove", list.swapItems);
                    $(document).unbind("mouseup", list.dropItem);

                    //opts.dragEnd.apply(list.draggedItem);
                    opts.dragEnd();
                    list.draggedItem = null;
                    return false;
                },

                stopBubble: function() { return false; },

                swapItems: function(e) {
                    if (list.draggedItem == null)
                        return false;

                    list.setPos(e.pageX, e.pageY);

                    var ei = list.findPos(e.pageX, e.pageY);
                    var nlist = list;
                    for (var i = 0; ei == -1 && opts.dragBetween && i < lists.length; i++) {
                        ei = lists[i].findPos(e.pageX, e.pageY);
                        nlist = lists[i];
                    }

                    if (ei == -1 || $(nlist.pos[ei].elm).attr("placeHolder"))
                        return false;

                    if (lastPos == null || lastPos.top > list.draggedItem.offset().top || lastPos.left > list.draggedItem.offset().left)
                        $(nlist.pos[ei].elm).before(list.placeHolderItem);
                    else
                        $(nlist.pos[ei].elm).after(list.placeHolderItem);

                    $(lists).each(function(i, l) { l.ensureNotEmpty(); l.buildPositionTable(); });
                    lastPos = list.draggedItem.offset();
                    return false;
                },

                findPos: function(x, y) {
                    for (var i = 0; i < this.pos.length; i++) {
                        if (this.pos[i].left < x && this.pos[i].right > x && this.pos[i].top < y && this.pos[i].bottom > y)
                            return i;
                    }
                    return -1;
                },
                
                ensureNotEmpty: function() {
                    if (!opts.dragBetween)
                        return;

                    var item = this.draggedItem == null ? null : this.draggedItem.get(0);
                    var emptyPH = null, empty = true;
                    
                    $(this.container).children(opts.itemSelector).each(function(i, elm) {
                        if ($(elm).attr("emptyPlaceHolder"))
                            emptyPH = elm;
                        else if (elm != item)
                            empty = false;
                    });
                    
                    if (empty && emptyPH == null)
                        $(this.container).append(list.placeHolderItem.clone().removeAttr("placeHolder").attr("emptyPlaceHolder", true));
                    else if (!empty && emptyPH != null)
                        $(emptyPH).remove();
                }
            };

            newList.init();
            lists.push(newList);
        });

        return this;
    };

    $.fn.dragsort.defaults = {
        itemSelector: "li",
        dragSelector: "li",
        dragEnd: function() { },
        dragBetween: false,
        placeHolderClass: "placeHolder",
        placeHolderTemplate: "&nbsp;"
    };

})(jQuery);

(function ($) {
    config.macros.MainMenuOrder = {};
    config.macros.MainMenuOrder.update = function () {
        var text = "";
        $("#mainMenu li a").each(function(i, elm) { 
            text += "*[[" + $(elm).attr('tiddlylink') + "]]\n";
        });
        var t = store.getTiddler("MainMenu");
        if (t.text != text) {
            store.saveTiddler(t.title,t.title,text,t.modifier,t.modified,t.tags,t.fields,true,t.created,t.creator);
            autoSaveChanges();
        }
    };

    config.macros.MainMenuOrder.handler = function (place, macroName, params, wikifier, paramString) {
        config.macros.tiddler.transclude(place, "MainMenu", "");
        $("#mainMenu ul:first").dragsort({ dragEnd: config.macros.MainMenuOrder.update});
    };

})(jQuery);
}
//}}}
