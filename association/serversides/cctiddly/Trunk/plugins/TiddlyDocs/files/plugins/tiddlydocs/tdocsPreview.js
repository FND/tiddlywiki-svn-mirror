config.macros.docPreview = {};
config.macros.docPreview.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var spec = $.parseJSON(store.getTiddlerText(window.activeDocument));
	var htmlStack = [];
	htmlStack.push("<html><body>");
	for(var t=0; t < spec.length; t++) {
		htmlStack.push("<h1>"+spec[t].title+"</h1>");
		htmlStack.push(wikifyStatic(store.getTiddlerText(spec[t].title)));
	}
	htmlStack.push("</body></html>");
	var htmlString = htmlStack.join("\n");
	newDate = new Date();
	var name = "Please wait..";
	store.saveTiddler("Document Preview", "Document Preview", htmlString, config.options.txtUserName, newDate,"",config.defaultCustomFields);
	story.displayTiddler(null, "Document Preview");
}