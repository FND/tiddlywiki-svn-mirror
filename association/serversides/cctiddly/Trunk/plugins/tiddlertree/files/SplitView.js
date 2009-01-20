// SplitView //

//{{{


var tabClick = function(e) {
var div = createTiddlyElement(null, "div");

log(e.id);
wikify( "<<SplitView "+e.id+">>", div);
$("#mainMenu").html("updared  "+div.innerHtml);

//document.getElementById("mainMenu").appendChild(div);
};
config.macros.SplitView={};
	
config.macros.SplitView.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.options.txtOpenType = "inline";
	config.macros.SplitView.refresh(place,macroName,params,wikifier,paramString,tiddler);
};

function lineBreakCount(str){
	/* counts \n */
	try {
		return((str.match(/[^\n]*\n[^\n]*/gi).length));
	} catch(e) {
		return 0;
	}
};
config.macros.SplitView.openType = function(showBoxTiddler, showBoxSlide, showBoxPopUp) {
	if(config.options.txtOpenType=="inline")
		return showBoxSlide();
}

config.macros.SplitView.editClick=function(){
			story.displayTiddler(null, this.parentNode.id.replace("HeadingView", ""));
}


config.macros.SplitView.strip=function(s) {
	return s.replace(" ",  "");
}

config.macros.SplitView.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	removeChildren(place);
	createTiddlyElement(place, "br");
 $("#example > ul").tabs();

console.log("here1", place);
	
	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");


	var showBoxSlide = function() {$("#newTiddlerDivContainer").slideToggle();};
	var showBoxTiddler = function() { alert("do nothing");};
	var showBoxPopUp = function() {$("#newTiddlerDiv").dialog({"height":"240px", "width":"400px", "dialogClass":"smmStyle", "position":['91100px','11100'],"show":"fadeIn"});};
	
//	createTiddlyButton(buttonHolder, "New Section", "click to create a new section", function() {config.macros.SplitView.openType(showBoxTiddler, showBoxSlide, showBoxPopUp); });

	wikify("<<newTiddler>>", buttonHolder);

	var newTiddlerContainerDiv = createTiddlyElement(place, "div", "newTiddlerDivContainer", "sort-handle-edit incomplete");
	newTiddlerContainerDiv.style.display = "none";
	var newTiddler = createTiddlyElement(newTiddlerContainerDiv, "div", "newTiddlerDiv", " flora");
	newTiddler.title = "Add New Section";
	tiddlerName = createTiddlyElement(newTiddler, "input", null, "sectionHeadingInput");
	tiddlerName.style['font-size'] = "2em";
	tiddlerName.name = "newTiddlerTitle";
	tiddlerName = createTiddlyElement(newTiddler, "br");
 	var textarea = createTiddlyElement(newTiddler, "textarea", "newTiddlerContent", "sectionBodyEdit");
	tiddlerName = createTiddlyElement(newTiddler, "br");
	var button = createTiddlyElement(newTiddler, "input", null, "button right");
	button.value = "Create Section";
	button.type = "button";
	button.onclick = function() {
		// TODO - should find a better way to get the new tiddler name value.
	// Something like this : 	document.forms["noteForm"].total.value 
		if(this.parentNode.firstChild.value==""){
			displayMessage("Please enter a value");
		}else{
			var newDate = new Date();	
			store.saveTiddler(params[0], params[0], "* "+this.parentNode.firstChild.value+"\n"+store.getTiddlerText(params[0]), config.options.txtUserName, newDate,"",config.defaultCustomFields);
			store.saveTiddler(this.parentNode.firstChild.value, this.parentNode.firstChild.value, document.getElementById("newTiddlerContent").value, config.options.txtUserName, newDate,"task",config.defaultCustomFields);
			autoSaveChanges();
			config.macros.SplitView.refresh(place,macroName,params,wikifier,paramString,tiddler);
		}
	};
	tiddlerName = createTiddlyElement(newTiddler, "br");

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
				var heading = createTiddlyElement(sectionDiv, "h"+level,  tiddlerTitle+"HeadingView", "sectionHeading ");
				
				createTiddlyText(heading, tiddlerTitle);
				
				//createTiddlyText(heading, tiddlerTitle+(assignment ? ("  - Assigned to: "+assignment+" ") : "  - Unassigned "));
				createTiddlyButton(heading,  "edit", "Click to edit this section", config.macros.SplitView.editClick, "button");
	
			 				
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