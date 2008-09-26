/***
|''Name''|ToDoTogglePlugin|
|''Description''|toggles a tiddler's tag based on containing checkboxes' status|
|''Authors''|FND, PhilHawksworth|
|''Version''|0.2.2|
|''Status''|@@beta@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/ToDoTogglePlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/ToDoTogglePlugin.js|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''|[[CheckboxPlugin|http://www.tiddlytools.com/#CheckboxPlugin]]|
|''Keywords''|tasks|
!Description
Checkboxes within tiddlers tagged with //todo// represent tasks.
When all checkboxes within a tiddler are checked, the respective tiddler's //todo// tag is changed to //done//.
!Usage
{{{
[_] active task
[x] closed task
}}}
!Revision History
!!v0.1.0 (2008-08-14)
* initial release
!!v0.2.0 (2008-08-15)
* restoring //todo// tag when checkbox is unchecked
!To Do
* documentation
!Code
***/
//{{{
if(!version.extensions.ToDoTogglePlugin) { //# ensure that the plugin is only installed once
version.extensions.ToDoTogglePlugin = { installed: true };

if(!config.extensions) { config.extensions = {}; }

config.extensions.ToDoTogglePlugin = {
	tags: {
		active: "todo",
		closed: "done"
	},

	toggleStatus: function(title) {
		var t = store.getTiddler(title);
		var tasks = {
			active: t.text.match(/\[[_|\s]\]/g),
			closed: t.text.match(/\[x\]/gi)
		};
		if(t.tags.contains(this.tags.active) && tasks.active === null && tasks.closed.length) {
			store.setTiddlerTag(t.title, false, this.tags.active);
			store.setTiddlerTag(t.title, true, this.tags.closed);
		} else if(t.tags.contains(this.tags.closed) && tasks.active && tasks.active.length) {
			store.setTiddlerTag(t.title, true, this.tags.active);
			store.setTiddlerTag(t.title, false, this.tags.closed);
		}
	}
};

// hijack onClickCheckbox()
config.macros.checkbox.onClickCheckbox_todoToggle = config.macros.checkbox.onClickCheckbox;
config.macros.checkbox.onClickCheckbox = function(event) {
	var tiddler = story.findContainingTiddler(this);
	var status = config.macros.checkbox.onClickCheckbox_todoToggle.apply(this, arguments);
	if(tiddler && !this.init) {
		var title = tiddler.getAttribute("tiddler");
		version.extensions.ToDoTogglePlugin.toggleStatus(title);
	}
	return status;
};

} //# end of "install only once"
//}}}
