/***
|Name|SimpleCommentsPlugin|
|Source|[[FND's DevPad|http://devpad.tiddlyspot.com/#SimpleCommentsPlugin]]|
|Version|0.7|
|Author|FND|
|License|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|N/A|
|Overrides|N/A|
|Description|add comments to a tiddler|
!Usage
Add {{{<<addComment>>}}} to the desired tiddler(s).
Alternatively, add the following to the tiddler toolbar (usually in ViewTemplate, {{{<div class='toolbar' macro='...'>}}}): {{{addComment}}} (currently untested)

''N.B.:'' For now, TiddlyWiki needs to be saved manually after adding a comment, thus making this plugin rather unsuitable for read-only TiddlyWikis.
!Changelog
!!v0.5 (2007-05-08)
* initial release
!!v0.6 (2007-05-10)
* moved required styles into a shadow tiddler
!!v0.7 (2007-05-14)
* complete rewrite from DOM-based to string-based processing
!Issues / To Do
* proper creation of command buttons
* global option and/or macro parameter for reverseOrder
* revise CSS properties
* review code (esp. section marked with DEBUG)
* some functions/routines might be redundant (i.e. already present in the TiddlyWiki core, e.g. {{{trim()}}}, {{{IsoTimestamp()}}} & {{{zeroPad()}}}?)
!Code
***/
//{{{
/*
** Styles (can be customized in the StyleSheetSimpleComments shadow tiddler)
*/

config.shadowTiddlers.StyleSheetSimpleComments = "/*{{{*/\n"
	+ ".comments {\n\tmargin-top: 2em;\n\tpadding: 1em 4px 4px;\n\tborder-top: 2px ridge #AAA;\n\tbackground-color: #F8F8F8;\n}\n\n"
	+ ".comments .comment {\n\tmargin: 0.5em 1em;\n\tpadding: 4px;\n\tborder: 1px solid #AAA;\n\tbackground-color: #FFF;\n}\n\n"
	+ ".comments .comment h1,\n.comments .comment h2 {\n\tmargin: 0 0 0.2em;\n\tpadding: 0;\n\tborder-bottom: 1px solid #AAA;\n\tbackground-color: transparent;\n}\n\n"
	+ ".comments .comment h1 {\n\tfloat: right;\n}\n\n"
	+ ".comments .comment p {\n\tmargin: 0 0 0.2em;\n}\n"
	+ "/*}}}*/";
store.addNotification("StyleSheetSimpleComments", refreshStyles);

/*
** Command Buttons
*/

/* Macro Button */
// adapted from Jack's DoBackupMacro (http://groups.google.com/group/TiddlyWiki/browse_thread/thread/5f1123d08bdadeac/86245d5e4bbe846c)
config.macros.addComment = { label: "Add comment", prompt: "Add a new comment" }; // DEBUG: prompt not needed!?
config.macros.addComment.handler = function(place) {
	if(!readOnly) {
		createTiddlyButton(place, this.label, this.prompt, function() {
				addTiddlerComment(this);
				return false; // DEBUG: ?
			}, null, null, this.accessKey
		); // DEBUG - to do: look up createTiddlyButton()'s parameters
	}
}

/* Toolbar Button */
config.commands.addComment = { text: "Add comment", tooltip: "Add a comment" }
config.commands.addComment.handler = function() {
	addTiddlerComment(this); // DEBUG: does that work?
}

/*
** Script
*/

