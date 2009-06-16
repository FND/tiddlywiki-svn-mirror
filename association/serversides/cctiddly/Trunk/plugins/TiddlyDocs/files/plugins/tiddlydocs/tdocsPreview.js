config.macros.docPreview = {};
config.macros.docPreview.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var spec = $.parseJSON(store.getTiddlerText(window.activeDocument));
	createTiddlyElement(place, "br");
	createTiddlyElement(place, "br");
	config.macros.docPreview.recurse(place, spec, 0, []);
}

config.macros.docPreview.recurse = function(place, item, level, label) {
	level++;
	for(var e=0; e < item.length; e++) {
		if(label[level] == undefined)
			label[level] = 1;
		else
			label[level] ++;
		var title = createTiddlyElement(place,"h"+level, null, null, label.join(".").substr(1)+" : "+item[e].title);
		wikify(store.getTiddlerText(item[e].title), place);
		if(typeof item[e].children == "object") {
			config.macros.docPreview.recurse(place, item[e].children, level, label);
		}		
	}
}
