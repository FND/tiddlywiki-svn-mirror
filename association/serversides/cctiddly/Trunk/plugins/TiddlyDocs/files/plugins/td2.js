



				var testSpec = [{title:'Creation', children:[
									{title:'Middl1e', children: []}
								]},
								{title:'Middle', children: [
											{title:'Middl2e', children: [
													{title:'Middl2.1e', children: []}
											]}
								]},
								{title:'Fin', children:[
											{title:'Middl3e', children: []}
								]}];
								
								
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
								
//tdoc2Outline //

//{{{
config.macros.tdoc2Outline={};

config.macros.tdoc2Outline.editClick=function(){
	story.displayTiddler(null, this.parentNode.id.replace("HeadingView", ""));
}

config.macros.tdoc2Outline.strip=function(s) {
	console.log("here");
	return s.replace(" ",  "");
}

config.macros.tdoc2Outline.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.macros.tdoc2Outline.refresh(place,macroName,params,wikifier,paramString,tiddler);
};


/*
	if(store.getTiddler(spec.title)==null){
			store.saveTiddler(spec.title, spec.title, "", config.options.txtUserName, new Date(),"task" );
			autoSaveChanges(false, spec.title);
	}else{
		if(store.getTiddler(spec.title).fields.tt_status == "Complete")
			var sectionClass = "completed";
		else 
			var sectionClass = "incomplete";
	}
	var sectionDiv = createTiddlyElement(li, "div", spec.title+"HeadingView", "sectionHeading toc-sort-handle "+sectionClass);	
	
*/

config.macros.tdoc2Outline.renderSpec = function(place, spec, label) {
	var childCount=1;
	label=label.concat([0])
	$.each(spec, function() {
		label[label.length-1]++;
		var ul = createTiddlyElement(place, "ul", "ul"+(window.ulCount++), "toc");
	   	var li = createTiddlyElement(ul, "li", this.title, "clear-element toc-item left");

	    var sectionDiv = createTiddlyElement(li, "div", this.title+"HeadingView", "sectionHeading toc-sort-handle ");	
		// createTiddlyText(sectionDiv, (sectionLabel++)+"  :  "+spec.title);
		createTiddlyText(sectionDiv, label+"  :  "+this.title);
		config.macros.tdoc2Outline.renderSpec(li, this.children, label);
	});
}

config.macros.tdoc2Outline.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	window.ulCount=0;
	window.liCount=0;
	window.divCount=0;
	window.sectionCount = 1;
	
	config.macros.tdoc2Outline.renderSpec(place, testSpec, []);
	
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
				console.log("found ", config.macros.deleteZone.find(drag.id, testSpec));
			}
	});
};
/*
config.macros.deleteZone.delete = function(unwantedTitle, spec) {
    var unwantedSpec = config.macros.deleteZone.find(unwantedTitle, spec);
    if (unwantedSpec) config.macros.deleteZone.deleteRecursively(unwantedSpec);
})

config.macros.deleteZone.deleteRecursively = function(unwantedSpec) {
	// get parent and use parent.children.splice() to prune the spec
})
*/

// inefficient implementation
config.macros.deleteZone.find = function(wantedTitle, spec) {
	var wantedSpec;
	console.log("spec", wantedTitle, "---", spec)
	$.each(spec, function() {
		if(this.title == wantedTitle)
		  // SHOULD DO THIS TO GET PARENT FOR DELETE RECURSIVELY wantedSpec = { wanted: this, wantedParent: spec };
		  wantedSpec = this;
		else
		  wantedSpec = config.macros.deleteZone.find(wantedTitle, this.children);
		log("wanted", wantedSpec)
		if (wantedSpec) return false; // break
	})
	return wantedSpec;
}
//}}}

function log() { if (console) console.log.apply(console, arguments); };

//}}}