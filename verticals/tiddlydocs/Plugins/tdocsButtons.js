// Buttons 

config.macros.tdButtons = {};
config.macros.tdButtons.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");
	wikify("<<docPrint "+window.activeDocuement+">>", buttonHolder);
	var previewClick = function(place) {
		story.displayTiddler(null, "Current Document Preview");
	}
	var btn = createTiddlyButton(buttonHolder, "preview", "preview current document", previewClick, null, null, null, null, "/static/mydocs_images/icon_preview.jpg");
	var btn = createTiddlyButton(buttonHolder, "new", "New Section", config.macros.newTiddler.onClickNewTiddler, null, null, null, null, "/static/mydocs_images/icon_new.jpg");
	btn.setAttribute("newTitle","New Section Title");
	btn.setAttribute("newTemplate", config.options.txtTheme+"##newEditTemplate");
	var displaySettings= function () {
		story.displayTiddler(null, "Settings");
	};
}
