// tiddlerTree1 //

//{{{

config.macros.tiddlerTree1={};
	
config.macros.tiddlerTree1.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.macros.tiddlerTree1.refresh(place,macroName,params,wikifier,paramString,tiddler);
};

function lineBreakCount(str){
	/* counts \n */
	try {
		return((str.match(/[^\n]*\n[^\n]*/gi).length));
	} catch(e) {
		return 0;
	}
};


config.macros.tiddlerTree1.doneClick=function(){
		var tiddlerTitle = this.id.replace("DoneButton","");
		var form = document.forms[tiddlerTitle+"Form"];
		var body = $("#"+tiddlerTitle+"BodyDiv");
		var editDiv = form.parentNode;
		var viewDiv = form.parentNode.parentNode.firstChild;
		log($(viewDiv).slideDown());
		$(editDiv).hide();
		body.value = form.body.value;
		body.rows = lineBreakCount(form.body.value)+6;
		$("#"+tiddlerTitle+"BodyDiv").replaceWith(form.body.value); 
		if(!store.tiddlerExists(form.heading.value))
			var oldTitle = "";
		else 
			var oldTitle = form.heading.value;
		store.saveTiddler(oldTitle, form.heading.value, form.body.value);
		autoSaveChanges();	
};

config.macros.tiddlerTree1.editClick=function(){
		$(this.parentNode.parentNode).hide();
		$(this.parentNode.parentNode.nextSibling).show();
}

config.macros.tiddlerTree1.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	removeChildren(place);
	createTiddlyElement(place, "br");
