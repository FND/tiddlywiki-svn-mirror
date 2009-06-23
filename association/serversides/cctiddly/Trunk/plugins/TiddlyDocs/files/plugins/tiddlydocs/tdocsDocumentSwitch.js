config.macros.docSwitcher = {};
config.macros.docSwitcher.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var values = store.getTaggedTiddlers('document');
	var options = [];
	for (var i=0; i < values.length; i++) {
		options.push({'caption': values[i].title, 'name': values[i].title});				
	}
//	options.push({'caption': 'add new', 'name': 'new'});
	var dropDown = createTiddlyDropDown(place,this.setDropDownMetaData,options,window.activeDocument);
}

config.macros.docSwitcher.setDropDownMetaData = function(ev) {
	if(this[this.selectedIndex].value=='new'){
		story.displayTiddler(null, "Create New Document");
		return false;
	}
	var title = this.name;
	var option = this[this.selectedIndex].value;
	window.activeDocument = option;
	refreshAll();
	story.displayTiddler(null, option);
}
