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
	config.macros.tdoc2Outline.refresh(place,macroName,params,wikifier,paramString,tiddler);
};

config.macros.tdoc2Outline.renderSpec = function(place, spec) {
	var ul = createTiddlyElement(place, "ul", "ul"+(window.ulCount++), "toc");
   	var li = createTiddlyElement(ul, "li", spec.title, "clear-element toc-item left");
	if(store.getTiddler(spec.title)==null){
			store.saveTiddler(spec.title, spec.title, "", config.options.txtUserName, new Date(),"task" );
			autoSaveChanges(false, spec.title);
	}else{
		if(store.getTiddler(spec.title).fields.tt_status == "Complete")
			var sectionClass = "completed";
		else 
			var sectionClass = "incomplete";
	}
	var sectionDiv = createTiddlyElement(li, "div", "div"+window.divCount++, "toc-sort-handle "+sectionClass);	
	var heading = createTiddlyElement(sectionDiv, "div",  config.macros.tdoc2Outline.strip(spec.title)+"HeadingView", "sectionHeading");		
	createTiddlyText(heading, spec.title);
	$.each(spec.children, function() {
		console.log("pah");
		config.macros.tdoc2Outline.renderSpec(li, this);
	});
}

config.macros.tdoc2Outline.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	window.ulCount=0;
	window.liCount=0;
	window.divCount=0;
	config.macros.tdoc2Outline.renderSpec(place, testSpec);	
	$("#ul0").NestedSortable({
		accept: 'toc-item',
		noNestingClass: "no-nesting",
		helperclass: 'helper',
		onStop: function() {
			// HACK TO REMOVE THE HELPER CLASS WHICH SHOULD REMOVE ITSELF
			$(".helper").remove();
		},
		onChange: function(serialized) {
			displayMessage("saving");
			$('#left-to-right-ser').html("This can be passed as parameter to a GET or POST request: "+ serialized[0].hash);
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

// DELETE ZONE

config.macros.deleteZone = {};
config.macros.deleteZone.handler = function() {
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
				config.macros.deleteZone.delete(drag.id, testSpec);
			}
	});
};

config.macros.deleteZone.delete = function(id, spec) {
	if(spec.title == id) {
		console.log("delete me ", id);		
	}
	console.log(spec.children, id);
	if(spec.children != undefined)	
		config.macros.deleteZone.delete(id, spec.children);
};
//}}}

function log() { if (console) console.log.apply(console, arguments); };

//}}}