//	var showBox = function() {$("#newTiddlerDiv").dialog({"height":"240px", "width":"400px", "dialogClass":"smmStyle", "position":['91100px','11100'],"show":"fadeIn"});};
	var showBox = function() {$("#newTiddlerDivContainer").slideToggle();};
	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");
	createTiddlyButton(buttonHolder, "New Section", "click to create a new section", showBox);
	createTiddlyButton(buttonHolder, "Print");
	createTiddlyElement(place, "br");
	var newTiddlerContainerDiv = createTiddlyElement(place, "div", "newTiddlerDivContainer");
	newTiddlerContainerDiv.style.display = "none";
	var newTiddler = createTiddlyElement(newTiddlerContainerDiv, "div", "newTiddlerDiv", " flora");
	newTiddler.title = "Add New Section";
	tiddlerName = createTiddlyElement(newTiddler, "input");
	tiddlerName.name = "newTiddlerTitle";
	tiddlerName = createTiddlyElement(newTiddler, "br");
 	var textarea = createTiddlyElement(newTiddler, "textarea", "newTiddlerContent");
	tiddlerName = createTiddlyElement(newTiddler, "br");
	var button = createTiddlyElement(newTiddler, "input");
	button.value = "Create Section";
	button.type = "button";
	button.onclick = function() {
		// TODO - should find a better way to get the new tiddler name value.
	// Something like this : 	document.forms["noteForm"].total.value 
		if(this.parentNode.firstChild.value==""){
			displayMessage("Please enter a value");
		}else{
			if(!store.tiddlerExists(params[0]))
				store.createTiddler(params[0]);
			store.saveTiddler(params[0], params[0], "* "+this.parentNode.firstChild.value+"\n"+store.getTiddlerText(params[0]));
			store.saveTiddler(this.parentNode.firstChild.value, this.parentNode.firstChild.value, document.getElementById("newTiddlerContent").value);
			autoSaveChanges();
			config.macros.tiddlerTree1.refresh(place,macroName,params,wikifier,paramString,tiddler);
		}
	};
	var treeSpec = store.getTiddlerText(params[0]); 
	
	// editClick removed from here 
	
	
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
				if(store.getTiddler(tiddlerTitle)){
				// If the tiddler exists 
					if(store.getTiddler(tiddlerTitle).fields.tt_status == "Complete")
						var sectionClass = "completed";
					else 
						var sectionClass = "incomplete";
					var section = createTiddlyElement(parent, "li", tiddlerTitle, "section clear-element page-item1 left ");
					var assignment = store.getTiddler(tiddlerTitle).fields['tt_user'];
					var sectionDiv = createTiddlyElement(section, "div", tiddlerTitle+"ViewContainer", "sort-handle " +sectionClass);
					var heading = createTiddlyElement(sectionDiv, "h"+level,  tiddlerTitle+"HeadingView", "sectionHeading ");
					createTiddlyText(heading, tiddlerTitle+(assignment ? ("  - Assigned to: "+assignment) : "  - Unassigned"));
					createTiddlyButton(heading, "edit", "Click to edit this section", config.macros.tiddlerTree1.editClick, "right");
					var body = createTiddlyElement(sectionDiv, "textarea", tiddlerTitle+"BodyDiv", "sectionBody", store.getTiddlerText(tiddlerTitle));
					body.rows = lineBreakCount(store.getTiddlerText(tiddlerTitle))+6;
					body.disabled = true;
					var prevLevel = level;
				} else {
				// The tiddler does not exist
					var sectionClass = "incomplete";
					var section = createTiddlyElement(parent, "li", tiddlerTitle, "section clear-element page-item1 left ");
					var sectionDiv = createTiddlyElement(section, "div", tiddlerTitle+"ViewContainer", "sort-handle " +sectionClass);
					var heading = createTiddlyElement(sectionDiv, "h"+level, tiddlerTitle+"HeadingView", "sectionHeading");
					
					createTiddlyText(heading, tiddlerTitle+" - Not Started");
					createTiddlyButton(heading, "edit", "Click to edit this section", config.macros.tiddlerTree1.editClick, "right");
							var body = createTiddlyElement(sectionDiv, "textarea", tiddlerTitle+"BodyDiv", "sectionBody", store.getTiddlerText(tiddlerTitle));
			
					var prevLevel = level;
				}
				
				var sectionEditDiv = createTiddlyElement(section, "div", tiddlerTitle+"BodyDivEditView", "sort-handle-edit "+sectionClass);
				sectionEditDiv.style.display = "none";
				var form = createTiddlyElement(sectionEditDiv, "form");
			 	form.name = tiddlerTitle+"Form";
				var headingInput = createTiddlyElement(form, "input",  "heading", "sectionHeading ");
				headingInput.style.width = "70%";
				headingInput.style.size = "2em";
				headingInput.value = tiddlerTitle;
	
				
				var editButton = createTiddlyButton(form, "Done", "Click to Save", config.macros.tiddlerTree1.doneClick, "right");
		
	
				var bodyEdit = createTiddlyElement(form, "textarea", "body", "sectionBodyEdit", store.getTiddlerText(tiddlerTitle));
				bodyEdit.rows = lineBreakCount(store.getTiddlerText(tiddlerTitle))+1;
				bodyEdit.onkeyup = function() {
					this.rows = lineBreakCount(this.value)+1;
				}
			//	wikify(store.getTiddlerText("TaskTiddlerControls"), sectionEditDiv);
				wikify("|assigned to |<<ValueSwitcher type:'dropdown' valuesSource:'UserDefinitions' tiddler:'"+tiddlerTitle+"'>> |status |<<ValueSwitcher type:'dropdown' valuesSource:'StatusDefinitions' tiddler:'"+tiddlerTitle+"'>> |", sectionEditDiv);
				
				

				
				createTiddlyElement(sectionEditDiv, "br");
				var editButton = createTiddlyElement(sectionEditDiv, "input", tiddlerTitle+"DoneButton");
				editButton.type = "button";
				editButton.value = "Done";
				
				$(editButton).click(config.macros.tiddlerTree1.doneClick); 

				var  editDblClick = function(e) {
					$(e.target.parentNode).slideToggle();
					$("#"+e.target.id+"EditView").slideToggle();
				};
				$(body).dblclick(editDblClick); 
			
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