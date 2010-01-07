config.macros.list.withNotes= {
	
	handler : function(params){
		var notesTag = params[1];
		var suffix = params[2];
		var notes = store.getTaggedTiddlers(notesTag,"title");


		var getTiddlerForNotes = function(note){
			var title = note.title.replace("-"+suffix,"");
			tiddler = store.getTiddler(title);
			if (tiddler)
				return tiddler;
		};
		var tiddlers = notes.map(getTiddlerForNotes);
		return tiddlers;
	}

};

config.macros.list.withoutNotes = {

	handler : function(params){
		if (params[1] && params[1] != "")
			var tiddlers = store.getTaggedTiddlers(params[1],'title');
		else
			tiddlers = store.getTiddlers('title',"excludeLists"); 	

		var suffix = params[2];

		var nonotes = [];

		for (var j=0;j<tiddlers.length;j++){
			if(tiddlers[j].fields['server.type'] == "wikispaces"){
				var title = tiddlers[j].title + "-" + suffix;
				var tiddler = store.getTiddler(title);
				if(!tiddler)
					nonotes.push(tiddlers[j]);
			}
		}
		return nonotes;
	}

}

