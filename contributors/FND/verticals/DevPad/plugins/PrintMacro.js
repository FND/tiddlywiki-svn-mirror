/***
|''Name''|PrintMacro|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#PrintMacro]]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|prints the current document|
!Usage
{{{
<<print [label] [tooltip] [class] [access key]>>
}}}
<<print>>
!Revision History
!!v0.1 (2007-12-10)
* initial release
!Code
***/
//{{{
config.macros.print = {
	label: "print",
	prompt: "print document",
	buttonClass: "",
	accessKey: ""
};

config.macros.print.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var label = params[0] || this.label;
	var prompt = params[1] || this.prompt;
	var buttonClass = params[2] || this.buttonClass;
	var accessKey = params[3] || this.accessKey;
	createTiddlyButton(place, label, prompt,
		function() { window.print(); },
		buttonClass, null, accessKey);
}
//}}}