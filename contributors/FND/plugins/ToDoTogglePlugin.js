//{{{
if(!version.extensions.TodoTogglePlugin) {
version.extensions.TodoTogglePlugin = {
	cueTag: "todo",

	checkStatus: function(title) {
		var t = store.getTiddler(title);
		var open = t.text.match(/\[[_|\s]\]/g);
		var done = t.text.match(/\[x\]/gi);
		if(t.tags.contains(this.cueTag) && open === null && done.length) {
			store.setTiddlerTag(t.title, false, this.cueTag);
		}
	}
};

// hijack store.saveTiddler()
config.macros.checkbox.onClickCheckbox_todoToggle = config.macros.checkbox.onClickCheckbox;
config.macros.checkbox.onClickCheckbox = function(event) {
	var tiddler = story.findContainingTiddler(this);
	if(tiddler) {
		var title = tiddler.getAttribute("tiddler");
		version.extensions.TodoTogglePlugin.checkStatus(title);
	}
	var status = config.macros.checkbox.onClickCheckbox_todoToggle.apply(this, arguments);
	return status;
};

} //# end of "install only once"
//}}}
