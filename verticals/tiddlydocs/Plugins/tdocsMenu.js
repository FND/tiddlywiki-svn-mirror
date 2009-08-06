//{{{

//tdoc2Outline //

//{{{
	
config.macros.tdoc2Outline={};

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
	jQuery(specView).empty();	
	config.macros.tdoc2Outline._renderSpec(specView, spec, []);
	
	jQuery("#ul0").NestedSortable({
		accept: 'toc-item',
		noNestingClass: "no-nesting",
		helperclass: 'helper',
		onChange: function(serialized) {
			 window.testSpec = config.macros.tdoc2Outline.buildSpec();
				if(store.tiddlerExists(window.activeDocument)) {
					var specTiddler = store.getTiddler(window.activeDocument);
					var fields = merge(specTiddler.fields, config.defaultCustomFields);
				} else {
					var fields = config.defaultCustomFields;
				}
			store.saveTiddler(window.activeDocument, window.activeDocument, jQuery.toJSON(window.testSpec), null, null, "document", fields);
			autoSaveChanges(true, window.activeDocument);
		},
		autoScroll: true,
		handle: '.toc-sort-handle'
	});
	jQuery(".sectionHeading").hover(
		function() {
			jQuery(this).addClass("draggableOn");
		}, 
		function() {
			jQuery(this).removeClass("draggableOn");
		}
	);
}

config.macros.tdoc2Outline.buildSpec = function() {
  return config.macros.tdoc2Outline._buildSpec(jQuery(".specView > ul > li"));
}

config.macros.tdoc2Outline._buildSpec = function (liList) {
	var spec = [];
	liList.each(function() {
		var li=this;
		var node = {
			title: li.id
		};
		node.children = config.macros.tdoc2Outline._buildSpec(jQuery(li).children("ul").children("li"));
		spec.push(node);
 	});
  return spec;
}
 
config.macros.tdoc2Outline._renderSpec = function(specView, spec, label) {
	var childCount=1;
	label=label.concat([0])
	var ul = createTiddlyElement(specView, "ul", "ul"+(window.ulCount++), "toc");
	jQuery.each(spec, function() {
		label[label.length-1]++;
	   	var li = createTiddlyElement(ul, "li", this.title, "clear-element toc-item left");
		if(store.getTiddler(this.title)==null){
			// these two lines should not be necessary
				store.saveTiddler(this.title, this.title, config.views.wikified.defaultText, config.options.txtUserName, new Date(),"section");
				autoSaveChanges(false, this.title);
		}else{
			if(store.getTiddler(this.title).fields.tt_status == "Complete"){
				var sectionClass = "completed"; 
			}else{ 
				var sectionClass = "incomplete";
			}
		}
	    var sectionDiv = createTiddlyElement(li, "div", this.title+"_div", "sectionHeading toc-sort-handle "+sectionClass);	
		sectionDiv.onclick = function() {
			story.displayTiddler(DEFAULT_EDIT_TEMPLATE, this.id.replace("_div", ""));
		}
		createTiddlyText(sectionDiv, label.join(".")+"  :  "+this.title);
		config.macros.tdoc2Outline._renderSpec(li, this.children, label);
	});
}

config.macros.tdoc2Outline.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	if(store.tiddlerExists(window.activeDocument)) {
		var testSpec = jQuery.parseJSON(store.getTiddlerText(window.activeDocument));	
		console.log(testSpec); 
	}
	var specView = createTiddlyElement(place, "div", "", "specView");	
	config.macros.tdoc2Outline.renderSpec(specView, testSpec);
}	



function log() { if (console) console.log.apply(console, arguments); };

//}}}
