config.macros.importAndSync = {
    
    label: 'synchronize',
    
    prompt: 'synchronize with server',
    
    handler : function(place,macroName,params,wikifier,paramString,tiddler){
        createTiddlyButton(place,this.label,this.prompt,this.onClick);
    },
    
    onClick : function(e){
        config.macros.importWorkspace.getTiddlersForAllFeeds();
        var customFields = config.defaultCustomFields;
        if(!customFields['server.type']) {
            var tiddlers = store.getTaggedTiddlers('systemServer');
            if(tiddlers.length>0)
                var title = tiddlers[0].title;
        }
        if(title) {
            customFields = {};
            customFields['server.type'] = store.getTiddlerSlice(title,'Type');
            customFields['server.host'] = store.getTiddlerSlice(title,'URL');
            customFields['server.workspace'] = store.getTiddlerSlice(title,'Workspace');
        }
        config.macros.quicksync.getTiddlers(config.macros.quicksync.createContext(customFields));  
        return false;      
    }  
}