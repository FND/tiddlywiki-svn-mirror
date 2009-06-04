
// DELETE ZONE

config.macros.deleteZone = {};
config.macros.deleteZone.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var div = createTiddlyElement(place, "div","deleteZone", "deleteZoneClass");
	var binContents = store.getTiddlerText(window.activeDocument+"Bin");
	if(binContents)
		wikify("Bin \n"+binContents, div);
	else
		div.innerHTML = "<span id='noo'><li class='toc-item'>&nbsp;</li></span><b>Recycle Bin</b><br /><br /> You have an empty bin.";
	div.style.height = "auto";
	
	
	$("#noo").NestedSortable({
		accept: 'toc-item',
		noNestingClass: "no-nesting",
		onStop : function() {
			alert("boo");
			console.log("change");
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
