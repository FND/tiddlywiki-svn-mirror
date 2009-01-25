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
//top nav 
	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");
	wikify("<<printTree "+params[0]+">>", buttonHolder);
/// new tiddler button 
	var btn = createTiddlyElement(buttonHolder, "a", null, "button");
	btn.onclick = config.macros.newTiddler.onClickNewTiddler;
	btn.setAttribute("newTitle","New Section");
	btn.setAttribute("newTemplate",DEFAULT_EDIT_TEMPLATE);
	var img = createTiddlyElement(btn, "img");
	img.style.width = "10px";
	img.style.height="10px";
	img.src = "http://www.iconspedia.com/uploads/578075880.png";
	createTiddlyText(btn, " New Section");
	btn.setAttribute("href","javascript:;");
	createTiddlyElement(buttonHolder, "br");
	createTiddlyElement(buttonHolder, "br");
/// users button
	var btn = createTiddlyElement(buttonHolder, "a", null, "button");
	btn.onclick = function () {
		story.displayTiddler(null, "UserDefinitions");
	};
	var img = createTiddlyElement(btn, "img");
	img.style.width = "10px";
	img.style.height="10px";
	img.src = "http://dryicons.com/images/icon_sets/aesthetica_version_2/png/128x128/community_users.png";
	createTiddlyText(btn, " Users");
	btn.setAttribute("href","javascript:;");		
/// document specification button
	var btn = createTiddlyElement(buttonHolder, "a", null, "button");
	btn.onclick = function () {
		story.displayTiddler(null, params[0]);
	};
	var img = createTiddlyElement(btn, "img");
	img.style.width = "10px";
	img.style.height="10px";
	img.src = "http://ib.berkeley.edu/labs/dawson/calender/theme/icons/bullet_point_50x50.gif";
	createTiddlyText(btn, " Document Specification");
	btn.setAttribute("href","javascript:;");	
	createTiddlyElement(place, "br");
	/*
	var div = createTiddlyElement(place, "div", "example", "flora");
	var ul = createTiddlyElement(div, "ul");
	var li = createTiddlyElement(ul, "li");
	var a = createTiddlyElement(li, "a");
	a.href = "#frag1";
	createTiddlyElement(a, "span", null, null, "frag1");
	var li = createTiddlyElement(ul, "li");
	var a = createTiddlyElement(li, "a");
	a.href = "#frag2";
	createTiddlyElement(a, "span", null, null, "frag2");
	var frag1 = createTiddlyElement(div, "div", "frag1", null, "frag 1 content");
	createTiddlyElement(div, "div", "frag2", null, "frag 2 content ");
	*/
	log($('#example >ul').tabs());
	var treeSpec = store.getTiddlerText(params[0]); 
	if(treeSpec){
		var sections = treeSpec.split("\n");
		var parent = createTiddlyElement(place, "ul","sortableList", "page-list");
		var counth1 = 1;
		var counth2 = 1;
		var counth3 = 1;	
		for(var i = 0; i < sections.length; i++) {
			
			var matches = sections[i].match(/^(\*+) (.*)/)
			if (matches) {
				var level = matches[1].length;
				var tiddlerTitle = matches[2];
				if(level==1)
					levelCount = counth1++;
				if(level==2)
					levelCount = counth1+"."+counth2++;
				if(level==3)
					levelCount = counth1+"."+counth2+"."+counth3++;
				if (level>prevLevel) {
					parent = createTiddlyElement(parent, "ul","sortableList", "page-list");
				} else if (level < prevLevel) {
					parent = parent.parentNode;
				}
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
				createTiddlyText(heading, tiddlerTitle);
//				createTiddlyText(heading, levelCount+ " - " +tiddlerTitle); // show number count 
//				createTiddlyButton(heading,  "edit", "Click to edit this section", config.macros.SplitView.editClick, "button");	// show edit button		
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
					handle: '.sort-handle '
				});	
				
					$("#sortableList li").mouseup(function() {
					//	log("mouseup", this.id, config.macros.SplitView.dragged);
					story.displayTiddler(null, this.id)
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