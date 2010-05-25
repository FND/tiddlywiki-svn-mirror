config.macros.smmNestedSortable = {
	serializer:'textSerializer',
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
		window.liCount=0;
		window.divCount=0;
		window.sectionCount = 1;
		jQuery(specView).empty();
		this._renderSpec(specView, spec, []);	
		jQuery(jQuery(specView)).smmNestedSortable({
			'serializer':function() {
				config.macros.smmNestedSortable.specChanged();
			}
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
		
		
		/*
		if(store.getTiddler(item.title)!=null){
			if(store.getTiddler(item.title).fields.tt_status == "Complete")
				var sectionClass = "completed"; 
		}else{
			var sectionClass = "";
		}
		var exists = (store.tiddlerExists(item.title)) ? "" : "sectionNotExist";
	    var sectionDiv = createTiddlyElement(li, "div", this.title+"_div", "sectionHeading toc-sort-handle "+sectionClass+" "+config.macros.TableOfContent.strip(this.title)+"_div "+exists);	
		sectionDiv.title = config.macros.TableOfContent.dragToolTip;
		sectionDiv.onclick = function() {
			if(config.options.chkOpenEditView == true)
				story.displayTiddler(item.id, item.id.replace("_div", ""), config.macros.TableOfContent.editTemplate ,null, null, null, null,item);
			else
				story.displayTiddler(item.id, item.id.replace("_div", ""), config.macros.TableOfContent.viewTemplate,null, null, null, null,item);
		};		
		jQuery(sectionDiv).hover( 
			function() { 
				jQuery(item).children().css('opacity', '1');
			},  
			function() {                  
				jQuery(item).children().css('opacity', '0');
			} 
        );
		createTiddlyText(sectionDiv, label.join(".")+"  :  "+item.title);
		var a = createTiddlyElement(sectionDiv, "a", null, 'button deleteButton', config.macros.TableOfContent.deleteText);    
		jQuery(a).css('opacity', '0');
		jQuery(a).click(function() {
			jQuery(item).parent().parent().fadeOut('fast', function() {
				jQuery(item).remove();
				config.macros.TableOfContent.specChanged();
			});
			return false;
		})
		
		*/
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
