/***
|''Name''|NewDocument|
|''Description''|Provides a form to create a new document from within a TiddlyWiki|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/newDocument.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/newDocument.js |
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''||
!Description

Provides a macro that can be called with <<newDocument>>. The macro craetes a form which creates new documents in the TiddlyWiki file.

!Usage
{{{
<<newDocument>>
}}}

!Code
***/

//{{{
config.macros.newDocument = {};

config.macros.newDocument.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var w = new Wizard();
	var me = config.macros.newDocument;
	w.createWizard(place,"create new document");
	w.addStep(null, '<input name="documentName" />');
	w.setButtons([
		{caption: 'create', tooltip: 'create new document', onClick: function()  { config.macros.newDocument.createDocumentOnClick(this, w);}
	}]);
};

config.macros.newDocument.createDocumentOnClick = function(e, w) {
	var docName = w.formElem.documentName.value;

		if(store.tiddlerExists(docName)) {
			alert(docName+" Already Exists");
		}else{
			var tiddler = store.saveTiddler(docName, docName, '{content:[]}', null, null, "document", merge({}, config.defaultCustomFields));
			autoSaveChanges(null, [tiddler]);
		}
		window.activeDocument = docName;
		refreshAll();
		return false;
}


//}}}