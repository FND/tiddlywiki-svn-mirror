config.macros.docPreview = {};
config.macros.docPreview.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var spec = $.parseJSON(store.getTiddlerText(window.activeDocument));
	createTiddlyElement(place, "br");
	createTiddlyElement(place, "br");
	for(var t=0; t < spec.length; t++) {
		var title = createTiddlyElement(place,"h1", null, null, spec[t].title);
		wikify(store.getTiddlerText(spec[t].title), place);
	}
}