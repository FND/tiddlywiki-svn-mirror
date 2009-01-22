// SplitView //

//{{{

config.macros.SplitView={};

config.macros.SplitView.editClick=function(){
			story.displayTiddler(null, this.parentNode.id.replace("HeadingView", ""));
}

config.macros.SplitView.strip=function(s) {
	return s.replace(" ",  "");
}

config.macros.SplitView.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.options.txtOpenType = "inline";
	config.macros.SplitView.refresh(place,macroName,params,wikifier,paramString,tiddler);
};

config.macros.SplitView.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	removeChildren(place);
	createTiddlyElement(place, "br");
	//top nav 
	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");
	wikify("<<newTiddler>> {{button{[["+params[0]+"]]}}}", buttonHolder);
	createTiddlyElement(place, "br");

	var treeSpec = store.getTiddlerText(params[0]); 
	if(treeSpec){
		var sections = treeSpec.split("\n");
		var parent = createTiddlyElement(place, "ul","sortableList", "page-list");
		for(var i = 0; i < sections.length; i++) {
			
			var matches = sections[i].match(/^(\*+) (.*)/)
			if (matches) {
				var level = matches[1].length;
				var tiddlerTitle = matches[2];
				if (level>prevLevel) {
						log("n", level, "pl", prevLevel);
					
					parent = createTiddlyElement(parent, "ul","sortableList", "page-list");
				} else if (level < prevLevel) {
					parent = parent.parentNode;
				}
				if(!store.getTiddler(tiddlerTitle)){
					var newDate = new Date();
					store.saveTiddler(tiddlerTitle, tiddlerTitle, "", config.options.txtUserName, newDate,"",config.defaultCustomFields);
				}
				if(store.getTiddler(tiddlerTitle).fields.tt_status == "Accepted")
					var sectionClass = "completed";
				else 
					var sectionClass = "incomplete";
				var section = createTiddlyElement(parent, "li", tiddlerTitle, "section clear-element page-item1 left ");
				var assignment = store.getTiddler(tiddlerTitle).fields['tt_user'];
				var sectionDiv = createTiddlyElement(section, "div", tiddlerTitle+"ViewContainer", "sort-handle " +sectionClass);
				var heading = createTiddlyElement(sectionDiv, "div",  tiddlerTitle+"HeadingView", "sectionHeading ");		
				createTiddlyText(heading, tiddlerTitle);
				//	createTiddlyText(heading, tiddlerTitle+(assignment ? ("  - Assigned to: "+assignment+" ") : "  - Unassigned "));
				createTiddlyButton(heading,  "edit", "Click to edit this section", config.macros.SplitView.editClick, "button right");			
				var prevLevel = level;			
				//  Make the lists sortable 
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
					store.saveTiddler(params[0], params[0], output);
					autoSaveChanges();
					},
					autoScroll: true,
					handle: '.sort-handle .sectionHeading'
				});	
				// set the style when hovering over each item
				$(".sectionHeading").hover(
					function() {
						$(this).addClass("draggableOn");
					}, 
					function() {
						$(this).removeClass("draggableOn");
					}
				);
			}
		}
	}
}	

function log() { if (console) console.log.apply(console, arguments); };

//}}}