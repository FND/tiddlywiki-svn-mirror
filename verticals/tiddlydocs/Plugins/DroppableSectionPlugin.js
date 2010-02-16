config.macros.droppableSection = {};
config.macros.droppableSection.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	
	var tiddlerElem = story.findContainingTiddler(place);
 	var containingTiddlerTitle = tiddlerElem.getAttribute("tiddler"); 
	var strippedTidTitle = config.macros.droppableSection.strip(containingTiddlerTitle);
	var ul = createTiddlyElement(place, "ul", strippedTidTitle+"DroppableSectionList", "toc");
	   	var li = createTiddlyElement(ul, "li", containingTiddlerTitle, "clear-element toc-item left");

	var sectionDiv = createTiddlyElement(li, "div", containingTiddlerTitle+'_div', "sectionHeading toc-sort-handle ");	
	createTiddlyText(sectionDiv, containingTiddlerTitle);
	jQuery("#"+strippedTidTitle+"DroppableSectionList").NestedSortable({
		accept: 'toc-item',
		noNestingClass: "no-nesting",
		onStop : function() {
		},
		helperclass: 'helper',
		autoScroll: true,
		ghosting: true,
		handle: '.toc-sort-handle'
	});
};

config.macros.droppableSection.strip=function(s) {
	return s.replace(/ /g,'');
}