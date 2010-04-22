/***
|''Name''|NewDocumentButton|
|''Description''|Provides the button to link to the new document tiddler|
|''Authors''|Simon McManus|
|''Version''|0.2|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/newDocumentButtonPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/newDocumentButtonPlugin.js |
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Requires''||
!Description

Provides a macro that can be called with <<newDocumentButton>>. The macro craetes a form which creates new documents in the TiddlyWiki file.

!Usage
{{{
<<newDocumentButton>>
}}}

!Code
***/

//{{{

config.macros.newDocumentButton = {
	defaultTemplate: "newDocumentButtonPlugin##simpleWizardView",
	defaultText: 'Create New Document', 
	newDocumentTiddler: "CreateNewDocument", 
	tooltip: "Click here to create a new document"
};
config.macros.newDocumentButton.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var me = config.macros.newDocumentButton;
	var params = paramString.parseParams("anon",null,true,false,false);
	var template = getParam(params,"template",null);
	var text = getParam(params,"text",null);
	var newDoc = function() {
		template = (template)?template:me.defaultTemplate;
		story.displayTiddler(null,me.newDocumentTiddler, template);
		return false;
	};
	text = (text!=null)?text:me.defaultText;
	createTiddlyButton(place, text, me.tooltip, newDoc,"newDocumentButton button");
}

config.shadowTiddlers["newDocumentButtonPluginStyles"] = store.getTiddlerText("newDocumentButtonPlugin##StyleSheet");
store.addNotification("newDocumentButtonPluginStyles", refreshStyles);

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################
	
/***
!StyleSheet

 a.newDocumentButton, .settingsButton {
	padding:0.5em 1em;
	background:#fff;
	border:1px solid #eee;
	margin:0.5em;
}
!(end of StyleSheet)

!simpleWizardView 
<!--{{{-->
	<div class='toolbar' ></div>
	<div class='wizardViewer'  macro='view text wikified'></div>
<!--}}}-->

!(end of simpleWizardView)


***/

//}}}