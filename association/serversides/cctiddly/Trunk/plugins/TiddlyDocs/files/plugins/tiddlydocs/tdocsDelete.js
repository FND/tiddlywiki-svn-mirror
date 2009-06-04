
// DELETE ZONE

config.macros.deleteZone = {};
config.macros.deleteZone.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var div = createTiddlyElement(place, "div","deleteZone", "deleteZoneClass");
	var binContents = store.getTiddlerText(window.activeDocument+"Bin");
	if(binContents)
		wikify("Bin \n"+binContents, div);
	else
		div.innerHTML = "<ul style='height:50px; background:orange;' id='noo'><li>sdfsdf</li></ul><b>Recycle Bin</b><br /><br /> You have an empty bin.";
	div.style.height = "auto";
	$("#noo").Droppable(
	{
		hoverclass : "deleteHelper",
		accept:"toc-item",
			ondrop:	function (drag) {
				
				console.log("on drop ");
				

			}
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
