/***
|''Name''|TiddlerPopupMacro|
|''Version''|0.1|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#TiddlerPopupMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|Shows the contents of the specified tiddler in a popup.|
!Notes
This is a sample macro, created only for educational purposes.
!Usage
{{{
<<tiddlerPopup [tiddler name]>>
}}}
!!Example
<<tiddlerPopup [[ColorPalette]]>>
!Revision History
!!v0.1 (2007-11-19)
* initial release
!To Do
* parameters for {{{buttonClass}}}, {{{popupClass}}}, {{{id}}}, {{{accessKey}}}
* customizable order (title, tags, contents)
!Code
***/
//{{{
config.macros.tiddlerPopup = {
	label: "label",
	tooltip: "tooltip",
	buttonClass: null,
	id: null,
	accessKey: null
};

config.macros.tiddlerPopup.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var title = params[0] || tiddler.title;
	this.label = title;
	this.tooltip = "show " + title;
	createTiddlyButton(place, this.label, this.tooltip,
		function(e) { config.macros.tiddlerPopup.show(e, this, title) },
		this.buttonClass, this.id, this.accessKey);
};

config.macros.tiddlerPopup.show = function(ev, el, title) {
	// prevent event bubbling
	ev.cancelBubble = true;
	if(ev.stopPropagation) ev.stopPropagation();
	// show tiddler contents
	var tiddler = store.getTiddler(title);
	var popup = Popup.create(el, "div");
	if(tiddler) {
		var contents = "tags: " + tiddler.tags.join(" ") + "\n----\n"
			+ "[[" + tiddler.title + "]]\n----\n"
			+ tiddler.text;
	} else {
		if(store.getTiddlerText(title)) { // shadow tiddler
			var contents = "[[" + title + "]]\n----\n" + store.getTiddlerText(title);
		} else {
			var contents = "Error: Tiddler [[" + title + "]] not found.";
		}
	}
	wikify(contents, popup);
	Popup.show();
}
//}}}