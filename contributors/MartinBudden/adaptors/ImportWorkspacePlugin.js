/***
|''Name:''|ImportWorkspacePlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ImportWorkspacePlugin.js |
|''Version:''|0.0.15|
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
config.messages.nothingToImport = "Nothing to import";
config.messages.workspaceTiddlers = "%0 tiddlers on host, importing...";
config.messages.tiddlerImported = "Tiddler: \"%0\" imported";
config.messages.importComplete = "Import complete";


// import all the tiddlers from a given workspace on a given host
config.macros.importWorkspace = {};
merge(config.macros.importWorkspace,{
	label: "import workspace",
	prompt: "Import tiddlers in workspace",
	done: "Tiddlers imported",
	usernamePrompt: "Username",
	passwordPrompt: "Password"
	});


config.macros.importWorkspace.init = function()
{
	var customFields = config.defaultCustomFields;
	//config.macros.importWorkspace.getCustomFieldsFromTiddler(config.options.txtImportFeed);
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
			//config.defaultCustomFields.wikiformat = store.getTiddlerSlice(title,'WikiFormat');
		}
	}
	if(config.options.chkImportWorkspaceOnStartup)
		this.getTiddlersForAllFeeds();
};

config.macros.importWorkspace.getCustomFieldsFromTiddler = function(title)
{
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
		//config.defaultCustomFields.wikiformat = store.getTiddlerSlice(title,'WikiFormat');
	}
	return customFields;
};

config.macros.importWorkspace.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams('anon',null,false,false,false);
	var customFields = getParam(params,'fields',false);
	if(!customFields['server.type']) {
		var title = getParam(params,'anon');
		customFields = config.macros.importWorkspace.getCustomFieldsFromTiddler(title);
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

config.macros.importWorkspace.getTiddlersForFeed = function(feed,userCallback,userCallbackParams)
{
	config.macros.importWorkspace.getTiddlers(store.getTiddlerSlice(feed,'URL'),store.getTiddlerSlice(feed,'Type'),store.getTiddlerSlice(feed,'Workspace'),store.getTiddlerSlice(feed,'TiddlerFilter'),userCallback,userCallbackParams)
};

config.macros.importWorkspace.getTiddlers = function(uri,type,workspace,filter,userCallback,userCallbackParams)
{
	var fields = {};
	fields['server.host'] = uri;
	fields['server.type'] = type;
	fields['server.workspace'] = workspace;
	config.macros.importWorkspace.getTiddlersForContext(config.macros.importWorkspace.createContext(fields,filter,userCallback,userCallbackParams));
};

config.macros.importWorkspace.getTiddlersForContext = function(context)
{
//#console.log("config.macros.importWorkspace.getTiddlersForContext");
	if(context) {
		context.loginPromptFn = config.macros.importWorkspace.loginPromptFn;
		context.adaptor.openHost(context.host,context);
		context.adaptor.openWorkspace(context.workspace,context,context.userParams,config.macros.importWorkspace.openWorkspaceCallback);
		return true;
	}
	return false;
};

config.macros.importWorkspace.createContext = function(fields,filter,userCallback,userCallbackParams)
{
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(!serverType)
		return false;
	var adaptor = new config.adaptors[serverType]();
	if(!adaptor)
		return false;
	if(adaptor) {
		var context = {};
		context.host = fields['server.host'];
		context.workspace = fields['server.workspace'];
		context.filter = filter;
		context.userCallback = userCallback;
		context.userCallbackParams = userCallbackParams;
		context.adaptor = adaptor;
		return context;
	}
	return false;
};

config.macros.importWorkspace.loginPromptFn = function(context)
{
//#console.log("loginPromptFn");
//#console.log(context);
	context.username = prompt(config.macros.importWorkspace.usernamePrompt,'');
	context.password = prompt(config.macros.importWorkspace.passwordPrompt,'');
	if(context.loginPromptCallback) {
		context.loginPromptCallback(context);
	}
};

config.macros.importWorkspace.openWorkspaceCallback = function(context,userParams)
{
//#console.log("config.macros.importWorkspace.openWorkspaceCallback:"+context.status);
	if(context.status) {
		context.adaptor.getTiddlerList(context,userParams,config.macros.importWorkspace.getTiddlerListCallback);
		return true;
	}
	displayMessage(context.statusText);
	return false;
};

config.macros.importWorkspace.getTiddlerListCallback = function(context,userParams)
{
//#console.log("config.macros.importWorkspace.getTiddlerListCallback:"+context.status);
	if(context.status) {
		var tiddlers = context.tiddlers;
		var length = tiddlers.length;
		if(userParams && userParams.maxCount && length > userParams.maxCount) {
			length = userParams.maxCount;
			var sortField = 'modified';
			tiddlers.sort(function(a,b) {return a[sortField] < b[sortField] ? +1 : (a[sortField] == b[sortField] ? 0 : -1);});
		}
		context.adaptor.getTiddlerLength = 0;
		for(var i=0; i<length; i++) {
			if(!store.fetchTiddler(tiddlers[i].title)) {
				//# count the tiddlers to be imported
				++context.adaptor.getTiddlerLength;
			}
		}
		if(config.messages.workspaceTiddlers)
			displayMessage(context.adaptor.getTiddlerLength ? config.messages.workspaceTiddlers.format([tiddlers.length]) : config.messages.nothingToImport);
		for(i=0; i<length; i++) {
			tiddler = tiddlers[i];
			var t = store.fetchTiddler(tiddler.title);
			if(!t) {
				//# only get the tiddlers that are not available locally
				var c = null;
				if(context && context.userCallback)
					c = {userCallback:context.userCallback,userCallbackParams:context.userCallbackParams};
				context.adaptor.getTiddler(tiddler.title,c,null,config.macros.importWorkspace.getTiddlerCallback);
			}
		}
	}
};

config.macros.importWorkspace.getTiddlerCallback = function(context,userParams)
{
//#console.log("config.macros.importWorkspace.getTiddlerCallback:"+context.status+" t:"+context.tiddler.title);
	if(context.status) {
		var tiddler = context.tiddler;
		store.suspendNotifications();
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		store.resumeNotifications();
		//#story.refreshTiddler(tiddler.title,1,true);
		//#displayMessage(config.messages.tiddlerImported.format([tiddler.title]));
	} else {
		displayMessage(context.statusText);
	}
	--context.adaptor.getTiddlerLength;
	if(context.adaptor.getTiddlerLength==0) {
		// have completed import of all tiddlers requested
		if(config.messages.importComplete) {
			store.notifyAll();
			//#console.log('all imported');
			clearMessage();
			displayMessage(config.messages.importComplete.format([tiddlers.length]));
		}
	}
	if(context.userCallback)
		context.userCallback(context,context.userCallbackParams);
};

} //# end of 'install only once'
//}}}
