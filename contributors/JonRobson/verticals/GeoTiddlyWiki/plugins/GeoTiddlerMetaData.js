/*Many thanks to the tiddler alias plugin for where I got this code*/

config.macros.canvasMaps.metaExtension ="<div macro='edit fill' class='editor'></div>"+
				"<div class='editorFooter'>fill colour for this tiddler</div>"+
				"<div macro='edit geo' class='editor'></div>"+
				"<div class='editorFooter'>apply geo coordinate to the tiddler usage format: 'lat;long' eg. for London use 51.507778; -0.12</div>";
				
				


function modifyEditTemplate() {
	// The shadow tiddler
	var s = addEditTemplateExtension(config.shadowTiddlers["EditTemplate"]);
	if (s) 
		config.shadowTiddlers["EditTemplate"] = s;
	
	// The "real" tiddler (if defined)
	var t = store.getTiddler("EditTemplate");
    if (t && !hasEditTemplateExtension(t.text))
          t.set(null,addEditTemplateExtension(t.text));		
}

function hasEditTemplateExtension(s) {
	return s.indexOf(config.macros.canvasMaps.metaExtension.editTemplateExtension) >= 0;
}

function addEditTemplateExtension(s) {
	if (s && !hasEditTemplateExtension(s)) {
		var i = s.lastIndexOf("</div>");
		if (i >= 0)
			return s.slice(0,i+6)+"\n"+config.macros.canvasMaps.metaExtension+s.slice(i+6);
	}
	return null;
}

// Requires store is defined.
function doHijacking() {
	modifyEditTemplate();
}

// for debugging the plugin is not loaded through the systemConfig mechanism but via a script tag. 
// At that point in the "store" is not yet defined. In that case hijackFetchTiddler through the restart function.
// Otherwise hijack now.
if (!store) {
	var oldRestartFunc = restart;
	window.restart = function() {
		doHijacking();
		oldRestartFunc.apply(this,arguments);
	};
} else
	doHijacking();


var oldwikify =wikify;

wikify = function(source,output,highlightRegExp,tiddler){
	if(tiddler) {
		if(tiddler.tags.contains("svg")){
			source = "<<canvasMaps source:'"+ tiddler.name+"'>>";
			
		}
	}
	oldwikify(source,output,highlightRegExp,tiddler);
} 