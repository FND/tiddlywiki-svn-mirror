/***
|''Name''|removeActiveDocumentLinkPlugin|
|''Description''|outputs the current active document|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Requires''||

!Usage
{{{

<<removeActiveDocumentLink>>

}}}

!Code
***/

//{{{

config.macros.removeActiveDocumentLink = {
	linkText:"delete this document"
};
config.macros.removeActiveDocumentLink.handler = function() {
		if(!window.activeDocument)
			return false;
			
		var delButton = createTiddlyElement(place, "a", null, 'deleteDocumentButton', config.macros.removeActiveDocumentLink.linkText);
		jQuery(delButton).click(function(){
//			jQuery(this.parentNode).fadeOut("slow");
			store.setTiddlerTag(window.activeDocument,false,"document");
			store.setTiddlerTag(window.activeDocument,true,"documentDisabled");
			autoSaveChanges(true, window.activeDocument);
			if(store.getTaggedTiddlers('document')[0].title)
				window.activeDocument = store.getTaggedTiddlers('document')[0].title;
			refreshAll();
			return false;
		});
	
}

//}}}