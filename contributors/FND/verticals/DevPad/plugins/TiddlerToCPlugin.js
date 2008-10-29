/***
|Name|TiddlerToCPlugin|
|Source|[[FND's DevPad|http://devpad.tiddlyspot.com/#TiddlerToCPlugin]]|
|Version|0.7|
|Author|FND|
|Contributors|[[Saq|http://tw.lewcid.org]]|
|License|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|N/A|
|Overrides|N/A|
|Description|create a table of contents from a tiddler's headings|
!Notes
Doug Compton has written a similar, though much more advanced plugin for this purpose, called [[DcTableOfContentsPlugin|http://devpad.tiddlyspot.com/#DcTableOfContentsPlugin]].
!Usage
Add {{{<<ToC>>}}} to the desired tiddler(s). Alternatively, a parameter can be used to display the table of contents for another tiddler: {{{<<ToC "tiddlerName">>}}}.
The styling can be modified in the [[StyleSheetTableOfContents]] shadow tiddler.
<<ToC>>
!Changelog
!!v0.5a (2007-05-20)
* initial release
!!v0.5b (2007-05-20)
* renamed to TiddlerToCPlugin (to prevent confusion with the existing [[TableOfContentsPlugin|http://tiddlytools.com/#TableOfContentsPlugin]])
!!v0.6 (2007-05-21)
* several bugfixes and significant improvements regarding the macro code (thanks Saq)
!!v0.7 (2007-08-29)
* fixed error for tiddlers not containing any headings
!Issues / To Do
* add links to sections (problematic, as there are no anchors, yet?)
* introduce thresholds (minimum amount of headings to show a ToC, maximum depth)
!Code
***/
//{{{
/*
** Styles (can be customized in the StyleSheetTableOfContents shadow tiddler)
*/

config.shadowTiddlers.StyleSheetTableOfContents = "/*{{{*/\n"
	+ ".ToC {\n\tfloat: left; /* auto-width */\n\tmargin: 0 2em 2em 0;\n\tborder: 1px solid #aaa;\n\tpadding: 5px;\n\tbackground-color: #eee;\n}\n\n"
	+ ".ToC ol {\n\tmargin: 0 1em;\n}\n\n"
	+ "h1 {\n\tclear: left;\n}\n"
	+ "/*}}}*/";
store.addNotification("StyleSheetTableOfContents", refreshStyles);

/*
** Macro Code
*/

config.macros.ToC = { label: "Add Table of Contents", prompt: "Add Table of Contents" }; // DEBUG: obsolete?
config.macros.ToC.handler =
	function(place, macroName, params, wikifier, paramString, tiddler) {
		// process parameters
		if (params[0]) { // tiddler name
			tiddler = store.getTiddler(params[0]);
		}
		// create table of contents
		generateToC(place, tiddler);
		return false; // DEBUG: ?
}

/*
** Main Code
*/

generateToC = function(place, tiddler) {
	// retrieve headings
	var RegEx = /^!+(.*)$/gim;
	var tiddlerContents = tiddler.text.match(RegEx);
	// create ToC
	if(tiddlerContents) {
		var ToC = "";
		for(var i = 0; i < tiddlerContents.length; i++) {
			ToC += tiddlerContents[i] + "\n";
		}
		// replace headings markup with list markup
		for(var i = 0; i < 6; i++) { // DEBUG: inefficient!? (use a single RegEx instead? problem: JavaScript RegEx limitations)
			ToC = ToC.replace(/^(#*)!/gim, "$1#");
		}
		// add ToC wrapper container
		ToC = "{{ToC{\n''Table of Contents''\n" + ToC + "}}}\n";
		// add ToC to tiddler
		wikify(ToC, place);
	}
	return false;
}
//}}}