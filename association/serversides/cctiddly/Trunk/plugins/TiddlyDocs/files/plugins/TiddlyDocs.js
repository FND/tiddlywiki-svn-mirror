


//docOutline //

//{{{


config.macros.docOutline={};

config.macros.docOutline.editClick=function(){
			story.displayTiddler(null, this.parentNode.id.replace("HeadingView", ""));
}

config.macros.docOutline.strip=function(s) {
	return s.replace(" ",  "");
}

config.macros.docOutline.addSection = function(section) {
	alert("mf"+section);
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
	var btn = createTiddlyButton(buttonHolder, "new", "New Section", config.macros.newTiddler.onClickNewTiddler, null, null, null, null, "http://www.iconspedia.com/uploads/578075880.png");

	btn.setAttribute("newTitle","New Section Title");
	btn.setAttribute("newTemplate",getParam(params,"template","mpTheme##newEditTemplate"));

	var displaySettings= function () {
		story.displayTiddler(null, "Settings");
	};
	createTiddlyButton(buttonHolder, "settings", "Personalise TiddlyDocs", displaySettings, null, null, null, null, "http://dryicons.com/images/icon_sets/aesthetica_version_2/png/128x128/community_users.png");
	var logout = function() {
		if (window.fullUrl.indexOf('?') > 0)
			window.location = window.fullUrl+'&logout=1';
		else
			window.location = window.fullUrl+'?logout=1';
	};
	createTiddlyButton(buttonHolder, "logout", "Logout of TiddlyDocs", logout, null, null, null, null, "http://ftpvweb.com/file_transfer/skins/blue/images/actions/exit.png");
	createTiddlyElement(place, "br");
	var treeSpec = store.getTiddlerText(params[0]); 
	if(treeSpec){
		var sections = treeSpec.split("\n");
		var parent = createTiddlyElement(place, "ul","idb", "sortableToc page-list");
		var levelCount = [1];
  		for(var i = 0; i < sections.length; i++) {
			var matches = sections[i].match(/^(\*+) (.*)/);
			if (matches) {
				var level = matches[1].length;
				var tiddlerTitle = matches[2];
				if (level>prevLevel) {
					parent = createTiddlyElement(parent, "ul","ida", "sortableToc page-list");	
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
				var section = createTiddlyElement(parent, "li", tiddlerTitle, "section clear-element page-item1 left");
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
				$(".sortableToc li").mouseup(function() {
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
	var binContents = store.getTiddlerText(window.activeDocument+"Bin");
	if(binContents)
		wikify("Bin \n"+binContents, div);
	else
		div.innerHTML = "<b>Recycle Bin</b><br /><br /> You have an empty bin.";
	div.style.height = "auto";

	$("#deleteZone").Droppable(
      {
		hoverclass : "deleteHelper",
		accept:"page-item1",
			ondrop:	function (drag) {
				var binText = store.getTiddlerText(window.activeDocument+"Bin");
				if(binText)
					binContents = "[["+drag.id+"]] <br />"+binText;  // build up the bin
				else
					binContents = "[["+drag.id+"]] <br />";  // build up the bin
				if(config.options.chkRecycle) {
					var specBinTiddler = store.getTiddler(window.activeDocument+"Bin");
					if(config.options.chkRecycle) {
						store.saveTiddler(window.activeDocument+"Bin", window.activeDocument+"Bin", binContents); // save the bin
						autoSaveChanges(true, window.activeDocument+"Bin");
					}	
				}
				// remove the item from the orginal spec.
				var stars = "********************************************************";
				var specTiddler = store.getTiddler(window.activeDocument);
				var spec = store.getTiddlerText(window.activeDocument).replace(stars.substring(0, drag.firstChild.firstChild.className.match(/heading[0-9]+/)[0].replace("heading",""))+" "+drag.id+"\n", "");
				store.saveTiddler(window.activeDocument, window.activeDocument, spec);
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
			var name = "Please wait..";
			store.saveTiddler(name, name, "Creating PDF file of "+params[0]+" for printing. You should be prompted to download a .pdf file shortly.", config.options.txtUserName, newDate,"",config.defaultCustomFields);
			story.displayTiddler(null, name);
		doHttp('POST',url+'plugins/TiddlyDocs/files/createHtmlFile.php','workspace_name='+workspace+'&html='+encodeURIComponent(htmlString)+'&compositionTiddler='+params[0],null,null,null,config.macros.docPrint.saveCallback,params);		
//displayMessage("made it to here1");

//			doHttp('GET',"http://wiki.osmosoft.com/TiddlyDocs/plugins/tiddlertree/files/createHtmlFile.php",'workspace_name='+workspace+'&html='+encodeURIComponent(htmlString)+'&compositionTiddler='+params[0]+"3",null,null,null,config.macros.docPrint.saveCallback,params);		
//displayMessage("made it to here2");

		}
	};
	// print button 
	createTiddlyButton(place, "print", "Download a printable PDF version of the document.", onClickPrint, null, null, null, null, "http://www.medici.com.au/img/print_icon.png");

};

config.macros.docPrint.saveCallback=function(status,context,responseText,uri,xhr) {
//	console.log(responseText);
	window.open("http://osmosoft.com/~psd/html2pdf/?uri="+responseText,'','scrollbars=yes,menubar=no,height=600,width=800,resizable=yes,toolbar=no,location=no,status=no');
}

//}}}

function log() { if (console) console.log.apply(console, arguments); };

//}}}