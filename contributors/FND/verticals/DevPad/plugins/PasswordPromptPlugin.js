/***
|''Name''|PasswordPromptPlugin|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#PasswordPromptMacro]]|
|''Version''|0.95|
|''Author''|FND|
|''Contributors''|[[Lewcid|http://tw.lewcid.org]], [[BidiX|http://www.bidix.info]], [[Loic|http://dachary.org]]|
|''License''|[[Creative Commons Attribution-Share Alike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|create a prompt for masked password inputs|
!Usage Notes
* {{{passwordPrompt.handler(promptString, callbackFunction);}}}, whereas the callback function takes the prompt's inputs as parameter
* styling can be customized in the [[StyleSheetPasswordPrompt]] shadow tiddler
!Revision History
!!v0.1 (2007-07-19)
* initial proof-of-concept implementation
!!v0.8 (2007-07-21)
* fixed IE issues (thanks Saq and BidiX)
* made ENTER/RETURN key trigger the password check
* various changes and improvements
!!v0.9 (2007-07-22)
* converted from a macro to a general-purpose component (function library)
!!v0.95 (2007-08-05)
* corrected callback usage (thanks Loic)
!To Do
* add cancel button
* clean up code<br>&rArr; remove/fix {{{DEBUG}}} flags<br>&rArr; use {{{this.}}} instead of {{{passwordPrompt.}}}
* documentation
* fix positioning issue in IE (not perfectly centered due to issues with negative margin)
!Code
***/
//{{{
/*
** Styles (can be customized in the StyleSheetPasswordPrompt shadow tiddler)
*/

config.shadowTiddlers.StyleSheetPasswordPrompt = "/*{{{*/\n"
	+ "#passwordPrompt {\n"
	+ "\tz-index: 100;\n"
	+ "\tposition: absolute;\n"
	+ "\ttop: 50%;\n"
	+ "\tleft: 50%;\n"
	+ "\twidth: 15em;\n"
	+ "\theight: 4.5em;\n"
	+ "\tline-height: 1.3em;\n"
	+ "\tmargin: -2em 0 0 -5em;\n"
	+ "\tborder: 2px solid #AAA;\n"
	+ "\tpadding: 10px;\n"
	+ "\ttext-align: center;\n"
	+ "\tbackground-color: #EEE;\n"
	+ "}\n\n"
	+ "#passwordPrompt label {\n"
	+ "\tdisplay: block;\n"
	+ "}\n\n"
	+ "* html #passwordPrompt { /* IE fix */\n"
	+ "\tmargin: 0;\n"
	+ "}\n"
	+ "/*}}}*/";
store.addNotification("StyleSheetPasswordPrompt", refreshStyles);

/*
** Password Prompt class
*/

passwordPrompt = {}

passwordPrompt.handler = function(promptString, callback) {
	passwordPrompt.togglePrompt(promptString, callback);
	return false; // DEBUG: obsolete/nonsense!?
}

passwordPrompt.togglePrompt = function(promptString, callback) {
	var e = document.getElementById("passwordPrompt");
	if(!e) {
		// create display container for password prompt
		var r = createTiddlyElement(document.body, "form");
		r.setAttribute("id", "passwordPrompt");
		r.setAttribute("action", "");
		r.setAttribute("onsubmit", "return false"); // DEBUG: valid? obsolete (cf. i.onKeyPress)?
		// create label
		var l = createTiddlyElement(r, "label", null, null, promptString);
		l.setAttribute("for", "passwordField");
		// create password field
		var i = document.createElement("input");
		i.setAttribute("id", "passwordField");
		i.setAttribute("type","password");
		i.onkeypress = function(e, callback) { e = e || window.event; return passwordPrompt.checkEnter(e, callback); }; // DEBUG: "e = e || window.event;"??
		r.appendChild(i); // needs to be done *after* setting the type attribute
		// create separator
		createTiddlyElement(r, "br");
		// create submit button
		var b = document.createElement ("input");
		b.setAttribute("type","button");
		b.setAttribute("value", "ok");
		b.onclick = function() { passwordPrompt.checkPassword(callback); }
		r.appendChild(b); // needs to be done *after* setting the type attribute
		// select password field
		i.focus();
	} else {
		// remove input field
		e.parentNode.removeChild(e);
	}
	return false; // DEBUG: obsolete/nonsense!?
}

passwordPrompt.checkPassword = function(callback) {
	var e = document.getElementById("passwordField");
	passwordPrompt.togglePrompt();
	return callback(e.value);
}

passwordPrompt.checkEnter = function(e, callback) {
	// retrieve key code
	if(!e)
		var e = window.event;
	if(e.keyCode)
		var code = e.keyCode;
	else if(e.which)
		var code = e.which;
	// check key code
	if(code == 13) // ENTER key
		this.checkPassword(callback);
	// do not suppress key presses
	return true;
}
//}}}