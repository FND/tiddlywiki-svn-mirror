/***
|''Name''|PasswordPromptMacro|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#PasswordPromptMacro]]|
|''Version''|0.8|
|''Author''|FND|
|''Contributors''|[[Lewcid|http://tw.lewcid.org]], [[BidiX|http://www.bidix.info]]|
|''License''|[[Creative Commons Attribution-Share Alike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|create a prompt for password input|
<<<
''N.B.'' [[PasswordPromptMacro]] has been superseded by [[PasswordPromptPlugin]]
<<<
!Usage Notes
* styling can be customized in the [[StyleSheetPasswordPrompt]] shadow tiddler
!Revision History
!!v0.1 (2007-07-19)
* initial proof-of-concept implementation
!!v0.8 (2007-07-21)
* fixed IE issues (thanks Saq and BidiX)
* made ENTER/RETURN key trigger the password check
* various changes and improvements
!To Do
* {{{checkPassword()}}}: provide "interface" for other plugins to use this functionality (cf. {{{displayMessage()}}}) <br>&rArr; read/write password from/to custom variable ({{{config.macros.passwordPrompt.password}}}?) or use function call(??) instead of using macro parameter<br>&rArr; encryption issues!?
* fix positioning issue in IE (caused by negative margin)
* clean up code<br>&rArr; remove/fix {{{DEBUG}}} flags<br>&rArr; use {{{this}}} instead of {{{config.macros.passwordPrompt}}}
* documentation
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
	+ "}\n"
	+ "/*}}}*/";
store.addNotification("StyleSheetPasswordPrompt", refreshStyles);

/*
** Macro Code
*/

config.macros.passwordPrompt = { label: "toggle prompt", prompt: "show/hide password prompt" };
config.macros.passwordPrompt.handler = 
function(place, macroName, params, wikifier, paramString, tiddler) {
	if(!readOnly) {
		createTiddlyButton(place, this.label, this.prompt, function() {
				// process parameters -- DEBUG: obsolete (for testing purposes only)?
				if (params[0]) {
					config.macros.passwordPrompt.password = params[0];
				} else {
					config.macros.passwordPrompt.password = "";
				}
				// toggle password prompt
				config.macros.passwordPrompt.togglePrompt(this);
				return false;
			}, null, null, this.accessKey
		);
	}
}

/*
** Main Code
*/

config.macros.passwordPrompt.togglePrompt = function() {
	var e = document.getElementById("passwordPrompt");
	if(!e) {
		// create display container for password prompt
		var r = createTiddlyElement(document.body, "form");
		r.setAttribute("id", "passwordPrompt");
		r.setAttribute("action", "");
		r.setAttribute("onsubmit", "return false"); // DEBUG: valid? obsolete (cf. i.onKeyPress)?
		// create label
		var l = createTiddlyElement(r, "label", null, null, "Enter password:");
		l.setAttribute("for", "passwordField");
		// create password field
		var i = document.createElement ("input");
		i.setAttribute("id", "passwordField");
		i.setAttribute("type","password");
		i.onkeypress = function(e) { e = e; return config.macros.passwordPrompt.checkEnter(e); };
		r.appendChild(i); // needs to be done *after* setting the type attribute
		// create separator
		createTiddlyElement(r, "br");
		// create submit button
		var b = document.createElement ("input");
		b.setAttribute("type","button");
		b.setAttribute("value", "ok");
		b.onclick = config.macros.passwordPrompt.checkPassword;
		r.appendChild(b); // needs to be done *after* setting the type attribute
		// select password field
		i.focus();
	} else {
		// remove input field
		e.parentNode.removeChild(e);
	}
}

config.macros.passwordPrompt.checkPassword = function() {
	var e = document.getElementById("passwordField");
	if(e.value === config.macros.passwordPrompt.password) {
		config.macros.passwordPrompt.togglePrompt();
		alert("password correct"); // DEBUG: for testing purposes only
	}
	else
		alert("password incorrect");
}

config.macros.passwordPrompt.checkEnter = function(e) {
	// retrieve key code
	if(!e)
		var e = window.event;
	if(e.keyCode)
		var code = e.keyCode;
	else if(e.which)
		var code = e.which;
	// check key code
	if(code == 13) // ENTER key
		this.checkPassword();
	return true;
}
//}}}