// adapted from Eric Shulman's CommentScript (http://www.tiddlytools.com/#CommentScript)
addTiddlerComment = function(place) {
	// select current tiddler
	var here = story.findContainingTiddler(place);
	if (!here) {
		alert("error: no tiddler specified");
		return;
	}
	var title = here.getAttribute("tiddler");
	var tiddler = store.getTiddler(title);
	// retrieve tiddler sections
	var tiddlerContentsPre = tiddler.text + "\n";
	var tiddlerComments = "";
	var tiddlerContentsPost = "";
	var RegEx = /^([\S\s]*)\{\{comments\{((?:\{\{comment\{[^}]*\}\}\}|\s+)*)\}\}\}([\S\s]*)$/i; // RegEx provided by Andreas "Qtax" Zetterlund (www.qtax.se)
	var tiddlerContents = RegEx.exec(tiddler.text);
	if (tiddlerContents != null) {
		tiddlerContentsPre = tiddlerContents[1];
		tiddlerComments += lTrim(tiddlerContents[2]); // assuming there is only a single comments section per tiddler
		tiddlerContentsPost = tiddlerContents[3];
	}
	// append comment
	var reverseOrder = false; // DEBUG: global option!?
	if (reverseOrder) {
		tiddlerComments = newComment() + "\n" + tiddlerComments;
	} else {
		tiddlerComments += newComment() + "\n";
	}
	tiddlerComments = "{{comments{\n" + tiddlerComments + "}}}";
	// re-create tiddler contents
	tiddlerContents = tiddlerContentsPre + tiddlerComments + tiddlerContentsPost;
	// store new tiddler contents
	store.saveTiddler(tiddler.title, tiddler.title, tiddlerContents, tiddler.modifier, tiddler.modified, tiddler.tags); // DEBUG: look up saveTiddler()'s parameters
	story.refreshTiddler(title, 1, true); // DEBUG: look up refreshTiddler()'s parameters
	// DEBUG: save file automatically? (could also be uploaded if the respective plugin is installed)
}

function newComment() {
	// get comment
	var comment = getComment();
	// create comment
	if (comment != null) {
		// get username
		getUserName();
		// get timestamp
		var now = new Date();
		var timestamp = IsoTimestamp(now, true); // use UTC -- DEBUG: use toLocaleString()?; make UTC a macro parameter
		// add timestamp and username
		comment = "{{comment{\n"
			+ "!" + timestamp + "\n"
			+ "!!" + config.options.txtUserName + "\n"
			+ comment + "\n"
			+ "}}}";
	}
	return comment;
}

function getComment() { // DEBUG: use temporary textarea instead of dialog box?
	var comment = prompt("Please enter your comment (wiki markup is allowed).", "");
	comment = trim(comment);
	if (comment == "") { // disallow empty comments
		getComment();
	}
	return comment;
}

function getUserName() {
	if (config.options.txtUserName == "" || config.options.txtUserName == null) { // does not accept "Cancel"!
		config.options.txtUserName = prompt("Please enter your username.", config.options.txtUserName);
		config.options.txtUserName = trim(config.options.txtUserName);
		getUserName(); // check for empty username
	}
}

function IsoTimestamp(date, UTC) {
	var date = new Date(date)
	if (UTC == true) {
		date = date.getUTCFullYear() + "-"
			+ zeroPad(date.getUTCMonth() + 1, 2) + "-"
			+ zeroPad(date.getUTCDate(), 2) + " "
			+ zeroPad(date.getUTCHours(), 2) + ":"
			+ zeroPad(date.getUTCMinutes(), 2)
			+ " UTC";
	} else {				
		date = date.getFullYear() + "-"
			+ zeroPad(date.getMonth() + 1, 2) + "-"
			+ zeroPad(date.getDate(), 2) + " "
			+ zeroPad(date.getHours(), 2) + ":"
			+ zeroPad(date.getMinutes(), 2);
	}
	return date;
}

function zeroPad(number, digits) {
	var s = String(number);
	while (s.length < digits)
		s = '0' + s;
	return s;
}

// remove leading whitespaces
function lTrim(str) {
	var RE = /^\s*((\S+\s*)*)$/;
	return str.replace(RE, "$1");
}

// remove trailing whitespaces
function rTrim(str) {
	var RE = /^((\s*\S+)*)\s*$/;
	return str.replace(RE, "$1");
}

// remove leading and trailing whitespaces
function trim(str) {
	return lTrim(rTrim(str));
}
//}}}