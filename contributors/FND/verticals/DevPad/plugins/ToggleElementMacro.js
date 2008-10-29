/***
|''Name''|ToggleElementMacro|
|''Description''|toggles the visibility of the element specified|
|''Author''|FND|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#ToggleElementMacro]]|
|''Version''|0.6|
|''Status''|@@experimental@@|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
!Notes
This macro was created for use with the [[overflow technique|http://cleanlayout.tiddlyspot.com/#StyleSheet]] (cf. [[[twdev] StyleSheetLayout: overflow technique|http://groups.google.at/group/TiddlyWikiDev/browse_thread/thread/b55011665c5e04d9/]]).
!Usage
{{{
<<toggleElement
	[element ID]
	[button label]
	[button tooltip]
	[button class]
	[button access key]
	[startup mode]
>>
}}}
All parameters are optional.
If the last parameter is {{{"hide"}}}, the respective element will be hidden when the macro is first rendered.
In order to use the default value for a certain property, the respective parameter can either be omitted or defined as empty by using {{{""}}}.
!!Examples
|!Code|!Result|
|{{{<<toggleElement>>}}}| <<toggleElement>> |
|{{{<<toggleElement "mainMenu" "Toggle MainMenu" "" "tiddlyLinkExisting">>}}}| <<toggleElement "mainMenu" "Toggle MainMenu" "" "tiddlyLinkExisting">> |
|{{{<<toggleElement "mainMenu" "Toggle MainMenu" "" "" "" "hide">>}}}| <<toggleElement "mainMenu" "Toggle MainMenu" "" "" "" "hide">> |
!Revision History
!!v0.5 (2007-09-22)
* initial proof-of-concept implementation
!!v0.6 (2007-11-11)
* added parameter for hiding element by default
* renamed to [[ToggleElementMacro]] (from [[ToggleElementPlugin]])
!To Do
* use named parameters
* documentation (esp. parameters)
* separate button labels depending on element's toggle state
* add animations (using [[AnimationsLibrary]]; cf. [[ToggleElementPlugin (animated)]])
!Code
***/
//{{{
config.macros.toggleElement = {
	elementID: "sidebar",
	label: "Toggle Sidebar",
	prompt: "Switch sidebar on and off",
	buttonClass: "",
	accessKey: ""
};

config.macros.toggleElement.handler = function(place, macroName, params) {
	// process command line parameters
	var elementID = params[0] || this.elementID;
	var label = params[1] || this.label;
	var prompt = params[2] || this.prompt;
	var buttonClass = params[3] || this.buttonClass;
	var accessKey = params[4] || this.accessKey;
	// startup mode
	if(params[5] == "hide") {
		this.toggle(elementID);
	}
	// create toggle button
	createTiddlyButton(place, label, prompt,
		function() { config.macros.toggleElement.toggle(elementID); },
		buttonClass, null, accessKey);
};

config.macros.toggleElement.toggle = function(id) {
	var e = document.getElementById(id);
	if(e) {
		if(e.style.display != "none") {
			e.style.display = "none";
		} else {
			e.style.display = "";
		}
	}
};
//}}}