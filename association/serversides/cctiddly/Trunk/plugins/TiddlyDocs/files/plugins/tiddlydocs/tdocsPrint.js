

// docPrint //
config.macros.docPrint={};

config.macros.docPrint.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var treeSpec = store.getTiddlerText(params[0]); 
	var onClickPrint = function() {
		var htmlStack = ["<html><head></head><body>"];
		if(treeSpec){
			var sections = treeSpec.split("\n");
			for(var i = 0; i < sections.length; i++) {
				var matches = sections[i].match(/^(\*+) (.*)/)
				if (matches) {
					var level = matches[1].length;
					var tiddlerTitle = matches[2];
				}		
				htmlStack.push("<h"+level+">"+tiddlerTitle+"</h"+level+">");
				htmlStack.push(wikifyStatic(store.getTiddlerText(tiddlerTitle)));
				var prevLevel = level;			
			}
			htmlStack.push("</body></html>")
			var htmlString = htmlStack.join("\n");
			newDate = new Date();
			var name = "Please wait..";
			store.saveTiddler(name, name, "Creating PDF file of "+params[0]+" for printing. You should be prompted to download a .pdf file shortly.", config.options.txtUserName, newDate,"",config.defaultCustomFields);
			story.displayTiddler(null, name);
		doHttp('POST',url+'plugins/TiddlyDocs/files/createHtmlFile.php','workspace_name='+workspace+'&html='+encodeURIComponent(htmlString)+'&compositionTiddler='+params[0],null,null,null,config.macros.docPrint.saveCallback,params);		
//displayMessage("made it to here1");

//			doHttp('GET',"http://wiki.osmosoft.com/TiddlyDocs/plugins/tiddlertree/files/createHtmlFile.php",'workspace_name='+workspace+'&html='+encodeURIComponent(htmlString)+'&compositionTiddler='+params[0]+"3",null,null,null,config.macros.docPrint.saveCallback,params);		
//displayMessage("made it to here2");

		}
	};
	// print button 
	createTiddlyButton(place, "print", "Download a printable PDF version of the document.", onClickPrint, null, null, null, null, "http://www.medici.com.au/img/print_icon.png");

};

config.macros.docPrint.saveCallback=function(status,context,responseText,uri,xhr) {
//	console.log(responseText);
	window.open("http://osmosoft.com/~psd/html2pdf/?uri="+responseText,'','scrollbars=yes,menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
}