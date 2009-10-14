/***
|''Name:''|TaggedTemplatePlugin|
|''Description:''|Apply a view/edit template based on a tag |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TaggedTemplatePlugin |
|''Version:''|1.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
|''Overrides''|Story.prototype.chooseTemplateForTiddler() |
!!Documentation
This plugin enables the application of a view or edit template based on a tag name. 

The priority of searching for duplicate templates has been designed to allow partially defined themes, in which missing templates are defaulted to ones defined as tiddlers.  Collation sequence is used to disambiguate collisions when a tiddler it tagged with more than one tag with an associated template. For example, tiddler tagged "Foo Bar" will result in a hunt for a template as follows:
# in the current theme by tag:
##[[CurrentTheme]]##barViewTemplate
##[[CurrentTheme]]##fooViewTemplate
# in a template for the tag:
##[[barViewTemplate]]
##[[fooViewTemplate]]
# global in the current theme
##[[CurrentTheme]]##ViewTemplate
# in the global tiddler
##[[ViewTemplate]]
This plugin is used by RippleRap, TiddlyResume and a number of other verticals which use nested themes was based on Eric Shulman's [[TaggedTemplateTweak|http://www.TiddlyTools.com/#TaggedTemplateTweak]] plugin which at the time didn't support themes and searches in a different order.
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global Story, store, config */
if (!version.extensions.TaggedTemplatePlugin) {
    version.extensions.TaggedTemplatePlugin = {installed: true};

    Story.prototype._chooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler;
    Story.prototype.chooseTemplateForTiddler = function (title, n)
    {
        var slice, i, tags = [], tagTiddler;
        var tiddler = store.getTiddler(title);

        // translate number into template name
        var template = ["ViewTemplate", "EditTemplate"][n ? n - 1 : 0];

        // canonicalise tags
        if (tiddler) {
            for (i = 0; i < tiddler.tags.length; i++) {
                tags.push(tiddler.tags[i].toLowerCase());
            }
            tags.sort();
        }

        // search theme for tagged template in the current theme
        if (tags.length && store.tiddlerExists(config.options.txtTheme)) {
            for (i = 0; i < tags.length; i++) {
                slice = config.options.txtTheme + '##' + tags[i] + template;
                if (store.getTiddlerText(slice)) {
                    return slice;
                }
            }
        }

        // search theme for tagged template tiddler
        for (i = 0; i < tags.length; i++) {
            tagTiddler = tags[i] + template;
            if (store.tiddlerExists(tagTiddler)) {
                return tagTiddler;
            }
        }

        // search theme for template
        if (store.tiddlerExists(config.options.txtTheme)) {
            slice = config.options.txtTheme + '##' + template;
            if (store.getTiddlerText(slice)) {
                return slice;
            }
        }

        return this._chooseTemplateForTiddler.apply(this, arguments);
    };
}
//}}}
