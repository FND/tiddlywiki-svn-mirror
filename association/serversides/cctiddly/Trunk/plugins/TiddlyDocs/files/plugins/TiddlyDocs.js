config.commands.saveSection = {};

merge(config.commands.saveSection,{
	text: "save section",
	tooltip: "Save changes to this section"});

config.commands.saveSection.handler = function(event,src,title)
{
	var tiddlerElem = story.getTiddler(title);
	if(tiddlerElem) {
		var fields = {};
		story.gatherSaveFields(tiddlerElem,fields);
		var newTitle = fields.title || title;
		if(!store.tiddlerExists(newTitle))
			newTitle = newTitle.trim();
	}
	if(!store.tiddlerExists(newTitle)) {
		var spec = "* "+newTitle+"\n"+store.getTiddlerText(window.activeDocument);
	}
	store.saveTiddler(newTitle, newTitle, fields.text, config.options.txtUserName, new Date(), "task");
	store.saveTiddler(window.activeDocument, window.activeDocument, spec);
	autoSaveChanges();
	story.closeTiddler(title);
	story.displayTiddler(null, newTitle);
	return false;
};


//docOutline //

//{{{

config.macros.docOutline={};

config.macros.docOutline.editClick=function(){
			story.displayTiddler(null, this.parentNode.id.replace("HeadingView", ""));
}

config.macros.docOutline.strip=function(s) {
	return s.replace(" ",  "");
}

config.macros.docOutline.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.options.txtOpenType = "inline";
	config.macros.docOutline.refresh(place,macroName,params,wikifier,paramString,tiddler);
};

config.macros.docOutline.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	removeChildren(place);
//top nav 
	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");
	if(config.options.chkDrawings)
		wikify("| [[Drawings]] | <<newDrawing>>  ", buttonHolder);
	wikify("<<docPrint "+params[0]+">>", buttonHolder);
	window.activeDocument = params[0];
/// new tiddler button 
	var btn = createTiddlyElement(buttonHolder, "a", null, "button");
	btn.onclick = config.macros.newTiddler.onClickNewTiddler;
	btn.setAttribute("newTitle","New Section");
	btn.setAttribute("newTemplate","mpTheme##newEditTemplate");
	var img = createTiddlyElement(btn, "img");
	img.style.width = "10px";
	img.style.height="10px";
	img.src = "http://www.iconspedia.com/uploads/578075880.png";
	createTiddlyText(btn, " New");
	btn.setAttribute("href","javascript:;");
