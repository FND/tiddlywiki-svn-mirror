
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
		createTiddlyButton(editHolder,'WikiMarkup', 'revert to wiki markup', markupSwitch, null, null, null, {tiddlerTitle:tiddler.title});

		if(tiddler.text.substring(0, 6)==="<html>")
			config.macros.editHtml.handler(editHolder,macroName,params,wikifier,paramString,tiddler);
		else
			oldEditHandler(editHolder,macroName,params,wikifier,paramString,tiddler);  // use old edit handler 		
	}
};



config.macros.edit.ckRefresh = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var editHolder = createTiddlyElement(place, "div", "editHolder");

	if(paramString.indexOf("text") === -1)  {// if paramsString does not contain "text" 
		oldEditHandler(editHolder,macroName,params,wikifier,paramString,tiddler);  // use old edit handler 
	}else {  // We are dealing with the main text area 
		if(tiddler.text.substring(0, 6)==="<html>")
			config.macros.editHtml.handler(editHolder,macroName,params,wikifier,paramString,tiddler);
		else
			oldEditHandler(editHolder,macroName,params,wikifier,paramString,tiddler);  // use old edit handler 		
	}
		
/*		if(!paramString.indexOf("text")) {
		
		var markupSwitch = function(a, b, c, place) {
			console.log('boo', place);		
		};
		createTiddlyButton(editHolder,'tiddlerText', 'revert to wiki markup', markupSwitch, null, null, null, {tiddlerTitle:tiddler.title});
		config.macros.editHtml.handler(editHolder,macroName,params,wikifier,paramString,tiddler);
	} else {
 		oldEditHandler(editHolder,macroName,params,wikifier,paramString,tiddler);
	}
	*/
};

/*
config.macros.edit.ckRefresh = function(place,macroName,params,wikifier,paramString,tiddler)
{

	if((tiddler.text.substring(0, 6)==="<html>" || !tiddler.isTagged('markup')) && !paramString.indexOf("text")) {
			var markupSwitch = function(place) {
						console.log(arguments);
				var title = this.getAttribute('tiddlerTitle');
				console.log(title);
			//	story.setTiddlerTag(title,'markup',0);
			//	story.saveTiddler(title);
			//	refreshAll();
			}
	
		createTiddlyButton(place,'tiddlerText', 'revert to wiki markup', markupSwitch, null, null, null, {tiddlerTitle:tiddler.title});
		config.macros.editHtml.handler(place,macroName,params,wikifier,paramString,tiddler);

	} else {
 		oldEditHandler(place,macroName,params,wikifier,paramString,tiddler);
	}
};


*/

