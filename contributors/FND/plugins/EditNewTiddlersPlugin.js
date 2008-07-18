/***
|''Name''|EditNewTiddlersPlugin|
|''Description''|non-existing tiddlers are automatically opened in edit mode|
|''Author''|FND|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#EditNewTiddlersPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
!Revision History
!!v0.1 (2008-07-18)
* initial release
!Code
***/
//{{{
// hijack chooseTemplateForTiddler()
Story.prototype.chooseTemplateForTiddler_editNewTiddlers = Story.prototype.chooseTemplateForTiddler;
Story.prototype.chooseTemplateForTiddler = function(title,template) {
	if(store.tiddlerExists(title) || store.isShadowTiddler(title)) {
		return Story.prototype.chooseTemplateForTiddler_editNewTiddlers.apply(this, arguments);
	} else {
		return config.tiddlerTemplates[DEFAULT_EDIT_TEMPLATE];
	}
};
//}}}