/// users button
	var btn = createTiddlyElement(buttonHolder, "a", null, "button");
	btn.onclick = function () {
		story.displayTiddler(null, "Settings");
	};
	var img = createTiddlyElement(btn, "img");
	img.style.width = "10px";
	img.style.height="10px";
	img.src = "http://dryicons.com/images/icon_sets/aesthetica_version_2/png/128x128/community_users.png";
	createTiddlyText(btn, " Settings");
	btn.setAttribute("href","javascript:;");		

	createTiddlyElement(place, "br");
	var treeSpec = store.getTiddlerText(params[0]); 
	if(treeSpec){
		var sections = treeSpec.split("\n");
		var parent = createTiddlyElement(place, "ul","sortableList", "page-list");
		
		var levelCount = [1];

		
  		for(var i = 0; i < sections.length; i++) {
			var matches = sections[i].match(/^(\*+) (.*)/)
			if (matches) {
				var level = matches[1].length;
				var tiddlerTitle = matches[2];
				

				if (level>prevLevel) {
					parent = createTiddlyElement(parent, "ul","sortableList", "page-list");	
					levelCount.push(1);				
				} else if (level < prevLevel) {
					parent = parent.parentNode;
					levelCount.pop();				
					levelCount[levelCount.length-1]++;
				} else if (level==prevLevel) {
					levelCount[levelCount.length-1]++;
				};
				
				
				if(!store.getTiddler(tiddlerTitle)){
					var newDate = new Date();
					store.saveTiddler(tiddlerTitle, tiddlerTitle, "", config.options.txtUserName, newDate,"task",config.defaultCustomFields);
				}
				if(store.getTiddler(tiddlerTitle).fields.tt_status == "Accepted")
					var sectionClass = "completed";
				else 
					var sectionClass = "incomplete";
				var section = createTiddlyElement(parent, "li", tiddlerTitle, "section clear-element page-item1 left ");
				var assignment = store.getTiddler(tiddlerTitle).fields['tt_user'];
				var sectionDiv = createTiddlyElement(section, "div", tiddlerTitle+"ViewContainer", "sort-handle " +sectionClass);
				var heading = createTiddlyElement(sectionDiv, "div",  tiddlerTitle+"HeadingView", "sectionHeading heading"+level);		
				createTiddlyText(heading, levelCount.join(".")+" : "+tiddlerTitle);
//				createTiddlyText(heading, levelCount+ " - " +tiddlerTitle); // show number count 
//				createTiddlyButton(heading,  "edit", "Click to edit this section", config.macros.docOutline.editClick, "button");	// show edit button		
				var prevLevel = level;			
				//  Make the lists sortable 
				$("#sortableList").NestedSortable({
					accept: 'page-item1',
					opacity: .6,
					helperclass: 'helper',
					//onOut: function(a, b, c) {
					//	console.log(arguments, this);
					//}, 
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
					handle: '.sort-handle '
				});	




				$("#sortableList li").mouseup(function() {
					if(config.options.chkOpenEditView==true)
						story.displayTiddler(null, this.id, "mpTheme##taskEditTemplate");
					else
						story.displayTiddler(null, this.id);
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

	var div = createTiddlyElement(place, "div","deleteZone", "deleteZoneClass");
	var binContents = store.getTiddlerText(window.activeDocument+"_bin");
	if(binContents)
		div.innerHTML = "<b>Recycle Bin</b><br /><br />"+binContents;
	else
		div.innerHTML = "<b>Recycle Bin</b><br /><br /> You have an empty bin.";
	div.style.height = "110px";

	$("#deleteZone").Droppable(
      {
		activeclass : "deleteHelper",
		accept:"page-item1",
			ondrop:	function (drag) {
				var binText = store.getTiddlerText(window.activeDocument+"_bin");
				if(binText)
					binContents = drag.id+" <br />"+binText;  // build up the bin
				else
					binContents = drag.id+" <br />";  // build up the bin
				if(config.options.chkRecycle)
					store.saveTiddler(window.activeDocument+"_bin", window.activeDocument+"_bin", binContents); // save the bin
				// remove the item from the orginal spec.
				var stars = "********************************************************";
				var spec = store.getTiddlerText(window.activeDocument).replace(stars.substring(0, drag.firstChild.firstChild.className.match(/heading[0-9]+/)[0].replace("heading",""))+" "+drag.id+"\n", "");
				store.saveTiddler(window.activeDocument, window.activeDocument, spec);
				autoSaveChanges();
			}
  });
}	

//}}}



// docPrint //
config.macros.docPrint={};

config.macros.docPrint.handler=function(place,macroName,params,wikifier,paramString,tiddler){
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
			doHttp('POST',url+'plugins/tiddlertree/files/createHtmlFile.php','workspace_name='+workspace+'&html='+encodeURIComponent(htmlString)+'&compositionTiddler='+params[0],null,null,null,config.macros.docPrint.saveCallback,params);		
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
};

config.macros.docPrint.saveCallback=function(status,context,responseText,uri,xhr) {
	window.open(responseText,'','scrollbars=yes,menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
}

//}}}

// docView //

//{{{

config.macros.docView={};
	
config.macros.docView.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.options.txtOpenType = "inline";
	config.macros.docView.refresh(place,macroName,params,wikifier,paramString,tiddler);
};

function lineBreakCount(str){
	/* counts \n */
	try {
		return((str.match(/[^\n]*\n[^\n]*/gi).length));
	} catch(e) {
		return 0;
	}
};
config.macros.docView.openType = function(showBoxTiddler, showBoxSlide, showBoxPopUp) {
	if(config.options.txtOpenType=="popup")
		return showBoxPopUp();
	if(config.options.txtOpenType=="inline")
		return showBoxSlide();
	if(config.options.txtOpenType=="traditional")
		return showBoxTiddler();
}

config.macros.docView.doneClick=function(){
		var tiddlerTitle = this.id.replace("DoneButton","");
		var form = document.forms[tiddlerTitle+"Form"];
		var body = $("#"+tiddlerTitle+"BodyDiv");
		var editDiv = form.parentNode;
		var viewDiv = form.parentNode.parentNode.firstChild;

// different view types
		if(config.options.txtOpenType=="popup") {
			// POINT2
			$(editDiv).dialog("close");
		}
		if(config.options.txtOpenType=="inline"){
//			$(editDiv).slideToggle("fast");
			$(editDiv).hide();

			$(viewDiv).show();
		}
// end different view types
		
		
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
		
		$(body).html(wikifyStatic(form.body.value));
		if(!store.tiddlerExists(form.heading.value))
			var oldTitle = "";
		else 
			var oldTitle = form.heading.value;
		store.saveTiddler(oldTitle, form.heading.value, form.body.value);
		autoSaveChanges();	
};

config.macros.docView.editClick=function(){
		if(config.options.txtOpenType=="popup") {
	//	log(this.parentNode.nextSibling);
// POINT1
//				$(this.parentNode.nextSibling).dialog("moveToTop");
try {
	$(this.parentNode.nextSibling).show();
	$(this.parentNode.nextSibling).dialog({'width':'480px', 'height':'300px'});
} catch(err) {
	$(this.parentNode.nextSibling).show();
	
}
	
		}
		if(config.options.txtOpenType=="inline"){
//			$(this.parentNode.nextSibling).slideToggle("fast");
$(this.parentNode.nextSibling).show();

			$(this.parentNode).hide();
		}
		if(config.options.txtOpenType=="traditional"){
			story.displayTiddler(null, this.parentNode.id.replace("ViewContainer", ""));
		}
}



config.macros.docView.strip=function(s) {
	return s.replace(" ",  "");
}

config.macros.docView.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	removeChildren(place);

	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");


	var showBoxPopUp = function() {$("#newTiddlerDiv").dialog({"height":"240px", "width":"400px", "dialogClass":"smmStyle", "position":['91100px','11100'],"show":"fadeIn"});};
	var showBoxSlide = function() {$("#newTiddlerDivContainer").slideToggle();};
	var showBoxTiddler = function() { alert("do nothing");};
	createTiddlyButton(buttonHolder, "New Section", "click to create a new section", function() {config.macros.docView.openType(showBoxTiddler, showBoxSlide, showBoxPopUp); });

	var hideBody = function() {
		$(".sectionBody").slideToggle("fast");
	};
	createTiddlyButton(buttonHolder, "View Body", "click to create a new section", hideBody);
//	wikify("<<changeOption>>", buttonHolder);
//	createTiddlyButton(buttonHolder, "Print", "print", function() {alert("Print the doc");});
	createTiddlyElement(place, "br");
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
			config.macros.docView.refresh(place,macroName,params,wikifier,paramString,tiddler);
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
				var commentButtonClick = function() {
					
					$("#"+config.macros.docView.strip(this.id)+"CommentsArea").slideToggle();
				};
				createTiddlyButton(sectionDiv, "edit", "Click to edit this section", config.macros.docView.editClick, "right button");
				createTiddlyButton(sectionDiv, "comments("+store.getTaggedTiddlers(tiddlerTitle).length+")", "Click to view the comments", commentButtonClick, "right button", null, null, {'id':tiddlerTitle});

				var body = createTiddlyElement(sectionDiv, "div", tiddlerTitle+"BodyDiv", "sectionBody", store.getTiddlerText(tiddlerTitle));
				$(body).html(wikifyStatic(store.getTiddlerText(tiddlerTitle)));
				body.rows = lineBreakCount(store.getTiddlerText(tiddlerTitle))+2;
				var commentsDiv = createTiddlyElement(sectionDiv, "div", config.macros.docView.strip(tiddlerTitle)+"CommentsArea");
				wikify("<<comments tiddler:'"+tiddlerTitle+"' tags:'"+tiddlerTitle+"'>>", commentsDiv);
				$(commentsDiv).hide();
				
				
				//body.disabled = true;

				/* double click bits */
				var editDblClick = function(e) {
				//	$(e.target.parentNode).slideToggle("fast");
				displayMessage("here again"+e.target.id.replace("BodyDiv", ""));
					$("#"+e.target.id.replace("BodyDiv", "")+"ViewContainer").hide();
					$("#"+e.target.id+"EditView").show();
				};
				$(body).dblclick(editDblClick);
				
				 				
				var prevLevel = level;			
				var sectionEditDiv = createTiddlyElement(section, "div", tiddlerTitle+"BodyDivEditView", "sort-handle-edit "+sectionClass);
				sectionEditDiv.style.display = "none";

				var form = createTiddlyElement(sectionEditDiv, "form", null, "editForm");
			 	form.name = tiddlerTitle+"Form";


				var headingInput = createTiddlyElement(form, "input",  "heading", "sectionHeadingInput ");
				headingInput.value = tiddlerTitle;

// create button 
//				var editButton = createTiddlyElement(form, "input", tiddlerTitle+"DoneButton", "button right doneButton");
//				editButton.type = "button";
//				editButton.style.float = "right";
//				editButton.value = "done";
//				$(editButton).click(config.macros.docView.doneClick); 
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
				$(editButton).click(config.macros.docView.doneClick); 
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