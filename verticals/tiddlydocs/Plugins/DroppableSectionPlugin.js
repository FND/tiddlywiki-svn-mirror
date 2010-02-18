config.macros.droppableSection = {};
config.macros.droppableSection.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	
	removeChildren(place);
	var tiddlerElem = story.findContainingTiddler(place);
 	var containingTiddlerTitle = tiddlerElem.getAttribute("tiddler"); 
	var strippedTidTitle = config.macros.droppableSection.strip(containingTiddlerTitle);
	var ul = createTiddlyElement(place, "ul", strippedTidTitle+"DroppableSectionList", "toc");
	   	var li = createTiddlyElement(ul, "li", containingTiddlerTitle, "clear-element toc-item left");

	var sectionDiv = createTiddlyElement(li, "div", containingTiddlerTitle+'_div', " toc-sort-handle toc-droppable-heading");
	createTiddlyText(sectionDiv, containingTiddlerTitle);
	jQuery("#"+strippedTidTitle+"DroppableSectionList").NestedSortable({
		accept: 'toc-item',
		helperclass: 'helper', 
		autoScroll: true,
		onStart: function() {
				story.refreshTiddler(this.id,1,true);
		},
		onStop: function() {
				story.refreshTiddler(this.id,1,true);
		},
		handle: '.toc-sort-handle'
	});
};

config.macros.droppableSection.strip=function(s) {
	return s.replace(/ /g,'');
}

config.shadowTiddlers["DroppableSectionPluginStyles"] = store.getTiddlerText("DroppableSectionPlugin##StyleSheet");
store.addNotification("DroppableSectionPluginStyles", refreshStyles);


/***
!StyleSheet

.toc-droppable-heading {
	border:2px dashed transparent;
	cursor:move;
}

.toc-droppable-heading:hover {
	border:2px dashed #fff;
	background:#eee;
	cursor:move;
}

html body div.title ul.toc {
    padding:0;
}

div.title  ul.toc {
	padding:0em;
	margin:0em;
}

!(end of StyleSheet)

***/