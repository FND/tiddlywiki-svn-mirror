/***
|Name|EasyHighlightingPlugin|
|Source|[[FND's DevPad|http://devpad.tiddlyspot.com/#EasyHighlightingPlugin]]|
|Version|0.1|
|Author|FND|
|License|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|N/A|
|Overrides|N/A|
|Description|allow for simple highlighting by selecting text|
!Usage
[tbd]
!Changelog
!!v0.1 (2007-05-27)
* alpha version
!Issues / To Do
[tbd; cf [[[tw] discussion|http://groups.google.com/group/TiddlyWiki/t/349af49c41f8bf44]]]
''N.B.:'' development is currently ''ON HOLD'':
<<<
Since the text is selected from the formatted (wikified) output, I'll run into trouble as soon as there's any kind of wiki markup involved (e.g. trying to highlight "lorem ''ipsum'' dolor" would not be recognized -- or it might even strip the bold formatting).
<<<
!Code
***/
//{{{
/*
** Styles (can be customized in the StyleSheetEasyHighlighting shadow tiddler)
*/

config.shadowTiddlers.StyleSheetEasyHighlighting = "/*{{{*/\n"
	+ ".highlightDefault {\n\tbackground-color: #FF0;\n\tcursor: pointer;\n}\n"
	+ "/*}}}*/";
store.addNotification("StyleSheetEasyHighlighting", refreshStyles);

/*
** Macro Code
*/

config.macros.EasyHighlighting = { label: "Highlight", prompt: "Toggle highlighting" };
config.macros.EasyHighlighting.handler =
	function(place, macroName, params, wikifier, paramString, tiddler) {
		
}

/*
** Command Buttons
*/

/* Macro Button */
config.macros.EasyHighlighting = { label: "Highlight", prompt: "Toggle highlighting", accessKey: "h" }; // DEBUG: check accessKey usage
config.macros.EasyHighlighting.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	createTiddlyButton(place, this.label, this.prompt, function() { // DEBUG: how to pass current tiddler to function?
			// highlight selected text
			highlightPassage(place, tiddler, "highlightDefault"); // DEBUG: tiddler is undefined (see above)
			return false; // DEBUG: ?
		}, null, null, this.accessKey
	);
}

/* Toolbar Button */
config.commands.EasyHighlighting = { label: "Highlight", prompt: "Toggle highlighting" } // DEBUG: accessKey!?
config.commands.EasyHighlighting.handler = function() {
	// highlight selected text
	highlightPassage(place, tiddler, "highlightDefault");
	return false; // DEBUG: ?
}

/*
** Main Code
*/

highlightPassage = function(place, tiddler, className) {
	// get selection
	var selection = getSelText();
	if(selection == "") {
		alert("Error: No text selected.");
		return
	}
	// retrieve tiddler -- DEBUG: obsolete?! only necessary for macro button, because tiddler parameter is not working there (see Command Buttons section)
	var here = story.findContainingTiddler(place);
	if(!here) {
		alert("Error: No tiddler specified.");
		return;
	}
	var title = here.getAttribute("tiddler");
	var tiddler = store.getTiddler(title);
	// determine tiddler contents
	var tiddlerContents = tiddler.text;
	var tiddlerParts = tiddlerContents.split(selection);
	var preSelection = tiddlerParts[0]; // DEBUG: to do
	var postSelection = tiddlerParts[1]; // DEBUG: to do
	// highlight selected passage
	alert(tiddlerParts.length + "\n\npreSelection:\n" + preSelection + "\n\npostSelection:\n" + postSelection); // DEBUG
	tiddlerContents = preSelection + "{{" + className + "{" + selection + "}}}" + postSelection;
	alert("tiddlerContents:\n" + tiddlerContents); // DEBUG
	// store altered tiddler contents
	//wikify(tiddlerContents, place); // DEBUG'd
	// ??
	return false;
}

/*
** Support Functions
*/

// getSelText() by Jeff Anderson (http://www.codetoad.com/javascript_get_selected_text.asp)
function getSelText() {
	var txt = "";
	if (window.getSelection) {
		txt = window.getSelection();
	} else if (document.getSelection) {
		txt = document.getSelection();
	} else if (document.selection) {
		txt = document.selection.createRange().text;
	} else {
		return;
	}
	return txt;
}
//}}}