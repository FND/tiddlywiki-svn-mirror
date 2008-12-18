// tiddlerTree1 //

//{{{


config.macros.tiddlerTree1={};
	
config.macros.tiddlerTree1.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var treeSpec = store.getTiddlerText(params[0]); 
	var sections = treeSpec.split("\n");
	var parent = createTiddlyElement(place, "ul","sortableList", "page-list");
	for(var i = 0; i < sections.length; i++) {
		var matches = sections[i].match(/^(\*+) (.*)/)
		if (matches) {
			var level = matches[1].length
			var tiddlerTitle = matches[2];
			if (level>prevLevel) {
				parent = createTiddlyElement(parent, "ul","sortableList", "page-list");
			} else if (level < prevLevel) {
				parent = parent.parentNode;
			}
			
			if(store.getTiddler(tiddlerTitle).fields['tt_status'] == "Complete")
				var sectionClass = "completed";
			else 
				var sectionClass = "incomplete";
				
				
			var section = createTiddlyElement(parent, "li", tiddlerTitle, "section clear-element page-item1 left "+sectionClass);
			
			var sectionDiv = createTiddlyElement(section, "div", null, "sort-handle");
			var heading = createTiddlyElement(sectionDiv, "h"+level, null, null, tiddlerTitle);
			
			
	
			
			createTiddlyLink(sectionDiv,tiddlerTitle, "edit","editLink");
			log(store.getTiddler(tiddlerTitle).fields['tt_status']);
			
			
			var body = createTiddlyElement(sectionDiv, "div", null, null, store.getTiddlerText(tiddlerTitle));
			var prevLevel = level;


	$("#sortableList").NestedSortable({
		accept: 'page-item1',
		opacity: .6,
		helperclass: 'helper',
		onChange: function(serialized) {
			var output = "";
			$("li").each(function (i) {
				
				
					if($(this).parents(".page-list").length != 0) {
						
						var stars = "********************************************************";
						output += stars.substring(0, $(this).parents(".page-list").length);
						output += " "+this.id+"\n";
					}			
			 });
			log(output);
			
			store.saveTiddler(params[0], params[0], output);
			autoSaveChanges();
		},
		autoScroll: true,
		handle: '.sort-handle'
	});



		}
	}
};
	

function log() { if (console) console.log.apply(console, arguments); };

//}}}