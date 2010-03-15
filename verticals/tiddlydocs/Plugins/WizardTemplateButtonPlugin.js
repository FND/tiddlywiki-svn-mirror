/***
|''Name''|WizardTemplateButtonPlugin|
|''Description''|Provides the button to link to the new document tiddler|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/WizardTemplateButtonPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/WizardTemplateButtonPlugin.js |
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
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
	var newDoc = function() {
		story.displayTiddler(null, "CreateNewDocument", "WizardTemplateButtonPlugin##simpleWizardView");
		return false;
	}
	createTiddlyButton(place,'Create New Document', 'Click here to create a new document', newDoc,"newDocumentButton button");
}

config.shadowTiddlers["WizardTemplateButtonPluginStyles"] = store.getTiddlerText("WizardTemplateButtonPlugin##StyleSheet");
store.addNotification("WizardTemplateButtonPluginStyles", refreshStyles);


//################################################################################
//# CUSTOM STYLESHEET
//################################################################################
	
/***
!StyleSheet

html body a.newDocumentButton, .settingsButton {
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