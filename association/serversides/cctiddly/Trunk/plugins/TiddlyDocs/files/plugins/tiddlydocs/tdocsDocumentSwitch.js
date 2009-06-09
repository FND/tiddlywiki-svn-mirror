config.macros.docSwitcher = {};
config.macros.docSwitcher.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var values = store.getTaggedTiddlers('document');
	var options = [];
	for (var i=0; i < values.length; i++) {
		options.push({'caption': values[i].title, 'name': values[i].title});				
	}
	var dropDown = createTiddlyDropDown(place,this.setDropDownMetaData,options,window.activeDocument);
}

config.macros.docSwitcher.setDropDownMetaData = function(ev) {
	var title = this.name;
	var option = this[this.selectedIndex].value;
	window.activeDocument = option;
	console.log("opt is : ", option);
	refreshAll();
}