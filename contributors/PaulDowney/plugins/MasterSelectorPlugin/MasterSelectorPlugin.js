/***
|''Name:''|MasterSelectorPlugin|
|''Description:''|Select themed tiddler field |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/MasterSelectorPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/MasterSelectorPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Used by [[TiddlySlidy|http://tiddlyslidy.com]] to select the [[ThemedTiddlerPlugin|http://whatfettle.com/2008/07/ThemedTiddlerPlugin/]] {{{theme}}} field.
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config */
(function ($) {
    version.extensions.MasterSelectorPlugin = {installed: true};

    config.macros.fieldSelector = {};
    config.macros.fieldSelector.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
        var caption = params[0] || "Select a master slide";
        var field = params[1] || "theme";
        var tag = params[2] || "masterSlide";
        var title = tiddler.title;

        var tagged = store.getTaggedTiddlers(tag);
        var options = [];
        options.push({'caption': caption, 'name': null});
        for (var i=0; i < tagged.length; i++) {
            options.push({'caption': tagged[i].title, 'name': tagged[i].title});
        }

        return createTiddlyDropDown(place, function(ev) {
                var fields = {};
                fields[field] = this[this.selectedIndex].value;
                store.addTiddlerFields(title, fields);
                story.refreshTiddler(title);
                return false;
            }, options, 
            tiddler.fields[field]);
    };

}(jQuery));
//}}}
