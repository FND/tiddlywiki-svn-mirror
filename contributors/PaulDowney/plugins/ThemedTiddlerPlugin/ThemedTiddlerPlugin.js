/***
|''Name:''|ThemedTiddlerPlugin |
|''Description:''|Per-Tiddler Mini-Themes |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ThemedTiddlerPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ThemedTiddlerPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
The extended field "theme" is used to reference a tiddler containing a "mini-theme"

A mini-theme is a tiddler containing a [[ViewTemplate]], [[EditTemplate]] and [[StyleSheet]] sections which are applied when the tiddler is displayed. 

In addition, a CSS class of the theme name is added to the tiddler which may be useful when writing a mini-theme [[StyleSheet]]. 
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global Story, store, setStylesheet, addClass */
if (!version.extensions.ThemedTiddlerPlugin) {
    version.extensions.ThemedTiddlerPlugin = {installed: true};

    Story.prototype.__chooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler;
    Story.prototype.chooseTemplateForTiddler = function (title, n)
    {
        // translate number into template name
        var template = ["ViewTemplate", "EditTemplate"][n ? n - 1 : 0];

        var tiddler = store.getTiddler(title);

        if (tiddler) {
            var theme = tiddler.fields.theme;
            if (theme) {

                // assert stylesheet
                var style = store.getTiddlerText(theme + '##StyleSheet');
                if (style) {
                    setStylesheet(style, theme);
                }

                // return theme template
                var slice = theme + '##' + template;
                if (store.getTiddlerText(slice)) {
                    return slice;
                }
            }
        }

        // default template
        return this.__chooseTemplateForTiddler.apply(this, arguments);
    };

    // assert theme name as a class on the tiddler
    Story.prototype.__refreshTiddler = Story.prototype.refreshTiddler;
    Story.prototype.refreshTiddler = function (title, template, force, customFields, defaultText)
    {
        var tiddlerElem = this.__refreshTiddler.apply(this, arguments);
        var tiddler = store.getTiddler(title);
        if (tiddler) {
            addClass(tiddlerElem, store.getTiddler(title).fields.theme);
        }
        return tiddlerElem;
    };
}
//}}}
