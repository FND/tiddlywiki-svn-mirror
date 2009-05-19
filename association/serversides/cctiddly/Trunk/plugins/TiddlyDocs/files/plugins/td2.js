var testSpec = {title:'Creation', children:
					[{title:'Growth', children: 
						[{title:'Language', children: []}]
					 },
					 {title:'Mowth', children: []},
					 {title:'Jowth', children: []}
					]
				}
			 

//tdoc2Outline //

//{{{
config.macros.tdoc2Outline={};

config.macros.tdoc2Outline.editClick=function(){
			story.displayTiddler(null, this.parentNode.id.replace("HeadingView", ""));
}

config.macros.tdoc2Outline.strip=function(s) {
	return s.replace(" ",  "");
}

config.macros.tdoc2Outline.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.options.txtOpenType = "inline";
	console.log("called");
	config.macros.tdoc2Outline.refresh(place,macroName,params,wikifier,paramString,tiddler);
};


var ulCount=0, liCount=0, divCount=0;
config.macros.tdoc2Outline.renderSpec = function(place, spec) {
	console.log("ul", ulCount, "li", liCount, "title", spec.title)
	var ul = createTiddlyElement(place, "ul", "ul"+(ulCount++), "");
    var li = createTiddlyElement(ul, "li", "li"+liCount++, "");
	createTiddlyElement(li, "div", "div"+divCount++, "sort-handle", spec.title);
 	// for (var child in spec.children) {
	console.log("The children", spec.children)
	$.each(spec.children, function() {
		console.log("Rendering child", this)
		config.macros.tdoc2Outline.renderSpec(li, this);
	});
}

config.macros.tdoc2Outline.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	console.log("ref");
	var prevLevel = 0;
	var nodeCount = 0;
	
	config.macros.tdoc2Outline.renderSpec(place, testSpec);
	
	// removeChildren(place);
//top nav 



/*
	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");
	window.activeDocument = params[0];
	var btn = createTiddlyButton(buttonHolder, "new", "New Section", config.macros.newTiddler.onClickNewTiddler, null, null, null, null, "http://www.iconspedia.com/uploads/578075880.png");
	btn.setAttribute("newTitle","New Section Title");
	btn.setAttribute("newTemplate",getParam(params,"template","mpTheme##newEditTemplate"));
	

	var displaySettings= function () {
		story.displayTiddler(null, "Settings");
	};
	createTiddlyButton(buttonHolder, "settings", "Personalise TiddlyDocs", displaySettings, null, null, null, null, "http://dryicons.com/images/icon_sets/aesthetica_version_2/png/128x128/community_users.png");
	createTiddlyElement(place, "br");
	createTiddlyElement(place, "br");
	createTiddlyElement(place, "br");
	var counter = 0;
	var treeSpec = store.getTiddlerText(params[0]); 
	if(treeSpec){
		var sections = treeSpec.split("\n");
		var parent = createTiddlyElement(place, "ul","node"+(counter++), "sortableToc page-list");
		var levelCount = [1];
  		for(var i = 0; i < sections.length; i++) {
			
			var matches = sections[i].match(/^(\*+) (.*)/);
			if (matches) {
				var level = matches[1].length;
				var tiddlerTitle = matches[2];
				if (level>prevLevel) {
					parent = createTiddlyElement(parent, "ul","node"+(counter++), "sortableToc page-list");	
					levelCount.push(1);				
				} else if (level < prevLevel) {
					parent = parent.parentNode;
					levelCount.pop();				
					levelCount[levelCount.length-1]++;
				} else if (level==prevLevel) {
					levelCount[levelCount.length-1]++;
				};
				if(!store.getTiddler(tiddlerTitle)){
					store.saveTiddler(tiddlerTitle, tiddlerTitle, "", config.options.txtUserName, new Date(),"task" );
					autoSaveChanges(false, tiddlerTitle);
				}
				if(store.getTiddler(tiddlerTitle).fields.tt_status == "Complete")
					var sectionClass = "completed";
				else 
					var sectionClass = "incomplete";
				var section = createTiddlyElement(parent, "li", config.macros.tdoc2Outline.strip(tiddlerTitle), "section clear-element page-item1 left");
				var assignment = store.getTiddler(tiddlerTitle).fields['tt_user'];
				var sectionDiv = createTiddlyElement(section, "div", tiddlerTitle+"ViewContainer", "sort-handle " +sectionClass);
				var heading = createTiddlyElement(sectionDiv, "div",  tiddlerTitle+"HeadingView", "sectionHeading heading"+level);		
				createTiddlyText(heading, levelCount.join(".")+" : "+tiddlerTitle);
				var prevLevel = level;			
				//  Make the lists sortable 
				$(".sortableToc").NestedSortable({
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
					autoSaveChanges(true, params[0]	);
					},
					autoScroll: true,
					handle: '.sort-handle '
				});	
				
				
			}
		}
		
	}
	
	*/
}	

//}}}

function log() { if (console) console.log.apply(console, arguments); };

//}}}