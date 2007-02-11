/***
|''Name:''|HostedCommands2Plugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#HostedCommands2Plugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/HostedCommands2Plugin.js|
|''Version:''|0.2.3|
|''Date:''|Jan 20, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.HostedCommands2Plugin) {
version.extensions.HostedCommands2Plugin = {installed:true};

// Return an array of tiddler titles that are in the given workspace on the host
TiddlyWiki.prototype.getHostedTiddlers = function(host,workspace)
{
//#displayMessage("getHostedTiddlers:"+host+" ws:"+workspace);
	var results = [];
	if(!this.hostedTiddlers || !this.hostedTiddlers[host])
		return results;
	var list = this.hostedTiddlers[host][workspace];
	if(list) {
		for(i=0; i<list.length; i++) {
			results.push(list[i].title);
		}
		results.sort();
	}
	return results;
};

config.macros.list.workspaceTiddlers = {};
config.macros.list.workspaceTiddlers.prompt = "List Tiddlers in the workspace";
config.macros.list.workspaceTiddlers.handler = function(params,wikifier,paramString,tiddler)
{
//#displayMessage("list.workspaceTiddlers");
	var fields = convertCustomFieldsToHash(store.getDefaultCustomFields());
	return store.getHostedTiddlers(fields['server.host'],fields['server.workspace']);
};

config.macros.updateWorkspaceTiddlerList = {};
merge(config.macros.updateWorkspaceTiddlerList,{
	label: "update workspace list",
	prompt: "Update list of tiddlers in workspace",
	done: "List updated"});

config.macros.updateWorkspaceTiddlerList.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
//#displayMessage("updateWorkspaceTiddlerList.handler");
	params = paramString.parseParams("anon",null,true,false,false);
	var customFields = getParam(params,"fields",false);
	if(!customFields)
		customFields = store.getDefaultCustomFields();
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute("customFields",customFields);
};

config.macros.updateWorkspaceTiddlerList.onClick = function(e)
{
	clearMessage();
//#displayMessage("updateWorkspaceTiddlerList.onClick");
	var customFields = this.getAttribute("customFields");
	var fields = convertCustomFieldsToHash(customFields);
	var params = {host:fields['server.host'],workspace:fields['server.workspace'],callback:config.macros.updateWorkspaceTiddlerList.callback};
	return invokeAdaptor('getTiddlerList',params,fields);
};

config.macros.updateWorkspaceTiddlerList.callback = function(params)
{
//#displayMessage("updateWorkspaceTiddlerList.callback:"+params.host+" w:"+params.workspace);
	if(params.status) {
		if(!store.hostedTiddlers)
			store.hostedTiddlers = {};
		if(!store.hostedTiddlers[params.host])
			store.hostedTiddlers[params.host] = {};
		store.hostedTiddlers[params.host][params.workspace] = params.list;
		displayMessage(config.macros.updateWorkspaceTiddlerList.done);
		var title = "ListWorkspace"; // !!!hardcoded for testing
		story.displayTiddler(null,title);
		story.refreshTiddler(title,1,true);
	} else {
		displayMessage(params.statusText);
	}
};


// import all the tiddlers from a given workspace on a given host
config.macros.importWorkspace = {};
merge(config.macros.importWorkspace,{
	label: "import workspace",
	prompt: "Import tiddlers in workspace",
	done: "Tiddlers imported"});

config.macros.importWorkspace.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
//#displayMessage("updateWorkspaceTiddlerList.handler");
	params = paramString.parseParams("anon",null,true,false,false);
	var customFields = getParam(params,"fields",false);
	if(!customFields)
		customFields = store.getDefaultCustomFields();
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute("customFields",customFields);
};

config.messages.hostOpened = "Host '%0' opened";
config.messages.workspaceOpened = "Workspace '%0' opened";
config.messages.workspaceTiddlers = "%0 tiddlers in workspace, importing %1 of them";
config.messages.tiddlerImported = 'Tiddler: "%0" imported';

config.macros.importWorkspace.onClick = function(e)
{
	clearMessage();
//#displayMessage("importWorkspace.onClick");
displayMessage("Starting import...");
	var customFields = this.getAttribute("customFields");
	var fields = convertCustomFieldsToHash(customFields);
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(serverType)
		serverType = serverType.toLowerCase();
	if(!serverType || !config.adaptors[serverType] || !fields['server.host'])
		return ret;
	var adaptor = new config.adaptors[serverType];
	if(adaptor) {
		var params = {};
		params.host = fields['server.host'];
		params.workspace = fields['server.workspace'];
		params.callback = config.macros.importWorkspace.callback;
		params.maxCount = config.maxTiddlerImportCount;
		params.adaptor = adaptor;
		adaptor.openHost(params.host,params);
		displayMessage(config.messages.hostOpened.format([params.host]));
		adaptor.openWorkspace(params.workspace,params);
		displayMessage(config.messages.workspaceOpened.format([params.workspace]));
		ret = adaptor.getTiddlerList(params);
	}
	return ret;
};

config.macros.importWorkspace.callback = function(params)
{
	var list = params.list;
	var sortField = 'modified';
	list.sort(function(a,b) {return a[sortField] < b[sortField] ? +1 : (a[sortField] == b[sortField] ? 0 : -1);});
	var length = list.length;
	if(length > params.maxCount)
		length = params.maxCount;
	displayMessage(config.messages.workspaceTiddlers.format([list.length,length]));
	for(i=0; i<length; i++) {
		//#displayMessage("li:"+list[i].title);
		var tiddler = store.fetchTiddler(list[i].title);
		if(!tiddler)
			tiddler = new Tiddler(list[i].title);
		if(!tiddler.isTouched()) {
			//# only get the tiddlers that have not been edited locally
			tiddler.fields['temp.callback'] = config.macros.importWorkspace.callbackTiddler;
			params.adaptor.getTiddler(tiddler);
		}
	}
	//params.adaptor.close();
	//delete params.adaptor;
};

config.macros.importWorkspace.callbackTiddler = function(tiddler)
{
	if(tiddler.fields['temp.status']) {
		TiddlyWiki.updateTiddlerAndSave(tiddler);
		story.refreshTiddler(tiddler.title,1,true);
		displayMessage(config.messages.tiddlerImported.format([tiddler.title]));
	} else {
		displayMessage(tiddler.fields['temp.statusText']);
	}
};

// revisions command definition
config.commands.revisions = {};
merge(config.commands.revisions,{
	text: "revisions",
	tooltip: "View another revision of this tiddler",
	loading: "loading...",
	revisionTooltip: "View this revision",
	popupNone: "No revisions"});

config.commands.revisions.isEnabled = function(tiddler)
{
	return isAdaptorFunctionSupported('getTiddlerRevisionList',tiddler.fields);
};

config.commands.revisions.handler = function(event,src,title)
{
//#displayMessage("revisions.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	tiddler['temp.callback'] = config.commands.revisions.callback;
	tiddler['temp.src'] = src;
	invokeAdaptor('getTiddlerRevisionList',tiddler);
	event.cancelBubble = true;
	if(event.stopPropagation)
		event.stopPropagation();
	return true;
};

config.commands.revisions.callback = function(tiddler,revisions)
// The revisions are returned in the revisions array
//# revisions[i].modified
//# revisions[i].key
{
//#displayMessage("config.commands.revisions.callback");
	popup = Popup.create(tiddler['temp.src']);
	Popup.show(popup,false);
	if(revisions.length==0) {
		createTiddlyText(createTiddlyElement(popup,'li',null,'disabled'),config.commands.revisions.popupNone);
	} else {
		for(var i=0; i<revisions.length; i++) {
			var modified = revisions[i].modified;
			var key = revisions[i].key;
			var btn = createTiddlyButton(createTiddlyElement(popup,'li'),
					modified.toLocaleString(),
					config.commands.revisions.revisionTooltip,
					function() {
						displayTiddlerRevision(this.getAttribute('tiddlerTitle'),this.getAttribute('revisionKey'),this);
						return false;
						},
					'tiddlyLinkExisting tiddlyLink');
			btn.setAttribute('tiddlerTitle',tiddler.title);
			btn.setAttribute('revisionKey',key);
			if(tiddler.revisionKey == key || (!tiddler.revisionKey && i==0))
				btn.className = 'revisionCurrent';
		}
	}
};

} // end of 'install only once'
//}}}
