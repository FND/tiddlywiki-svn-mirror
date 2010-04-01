config.macros.removeActiveDocumentLink = {
	linkText:"delete this document"
};
config.macros.removeActiveDocumentLink.handler = function() {
	
		var delButton = createTiddlyElement(place, "a", null, 'deleteDocumentButton', config.macros.removeActiveDocumentLink.linkText);
		jQuery(delButton).click(function(){
//			jQuery(this.parentNode).fadeOut("slow");
			store.setTiddlerTag(window.activeDocument,false,"document");
			store.setTiddlerTag(window.activeDocument,true,"documentDisabled");
			autoSaveChanges(true, window.activeDocument);
			window.activeDocument = store.getTaggedTiddlers('document')[0].title;
			refreshAll();
			return false;
		});
	
}