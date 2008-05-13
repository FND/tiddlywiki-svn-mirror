/***
|''Name:''|ImportWikispacesMessagesPlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/ImportWikispacesMessagesPlugin.js |
|''Version:''|0.0.1|
|''Date:''|May 13, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|


***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ImportWikispacesMessagesPlugin) {
version.extensions.ImportWikispacesMessagesPlugin = {installed:true};


config.macros.importWikispacesMessages = {};
merge(config.macros.importWikispacesMessages,{
	label: "import messages",
	prompt: "Import all messages in workspace",
	done: "Tiddlers imported"});


config.macros.importWikispacesMessages.handler = function(place,macroName,params,wikifier,paramString,tiddler)
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

config.macros.importWikispacesMessages.onClick = function(e)
{
	clearMessage();
//#displayMessage("Starting import...");
	var customFields = this.getAttribute('customFields');
//#displayMessage("cf:"+customFields)
	var fields = customFields ? customFields.decodeHashMap() : config.defaultCustomFields;
	config.macros.importWorkspace.getMessages(this.createContext(fields));
};

config.macros.importWikispacesMessages.createContext = function(fields,filter)
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
		context.adaptor = adaptor;
		return context;
	}
	return false;
};

config.macros.importWikispacesMessages.getMessages = function(context)
{
	if(context) {
		context.adaptor.openHost(context.host,context,null,config.macros.importWorkspace.openHostCallback);
		return true;
	}
	return false;
};


config.macros.importWikispacesMessages.openHostCallback = function(context,userParams)
{
	displayMessage(config.messages.hostOpened.format([context.host]));
	context.adaptor.openWorkspace(context.workspace,context,userParams,config.macros.importWorkspace.openWorkspaceCallback);
};

config.macros.importWikispacesMessages.openWorkspaceCallback = function(context,userParams)
{
	//# displayMessage(config.messages.workspaceOpened.format([context.workspace]));
	context.adaptor.getTiddlerList(context,userParams,config.macros.importWorkspace.getTopicList);
};

config.macros.importWikispacesMessages.getTopicListCallback = function(context,userParams)
{
//#displayMessage("config.macros.importWorkspace.getTiddlerListCallback:"+context.status);
	if(context.status) {
		var tiddlers = context.tiddlers;
		//displayMessage(config.messages.workspaceTiddlers.format([tiddlers.length]));
		for(var i=0; i<tiddlers.length; i++) {
			tiddler = tiddlers[i];
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
			story.refreshTiddler(tiddler.title,1,true);
		}
	}
};


} //# end of 'install only once'
//}}}
