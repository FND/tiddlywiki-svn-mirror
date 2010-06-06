/*
This is  TiddlyWiki Plugin 

Pulls in a list from a store tiddler using the specified adaptor (incorrectly named serializer atm) and generate a nestedSortable list from it. 

Also handles saving back to the same file. 

*/

config.macros.smmNestedSortable = {
	serializer:'jsonSerializer',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		this.refresh(place,macroName,params,wikifier,paramString,tiddler);
	},
	refresh: function(place,macroName,params,wikifier,paramString,tiddler) {
		docTiddler = window.activeDocument;
		if(store.tiddlerExists(docTiddler)) {
			var spec = jQuery.fn.smmNestedSortable[this.serializer].getSpec(docTiddler);
			var specView = createTiddlyElement(place, "div", "", "specView");	
			this.renderSpec(specView, spec);
		}else{
			this.noSpec();
		}
	},
	renderSpec: function(specView, spec) {
		window.ulCount=0;
		jQuery(specView).empty();
		this._renderSpec(specView, spec, []);	
		jQuery(jQuery(specView)).sortable({
			items: "li",
         	helper: "helper"
		}); 
	}, 
	_renderSpec: function(specView, spec, label) {
		var ul = createTiddlyElement(specView, "ul", "ul"+(window.ulCount++), "sortable");
		var childCount=1;
		label=label.concat([0]);
		jQuery.each(spec, function() {
			label[label.length-1]++;
			var li = config.macros.smmNestedSortable.renderItem(this, ul, label)
			config.macros.smmNestedSortable._renderSpec(li, this.children, label);
		});
	},
	noSpec: function(place) {
		createTiddlyElement(place, "span", null, "noDocSelected error", config.macros.TableOfContent.noDocSelectedText)
	},
	renderItem: function(item, ul, label) {
		return  li = createTiddlyElement(ul, "li", item.title, null, item.title);
	},
	specChanged: function() {
		if(store.tiddlerExists(window.activeDocument)) { 
			var specTiddler = store.getTiddler(window.activeDocument); 
			var fields = merge(specTiddler.fields, config.defaultCustomFields); 
		} else { 
		    var fields = config.defaultCustomFields; 
		} 
		store.saveTiddler(window.activeDocument, window.activeDocument, jQuery.fn.smmNestedSortable[this.serializer].buildSpec(), null, null, "document", fields); 
		autoSaveChanges(true, window.activeDocument);
		refreshAll();
	}
};
