// tiddlerTree1 //

//{{{


config.macros.tiddlerTree1={};
	
config.macros.tiddlerTree1.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	
	console.log(params[0]);
	var treeSpec = store.getTiddlerText(params[0]); 
	var sections = treeSpec.split("\n");
	var parent = createTiddlyElement(place, "ul","sortableList", "page-list");
	for(var i = 0; i < sections.length; i++) {
		var matches = sections[i].match(/^(\*+) (.*)/)
		if (matches) {
			var level = matches[1].length;
			var tiddlerTitle = matches[2];
			if (level>prevLevel) {
				parent = createTiddlyElement(parent, "ul","sortableList", "page-list");
			} else if (level < prevLevel) {
				parent = parent.parentNode;
			}
			
			
			if(store.getTiddler(tiddlerTitle)){
			// If the tiddler exists 
				if(store.getTiddler(tiddlerTitle).fields.tt_status == "Complete")
					var sectionClass = "completed";
				else 
					var sectionClass = "incomplete";
				
				var section = createTiddlyElement(parent, "li", tiddlerTitle, "section clear-element page-item1 left ");
				var assignment = store.getTiddler(tiddlerTitle).fields['tt_user'];
				var sectionDiv = createTiddlyElement(section, "div", null, "sort-handle");
				var heading = createTiddlyElement(sectionDiv, "h"+level, null, "sectionHeading "+sectionClass);
				var link = createTiddlyLink(heading, tiddlerTitle, "edit", false);
				createTiddlyText(link, (assignment ? ("  - Assigned to: "+assignment) : "  - Unassigned"));
				
			//	createTiddlyLink(heading,tiddlerTitle, "edit","editLink");
				var body = createTiddlyElement(sectionDiv, "div", null, "sectionBody "+sectionClass, store.getTiddlerText(tiddlerTitle));
				var prevLevel = level;
			} else {
			// The tiddler does not exist
				var sectionClass = "incomplete";
				var section = createTiddlyElement(parent, "li", tiddlerTitle, "section clear-element page-item1 left ");
				var sectionDiv = createTiddlyElement(section, "div", null, "sort-handle");
				var heading = createTiddlyElement(sectionDiv, "h"+level, null, "sectionHeading "+sectionClass);
				var link = createTiddlyLink(heading,tiddlerTitle, "edit",false);
		
				var prevLevel = level;
			}

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
		//	store.saveTiddler(params[0], params[0], output);
		//	autoSaveChanges();
		},
		autoScroll: true,
		handle: '.sort-handle .sectionHeading'
	});

			
			$(".sectionHeading").hover(
				function() {
					console.log("made the hover");
					$(this).addClass("draggableOn");
				}, 
				function() {
					console.log("made the unhoverr");
					$(this).removeClass("draggableOn");
				}
			);


		}
	}
};
	

function log() { if (console) console.log.apply(console, arguments); };

//}}}