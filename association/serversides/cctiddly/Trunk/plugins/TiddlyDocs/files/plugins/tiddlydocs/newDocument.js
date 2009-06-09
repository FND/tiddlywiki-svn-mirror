config.macros.newDocument = {};
config.macros.newDocument.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	
	
	var w = new Wizard();
	var me = config.macros.newDocument;
	w.createWizard(place,"create new docuemnt");
	w.addStep(null, '<div><input/><a href="javascript:;" title="Create New Document " class="btn"><span><span>Create</span></span></a></div>');
};

config.macros.newDocument.createDocument = function() {
	
	alert("s");
	console.log(this, this.parentNode, arguments);
	
}