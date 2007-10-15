//{{{

config.macros.tiddlyChatterControlPanel = {};

config.macros.tiddlyChatterControlPanel.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	if (config.macros.importWorkspace) {
		config.macros.importWorkspace.handler(place,"importWorkspacePlugin",params,wikifier,paramString,tiddler);
	}
	if (config.macros.newTiddler) {
		config.macros.newTiddler.handler(place,"newTiddler","{label:'New Chatter',title:'NewChatter',tag:'public',text:'Type some text and then press DONE'}",wikifier,"label:'New Chatter' title:'NewChatter' tag:'public' text:'Type some text and then press DONE'",tiddler);
	}
	if (config.macros.tiddlyChatterIncoming) {
		config.macros.tiddlyChatterIncoming.handler(place,"tiddlyChatterIncoming",params,wikifier,paramString,tiddler);
	}
	if (config.macros.tiddlyChatterSetup) {
		config.macros.tiddlyChatterSetup.handler(place,"tiddlyChatterSetup",params,wikifier,paramString,tiddler);
	}
};


//}}}