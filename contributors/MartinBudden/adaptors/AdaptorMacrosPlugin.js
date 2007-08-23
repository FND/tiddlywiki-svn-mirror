/***
|''Name:''|AdaptorMacrosPlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#AdaptorMacrosPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/AdaptorMacrosPlugin.js |
|''Version:''|0.3.6|
|''Date:''|Aug 23, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2.0|
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.AdaptorMacrosPlugin) {
version.extensions.AdaptorMacrosPlugin = {installed:true};

function getServerType(fields)
{
//#displayMessage("getServerType");
	if(!fields)
		return null;
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
//#displayMessage("serverType:"+serverType);
	return serverType;
}

// Return an array of tiddler titles that are in the given workspace on the host
TiddlyWiki.prototype.getHostedTiddlers = function(host,workspace)
{
//#displayMessage("getHostedTiddlers:"+host+" ws:"+workspace);
	var results = [];
	if(!this.hostedTiddlers || !this.hostedTiddlers[host])
		return results;
	var tiddlers = this.hostedTiddlers[host][workspace];
	if(tiddlers) {
		//#var sortField = 'modified';
		//#tiddlers.sort(function(a,b) {return a[sortField] < b[sortField] ? +1 : (a[sortField] == b[sortField] ? 0 : -1);});
		for(var i=0; i<tiddlers.length; i++) {
			results.push(tiddlers[i].title);
		}
		//#results.sort();
	}
	return results;
};

config.macros.list.workspaceTiddlers = {};
config.macros.list.workspaceTiddlers.prompt = "List Tiddlers in the workspace";
config.macros.list.workspaceTiddlers.handler = function(params,wikifier,paramString,tiddler)
{
//#displayMessage("config.macros.list.workspaceTiddlers");
	var customFields = getParam(params,'fields',false);
	if(!customFields)
		customFields = config.defaultCustomFields;
	return store.getHostedTiddlers(customFields['server.host'],customFields['server.workspace']);
};

config.macros.updateWorkspaceTiddlerList = {};
merge(config.macros.updateWorkspaceTiddlerList,{
	label: "update tiddler list",
	prompt: "Update list of tiddlers in workspace",
	done: "List updated"});

config.macros.updateWorkspaceTiddlerList.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
//#displayMessage("config.macros.updateWorkspaceTiddlerList.handler");
	params = paramString.parseParams('anon',null,true,false,false);
	var customFields = getParam(params,'fields',false);
	if(!customFields)
		customFields = String.encodeHashMap(config.defaultCustomFields);
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute('customFields',customFields);
	btn.setAttribute('title',tiddler.title);
};

config.macros.updateWorkspaceTiddlerList.onClick = function(e)
{
	clearMessage();
//#displayMessage("config.macros.updateWorkspaceTiddlerList.onClick");
	var customFields = this.getAttribute("customFields");
//#displayMessage("cf:"+customFields);
	//#var fields = convertCustomFieldsToHash(customFields);
	var fields = customFields.decodeHashMap();
//#displayMessage("host:"+fields['server.host']);
	var userParams = {host:fields['server.host'],workspace:fields['server.workspace'],title:this.getAttribute("title")};
	return invokeAdaptor('getTiddlerList',null,null,null,userParams,config.macros.updateWorkspaceTiddlerList.callback,fields);
};

config.macros.updateWorkspaceTiddlerList.callback = function(context,userParams)
{
//#displayMessage("config.macros.updateWorkspaceTiddlerList.callback:"+userParams.host+" w:"+userParams.workspace);
	if(context.status) {
		if(!store.hostedTiddlers)
			store.hostedTiddlers = {};
		if(!store.hostedTiddlers[userParams.host])
			store.hostedTiddlers[userParams.host] = {};
		store.hostedTiddlers[userParams.host][userParams.workspace] = context.tiddlers;
		displayMessage(config.macros.updateWorkspaceTiddlerList.done);
//#displayMessage("title:"+userParams.title);
		story.displayTiddler(null,userParams.title);
		story.refreshTiddler(userParams.title,1,true);
	} else {
		displayMessage(context.statusText);
	}
};


// import all the tiddlers from a given workspace on a given host
config.macros.importWorkspace = {};
merge(config.macros.importWorkspace,{
	label: "import workspace",
	prompt: "Import tiddlers in workspace",
	done: "Tiddlers imported"});

config.messages.hostOpened = "Host '%0' opened";
config.messages.workspaceOpened = "Workspace '%0' opened";
config.messages.workspaceTiddlers = "%0 tiddlers in workspace, importing %1 of them";
config.messages.tiddlerImported = 'Tiddler: "%0" imported';

config.macros.importWorkspace.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
//#displayMessage("updateWorkspaceTiddlerList.handler");
	params = paramString.parseParams('anon',null,true,false,false);
	var customFields = getParam(params,'fields',false);
	if(!customFields) {
		customFields = config.defaultCustomFields;
	}
	if(!customFields['server.type']) {
		var tiddlers = store.getTaggedTiddlers("systemServer");
		var title = tiddlers[0].title;
		customFields = {};
		customFields['server.type'] = store.getTiddlerSlice(title,'Type');
		customFields['server.host'] = store.getTiddlerSlice(title,'URL');
		customFields['server.workspace'] = store.getTiddlerSlice(title,'Workspace');
	}
	customFields = String.encodeHashMap(customFields);
	//#displayMessage("cf:"+customFields)
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute('customFields',customFields);
};

config.macros.importWorkspace.onClick = function(e)
{
	clearMessage();
//#displayMessage("Starting import...");
	var customFields = this.getAttribute('customFields');
//#displayMessage("cf:"+customFields)
	var fields = customFields ? customFields.decodeHashMap() : config.defaultCustomFields;
	config.macros.importWorkspace.getTiddlers(fields);
};

config.macros.importWorkspace.getTiddlers = function(fields)
{
	if(!fields['server.type']) {
		var tiddlers = store.getTaggedTiddlers("systemServer");
		var title = tiddlers[0].title;
		fields = {};
		fields['server.type'] = store.getTiddlerSlice(title,'Type');
		fields['server.host'] = store.getTiddlerSlice(title,'URL');
		fields['server.workspace'] = store.getTiddlerSlice(title,'Workspace');
	}
	var serverType = getServerType(fields);
	if(!serverType)
		return false;
	var adaptor = new config.adaptors[serverType];
	if(adaptor) {
		var context = {};
		var userParams = {};
		context.host = fields['server.host'];
		context.workspace = fields['server.workspace'];
		context.adaptor = adaptor;
		userParams.maxCount = config.maxTiddlerImportCount;
		adaptor.openHost(context.host,context,userParams,config.macros.importWorkspace.openHostCallback);
	}
	return ret;
};

config.macros.importWorkspace.openHostCallback = function(context,userParams)
{
	displayMessage(config.messages.hostOpened.format([context.host]));
	context.adaptor.openWorkspace(context.workspace,context,userParams,config.macros.importWorkspace.openWorkspaceCallback);
};

config.macros.importWorkspace.openWorkspaceCallback = function(context,userParams)
{
	displayMessage(config.messages.workspaceOpened.format([context.workspace]));
	context.adaptor.getTiddlerList(context,userParams,config.macros.importWorkspace.getTiddlerListCallback);
};

config.macros.importWorkspace.getTiddlerListCallback = function(context,userParams)
{
//#displayMessage("config.macros.importWorkspace.getTiddlerListCallback:"+context.status);
	if(context.status) {
		var tiddlers = context.tiddlers;
		var sortField = 'modified';
		tiddlers.sort(function(a,b) {return a[sortField] < b[sortField] ? +1 : (a[sortField] == b[sortField] ? 0 : -1);});
		var length = tiddlers.length;
		if(length > userParams.maxCount)
			length = userParams.maxCount;
		displayMessage(config.messages.workspaceTiddlers.format([tiddlers.length,length]));
		for(var i=0; i<length; i++) {
			tiddler = tiddlers[i];
			if(!tiddler.isTouched()) {
				//# only get the tiddlers that have not been edited locally
				context.adaptor.getTiddler(tiddler.title,null,null,config.macros.importWorkspace.getTiddlerCallback);
			}
		}
	}
};

config.macros.importWorkspace.getTiddlerCallback = function(context)
{
//#displayMessage("config.macros.importWorkspace.getTiddlerCallback:"+context.status+" t:"+context.tiddler.title);
	if(context.status) {
		var tiddler = context.tiddler;
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		story.refreshTiddler(tiddler.title,1,true);
		//#displayMessage(config.messages.tiddlerImported.format([tiddler.title]));
	} else {
		displayMessage(context.statusText);
	}
};

config.macros.updateWorkspaceList = {};
merge(config.macros.updateWorkspaceList,{
	label: "update workspace list",
	prompt: "Update list of workspaces",
	done: "List updated"});

config.macros.updateWorkspaceList.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
//#displayMessage("updateWorkspaceList.handler");
	params = paramString.parseParams('anon',null,true,false,false);
	var customFields = getParam(params,'fields',false);
//#displayMessage("fields:"+customFields);
	if(!customFields)
		customFields = String.encodeHashMap(config.defaultCustomFields);
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute('customFields',customFields);
	btn.setAttribute('title',tiddler.title);
};

config.macros.updateWorkspaceList.onClick = function(e)
{
	clearMessage();
//#displayMessage("updateWorkspaceList.onClick");
	var customFields = this.getAttribute("customFields");
//#displayMessage("cust:"+customFields);
	var fields = customFields.decodeHashMap();
	var userParams = {host:fields['server.host'],callback:config.macros.updateWorkspaceList.callback};
	return invokeAdaptor('getWorkspaceList',context,fields);
};

config.macros.updateWorkspaceList.callback = function(context,userParams)
{
//#displayMessage("updateWorkspaceList.callback:"+context.host);
	if(context.status) {
		displayMessage(config.macros.updateWorkspaceList.done);
		for(var i=0; i<context.workspaces.length; i++) {
			displayMessage("workspace:"+context.workspaces[i]);
		}
	} else {
		displayMessage(context.statusText);
	}
};

} // end of 'install only once'
//}}}
