
var oldEditHandler = config.macros.edit.handler;
config.macros.edit.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var editHolder = createTiddlyElement(place, "div", "editHolder");
	if(paramString.indexOf("text") === -1)  {// if paramsString does not contain "text" 
		oldEditHandler(editHolder,macroName,params,wikifier,paramString,tiddler);  // use old edit handler 
	}else {  // We are dealing with the main text area 	
		var markupSwitch = function() {
			removeChildren(this.parentNode);
			oldEditHandler(place,macroName,params,wikifier,paramString,tiddler);  // use old edit handler 			
		};
		if(tiddler.text.substring(0, 6)==="<html>" || tiddler.text == config.views.editor.defaultText.format([tiddler.title])) {
			config.macros.editHtml.handler(editHolder,macroName,params,wikifier,paramString,tiddler);
			createTiddlyButton(editHolder,'WikiMarkup', 'revert to wiki markup', markupSwitch, null, null, null, {tiddlerTitle:tiddler.title});	
		} else {
			oldEditHandler(editHolder,macroName,params,wikifier,paramString,tiddler);  // use old edit handler 
		}		
	}
};


