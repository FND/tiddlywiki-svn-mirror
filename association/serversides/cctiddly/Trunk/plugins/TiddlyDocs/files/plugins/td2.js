



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
	console.log("handler");
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

config.macros.tdoc2Outline.renderSpec = function(specView, spec) {
	
	window.ulCount=0;
	window.liCount=0;
	window.divCount=0;
	window.sectionCount = 1;
	
	
	console.log("render", specView);
	$(specView).empty();	
	config.macros.tdoc2Outline._renderSpec(specView, spec, []);
	console.log("done rendering");

		$("ul.toc").NestedSortable({
			accept: 'toc-item',
			noNestingClass: "no-nesting",
			helperclass: 'helper',
			onStop: function() {
				// HACK TO REMOVE THE HELPER CLASS WHICH SHOULD REMOVE ITSELF
				$(".helper").remove();
			},
			onChange: function(serialized) {
				console.log("args", arguments);
				var newSpec = [];

				$("li").children().each(function() {
	//				console.log("c: ", this);
				});
				$("li").each(function() {

					config.macros.tdoc2Outline.serialize(this);

		//			console.log("parent", $(this).parents(".toc"));
		//			newSpec.push({title:this.id});
		//			console.log("Children : ", this);
		//			console.log('new spec is :', newSpec, this.id);								

				})
		//		console.log(serialized);
				$('#left-to-right-ser').html("This can be passed as parameter to a GET or POST request: "+ serialized[0].hash);
			},
			autoScroll: true,
			handle: '.toc-sort-handle'
		});
	console.log("done nestedsorrtable");
		$("#ul0 li").mouseup(function() {
			if(config.options.chkOpenEditView==true)
				story.displayTiddler(null, this.id, DEFAULT_EDIT_TEMPLATE);
			else
				story.displayTiddler(null, this.id);
		});
		console.log("done mousepu");

		$(".sectionHeading").hover(
			function() {
				$(this).addClass("draggableOn");
			}, 
			function() {
				$(this).removeClass("draggableOn");
			}
		);
		console.log("done hover");
			
}

config.macros.tdoc2Outline._renderSpec = function(specView, spec, label) {
	console.log("_renderSpec", arguments);
	var childCount=1;
	label=label.concat([0])
	$.each(spec, function() {
		label[label.length-1]++;
		var ul = createTiddlyElement(specView, "ul", "ul"+(window.ulCount++), "toc");
	   	var li = createTiddlyElement(ul, "li", this.title, "clear-element toc-item left");

	    var sectionDiv = createTiddlyElement(li, "div", this.title+"HeadingView", "sectionHeading toc-sort-handle ");	
		// createTiddlyText(sectionDiv, (sectionLabel++)+"  :  "+spec.title);
		createTiddlyText(sectionDiv, label.join(".")+"  :  "+this.title);
		config.macros.tdoc2Outline._renderSpec(li, this.children, label);
	});
}

config.macros.tdoc2Outline.serialize=function(item, spec){
//	console.log(item.id);
	spec = {title:item.id, children:[]};
		$(item).children().each(function() {
//			console.log("has child of: ", this);
//			config.macros.tdoc2Outline.serialize(item, "");
		});
		
};


config.macros.tdoc2Outline.refresh=function(place,macroName,params,wikifier,paramString,tiddler){

	
	var specView = createTiddlyElement(place, "div", "", "specView");	
	config.macros.tdoc2Outline.renderSpec(specView, testSpec);

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
				var unwanted = config.macros.deleteZone.find(drag.id, testSpec)
				/*
				for (var i=0; i<unwanted.containerSpec.length; i++) {
					if (unwanted.containerSpec[i]==unwanted.found) {
						unwanted.containerSpec.splice(i,1);
						console.log("spec after splice", testSpec);
						console.log("1", ($(drag).parents(".specView").get())[0]);
						config.macros.tdoc2Outline.renderSpec(($(drag).parents(".specView").get())[0], testSpec, []);	
						console.log("2", ($(drag).parents(".specView").get())[0]);
						break;
					}
					console.log("end of check");
				}
				*/
				if (unwanted) {
					unwanted.containerSpec.splice(unwanted.index, 1);
					console.log("unwanted", unwanted, "spliced", testSpec)
					config.macros.tdoc2Outline.renderSpec(($(drag).parents(".specView").get())[0], testSpec, []);	
				} else {
					console.log("ERROR - no unwanted found");
				}
				console.log("ondrop  done");
				return false; // probably does nothing - remove?
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
	console.log("spec", wantedTitle, "---", spec);
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
//}}}

function log() { if (console) console.log.apply(console, arguments); };

//}}}