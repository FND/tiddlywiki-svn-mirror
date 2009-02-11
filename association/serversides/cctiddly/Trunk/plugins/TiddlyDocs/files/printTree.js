config.macros.printTree={};

config.macros.printTree.handler=function(place,macroName,params,wikifier,paramString,tiddler){
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
			store.saveTiddler(params[0]+' Print Preview', params[0]+' Print Preview', htmlString, config.options.txtUserName, newDate,"",config.defaultCustomFields);
			story.displayTiddler(null, params[0]+' Print Preview');
			doHttp('POST',url+'plugins/tiddlertree/files/createHtmlFile.php','workspace_name='+workspace+'&html='+encodeURIComponent(htmlString)+'&compositionTiddler='+params[0],null,null,null,config.macros.printTree.saveCallback,params);		
		}
	};



// print button 
		var btn = createTiddlyElement(place, "a", null, "button");
		btn.onclick = onClickPrint;
		var img = createTiddlyElement(btn, "img");
		img.style.width = "10px";
		img.style.height="10px";
		img.src = "http://www.iconspedia.com/uploads/1543439043.png";
		createTiddlyText(btn, " Print");
		btn.setAttribute("href","javascript:;");



//	createTiddlyButton(place, "print", "Print the entire document", onClickPrint);
};

config.macros.printTree.saveCallback=function(status,context,responseText,uri,xhr) {
	
		log(responseText);
	window.open(responseText,'','scrollbars=yes,menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
}

function log() { if (console) console.log.apply(console, arguments); };

//}}}