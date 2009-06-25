
// Buttons 

config.macros.tdButtons = {};
config.macros.tdButtons.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var buttonHolder = createTiddlyElement(place, "div", "buttonHolder");
	if(config.options.chkDrawings)
		wikify("| [[Drawings]] | <<newDrawing>>  ", buttonHolder);
		//	window.activeDocument = params[0];
	wikify("<<docPrint "+window.activeDocuement+">>", buttonHolder);

	var previewClick = function(place) {
		story.displayTiddler(null, "Current Document Preview");
	}
	
	var btn = createTiddlyButton(buttonHolder, "preview", "preview current document", previewClick, null, null, null, null, "http://www.iconspedia.com/uploads/578075880.png");
	
	var btn = createTiddlyButton(buttonHolder, "new", "New Section", config.macros.newTiddler.onClickNewTiddler, null, null, null, null, "http://www.iconspedia.com/uploads/578075880.png");

	btn.setAttribute("newTitle","New Section Title");
	btn.setAttribute("newTemplate",getParam(params,"template","mpTheme##newEditTemplate"));

	var displaySettings= function () {
		story.displayTiddler(null, "Settings");
	};
	createTiddlyButton(buttonHolder, "settings", "Personalise TiddlyDocs", displaySettings, null, null, null, null, "http://dryicons.com/images/icon_sets/aesthetica_version_2/png/128x128/community_users.png");
	var logout = function() {
		if (window.fullUrl.indexOf('?') > 0)
			window.location = window.fullUrl+'&logout=1';
		else
			window.location = window.fullUrl+'?logout=1';
	};
	createTiddlyButton(buttonHolder, "logout", "Logout of TiddlyDocs", logout, null, null, null, null, "http://ftpvweb.com/file_transfer/skins/blue/images/actions/exit.png");
	createTiddlyElement(place, "br");
}
