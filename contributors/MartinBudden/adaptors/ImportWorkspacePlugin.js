/***
|''Name:''|ImportWorkspacePlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ImportWorkspacePlugin.js |
|''Version:''|0.0.9|
|''Date:''|Aug 23, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|

|''Feed for import''|<<option txtImportFeed>>|
|''Import workspace on startup''|<<option chkImportWorkspaceOnStartup>>|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ImportWorkspacePlugin) {
version.extensions.ImportWorkspacePlugin = {installed:true};

if(config.options.txtImportFeed == undefined)
	{config.options.txtImportFeed = '';}
if(config.options.chkImportWorkspaceOnStartup == undefined)
	{config.options.chkImportWorkspaceOnStartup = false;}

config.messages.hostOpened = "Host '%0' opened";
config.messages.workspaceOpened = "Workspace '%0' opened";
config.messages.workspaceTiddlers = "%0 tiddlers on host, importing...";
config.messages.tiddlerImported = "Tiddler: \"%0\" imported";


// import all the tiddlers from a given workspace on a given host
config.macros.importWorkspace = {};
merge(config.macros.importWorkspace,{
	label: "import workspace",
	prompt: "Import tiddlers in workspace",
	done: "Tiddlers imported"});


config.macros.importWorkspace.init = function()
{
	var customFields = config.defaultCustomFields;
	if(!customFields['server.type']) {
		//# no server set so get the server from the specified feed
		var title = config.options.txtImportFeed;
		if(title=='') {
			//# no feed specified, so just use the first feed found to set the defaultCustomFields
			var tiddlers = store.getTaggedTiddlers('systemServer');
			if(tiddlers.length>0)
				title = tiddlers[0].title;
		}
		if(title) {
			config.defaultCustomFields['server.type'] = store.getTiddlerSlice(title,'Type');
			config.defaultCustomFields['server.host'] = store.getTiddlerSlice(title,'URL');
			config.defaultCustomFields['server.workspace'] = store.getTiddlerSlice(title,'Workspace');
		}
	}
	if(config.options.chkImportWorkspaceOnStartup)
		config.macros.importWorkspace.getTiddlersForAllFeeds();
};

config.macros.importWorkspace.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams('anon',null,false,false,false);
	var customFields = getParam(params,'fields',false);
	if(!customFields['server.type']) {
		var title = getParam(params,'anon');
		if(!title) {
			customFields = config.defaultCustomFields;
			if(!customFields['server.type']) {
				var tiddlers = store.getTaggedTiddlers('systemServer');
				if(tiddlers.length>0)
					title = tiddlers[0].title;
			}
		}
		if(title) {
			customFields = {};
			customFields['server.type'] = store.getTiddlerSlice(title,'Type');
			customFields['server.host'] = store.getTiddlerSlice(title,'URL');
			customFields['server.workspace'] = store.getTiddlerSlice(title,'Workspace');
		}
	}
	customFields = String.encodeHashMap(customFields);
	//#displayMessage("cf:"+customFields)
	var label = getParam(params,'label',this.label);
	var btn = createTiddlyButton(place,label,this.prompt,this.onClick);
	btn.setAttribute('customFields',customFields);
};

config.macros.importWorkspace.onClick = function(e)
{
	clearMessage();
//#displayMessage("Starting import...");
	var customFields = this.getAttribute('customFields');
//#displayMessage("cf:"+customFields)
	var fields = customFields ? customFields.decodeHashMap() : config.defaultCustomFields;
	config.macros.importWorkspace.getTiddlersForContext(config.macros.importWorkspace.createContext(fields));
};

config.macros.importWorkspace.getTiddlersForAllFeeds = function()
{
	var tiddlers = store.getTaggedTiddlers('systemServer');
	for(var i=0;i<tiddlers.length;i++) {
		config.macros.importWorkspace.getTiddlersForFeed(tiddlers[i].title);
	}
};

config.macros.importWorkspace.getTiddlersForFeed = function(feed)
{
	var fields = {};
	fields['server.type'] = store.getTiddlerSlice(feed,'Type');
	fields['server.host'] = store.getTiddlerSlice(feed,'URL');
	fields['server.workspace'] = store.getTiddlerSlice(feed,'Workspace');
	var filter = store.getTiddlerSlice(feed,'TiddlerFilter');
	config.macros.importWorkspace.getTiddlersForContext(config.macros.importWorkspace.createContext(fields,filter));
};

config.macros.importWorkspace.getTiddlers = function(uri,type,workspace,filter,userCallback)
{
	var fields = {};
	fields['server.host'] = uri;
	fields['server.type'] = type;
	fields['server.workspace'] = workspace;
	config.macros.importWorkspace.getTiddlersForContext(config.macros.importWorkspace.createContext(fields,filter,userCallback));
};

config.macros.importWorkspace.createContext = function(fields,filter,userCallback)
{
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(!serverType)
		return false;
	var adaptor = new config.adaptors[serverType];
	if(!adaptor)
		return false;
	if(adaptor) {
		var context = {};
		context.host = fields['server.host'];
		context.workspace = fields['server.workspace'];
		context.filter = filter;
		context.userCallback = userCallback;
		context.adaptor = adaptor;
		return context;
	}
	return false;
};

config.macros.importWorkspace.getTiddlersForContext = function(context)
{
	if(context) {
		context.adaptor.openHost(context.host,context);
		//context.adaptor.getWorkspaceList(context,null,config.macros.importWorkspace.getWorkspaceListCallback);
		context.adaptor.openWorkspace(context.workspace,context,null,config.macros.importWorkspace.openWorkspaceCallback);
		//context.adaptor.getTiddlerList(context);
		return true;
	}
	return false;
};

config.macros.importWorkspace.openWorkspaceCallback = function(context,userParams)
{
	if(context.status) {
		context.adaptor.getTiddlerList(context,null,config.macros.importWorkspace.getTiddlerListCallback);
		return true;
	}
	displayMessage(context.statusText);
	return false;
};

config.macros.importWorkspace.getTiddlerListCallback = function(context,userParams)
{
//#displayMessage("config.macros.importWorkspace.getTiddlerListCallback:"+context.status);
	if(context.status) {
		var tiddlers = context.tiddlers;
		var sortField = 'modified';
		tiddlers.sort(function(a,b) {return a[sortField] < b[sortField] ? +1 : (a[sortField] == b[sortField] ? 0 : -1);});
		var length = tiddlers.length;
		if(userParams && userParams.maxCount && length > userParams.maxCount)
			length = userParams.maxCount;
		displayMessage(config.messages.workspaceTiddlers.format([tiddlers.length]));
		for(var i=0; i<length; i++) {
			tiddler = tiddlers[i];
			var t = store.fetchTiddler(tiddler.title);
			if(!t) {
				//# only get the tiddlers that are not available locally
				context.adaptor.getTiddler(tiddler.title,null,null,config.macros.importWorkspace.getTiddlerCallback);
			}
		}
	}
};

config.macros.importWorkspace.getTiddlerCallback = function(context,userParams)
{
//#displayMessage("config.macros.importWorkspace.getTiddlerCallback:"+context.status+" t:"+context.tiddler.title);
	if(context.status) {
		var tiddler = context.tiddler;
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		story.refreshTiddler(tiddler.title,1,true);
		//# displayMessage(config.messages.tiddlerImported.format([tiddler.title]));
	} else {
		displayMessage(context.statusText);
	}
	if(context.userCallback)
		context.userCallback(context,userParams);
};

} //# end of 'install only once'
//}}}
