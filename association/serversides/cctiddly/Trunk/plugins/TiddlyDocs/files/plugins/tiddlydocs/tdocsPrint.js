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
        if (label[level] === undefined){
        	label[level] = 1;
       }else{
        	label[level]++;
		}
        while (label.length > level + 1){
        	label.splice(level + 1);
        }

		console.log("b");
		html.push("<h" + level + ">" + label.join(".").substr(1) + " : " + item[e].title+"</h" + level + ">");
        html.push(wikifyStatic(store.getTiddlerText(item[e].title)));

		console.log("c");
        if (item[e].children.length > 0) {
	
//			console.log("d",html, item[e].children, level, label);
	config.macros.docPrint.recurse(html, item[e].children, level, label);
        }

		console.log("e");
    }
    return html;
};

config.macros.docPrint.saveCallback=function(status,context,responseText,uri,xhr) {
	console.log(responseText);
//	window.open("http://osmosoft.com/~psd/html2pdf/?uri="+responseText,'','scrollbars=yes,menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
}

/*
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

*/
