/***
|''Name''|NewDocumentButtonPlugin|
|''Description''|Provides the button to link to the new document tiddler|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/NewDocumentButtonPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/NewDocumentButtonPlugin.js |
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''||
!Description

Provides a macro that can be called with <<newDocument>>. The macro craetes a form which creates new documents in the TiddlyWiki file.

!Usage
{{{
<<newDocumentButton>>
}}}

!Code
***/

//{{{
	
config.macros.newDocumentButton = {};
config.macros.newDocumentButton.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	config.shadowTiddlers["NewDocumentButtonPluginStyles"] = store.getTiddlerText("NewDocumentButtonPlugin##StyleSheet");
	store.addNotification("NewDocumentButtonPluginStyles", refreshStyles);
	var newDoc = function() {
		story.displayTiddler(null, "Create New Document")
	}
	createTiddlyButton(place,'Create New Document', 'Click here to create a new document', newDoc,"newDocumentButton");
}


//################################################################################
//# CUSTOM STYLESHEET
//################################################################################
	
/***
!StyleSheet
html body .newDocumentButton {
	padding:0.5em 1em;
	-moz-border-radius-topright :10px;
	-webkit-border-top-right-radius: 10px;
	-moz-border-radius-topleft :10px;
	-webkit-border-top-left-radius: 10px;
	background:white:
	border:1px solid red;
}
!(end of StyleSheet)
***/


//}}}