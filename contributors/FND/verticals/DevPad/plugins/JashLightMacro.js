/***
|''Name''|JashMacro|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Author''|[[Billy Reisinger|http://www.billyreisinger.com]]|
|''Contributor''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#JashMacro]]|
|''License''|[[GNU General Public License|http://www.gnu.org/licenses/gpl.html]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|JavaScript shell console|
!Notes
This macro is entirely based upon (and dependent on) [[Jash|http://www.billyreisinger.com/jash/]] by [[Billy Reisinger|http://www.billyreisinger.com]].
It dynamically loads the required code from the online resource.
!Usage
{{{
<<Jash [label] [tooltip] [class] [access key]>>
}}}
<<Jash>>
!Revision History
!!v0.1 (2007-12-10)
* initial release
!Code
***/
//{{{
config.macros.Jash = {
	label: "Jash",
	prompt: "open Jash",
	buttonClass: "",
	accessKey: ""
};

config.macros.Jash.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var label = params[0] || this.label;
	var prompt = params[1] || this.prompt;
	var buttonClass = params[2] || this.buttonClass;
	var accessKey = params[3] || this.accessKey;
	createTiddlyButton(place, label, prompt, config.macros.Jash.toggle, buttonClass, null, accessKey);
}

config.macros.Jash.toggle = function(place, macroName, params, wikifier, paramString, tiddler) {
	document.body.appendChild(document.createElement("script")).src = "http://www.billyreisinger.com/jash/source/latest/Jash.js";
}
//}}}