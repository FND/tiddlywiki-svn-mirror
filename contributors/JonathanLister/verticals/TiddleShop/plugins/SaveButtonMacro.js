config.macros.saveButton = {
	label: "save",
	defaultPath: "/blog/index.html"
};

config.macros.saveButton.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	// collect the correct tiddler name
	var tiddlerElem = story.findContainingTiddler(place);
	var title = tiddlerElem.getAttribute("tiddler");
	// turn it into the right template name
	var template = title.replace(/^Preview/,"");
	template = template.replace(/([^\d]+)(\d+)/,"$1Template$2");
	// ttParams = [this.defaultPath,template];
	ttParams = ["blog.html",template];
	// for online:
	createTiddlyButton(place, this.label, null, function() {config.macros.uploadText.handler(null,null,ttParams);});
	// for offline:
	// createTiddlyButton(place, this.label, null, function() {config.macros.TiddlyTemplating.handler(null,null,ttParams);});
};