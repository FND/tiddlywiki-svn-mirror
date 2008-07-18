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
