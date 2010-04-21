/***
|''Name''|NewDocument|
|''Description''|Provides a form to create a new document from within a TiddlyWiki|
|''Authors''|Simon McManus|
|''Version''|0.2|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/newDocument.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/newDocument.js |
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Requires''||
!Description

Provides a macro that can be called with <<newDocument>>. The macro craetes a form which creates new documents in the TiddlyWiki file.

!Usage
{{{
<<newDocument>>
}}}


!History 

0.1 - initial release.
0.2 - pressing return key submits the form correctly. 

!Code
***/



//{{{
config.macros.newDocument = {
    'createNewDocument': 'create new document',
    'docExists': ' Document Already Exists',
    'sectionExists': ' Already Exists as a document section.'
};

config.macros.newDocument.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var w = new Wizard();
	var me = config.macros.newDocument;
	w.createWizard(place,config.macros.newDocument.createNewDocument);
	w.addStep(null, '<input name="documentName" />');
	w.formElem.onsubmit = function() {
		config.macros.newDocument.createDocumentOnClick(this, w);
		return false;
	};
	w.setButtons([
		{caption: 'create', tooltip: 'create new document', onClick: function()  { config.macros.newDocument.createDocumentOnClick(this, w);}
	}]);
};

config.macros.newDocument.createDocumentOnClick = function(e, w) {
    var docName = w.formElem.documentName.value;
	if(store.tiddlerExists(docName)) {
	    if(store.getTiddler(docName).isTagged('document'))
		    alert(docName+config.macros.newDocument.docExists);
		else 
	        alert(docName+config.macros.newDocument.sectionExists);  
	}else{
		var tiddler = store.saveTiddler(docName, docName, '{content:[]}', null, null, "document excludeSearch", merge({}, config.defaultCustomFields));
		autoSaveChanges(null, [tiddler]);
	}
	window.activeDocument = docName;
	refreshAll();
	return false;
}
//}}}