
// DELETE ZONE

config.macros.deleteZone = {};
config.macros.deleteZone.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
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
				if (unwanted) {
					unwanted.containerSpec.splice(unwanted.index, 1);
					var dummy=$("<div id='"+$(unwanted.found).id+"'>");
					$("body").append(dummy);
					config.macros.tdoc2Outline.renderSpec(($(drag).parents(".specView").get())[0], testSpec, []);	
				}
				if(store.tiddlerExists(window.activeDocument)) {
					var specTiddler = store.getTiddler(window.activeDocument);
					var fields = merge(specTiddler.fields, config.defaultCustomFields);
				} else {
					var fields = config.defaultCustomFields;
				}
				store.saveTiddler(window.activeDocument, window.activeDocument, $.toJSON(testSpec), null, null, null, fields);
				autoSaveChanges(window.activeDocument, true);
				return false; // probably does nothing - remove?
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
