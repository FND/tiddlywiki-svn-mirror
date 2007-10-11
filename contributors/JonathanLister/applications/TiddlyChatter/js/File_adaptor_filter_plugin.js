//{{{

// Gets the list of tiddlers within a given workspace
FileAdaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
{
	if(!this.store)
		return FileAdaptor.NotLoadedError;
	if(!context)
		context = {};
//	context.tiddlers = [];
//	this.store.forEachTiddler(function(title,tiddler)
//		{
//		var t = new Tiddler(title);
//		t.text = tiddler.text;
//		t.modified = tiddler.modified;
//		t.modifier = tiddler.modifier;
//		t.fields['server.page.revision'] = tiddler.modified.convertToYYYYMMDDHHMM();
//		t.tags = tiddler.tags;
//		context.tiddlers.push(t);
//		});
	context.tiddlers = this.store.filterTiddlers(filter);
	for(var t=0; t<context.tiddlers.length; t++) {
		context.tiddlers[t].fields['server.page.revision'] = context.tiddlers[t].modified.convertToYYYYMMDDHHMM();
	}
	context.status = true;
	window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

//}}}