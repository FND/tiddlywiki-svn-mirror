// Buttons 

config.macros.tdButtons = {};
config.macros.tdButtons.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");
	wikify("<<docPrint "+window.activeDocuement+">>", buttonHolder);
	var previewClick = function(place) {
		story.displayTiddler(null, "Current Document Preview");
	}
	var btn = createTiddlyButton(buttonHolder, "preview", "preview current document", previewClick, null, null, null, null, "/static/tiddlydocs_images/icons/Menu_24.png");
	var btn = createTiddlyButton(buttonHolder, "new", "New Section", config.macros.newTiddler.onClickNewTiddler, null, null, null, null, "/static/tiddlydocs_images/icons/Invitation_24.png");
	btn.setAttribute("newTitle","New Section Title");
	btn.setAttribute("newTemplate", config.options.txtTheme+"##newEditTemplate");
	var displaySettings= function () {
		story.displayTiddler(null, "Settings");
	};
/*	createTiddlyButton(buttonHolder, "settings", "Personalise TiddlyDocs", displaySettings, null, null, null, null, "http://tiddlydocs.com/files/images/icon/settings.png");

	var logout = function() {
		if (window.fullUrl.indexOf('?') > 0)
			window.location = window.fullUrl+'&logout=1';
		else
			window.location = window.fullUrl+'?logout=1';
	};
	createTiddlyButton(buttonHolder, "logout", "Logout of TiddlyDocs", logout, null, null, null, null, "");
	createTiddlyElement(place, "br");


	*/
}
