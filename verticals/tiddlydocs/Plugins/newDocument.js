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
			alert(docName+"Already Exists");
		}else{
			var tiddler = store.saveTiddler(docName, docName, '{content:[]}', null, null, "document", merge({}, config.defaultCustomFields));
			autoSaveChanges(null, [tiddler]);
		}
		window.activeDocument = docName;
		refreshAll();
		return false;
}
