/***
|''Name''|TodoTogglePlugin|
|''Description''|toggles a tiddler's tag based on contining checkboxes' status|
|''Authors''|FND, PhilHawksworth|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/ToDoTogglePlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/ToDoTogglePlugin.js|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''|[[CheckboxPlugin|http://www.tiddlytools.com/#CheckboxPlugin]]|
|''Keywords''|tasks|
!Description
<...>
!Usage
{{{
[_] task
}}}
!Revision History
!!v0.1.0 (2008-08-14)
* initial release
!To Do
* re-enable tag when unchecking task
* documentation
!Code
***/
//{{{
if(!version.extensions.TodoTogglePlugin) { //# ensure that the plugin is only installed once
version.extensions.TodoTogglePlugin = {
	installed: true,
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
