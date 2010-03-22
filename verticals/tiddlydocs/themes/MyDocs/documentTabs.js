/***
|''Name''|DocumentTabsPlugin (for MyDocs)|
|''Description''|Provides tabs which users can use to change the current active document to any document which already exists.|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''||
!Description

Provides tabs which users can use to change the current active document to any document which already exists.

!Usage
{{{

<<docTabs>>

}}}

!Code
***/

//{{{
	
config.macros.docTabs = {};
config.macros.docTabs.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var html = '<div id="tab_wrapper" style="background-color: rgb(128, 128, 128);"><ul class="tabs" id="tab_bar" style="visibility: visible;"><li class="tab spacer"/></li></ul></div>';
	var d = createTiddlyElement(null, 'div', '', '', '');
	d.innerHTML  = html;
	place.appendChild(d);
	config.macros.docTabs.refresh();
}


config.macros.docTabs.switchDoc = function (title) {
	window.activeDocument = title;
	refreshAll();
	var spec = jQuery.parseJSON(store.getTiddlerText(title));
	if(spec.content[0] != undefined){
		story.displayTiddler(null, spec.content[0].title);
	}
}

config.macros.docTabs.refresh = function() {
	var values = store.getTaggedTiddlers('document');
	var selectedHtml = '';
	for (var i=0; i < values.length; i++) {
		if(values[i].title == window.activeDocument){
			selectedHtml += '<li class="tab tab_l tab_l_selected"/><li class="tab selectedtab" id="tab_6801"><div class="tabsDiv"><span id="tab_name_6801">'+values[i].title+'</span></div></li><li class="tab tab_r tab_r_selected"/>';
		} else {
			selectedHtml +=  '<li class="tab tab_l tab_l_add" id="add_tab_l"></li><li class="tab tab_add tabalignment2 tabalignment2OP" id="add_tab"  onclick="config.macros.docTabs.switchDoc(\''+values[i].title.replace("'", "\\'")+'\');"><div><a class="thickbox mis" href="#">'+values[i].title+'</a></div></li><li class="tab tab_r tab_r_add"></li>';
	
		}
	selectedHtml += '<li class="tab spacer"/>';
	}
	html = selectedHtml;
	jQuery('#tab_bar:first-child').html(html);
	var addClick = function() {
			story.displayTiddler(null, "Create New Document", config.options.txtTheme+'##wizardViewTemplate');
	}
	jQuery('#AddFromCatalogueDialogue').click(addClick);
}
