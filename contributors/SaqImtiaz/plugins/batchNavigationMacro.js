//<div class='viewer' macro='batchNavigation Lectures'></div>

config.macros.batchNavigation = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		if(!config.macros.navigation)
			return false;
		var sets = store.getTaggedTiddlers(params[0]);
		for (var s=0; s<sets.length; s++){
			var p = "tiddlers:{{store.getTiddlerText('" + sets[s].title + "').readBracketedList()}}";
			invokeMacro(place,'navigation',p,wikifier,tiddler);
		}
	}
}
