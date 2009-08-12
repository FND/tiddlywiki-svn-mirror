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
	var firstItem = jQuery.parseJSON(store.getTiddlerText(title)).content[0].title;
	story.displayTiddler(null, firstItem);
}

config.macros.docTabs.refresh = function() {


var values = store.getTaggedTiddlers('document');
	var selectedHtml = '';
	for (var i=0; i < values.length; i++) {
		if(values[i].title == window.activeDocument){
			selectedHtml += '<li class="tab tab_l tab_l_selected"/><li class="tab selectedtab" id="tab_6801"><div class="tabsDiv"><span id="tab_name_6801">'+values[i].title+'</span></div></li><li class="tab tab_r tab_r_selected"/>';
		} else {
			selectedHtml +=  '<li class="tab tab_l tab_l_add" id="add_tab_l"></li><li class="tab tab_add tabalignment2 tabalignment2OP" id="add_tab"  onclick="config.macros.docTabs.switchDoc(\''+values[i].title+'\');"><div><a class="thickbox mis" href="#"><img src="static/wa/jarrita/skins/wholesale/images/icons/add_tab_normal.png" class="moreFunctionsImg addTabImg"/>'+values[i].title+'</a></div></li><li class="tab tab_r tab_r_add"></li>';
	
		}
	selectedHtml += '<li class="tab spacer"/>';
	}



	var newdoc = '<li class="tab tabalignment3OP tabalignment3" id="add_gadget"><a  class="thickbox mis addFromCatalogue"  id="AddFromCatalogueDialogue"><img style="border: medium none ;" src="http://www.btwholesale.com/container/static/wa/jarrita/skins/wholesale/images/buttons/add_gadgets_normal.gif" class="addGadgetCatImg"/></a>';
html = selectedHtml  + newdoc;
	jQuery('#tab_bar:first-child').html(html);
	var addClick = function() {
			story.displayTiddler(null, "Create New Document");
	}
	jQuery('#AddFromCatalogueDialogue').click(addClick);
}



