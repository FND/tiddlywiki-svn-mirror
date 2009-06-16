// docPrint //

config.macros.docPrint = {};

config.macros.docPrint.handler =  function(place, macroName, params, wikifier, paramString, tiddler) {		
	createTiddlyButton(place, "print", "Download a printable PDF version of the document.", config.macros.docPrint.onClickPrint, null, null, null, null, "http://www.medici.com.au/img/print_icon.png");
}

config.macros.docPrint.onClickPrint = function() {
    var spec = $.parseJSON(store.getTiddlerText(window.activeDocument));
	var html  = "<html><body>"+config.macros.docPrint.recurse([], spec,  0, []).join("\n")+"</body></html>";
	doHttp('POST',url+'plugins/TiddlyDocs/files/createHtmlFile.php','workspace_name='+workspace+'&html='+encodeURIComponent(html)+'&compositionTiddler='+window.activeDocument,null,null,null,config.macros.docPrint.saveCallback,params);		
};

config.macros.docPrint.recurse = function(html, item, level, label) {
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
			config.macros.docPrint.recurse(html, item[e].children, level, label);
    }
    return html;
};

config.macros.docPrint.saveCallback=function(status,context,responseText,uri,xhr) {
	window.open("http://osmosoft.com/~psd/html2pdf/?uri="+responseText,'','scrollbars=yes,menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
}