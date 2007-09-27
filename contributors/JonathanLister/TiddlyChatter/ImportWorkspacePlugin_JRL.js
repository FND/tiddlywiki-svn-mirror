/***
|''Name:''|ImportWorkspacePlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#AdaptorMacrosPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ImportWorkspacePlugin.js |
|''Version:''|0.0.1|
|''Date:''|Aug 23, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2.0|

|''Feed for import''|<<option txtImportFeed>>|
|''Import workspace on startup''|<<option chkImportWorkspaceOnStartup>>|
|''Label for go button''|<<option txtImportLabel>>|

***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.ImportWorkspacePlugin) {
version.extensions.ImportWorkspacePlugin = {installed:true};

if(config.options.txtImportFeed == undefined)
	{config.options.txtImportFeed = '';}
if(config.options.chkImportWorkspaceOnStartup == undefined)
	{config.options.chkImportWorkspaceOnStartup = true;}

config.messages.hostOpened = "Host '%0' opened";
config.messages.workspaceOpened = "Workspace '%0' opened";
config.messages.workspaceTiddlers = "%0 tiddlers in workspace, importing %1 of them";
config.messages.tiddlerImported = 'Tiddler: "%0" imported';


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
		var title = config.options.txtImportFeed;
		if(title=='') {
			var tiddlers = store.getTaggedTiddlers("systemServer");
			if(tiddlers.length==0)
				return;
			title = tiddlers[0].title;
		}
		config.defaultCustomFields['server.type'] = store.getTiddlerSlice(title,'Type');
		config.defaultCustomFields['server.host'] = store.getTiddlerSlice(title,'URL');
		config.defaultCustomFields['server.workspace'] = store.getTiddlerSlice(title,'Workspace');
		config.defaultCustomFields['server.filter'] = store.getTiddlerSlice(title,'TiddlerFilter');
	}
	if(config.options.chkImportWorkspaceOnStartup)
		config.macros.importWorkspace.getTiddlers(customFields);
};

config.macros.importWorkspace.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams('anon',null,true,false,false);
	var customFields = getParam(params,'fields',false);
	if(!customFields) {
		customFields = config.defaultCustomFields;
	}
	if(!customFields['server.type']) {
		var title = getParam(params,'anon');
		if(!title) {
			var tiddlers = store.getTaggedTiddlers("systemServer");
			if(tiddlers.length>0)
				title = tiddlers[0].title;
		}
		if(title) {
			customFields = {};
			customFields['server.type'] = store.getTiddlerSlice(title,'Type');
			customFields['server.host'] = store.getTiddlerSlice(title,'URL');
			customFields['server.workspace'] = store.getTiddlerSlice(title,'Workspace');
			customFields['server.filter'] = store.getTiddlerSlice(title,'TiddlerFilter');
		}
	}
	customFields = String.encodeHashMap(customFields);
	//#displayMessage("cf:"+customFields)
	if(config.options.txtImportLabel) this.label = config.options.txtImportLabel;
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute('customFields',customFields);
};

config.macros.importWorkspace.onClick = function(e)
{
	clearMessage();
//ŰdisplayMessage("Starting import...");
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
		fields['server.filter'] = store.getTiddlerSlice(title,'TiddlerFilter');
	}
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(!serverType)
		return false;
	var adaptor = new config.adaptors[serverType];
	if(adaptor) {
		var context = {};
		context.host = fields['server.host'];
		context.workspace = fields['server.workspace'];
		context.adaptor = adaptor;
		context.filter = fields['server.filter'];
		adaptor.openHost(context.host,context,null,config.macros.importWorkspace.openHostCallback);
	}
};

config.macros.importWorkspace.openHostCallback = function(context,userParams)
{
	displayMessage(config.messages.hostOpened.format([context.host]));
	//window.setTimeout(context.adaptor.openWorkspace,0,context.workspace,context,config.macros.importWorkspace.openWorkspaceCallback);
	context.adaptor.openWorkspace(context.workspace,context,userParams,config.macros.importWorkspace.openWorkspaceCallback);
};

config.macros.importWorkspace.openWorkspaceCallback = function(context,userParams)
{
	displayMessage(config.messages.workspaceOpened.format([context.workspace]));
	//window.setTimeout(context.adaptor.openWorkspace,0,context.workspace,context,config.macros.importWorkspace.getTiddlerListCallback);
	context.adaptor.getTiddlerList(context,userParams,config.macros.importWorkspace.getTiddlerListCallback,context.filter);
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
		displayMessage(config.messages.workspaceTiddlers.format([tiddlers.length,length]));
		var import_count = 0;
		for(var i=0; i<length; i++) {
			tiddler = tiddlers[i];
			var local_tiddler = store.fetchTiddler(tiddler.title);
			if(local_tiddler && !local_tiddler.isTouched()) {
				//# only get the tiddlers that have not been edited locally
				context.adaptor.getTiddler(tiddler.title,null,null,config.macros.importWorkspace.getTiddlerCallback);
				import_count++;
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
		//#displayMessage(config.messages.tiddlerImported.format([tiddler.title]));
	} else {
		displayMessage(context.statusText);
	}
};

} // end of 'install only once'
//}}}
