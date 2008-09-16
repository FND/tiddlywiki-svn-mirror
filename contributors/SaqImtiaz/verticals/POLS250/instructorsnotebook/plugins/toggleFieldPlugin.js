config.macros.toggleField = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		if(!store.getTiddler(tiddler.title))
			return;
		var key = params[0];
		var val = params[1];
		var label = params[2] || '';
		tiddler = (params[3] && params[3]!=".")? store.getTiddler(params[3]) : tiddler;
		var invert = !!params[4];
		var script = params[5] ? params[5] : null;
		createTiddlyCheckbox(place,label,invert?!store.getValue(tiddler,key):store.getValue(tiddler,key),function(e){
				var currentValue = store.getValue(tiddler,key);
				var newValue = (currentValue == val)? null : val;
				store.suspendNotifications();
				store.setValue(tiddler,key,newValue);
				if(!!script)
					script(place);
				store.resumeNotifications();
				story.refreshTiddler(tiddler.title,1,true);
			});
	}
};
