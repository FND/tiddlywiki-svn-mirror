/***
|''Name''|saveNewSection|
|''Description''|adds the SaveNewSection Command which when added to a tiddlers toolbar commands ensures the current tiddler is a part of the active tiddlydocs table of content|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/saveNewSection.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/saveNewSection.js |
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Requires''||
!Description

adds the SaveNewSection Command which when added to a tiddlers toolbar commands ensures the current tiddler is a part of the active tiddlydocs table of content

!Usage
{{{

add saveNewSection to the ToolbarCommands tiddler.

}}}

!Code
***/

//{{{
	
if(config.options.txtAutoAddSection==null)
	config.options.txtAutoAddSection = 'top';
	
config.commands.saveNewSection = {};
config.commands.saveNewSection.find = function(needle, haystack) {
	for(var t=0; t < haystack.length; t++) {
		if(haystack[t].title==needle)
			return true;
		if(haystack[t].children != undefined)
			config.commands.saveNewSection.find(needle, haystack[t].children);
	}
	return false;
}

window.addToToc = function(sectionTitle, docTitle) {
	var documentSpec = jQuery.parseJSON(store.getTiddlerText(docTitle)).content;
	if(!config.commands.saveNewSection.find(sectionTitle, documentSpec)){
		var node = {
			title: sectionTitle,
			children:[]
		};
		if(config.options.txtAutoAddSection == 'bottom') 
			documentSpec.push(node);
		if(config.options.txtAutoAddSection == 'top') 
			documentSpec.unshift(node);
	
		var docFields = store.getTiddler(docTitle).fields;
		var tiddler = store.saveTiddler(docTitle, docTitle, '{content:'+jQuery.toJSON(documentSpec)+'}', null, null, null, merge(docFields, config.defaultCustomFields));
	}
}


merge(config.commands.saveNewSection,{
	text: "add",
	tooltip: "Add this section to the active document."});


config.commands.saveNewSection.handler = function(event,src,title)
{
	var newTitle = story.saveNewSection(title,event.shiftKey);
	if(newTitle)
		story.displayTiddler(null,newTitle);
	return false;
};
	

//(function() {

var _saveTiddler = Story.prototype.saveTiddler;
Story.prototype.saveNewSection = function(title, minorUpdate) {
	var autosave = config.options.chkAutoSave;
	config.options.chkAutoSave = false;
	var _title = _saveTiddler.apply(this, arguments);
	config.options.chkAutoSave = autosave;
	if(config.options.chkAutoAddSection != 'none') {
		addToToc(_title, window.activeDocument);
	}
//	var tiddler = store.getTiddler(_title);
	autoSaveChanges(null, [window.activeDocument]);
	refreshAll();
	return _title;
};

//})();


//}}}