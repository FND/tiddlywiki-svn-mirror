/***
|''Name''|EditNewTiddlersPlugin|
|''Description''|non-existing tiddlers are automatically opened in edit mode|
|''Author''|FND|
|''Version''|0.1.1|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#EditNewTiddlersPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Revision History
!!v0.1 (2008-07-18)
* initial release
!Code
***/
//{{{
if(!version.extensions.EditNewTiddlersPlugin) {
version.extensions.EditNewTiddlersPlugin = { installed: true };

// hijack chooseTemplateForTiddler()
Story.prototype.chooseTemplateForTiddler_editNewTiddlers = Story.prototype.chooseTemplateForTiddler;
Story.prototype.chooseTemplateForTiddler = function(title,template) {
	if(store.tiddlerExists(title) || store.isShadowTiddler(title)) {
		return Story.prototype.chooseTemplateForTiddler_editNewTiddlers.apply(this, arguments);
	} else {
		return config.tiddlerTemplates[DEFAULT_EDIT_TEMPLATE];
	}
};

} //# end of "install only once"
//}}}
