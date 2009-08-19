config.macros.docPreview = {};
config.macros.docPreview.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var spec = jQuery.parseJSON(store.getTiddlerText(window.activeDocument));
	createTiddlyElement(place, "br");
	createTiddlyElement(place, "br");
	var html = config.macros.docPrint.recurse([], spec,  0, []).join("\n");
console.log('html is ', html);
	var x = window.open('', '', 'scrollbars=yes,menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
	x.document.write(html);
}

config.macros.docPreview.recurse = function(html, item, level, label) {
    level++;
    for (var e = 0; e < item.length; e++) {
        if (label[level] === undefined)
        	label[level] = 1;
       else
        	label[level]++;
        while (label.length > level + 1)
        	label.splice(level + 1);
		html.push("<h" + level + ">" + label.join(".").substr(1) + " : " + item[e].title+"</h" + level + ">");
        html.push(wikifyStatic(store.getTiddlerText(item[e].title)));
        if (item[e].children.length > 0)
			config.macros.docPreview.recurse(html, item[e].children, level, label);
    }
    return html;
};

