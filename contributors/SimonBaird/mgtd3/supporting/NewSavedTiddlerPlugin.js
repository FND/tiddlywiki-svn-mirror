config.macros.newSavedTiddler={};
config.macros.newSavedTiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	if(readOnly){
		return false;
	}
	var p = paramString.parseParams("anon",null,true,false,false);
	var label = getParam(p,"label","NewSavedTiddler");
	var tooltip = getParam(p,"tooltip","Create a new saved tiddler");
	var btn = createTiddlyButton(place,label,tooltip,this.onClick);
	btn.params = paramString;
	return false;
};

config.macros.newSavedTiddler.onClick = function(e) {
	var p = this.params.parseParams("anon",null,true,false,false);
	var titlePrompt = getParam(p,"prompt","Enter the title for the new tiddler:");
	var title = prompt(titlePrompt,"");
	if(title){
		title = config.macros.newTiddler.getName(title); // from NewMeansNewPlugin
		var text = getParam(p,"text","");
		var tags = getParam(p,"tag","");
		var fields = getParam(p,"fields","").decodeHashMap();
        tags = tags.replace(/\[\(/g,'[[');
        tags = tags.replace(/\)\]/g,']]');
		store.saveTiddler(title,title,text,config.options.txtUserName,new Date(),tags,fields);
		story.displayTiddler(this,title);
		return false;
	}
}

