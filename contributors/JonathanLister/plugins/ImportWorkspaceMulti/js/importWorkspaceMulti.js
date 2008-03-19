config.macros.importWorkspaceMulti = {};

config.macros.importWorkspaceMulti.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	// this uses the existing importWorkspace mechanism to import each systemServer tiddler returned by the filter in params[0], where the filter is of the form used by Tiddlywiki.prototype.filterTiddlers
	// currently only supports tag filters i.e. filters of the form [tag[filterTag]]
	// protects against importing your own feeds
	// console.log("in handler");
	if (params[0]) {
		var filter = params[0];
	}
	this.importAll(filter);
};

config.macros.importWorkspaceMulti.importAll = function(filter) {
	// 23/10/07: The next two lines should work when the core filterTiddlers function is sorted out
	// var extended_filter = filter+" [tag[systemServer]]";
	// var workspace_tiddlers = store.filterTiddlers(extended_filter);
	var sysServer_tiddlers = store.getTaggedTiddlers("systemServer");
	var workspace_tiddlers = [];
	if(!filter) {
		// if there is no filter, just import from all tiddlers with a systemServer tag
		// prompt first though...
		var sysList = "";
		for (var i=0;i<sysServer_tiddlers.length;i++) {
			sysList = sysList + "\n" + sysServer_tiddlers[i].title;
			workspace_tiddlers.push(sysServer_tiddlers[i]);
		}
		if(!confirm("are you sure you want to import from all these tiddlers?\n\n" + sysServer_Tiddlers)) {
			return false;
		};
	} else {
		// console.log(sysServer_tiddlers);
		// console.log(filter);
		var regex_tagFilter = /\[tag\[([\w ]+?)\]\]/mg;
		var match = regex_tagFilter.exec(filter);
		if (match) {
			var mini_filter = match[1];
			// console.log(match);
		} else {
			// console.log("no match");
		}
		for (var i=0;i<sysServer_tiddlers.length;i++) {
			// ownPath/feedPath specific to .html/.xml
			// can make feedPath general to any extension if we improve the regex
			// we assume ownPath is always a .html file
			var ownPath = document.location.href.replace(/.html$/,"");
			// console.log(ownPath);
			var feedPath = store.getTiddlerSlice(sysServer_tiddlers[i].title,"URL").replace(/.xml$/,"");
			// console.log(feedPath);
			if (ownPath != feedPath) {
				if (sysServer_tiddlers[i].isTagged(mini_filter)) {
					// console.log("tag match with: " + sysServer_tiddlers[i].title);
					workspace_tiddlers.push(sysServer_tiddlers[i]);
				}
			}
		}
	}
	// console.log(workspace_tiddlers);
	// run through the systemServer tiddlers, importing as we go
	for (var i=0;i<workspace_tiddlers.length;i++) {
		var title = workspace_tiddlers[i].title;
		var fields = {};
		fields['server.type'] = store.getTiddlerSlice(title,'Type');
		fields['server.host'] = store.getTiddlerSlice(title,'URL');
		fields['server.workspace'] = store.getTiddlerSlice(title,'Workspace');
		fields['server.filter'] = store.getTiddlerSlice(title,'TiddlerFilter');
		// console.log("about to call importWorkspace with: " + title);
		config.macros.importWorkspace.getTiddlers.call(config.macros.importWorkspace,fields);
	}
};