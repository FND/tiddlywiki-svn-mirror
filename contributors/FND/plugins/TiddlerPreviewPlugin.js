/***
|''Name''|TiddlerPreviewPlugin|
|''Description''|provides a toolbar command for previewing tiddler contents|
|''Author''|FND|
|''Version''|0.1.1|
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
		var container = this.getContainer(tiddlerElem);
		var text = this.getContents(tiddlerElem);
		wikify(text, container);
		window.scrollTo(0, ensureVisible(container));
		return false;
	},

	getContainer: function(tiddlerElem) {
		var containers = tiddlerElem.getElementsByTagName("div");
		var container = containers[containers.length - 1]; // XXX: pop method undefined on HTMLCollection!?
		if(container && hasClass(container, this.className)) {
			removeChildren(container);
		} else {
			container = createTiddlyElement(tiddlerElem, "div", null,
				this.className + " viewer");
		}
		return container;
	},

	getContents: function(tiddlerElem) {
		var containers = tiddlerElem.getElementsByTagName("textarea");
		if(containers[0]) {
			return containers[0].value;
		}
	}
};

} //# end of "install only once"
//}}}
