//{{{
	
var testSpec = [{title:'Creation', children:
			[{title:'Growth', children: 
				[{title:'Language', children: []}]
			 },
			 {title:'Mowth', children: []},
			 {title:'Jowth', children: []}
			]},
		{title:'Middle', children: []},
		{title:'Fin', children:
		    [{title:'Epilogue', children: []}]
		}];							
	
window.activeDocument = 'tiddlydocs_sp2c';

if(store.tiddlerExists(window.activeDocument)) {
	var testSpec = $.parseJSON(store.getTiddlerText(window.activeDocument));	 
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
	config.macros.tdoc2Outline.refresh(place,macroName,params,wikifier,paramString,tiddler);
};

config.macros.tdoc2Outline.renderSpec = function(specView, spec) {
	window.ulCount=0;
	window.liCount=0;
	window.divCount=0;
	window.sectionCount = 1;
	$(specView).empty();	
	config.macros.tdoc2Outline._renderSpec(specView, spec, []);
	$("ul.toc").NestedSortable({
		accept: 'toc-item',
		noNestingClass: "no-nesting",
		helperclass: 'helper',
		onStop: function() {
			// HACK TO REMOVE THE HELPER CLASS WHICH SHOULD REMOVE ITSELF
			$(".helper").remove();
		},
		onChange: function(serialized) {
			 window.testSpec = config.macros.tdoc2Outline.buildSpec();
				if(store.tiddlerExists(window.activeDocument)) {
					var specTiddler = store.getTiddler(window.activeDocument);
					var fields = merge(specTiddler.fields, config.defaultCustomFields);
				} else {
					var fields = config.defaultCustomFields;
				}
			store.saveTiddler(window.activeDocument, window.activeDocument, $.toJSON(window.testSpec), null, null, null, fields);
			autoSaveChanges(window.activeDocument, true);
		},
		autoScroll: true,
		handle: '.toc-sort-handle'
	});
	$("#ul0 li").mouseup(function() {
			if(config.options.chkOpenEditView==true)
				story.displayTiddler(null, this.id, DEFAULT_EDIT_TEMPLATE);
			else
				story.displayTiddler(null, this.id);
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

config.macros.tdoc2Outline.buildSpec = function() {
  return config.macros.tdoc2Outline._buildSpec($(".specView > ul > li"));
}

config.macros.tdoc2Outline._buildSpec = function (liList) {
	var spec = [];
	liList.each(function() {
		var li=this;
		var node = {
			title: li.id
		};
		node.children = config.macros.tdoc2Outline._buildSpec($(li).children("ul").children("li"));
		spec.push(node);
 	});
  return spec;
}

config.macros.tdoc2Outline._renderSpec = function(specView, spec, label) {
	var childCount=1;
	label=label.concat([0])
	$.each(spec, function() {
		label[label.length-1]++;
		var ul = createTiddlyElement(specView, "ul", "ul"+(window.ulCount++), "toc");
	   	var li = createTiddlyElement(ul, "li", this.title, "clear-element toc-item left");
	    var sectionDiv = createTiddlyElement(li, "div", this.title+"HeadingView", "sectionHeading toc-sort-handle ");	
		createTiddlyText(sectionDiv, label.join(".")+"  :  "+this.title);
		config.macros.tdoc2Outline._renderSpec(li, this.children, label);
	});
}

config.macros.tdoc2Outline.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	var specView = createTiddlyElement(place, "div", "", "specView");	
	config.macros.tdoc2Outline.renderSpec(specView, testSpec);
}	

// DELETE ZONE

config.macros.deleteZone = {};
config.macros.deleteZone.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
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
		accept:"toc-item",
			ondrop:	function (drag) {
				
				var unwanted = config.macros.deleteZone.find(drag.id, testSpec)
				if (unwanted) {
					unwanted.containerSpec.splice(unwanted.index, 1);
					var dummy=$("<div id='"+$(unwanted.found).id+"'>");
					$("body").append(dummy);
					config.macros.tdoc2Outline.renderSpec(($(drag).parents(".specView").get())[0], testSpec, []);	
				}
				if(store.tiddlerExists(window.activeDocument)) {
					var specTiddler = store.getTiddler(window.activeDocument);
					var fields = merge(specTiddler.fields, config.defaultCustomFields);
				} else {
					var fields = config.defaultCustomFields;
				}
				store.saveTiddler(window.activeDocument, window.activeDocument, $.toJSON(testSpec), null, null, null, fields);
				autoSaveChanges(window.activeDocument, true);
				return false; // probably does nothing - remove?
			}
	});
};

config.macros.deleteZone.find = function(wantedTitle, spec) {
	var wantedSpec;
	var count=0;
	$.each(spec, function() {
		if(this.title == wantedTitle)
		  wantedSpec = { found: this, containerSpec: spec, index: count };
		else
		  wantedSpec = config.macros.deleteZone.find(wantedTitle, this.children);
		log("wanted", wantedSpec)
		if (wantedSpec) return false; // break
		count++;
	})
	return wantedSpec;
}

// Buttons 

config.macros.tdButtons = {};
config.macros.tdButtons.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");
	if(config.options.chkDrawings)
		wikify("| [[Drawings]] | <<newDrawing>>  ", buttonHolder);
		//	window.activeDocument = params[0];
	wikify("<<docPrint "+window.activeDocuement+">>", buttonHolder);
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
	console.log("do buttons");
}



function log() { if (console) console.log.apply(console, arguments); };

//}}}