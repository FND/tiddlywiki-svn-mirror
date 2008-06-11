/***
|''Name''|DiffPlugin|
|''Author''|FND|
|''Version''|0.2|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#DiffPlugin|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''CoreVersion''|2.1|
|''Description''|provides //diff// functionality for comparing text strings|
|''Keywords''|diff comparison|
!Notes
This plugin uses external libraries for the diff algorithm.
!Usage
{{{
<<diff string1 string2 [algorithm URI]>>
}}}
!!Parameters
* {{{string1}}} is the base text
* {{{string2}}} is the modified text
* the optional {{{algorithm}}} parameter specifies the //diff// algorithm being used:
** "[[jsdiff|http://ejohn.org/projects/javascript-diff-algorithm/]]" (default)
** "[[google-diff-match-patch|http://code.google.com/p/google-diff-match-patch/]]"
** "server-side"
* the {{{URI}}} parameter (required when using "server-side") specifies the URL of the server-side //diff// script
Evaluated parameters can be used to compare tiddlers:
{{{
<<diff {{store.getTiddlerText("tiddlerName1")}} {{store.getTiddlerText("tiddlerName2")}}>>
}}}
!!Examples
<<diff "lorem ipsum dolor sit amet" "lorem isum sit dollor amet">>
!Configuration Options
The styling can be adjusted by editing the [[StyleSheetDiff]] shadow tiddler.
!Revision History
!!v0.1 (2008-03-22)
* initial release
!!v0.2 (2008-03-25)
* support for alternative diff libraries
!To Do
* explore further diff algorithms (e.g. http://www.lshift.net/blog/2008/05/09/diff-for-javascript-revisited)
* google-diff-match-patch
** non-unified diff (optional)
** parameters for {{{cleanupSemantic}}}, {{{cleanupEfficiency}}} and {{{displayEOL}}}
!Code
***/
//{{{
config.macros.diff = {};

config.macros.diff.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var diff;
	switch(params[2]) {
		case "google-diff-match-patch":
			diff = google_diff_match_patch(params[0], params[1], true, true, false);
			this.display(diff, place);
			break;
		case "XinDiff":
			// DEBUG: to do
			break;
		case "server-side":
			this.serverSide_request(params[3], place);
			break;
		case "diff3":
			// DEBUG: to do
			break;
		case "jsdiff":
		default:
			diff = jsdiff(params[0], params[1]);
			this.display(diff, place);
			break;
	}
};

config.macros.diff.display = function(diffMarkup, place) {
	var c = createTiddlyElement(place, "div", null, "diffView");
	c.innerHTML = diffMarkup;
};

config.macros.diff.serverSide_request = function(uri, place) {
	var params = {
		place: place
	};
	doHttp("GET", uri, null, null, null, null, config.macros.diff.serverSide_return, params);
};

config.macros.diff.serverSide_return = function(status, params, responseText, url, xhr) {
	config.macros.diff.display(responseText, params.place);
};

function jsdiff(string1, string2) {
	return diffString(string1, string2);
}

function google_diff_match_patch(string1, string2, cleanupSemantic, cleanupEfficiency, displayEOL) {
	var dmp = new diff_match_patch();
	var diff = dmp.diff_main(string1, string2);
	if(this.cleanupSemantic)
		dmp.diff_cleanupSemantic(diff);
	if(this.cleanupEfficiency)
		dmp.diff_cleanupEfficiency(diff);
	return dmp.diff_prettyHtml(diff);
}

config.shadowTiddlers.StyleSheetDiff = "/*{{{*/\n"
	+ ".diffView {\n"
	+ "\toverflow: auto;\n"
	+ "\tmargin: 1em;\n"
	+ "\tborder: 1px solid #888;\n"
	+ "\tpadding: 5px;\n"
	+ "\twhite-space: pre;\n"
	+ "\tfont-family: monospace;\n"
	+ "\tbackground-color: #fefefe;\n"
	+ "}\n\n"
	+ ".diffView ins {\n"
	+ "\tbackground-color: #E6FFE6;\n"
	+ "}\n\n"
	+ ".diffView del {\n"
	+ "\tbackground-color: #FFE6E6;\n"
	+ "}\n"
	+ "/*}}}*/";
store.addNotification("StyleSheetDiff", refreshStyles);
//}}}
