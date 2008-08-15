/***
|''Name''|TodoTogglePlugin|
|''Description''|toggles a tiddler's tag based on containing checkboxes' status|
|''Authors''|FND, PhilHawksworth|
|''Version''|0.1.1|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/ToDoTogglePlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/ToDoTogglePlugin.js|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''|[[CheckboxPlugin|http://www.tiddlytools.com/#CheckboxPlugin]]|
|''Keywords''|tasks|
!Description
Checkboxes within tiddlers tagged with //todo// represent tasks.
When all checkboxes are checked, the respective tiddler's //todo// tag is changed to //done//.
!Usage
{{{
[_] active task
[x] closed task
}}}
!Revision History
!!v0.1.0 (2008-08-14)
* initial release
!To Do
* restore //todo// tag when unchecking task
* documentation
!Code
***/
//{{{
if(!version.extensions.TodoTogglePlugin) { //# ensure that the plugin is only installed once
version.extensions.TodoTogglePlugin = {
	installed: true,
	tags: {
		active: "todo",
		closed: "done"
	},

	checkStatus: function(title) {
		var t = store.getTiddler(title);
		var tasks = {
			active: t.text.match(/\[[_|\s]\]/g),
			closed: t.text.match(/\[x\]/gi)
		};
		if(t.tags.contains(this.tags.active) && tasks.active === null && tasks.closed.length) {
			store.setTiddlerTag(t.title, false, this.tags.active);
			store.setTiddlerTag(t.title, true, this.tags.closed);
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
	return config.macros.checkbox.onClickCheckbox_todoToggle.apply(this, arguments);
};

} //# end of "install only once"
//}}}
