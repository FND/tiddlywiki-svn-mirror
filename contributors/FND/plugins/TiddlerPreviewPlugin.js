/***
|''Name''|TiddlerPreviewPlugin|
|''Description''|provides a toolbar command for previewing tiddler contents|
|''Author''|FND|
|''Version''|0.2.2|
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
* disable double click on preview
* styling inconsistencies
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

	handler: function(ev, src, title) {
		var tiddlerElem = story.findContainingTiddler(src);
		if(config.options.chkPopupPreview) {
			this.generatePopup(title, tiddlerElem, src, ev);
		} else {
			this.generatePane(title, tiddlerElem);
		}
		return false;
	},

	generatePane: function(title, tiddlerElem) {
		var containers = tiddlerElem.getElementsByTagName("div");
		var pane = containers[containers.length - 1];
		if(pane && hasClass(pane, this.className)) {
			removeChildren(pane);
		} else {
			pane = createTiddlyElement(tiddlerElem, "div", null,
				this.className + " viewer");
		}
		this.displayPreview(pane, tiddlerElem, title);
		window.scrollTo(0, ensureVisible(pane));
	},

	generatePopup: function(title, tiddlerElem, src, ev) {
		var popup = Popup.create(src, "div",
			this.className + " popupTiddler viewer");
		this.displayPreview(popup, tiddlerElem, title);
		Popup.show();
		if(ev) {
			ev.cancelBubble = true;
		}
		if(ev && ev.stopPropagation) {
			ev.stopPropagation();
		}
		return false;
	},

	displayPreview: function(container, tiddlerElem, title) {
		var tiddler = new Tiddler(title);
		if(tiddlerElem) {
			var fields = {};
			story.gatherSaveFields(tiddlerElem, fields);
			for(var p in fields) {
				if(TiddlyWiki.isStandardField(p)) {
					if(p == "tags") {
						tiddler[p] = fields[p].readBracketedList();
					} else {
						tiddler[p] = fields[p];
					}
				} else {
					tiddler.fields[p] = fields[p];
				}
			}
			var template = story.chooseTemplateForTiddler(title, DEFAULT_VIEW_TEMPLATE);
			container.innerHTML = story.getTemplateForTiddler(title, template, tiddler);
			applyHtmlMacros(container, tiddler);
			forceReflow();
		}
	}
};

config.shadowTiddlers.StyleSheetPreview = "/*{{{*/\n"
	+ ".preview .toolbar {\n"
	+ "\tdisplay: none;\n"
	+ "}\n"
	+ "/*}}}*/";
store.addNotification("StyleSheetPreview", refreshStyles);

} //# end of "install only once"
//}}}
