/***
|''Name''|eMailMacro|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#eMailMacro]]|
|''Version''|0.96|
|''Status''|stable|
|''Author''|Rick Magers, FND|
|''Contributors''|HeX|
|''License''|public domain|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|create an e-mail from tiddler contents|
!Usage
{{{
<<email [tiddler:"name"] [to:"address"] [cc:"address"] [bcc:"address"] [subject:"text"] [maxChars:"number"] [filterMacro:"true"] [label:"text"] [tooltip:"text"] [class:"customClass"]>>
}}}
All parameters are optional.
Multiple recipients can be added by separating the addresses with a comma.
!!Example
<<email subject:"Hello World" to:"foo@bar.baz,bar@foo.baz" label:"mail to Foo" tooltip:"send this tiddler to Foo">>
!!Adding the macro to the toolbar
After importing this plugin tiddler, the [[ViewTemplate]] needs to be modified by adding {{{<span macro='email'></span>}}} to the toolbar:
{{{
<div class='toolbar'>
<span macro='toolbar newHere +editTiddler deleteTiddler permalink references jump closeOthers -closeTiddler'>
<span macro='email'></span>
</div>
}}}
(The respective version of the ViewTemplate might differ from the one displayed here.)
!Limitations
* limited number of characters for the message body (due to [[inherent limitations|http://www.boutell.com/newfaq/misc/urllength.html]] of {{{mailto:}}} links)
* the user's combination of browser and e-mail client needs to support the respective features of the mailto protocol
!Revision History
!!v0.1 (2007-06-16)
* initial release [[by Rick Magers|http://groups.google.com/group/TiddlyWiki/browse_thread/thread/ff7ae93cbe94345e/f6699532351f0802?#f6699532351f0802]] 
!!v0.8 (2007-07-05)
* various modifications to enhance support for special characters ([[by FND and HeX|http://groups.google.com/group/TiddlyWikiDev/browse_thread/thread/ed196a32b295d2c9]])
!!v0.9 (2007-10-08)
* code refactoring
* added parameters for various fields
!!v0.91 (2007-10-10)
* fixed malformed mailto string (additional ampersand in some cases)
!!v0.95 (2007-12-27)
* added parameter for removing {{{<<email>>}}} macro calls from output (thanks [[ELS|http://www.tiddlytools.com]])
* using custom {{{escapeHTML()}}} function instead of {{{htmlDecode()}}}
!!v0.96 (2007-12-28)
* added parameter for specifying a target tiddler
* added parameter for limiting the number of characters returned from the tiddler body (default: 2000)
* some code refactoring
!To Do
* documentation
* further enhance handling of special characters
!Code
***/
//{{{
config.macros.email = {
	subject: "default title",
	body: "default contents",
	label: "e-mail",
	tooltip: "e-mail this tiddler",
	btnClass: "button",
	maxChars: 2000
};

config.macros.email.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	// process parameters
	var prms = paramString.parseParams(null, null, true);
	var label = getParam(prms, "label") || this.label;
	var tooltip = getParam(prms, "tooltip") || this.tooltip;
	var btnClass = getParam(prms, "class") || this.btnClass;
	var msgTo = getParam(prms, "to");
	var msgCC = getParam(prms, "cc");
	var msgBCC = getParam(prms, "bcc");
	var msgSubject = getParam(prms, "subject");
	var title = getParam(prms, "tiddler") || tiddler.title;
	var filterMacro = getParam(prms, "filterMacro");
	var maxChars = getParam(prms, "maxChars") || this.maxChars;
	// retrieve tiddler contents
	if(!msgSubject) {
		if(store.getTiddler(title) || store.isShadowTiddler(title))
			msgSubject = strEscape(title);
		else
			msgSubject = this.subject;
	}
	var msgBody = store.getTiddlerText(title, this.body);
	if(filterMacro == "true")
		msgBody = msgBody.replace(/\<\<email(.*|\n)?\>\>/gi, "");
	msgBody = strEscape(msgBody);
	// compose message
	var msg = "";
	if(msgTo) { msg += msgTo; }
	msg += "?";
	msg += "subject=" + msgSubject;
	if(msgCC) { msg += "&cc=" + msgCC; }
	if(msgBCC) { msg += "&bcc=" + msgBCC; }
	msg += "&body=" + msgBody;
	if(msg.length > maxChars)
		msg = msg.substr(0, maxChars);
	// create link
	wikify(
		"[[" + label + "|"
		+ "mailto:" + msg + "]]",
		place
	);
	place.lastChild.className = btnClass;
	place.lastChild.title = tooltip;
}

function strEscape(str) {
	return entitify(escape(escapeHTML(str)));
}

/* inspired by the Prototype library (http://prototype.conio.net) */
function escapeHTML(str) {
	var div = document.createElement("div");
	var text = document.createTextNode(str);
	div.appendChild(text);
	return div.innerHTML;
};

// handle special characters
function entitify(str) {
	return str
		.replace(/%A2/g, "¢")	   
		.replace(/%A3/g, "£")
		.replace(/%A5/g, "¥")
		.replace(/%AB/g, "«")
		.replace(/%BB/g, "»")
		.replace(/%B5/g, "µ")
		.replace(/%C4/g, "Ä")
		.replace(/%C5/g, "Å")
		.replace(/%C6/g, "Æ")
		.replace(/%D6/g, "Ö")
		.replace(/%D8/g, "Ø")
		.replace(/%DC/g, "Ü")
		.replace(/%DF/g, "ß")
		.replace(/%E4/g, "ä")
		.replace(/%E5/g, "å")
		.replace(/%E6/g, "æ")
		.replace(/%F0/g, "ð")
		.replace(/%F6/g, "ö")
		.replace(/%F8/g, "ø")
		.replace(/%FC/g, "ü")
		.replace(/%u20AC/g, "€");
};
//}}}