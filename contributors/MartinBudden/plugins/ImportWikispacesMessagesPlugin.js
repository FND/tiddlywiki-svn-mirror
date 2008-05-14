/***
|''Name:''|ImportWikispacesMessagesPlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/ImportWikispacesMessagesPlugin.js |
|''Version:''|0.0.3|
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
	var page = getParam(params,'page');
	btn.setAttribute('page',page);
};

config.macros.importWikispacesMessages.onClick = function(e)
{
	clearMessage();
//#displayMessage("Starting import...");
	var customFields = this.getAttribute('customFields');
//#displayMessage("cf:"+customFields)
	var fields = customFields ? customFields.decodeHashMap() : config.defaultCustomFields;
	var title = this.getAttribute('page');
	config.macros.importWikispacesMessages.getTopicList(title,config.macros.importWikispacesMessages.createContext(fields));
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

config.macros.importWikispacesMessages.getTopicList = function(title,context)
{
	if(context) {
		context.title = title;
		context.adaptor.openHost(context.host,context);
		context.adaptor.openWorkspace(context.workspace,context,null,config.macros.importWikispacesMessages.openWorkspaceCallback);
		return true;
	}
	return false;
};

config.macros.importWikispacesMessages.openWorkspaceCallback = function(context,userParams)
{
	if(context.status) {
		context.adaptor.getTopicList(context.title,context,null,config.macros.importWikispacesMessages.getTopicListCallback);
		return true;
	}
	return false;
};

config.macros.importWikispacesMessages.getTopicListCallback = function(context,userParams)
{
	//#console.log("config.macros.importWikispacesMessages.getTopicListCallback:"+context.status);
	if(context.status) {
		var tiddlers = context.topics;
		for(var i=0; i<tiddlers.length; i++) {
			tiddler = tiddlers[i];
		//#console.log("topic:"+tiddler.title);
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
			story.refreshTiddler(tiddler.title,1,true);
			context.adaptor.getMessageList(tiddler.fields['server.topic_id'],context,null,config.macros.importWikispacesMessages.getMessageListCallback);
		}
	}
};

config.macros.importWikispacesMessages.getMessageListCallback = function(context,userParams)
{
	//#console.log("config.macros.importWikispacesMessages.getMessageListCallback:"+context.status);
	if(context.status) {
		var tiddlers = context.messages;
		for(var i=0; i<tiddlers.length; i++) {
			tiddler = tiddlers[i];
		//#console.log("message:"+tiddler.title);
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
			story.refreshTiddler(tiddler.title,1,true);
		}
	}
};

} //# end of 'install only once'
//}}}
