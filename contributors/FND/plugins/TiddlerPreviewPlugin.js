/***
|''Name''|TiddlerPreviewPlugin|
|''Description''|provides a toolbar command for previewing tiddler contents|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@beta@@|
|''Source''|<...>|
|''Source''|http://svn.tiddlywiki.org/contributors/FND/plugins/TiddlerPreviewPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Notes
<...>
!Usage
<...>
!Revision History
!!v0.1 (2008-12-06)
* initial release
!To Do
* use popup for preview
!Code
***/
//{{{
if(!version.extensions.TiddlerPreviewPlugin) { //# ensure that the plugin is only installed once
version.extensions.TiddlerPreviewPlugin = { installed: true };

config.commands.previewTiddler = {
	text: "preview",
	tooltip: "preview tiddler contents",
	className: "preview",

	handler: function(event, src, title) {
		var tiddlerElem = story.findContainingTiddler(src);
		var containers = tiddlerElem.getElementsByTagName("div");
		var preview = containers[containers.length - 1]; // XXX: pop method undefined on HTMLCollection!?
		if(preview && hasClass(preview, this.className)) {
			removeChildren(preview);
		} else {
			preview = createTiddlyElement(tiddlerElem, "div", null, this.className + " viewer");
		}
		containers = tiddlerElem.getElementsByTagName("textarea");
		if(containers.length > 0) {
			var text = containers[0].value;
			wikify(text, preview);
			window.scrollTo(0, ensureVisible(preview));
		}
		return false;
	}
};

} //# end of "install only once"
//}}}
