
// DELETE ZONE

config.macros.deleteZone = {};
config.macros.deleteZone.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var div = createTiddlyElement(place, "div","deleteZone", "deleteZoneClass");
	var binContents = store.getTiddlerText(window.activeDocument+"Bin");
	if(binContents)
		wikify("Bin \n"+binContents, div);
	else
		div.innerHTML = "<b>Bin</b><br /><br /> <span id='bin'><li class='toc-item'>&nbsp;</li></span>";
	div.style.height = "auto";
	
	
	$("#bin").NestedSortable({
		accept: 'toc-item',
		noNestingClass: "no-nesting",
		onStop : function() {
		},
		helperclass: 'helper',
		autoScroll: true,
		handle: '.toc-sort-handle'
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
