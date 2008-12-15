


// tiddlerTree1 //

//{{{


config.macros.tiddlerTree1={};
	
config.macros.tiddlerTree1.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var treeSpec = store.getTiddlerText(params[0]); 
	log(treeSpec);
	var sections = treeSpec.split("\n");
	var parent = createTiddlyElement(place, "ol");
	for(var i = 0; i < sections.length; i++) {
		var matches = sections[i].match(/^(\*+) (.*)/)
		if (matches) {
			var level = matches[1].length
			var tiddlerTitle = matches[2];
			console.log(parent, level, prevLevel);
			if (level>prevLevel) {
				parent = createTiddlyElement(parent, "ol");
			} else if (level < prevLevel) {
				parent = parent.parentNode;
			}
			var section = createTiddlyElement(parent, "li", null, "section");
			var heading = createTiddlyElement(section, "h"+level, null, null, tiddlerTitle);
			wikify("[["+tiddlerTitle+"]]", section);
			
			log(store.getTiddlerText(tiddlerTitle));
			var body = createTiddlyElement(section, "div", null, null, store.getTiddlerText(tiddlerTitle));
			var prevLevel = level;
		}
	}
};
	

function log() { if (console) console.log.apply(console, arguments); };

//}}}










