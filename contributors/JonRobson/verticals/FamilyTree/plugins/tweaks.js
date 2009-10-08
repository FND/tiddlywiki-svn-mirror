merge(config.macros.newTiddler,{
	label: "new person",
	prompt: "Create a new person in your family tree",
	title: "New Person",
	accessKey: "N"});

config.macros.bootUpFamilyTree = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler){
        story.closeAllTiddlers();
          var tiddlers = store.getTaggedTiddlers("rootTree");
         for(var i=0; i < tiddlers.length; i++){
             story.displayTiddler(null,tiddlers[i].title);
         }
        
        
    }
};