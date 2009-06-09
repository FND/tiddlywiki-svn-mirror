//{{{

//tdoc2Outline //

//{{{
	
window.activeDocument ="The Internet";
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

	$("#ul0").NestedSortable({
		accept: 'toc-item',
		noNestingClass: "no-nesting",
		helperclass: 'helper',
		onChange: function(serialized) {
			
			console.log("on changes");
			 window.testSpec = config.macros.tdoc2Outline.buildSpec();
				if(store.tiddlerExists(window.activeDocument)) {
					var specTiddler = store.getTiddler(window.activeDocument);
					var fields = merge(specTiddler.fields, config.defaultCustomFields);
				} else {
					var fields = config.defaultCustomFields;
				}
			store.saveTiddler(window.activeDocument, window.activeDocument, $.toJSON(window.testSpec), null, null, "document", fields);
			autoSaveChanges(true, window.activeDocument);
		},
		autoScroll: true,
		handle: '.toc-sort-handle'
	});

	
	
	$("#ul0 li").mouseup(function() {
/*		
	store.saveTiddler(this.id, this.id, config.views.wikified.defaultText, null, null, "task", config.defaultCustomFields);
	autoSaveChanges(true, this.id);
*/	
	
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
	var ul = createTiddlyElement(specView, "ul", "ul"+(window.ulCount++), "toc");
	$.each(spec, function() {
		label[label.length-1]++;
	   	var li = createTiddlyElement(ul, "li", this.title, "clear-element toc-item left");
	    var sectionDiv = createTiddlyElement(li, "div", this.title+"HeadingView", "sectionHeading toc-sort-handle ");	
		createTiddlyText(sectionDiv, label.join(".")+"  :  "+this.title);
		config.macros.tdoc2Outline._renderSpec(li, this.children, label);
	});
}

config.macros.tdoc2Outline.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	if(store.tiddlerExists(window.activeDocument)) {
		var testSpec = $.parseJSON(store.getTiddlerText(window.activeDocument));	 
	}
	var specView = createTiddlyElement(place, "div", "", "specView");	
	config.macros.tdoc2Outline.renderSpec(specView, testSpec);
}	



function log() { if (console) console.log.apply(console, arguments); };

//}}}