config.macros.docTabs = {};
config.macros.docTabs.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	
	var html = '<div id="tab_wrapper" style="background-color: rgb(128, 128, 128);"><ul class="tabs" id="tab_bar" style="visibility: visible;"><li class="tab spacer"/><li class="tab tab_l tab_l_selected"/><li class="tab selectedtab" id="tab_6801"><div class="tabsDiv"><span id="tab_name_6801">The Internet</span></div></li><li class="tab tab_r tab_r_selected"/><li class="tab spacer"/><li class="tab tab_l tab_l_add" id="add_tab_l"></li><li class="tab tab_add tabalignment2 tabalignment2OP" id="add_tab"><div><a title="Click here to add more pages" class="thickbox mis" href="addTabForm.do?TB_iframe=true&amp;height=80&amp;width=195&amp;modal=true" id="AddTabDialogue"><img src="static/wa/jarrita/skins/wholesale/images/icons/add_tab_normal.png" class="moreFunctionsImg addTabImg"/> Create New Document</a></div></li><li class="tab tab_r tab_r_add"></li><li class="tab tabalignment3OP tabalignment3" id="add_gadget"><a title="Click to add gadgets from the catalogue" alt="Click to add gadgets from the catalogue" class="thickbox mis addFromCatalogue" href="/container/catalogue/index.do?target=http://www.btwholesale.com:80/container/jsp/tiles/container.jsp?null&amp;TB_iframe=true&amp;height=495&amp;width=800&amp;modal=true" id="AddFromCatalogueDialogue"><img style="border: medium none ;" src="static/wa/jarrita/skins/wholesale/images/buttons/add_gadgets_normal.gif" class="addGadgetCatImg"/></a></li></ul></div>';
	var d = createTiddlyElement(null, 'div', '', '', '');
	d.innerHTML  = html;
	place.appendChild(d);
}




