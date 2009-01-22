config.macros.printTree={};
	
config.macros.printTree.handler=function(place,macroName,params,wikifier,paramString,tiddler){

var srcWindow = window.open("","sourceWindow","width=700,height=900");
	var srcDocument = srcWindow.document;
	// Jam in the text template
	srcDocument.write("<html><head></head><body><div id='printedVersion'></div></body></html>");
	srcDocument.close();
	var marker = srcDocument.getElementById("printedVersion");
	var treeSpec = store.getTiddlerText(params[0]); 
	if(treeSpec){
		var sections = treeSpec.split("\n");
		var parent = createTiddlyElement(marker, "ul");
		for(var i = 0; i < sections.length; i++) {
			var matches = sections[i].match(/^(\*+) (.*)/)
			if (matches) {
				var level = matches[1].length;
				var tiddlerTitle = matches[2];
				if (level>prevLevel) {
					parent = createTiddlyElement(parent, "ul");
				} else if (level < prevLevel) {
					parent = parent.parentNode;
				}
			}
			var heading = createTiddlyElement(marker, "h"+level, null, null,   tiddlerTitle);
			wikify(store.getTiddlerText(tiddlerTitle),marker);
			var prevLevel = level;			
		}
	}
	
};

function log() { if (console) console.log.apply(console, arguments); };

//}}}