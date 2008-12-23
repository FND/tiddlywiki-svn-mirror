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
	log(this);
		var tiddlerTitle = this.id.replace("DoneButton","");
		var form = document.forms[tiddlerTitle+"Form"];
		var body = $("#"+tiddlerTitle+"BodyDiv");
		var editDiv = form.parentNode;
		var viewDiv = form.parentNode.parentNode.firstChild;
		$(editDiv).slideToggle("fast");
		$(viewDiv).show();
		//	team tasks specific 
		var taskStatus = store.getValue(store.getTiddler(tiddlerTitle),"tt_status");
		if (taskStatus=="Complete") {
			$(viewDiv).addClass("completed");
			$(viewDiv).removeClass("incomplete");
			$(editDiv).addClass("completed");
			$(editDiv).removeClass("incomplete");
		} else {
			$(viewDiv).addClass("incomplete");
			$(viewDiv).removeClass("completed");					
			$(editDiv).addClass("incomplete");
			$(editDiv).removeClass("completed");					
		}
		// end team tasks specific
		
		log(wikifyStatic(form.body.value));
		$(body).html(wikifyStatic(form.body.value));
		if(!store.tiddlerExists(form.heading.value))
			var oldTitle = "";
		else 
			var oldTitle = form.heading.value;
		store.saveTiddler(oldTitle, form.heading.value, form.body.value);
		autoSaveChanges();	
};

config.macros.tiddlerTree1.editClick=function(){
//		var tiddlerName = this.parentNode.id.replace("ViewContainer", "");

		$(this.parentNode.nextSibling).slideToggle("fast");
		$(this.parentNode).hide();
}

config.macros.tiddlerTree1.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	removeChildren(place);
	createTiddlyElement(place, "br");
//	var showBox = function() {$("#newTiddlerDiv").dialog({"height":"240px", "width":"400px", "dialogClass":"smmStyle", "position":['91100px','11100'],"show":"fadeIn"});};
	var showBox = function() {$("#newTiddlerDivContainer").slideToggle();};
	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");
	createTiddlyButton(buttonHolder, "New Section", "click to create a new section", showBox);
//	createTiddlyButton(buttonHolder, "Print");
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
			var newDate = new Date();	
			store.saveTiddler(params[0], params[0], "* "+this.parentNode.firstChild.value+"\n"+store.getTiddlerText(params[0]), config.options.txtUserName, newDate,"",config.defaultCustomFields);
			store.saveTiddler(this.parentNode.firstChild.value, this.parentNode.firstChild.value, document.getElementById("newTiddlerContent").value, config.options.txtUserName, newDate,"",config.defaultCustomFields);
			autoSaveChanges();
			config.macros.tiddlerTree1.refresh(place,macroName,params,wikifier,paramString,tiddler);
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
				if(store.getTiddler(tiddlerTitle).fields.tt_status == "Complete")
					var sectionClass = "completed";
				else 
					var sectionClass = "incomplete";
				var section = createTiddlyElement(parent, "li", tiddlerTitle, "section clear-element page-item1 left ");
				var assignment = store.getTiddler(tiddlerTitle).fields['tt_user'];
				var sectionDiv = createTiddlyElement(section, "div", tiddlerTitle+"ViewContainer", "sort-handle " +sectionClass);
				var heading = createTiddlyElement(sectionDiv, "h"+level,  tiddlerTitle+"HeadingView", "sectionHeading ");
				createTiddlyText(heading, tiddlerTitle+(assignment ? ("  - Assigned to: "+assignment) : "  - Unassigned"));
				createTiddlyButton(sectionDiv, "edit", "Click to edit this section", config.macros.tiddlerTree1.editClick, "right button");
				var body = createTiddlyElement(sectionDiv, "div", tiddlerTitle+"BodyDiv", "sectionBody", store.getTiddlerText(tiddlerTitle));
				$(body).html(wikifyStatic(store.getTiddlerText(tiddlerTitle)));
				body.rows = lineBreakCount(store.getTiddlerText(tiddlerTitle))+2;
				//body.disabled = true;
				var editDblClick = function(e) {
					$(e.target.parentNode).slideToggle("fast");
					$("#"+e.target.id+"EditView").slideToggle("fast");
				};
				$(body).dblclick(editDblClick); 				
				var prevLevel = level;			
				var sectionEditDiv = createTiddlyElement(section, "div", tiddlerTitle+"BodyDivEditView", "sort-handle-edit "+sectionClass);
				sectionEditDiv.style.display = "none";

				var form = createTiddlyElement(sectionEditDiv, "form", null, "editForm");
			 	form.name = tiddlerTitle+"Form";


				var headingInput = createTiddlyElement(form, "input",  "heading", "sectionHeading ");
				headingInput.value = tiddlerTitle;

// create button 
				var editButton = createTiddlyElement(form, "input", tiddlerTitle+"DoneButton", "button right doneButton");
				editButton.type = "button";
editButton.style.float = "right";
				editButton.value = "done";
				$(editButton).click(config.macros.tiddlerTree1.doneClick); 
// end create button

				wikify("<br />\n assigned to <<ValueSwitcher type:'dropdown' valuesSource:'UserDefinitions' tiddler:'"+tiddlerTitle+"'>>  status <<ValueSwitcher type:'dropdown' valuesSource:'StatusDefinitions' tiddler:'"+tiddlerTitle+"'>><br />\n", form);
				var bodyEdit = createTiddlyElement(form, "textarea", "body", "sectionBodyEdit", store.getTiddlerText(tiddlerTitle));
				bodyEdit.rows = lineBreakCount(store.getTiddlerText(tiddlerTitle))+1;
				bodyEdit.onkeyup = function() {
					this.rows = lineBreakCount(this.value)+1;
				}
				createTiddlyElement(form, "br");
				createTiddlyElement(form, "br");


// create button 
				var editButton = createTiddlyElement(form, "input", tiddlerTitle+"DoneButton", "button");
				editButton.type = "button";
				editButton.value = "done";
				$(editButton).click(config.macros.tiddlerTree1.doneClick); 
// end create button

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