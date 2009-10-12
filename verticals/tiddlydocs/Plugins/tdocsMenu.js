//{{{
	
config.macros.docMenu={};

config.macros.docMenu.strip=function(s) {
	return s.replace(" ",  "");
}

config.macros.docMenu.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.macros.docMenu.refresh(place,macroName,params,wikifier,paramString,tiddler);
};

config.macros.docMenu.renderSpec = function(specView, spec) {
	window.ulCount=0;
	window.liCount=0;
	window.divCount=0;
	window.sectionCount = 1;
	jQuery(specView).empty();
	config.macros.docMenu._renderSpec(specView, spec, []);
	jQuery("#ul0").NestedSortable({
		accept: 'toc-item',
		noNestingClass: "no-nesting",
		helperclass: 'helper',
		onChange: function(serialized) {
			 window.testSpec = config.macros.docMenu.buildSpec();
				if(store.tiddlerExists(window.activeDocument)) {
					var specTiddler = store.getTiddler(window.activeDocument);
					var fields = merge(specTiddler.fields, config.defaultCustomFields);
				} else {
					var fields = config.defaultCustomFields;
				}
			var spec = { format: { name: 'TiddlyDocsSpec', majorVersion:'0', minorVersion:'1' }, content: window.testSpec};
			store.saveTiddler(window.activeDocument, window.activeDocument, jQuery.toJSON(spec), null, null, "document", fields);
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

config.macros.docMenu.buildSpec = function() {
  return config.macros.docMenu._buildSpec(jQuery(".specView > ul > li"));
}

config.macros.docMenu._buildSpec = function (liList) {
	var spec = [];
	liList.each(function() {
		var li=this;
		var node = {
			title: li.id
		};
		node.children = config.macros.docMenu._buildSpec(jQuery(li).children("ul").children("li"));
		spec.push(node);
 	});
  return spec;
}
 
config.macros.docMenu._renderSpec = function(specView, spec, label) {
	var childCount=1;
	label=label.concat([0])
	var ul = createTiddlyElement(specView, "ul", "ul"+(window.ulCount++), "toc");
	jQuery.each(spec, function() {
		label[label.length-1]++;
	   	var li = createTiddlyElement(ul, "li", this.title, "clear-element toc-item left");
		if(store.getTiddler(this.title)==null){
			// these two lines should not be necessary
			//	store.saveTiddler(this.title, this.title, config.views.wikified.defaultText, config.options.txtUserName, new Date(),"section");
			//	autoSaveChanges(null, [this.title]);
		}else{
			if(store.getTiddler(this.title).fields.tt_status == "Complete"){
				var sectionClass = "completed"; 
			}else{ 
				var sectionClass = "incomplete";
			}
		}
	    var sectionDiv = createTiddlyElement(li, "div", this.title+"_div", "sectionHeading toc-sort-handle "+sectionClass);	
		sectionDiv.onclick = function() {
			if(config.options.chkOpenEditView == true)
				story.displayTiddler(this.id, this.id.replace("_div", ""), DEFAULT_EDIT_TEMPLATE,null, null, null, null,this);
			else
				story.displayTiddler(this.id, this.id.replace("_div", ""), DEFAULT_VIEW_TEMPLATE,null, null, null, null,this);
		}
		createTiddlyText(sectionDiv, label.join(".")+"  :  "+this.title);
		config.macros.docMenu._renderSpec(li, this.children, label);
	});
}

config.macros.docMenu.refresh=function(place,macroName,params,wikifier,paramString,tiddler){
	if(store.tiddlerExists(window.activeDocument)) {
		var testSpec = jQuery.parseJSON(store.getTiddlerText(window.activeDocument)).content;
	}
	var specView = createTiddlyElement(place, "div", "", "specView");	
	config.macros.docMenu.renderSpec(specView, testSpec);
}	

function log() { if (console) console.log.apply(console, arguments); };

//}}}
