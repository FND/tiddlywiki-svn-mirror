config.macros.toolbar.isCommandEnabled=function(command,tiddler){	
	var title=tiddler.title;
	if (workspace_delete=="D"){
		// REMOVE OPTION TO DELETE TIDDLERS 
		if (command.text=='delete')
			return false;
	}
	if (workspace_udate=="D"){
		// REMOVE EDIT LINK FROM TIDDLERS 
		if (command.text=='edit')
			return false;
	}
	var ro=tiddler.isReadOnly();
	var shadow=store.isShadowTiddler(title) && !store.tiddlerExists(title);
	return (!ro || (ro && !command.hideReadOnly)) && !(shadow && command.hideShadow);
};