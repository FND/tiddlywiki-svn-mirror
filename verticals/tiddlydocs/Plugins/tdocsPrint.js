config.macros.docPrint = {};
config.macros.docPrint.handler =  function(place, macroName, params, wikifier, paramString, tiddler) {		
	createTiddlyButton(place, "print", "Download a printable PDF version of the document.", config.macros.docPrint.onClickPrint, null, null, null, null, "/static/mydocs_images/icon_print.jpg");
}

config.macros.docPrint.onClickPrint = function() {
	var newLoc = window.location.toString();	
	newLoc = newLoc.replace('.wiki', '')+'.rtf';
	window.open(newLoc,'','scrollbars=yes,menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
};


