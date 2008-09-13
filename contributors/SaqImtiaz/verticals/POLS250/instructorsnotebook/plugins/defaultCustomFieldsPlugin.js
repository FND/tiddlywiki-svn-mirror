window.setDefaultCustomFields = function(){
	var t = store.getTaggedTiddlers('systemServerDefault')[0];
	var cf = {};	
	if(t) {
		cf['server.type'] = store.getTiddlerSlice(t.title,'Type');
		cf['server.host'] = store.getTiddlerSlice(t.title,'URL');
		cf['server.workspace'] = store.getTiddlerSlice(t.title,'Workspace');
	}
	merge(config.defaultCustomFields,cf);
}

window.setDefaultCustomFields();

