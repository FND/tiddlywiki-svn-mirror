/***
|''Name:''|TaggedTemplatePlugin|
|''Description:''|Apply a view/edit template based on a tag |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TaggedTemplatePlugin |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
|''Overrides''|Story.prototype.chooseTemplateForTiddler() |
!!Documentation
This plugin enables the application of a view or edit template based on a tag name. 

The priority of searching for duplicate templates has been designed to allow partially defined themes, in which missing templates are defaulted to ones defined as tiddlers.  Collation sequence is used to disambiguate collisions when a tiddler it tagged with more than one tag with an associated template. For example, tiddler tagged "fooFip Bar SNORK" will result in a hunt for a template, first in the skin, then in a dedicated tiddler, finally for the default ViewTemplate as follows: 
#[[CurrentTheme]]##barViewTemplate
#[[CurrentTheme]]##foofipViewTemplate
#[[CurrentTheme]]##snorkViewTemplate
#[[barViewTemplate]]
#[[foofipViewTemplate]]
#[[snorkViewTemplate]]
#[[ViewTemplate]]
This plugin is based on Eric Shulman's [[TaggedTemplateTweak|http://www.TiddlyTools.com/#TaggedTemplateTweak]] plugin which has different searching behaviour: a tiddler template trumps one in the skin, the tag used for a template is determined by the order it's defined on the tiddler, and the first letter of a tag is treated as being case insensitive.
!!Code
***/
//{{{
if(!version.extensions.TaggedTemplatePlugin) {
version.extensions.TaggedTemplatePlugin = {installed:true};

Story.prototype._taggedTemplate_chooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler;
Story.prototype.chooseTemplateForTiddler = function(title,template)
{
	template = this._taggedTemplate_chooseTemplateForTiddler.apply(this,arguments);
	var tiddler = store.getTiddler(title);
	if(!tiddler) {
		return template;
	}
	var skin = store.tiddlerExists(config.options.txtTheme);
	var tags = tiddler.tags;
	tags.sort();
        for(i=0;i<tags.length;i++) {
                var taggedTemplate = tags[i].toLowerCase()+template;
                if(skin) {
                        var slice = config.options.txtTheme+'##'+taggedTemplate;
                        if(store.getTiddlerText(slice)) {
                                return slice;
                        }
                }
                if(store.tiddlerExists(taggedTemplate)) {
                        return taggedTemplate;
                }
        }
        return template;
};
}
//}}}
