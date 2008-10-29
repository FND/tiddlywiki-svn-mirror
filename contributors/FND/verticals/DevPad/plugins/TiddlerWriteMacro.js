/***
|''Name''|TiddlerWriteMacro|
|''Version''|0.1|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#TiddlerPopupMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|Shows the contents of the specified tiddler.|
!Notes
This is a sample macro, created only for educational purposes.
!Usage
{{{
<<tiddlerWrite tiddlerName>>
}}}
!!Example
<<tiddlerWrite [[ColorPalette]]>>
!Revision History
!!v0.1 (2007-11-19)
* initial release
!Code
***/
//{{{
config.macros.tiddlerWrite = {};
config.macros.tiddlerWrite.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var title = params[0];
	if(title == tiddler.title) {
		title = "Error: Can't use the same tiddler from which the macro is called (infinite recursion)!";
	}
	var tiddler = store.getTiddler(title);
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
	wikify("<<<\n" + contents + "\n<<<", place);
}
//}}}