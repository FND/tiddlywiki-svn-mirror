/***
|''Name''|TiddlerPreviewPlugin|
|''Description''|provides a toolbar command for previewing tiddler contents|
|''Author''|FND|
|''Version''|0.2.1|
|''Status''|@@beta@@|
|''Source''|<...>|
|''Source''|http://svn.tiddlywiki.org/contributors/FND/plugins/TiddlerPreviewPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Notes
<...>
!Usage
<...>
!Configuration Options
<<option chkPopupPreview>> use popup for preview
!Revision History
!!v0.2 (2008-12-06)
* initial release
!To Do
* use templating mechanism instead of wikifying
!Code
***/
//{{{
if(!version.extensions.TiddlerPreviewPlugin) { //# ensure that the plugin is only installed once
version.extensions.TiddlerPreviewPlugin = { installed: true };

config.optionsDesc.chkPopupPreview = "use popup for preview";

config.commands.previewTiddler = {
	text: "preview",
	tooltip: "preview tiddler contents",
	className: "preview",

	handler: function(event, src, title) {
		var tiddlerElem = story.findContainingTiddler(src);
		var text = this.getContents(tiddlerElem);
		if(config.options.chkPopupPreview) {
			this.generatePopup(event, src, text);
		} else {
			this.generateContainer(tiddlerElem, text);
		}
		return false;
	},

	generateContainer: function(tiddlerElem, text) {
		var containers = tiddlerElem.getElementsByTagName("div");
		var container = containers[containers.length - 1]; // XXX: pop method undefined on HTMLCollection!?
		if(container && hasClass(container, this.className)) {
			removeChildren(container);
		} else {
			container = createTiddlyElement(tiddlerElem, "div", null,
				this.className + " viewer");
		}
		wikify(text, container);
		window.scrollTo(0, ensureVisible(container));
	},

	generatePopup: function(ev, src, text) {
		var e = ev || window.event; // XXX: already provided by TW framework?
		var popup = Popup.create(src, "div",
			this.className + " popupTiddler viewer");
		wikify(text, popup);
		Popup.show();
		if(e) {
			e.cancelBubble = true;
		}
		if(e && e.stopPropagation) {
			e.stopPropagation();
		}
		return false;
	},

	getContents: function(tiddlerElem) {
		var containers = tiddlerElem.getElementsByTagName("textarea");
		if(containers[0]) {
			return containers[0].value;
		}
	},

	displayTiddler: function(container, title, tiddler) {
		var template = story.chooseTemplateForTiddler(title);
		container.innerHTML = story.getTemplateForTiddler(title, template, tiddler);
		applyHtmlMacros(container, tiddler);
	}
};

} //# end of "install only once"
//}}}
