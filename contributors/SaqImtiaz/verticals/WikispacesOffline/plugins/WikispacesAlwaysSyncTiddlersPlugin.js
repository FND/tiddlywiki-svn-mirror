merge(config.defaultCustomFields,{
	wikiformat:'wikispaces'
//	'server.host':'disabledvillagechildren.projects.unamesa.org',
//	'server.workspace':'disabledvillagechildren'
});

window.setupCustomFields = function() {
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
     merge(config.defaultCustomFields,customFields);
}

//window.setupCustomFields();