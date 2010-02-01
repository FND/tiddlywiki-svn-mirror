var oldEditHandler = config.macros.edit.handler;
config.macros.edit.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var editHolder = createTiddlyElement(place, "div", "editHolder");
	if(paramString.indexOf("text") === -1)  {// if paramsString does not contain "text" 
		oldEditHandler(editHolder,macroName,params,wikifier,paramString,tiddler);  // use old edit handler 
	}else {  // We are dealing with the main text area 	
		var markupSwitch = function() {
			// attempt to retrieve previous conent and add it to the new textarea
			if(confirm("Unsaved changes to this tiddler will be lost??")===true) {
				removeChildren(this.parentNode);
				oldEditHandler(place,macroName,params,wikifier,paramString,tiddler);  // use old edit handler 
			}			
		};
		if(tiddler.text.substring(0, 6)==="<html>" || tiddler.text == config.views.editor.defaultText.format([tiddler.title])) {
			createTiddlyButton(editHolder,'Switch to TiddlyWiki Markup', 'revert to wiki markup', markupSwitch, 'button wikiMarkupButton', null, null, {tiddlerTitle:tiddler.title});	
			config.macros.editHtml.handler(editHolder,macroName,params,wikifier,paramString,tiddler);	
		} else {
			oldEditHandler(editHolder,macroName,params,wikifier,paramString,tiddler);  // use old edit handler 
		}		
	}
};


config.shadowTiddlers["ckEditorStyles"] = store.getTiddlerText("CKEditorPluginEditOverride##StyleSheet");
store.addNotification("ckEditorStyles", refreshStyles);


//################################################################################
//# CUSTOM STYLESHEET
//################################################################################

/***
!StyleSheet

.wikiMarkupButton  {
	border:2px;
	margin:0.5em;
	padding:0.5em;
}

!(end of StyleSheet)
***/