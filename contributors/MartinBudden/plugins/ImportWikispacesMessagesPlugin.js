/***
|''Name:''|ImportWikispacesMessagesPlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/ImportWikispacesMessagesPlugin.js |
|''Version:''|0.0.11|
|''Date:''|May 13, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|

|''Import discussion with tiddlers''|<<option chkImportWikispacesDiscussion>>|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ImportWikispacesMessagesPlugin) {
version.extensions.ImportWikispacesMessagesPlugin = {installed:true};

if(config.options.chkImportWikispacesDiscussion == undefined)
	{config.options.chkImportWikispacesDiscussion = false;}

config.macros.importWikispacesMessages = {};
merge(config.macros.importWikispacesMessages,{
	label: "import messages",
	prompt: "Import messages",
	done: "Tiddlers imported",
	noitems: "No discussion items for:%0",
	retrieved: "Disscussion items for:%0 retrieved"
	});


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
	config.macros.importWikispacesMessages.getTopicList(title,config.macros.importWikispacesMessages.createContext(title,fields));
};

config.macros.importWikispacesMessages.createContext = function(title,fields)
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
		context.title = title;
		context.host = fields['server.host'];
		context.workspace = fields['server.workspace'];
		context.adaptor = adaptor;
		return context;
	}
	return false;
};

config.macros.importWikispacesMessages.getTopicList = function(context)
{
//#console.log("config.macros.importWikispacesMessages.getTopicList:"+context.title);
	if(context) {
		context.adaptor.openHost(context.host,context);
		context.adaptor.openWorkspace(context.workspace,context,null,config.macros.importWikispacesMessages.openWorkspaceCallback);
		return true;
	}
	return false;
};

config.macros.importWikispacesMessages.openWorkspaceCallback = function(context,userParams)
{
//#console.log("config.macros.importWikispacesMessages.openWorkspaceCallback:"+context.status);
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
		if(!tiddlers || tiddlers.length==0) {
			//displayMessage(config.macros.importWikispacesMessages.noitems.format([context.title]));
			return;
		}
		for(var i=0; i<tiddlers.length; i++) {
			tiddler = tiddlers[i];
			//#console.log("topic:"+tiddler.title);
			store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
			//#story.refreshTiddler(tiddler.title,1,true);
			context.adaptor.getMessageList(tiddler.fields['server.topic_id'],context,null,config.macros.importWikispacesMessages.getMessageListCallback);
		}
	} else {
		displayMessage(context.statusText);
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
			//#story.refreshTiddler(tiddler.title,1,true);
		}
		//#displayMessage(config.macros.importWikispacesMessages.retrieved.format([context.title]));
	} else {
		displayMessage(context.statusText);
	}
};

//# getDiscussion command definition
config.commands.getDiscussion = {};
merge(config.commands.getDiscussion,{
	text: "getdiscussion",
	tooltip:"Get discussion for this tiddler",
	hideReadOnly: true,
	done: "Discussion downloaded",
	gettingItems: "Getting discussion items for:%0"
	});

config.commands.getDiscussion.isEnabled = function(tiddler)
{
	return isAdaptorFunctionSupported('getTopicList',tiddler.fields);
};

config.commands.getDiscussion.handler = function(event,src,title)
{
	displayMessage(config.commands.getDiscussion.gettingItems.format([title]));
	var tiddler = store.fetchTiddler(title);
	if(tiddler) {
		var fields = tiddler.fields;
	} else {
		fields = String(document.getElementById(story.idPrefix + title).getAttribute('tiddlyFields'));
		fields = fields ? fields.decodeHashMap() : null;
	}
	config.macros.importWikispacesMessages.getTopicList(config.macros.importWikispacesMessages.createContext(title,fields));
	return true;
};

//# showDiscussions command definition
config.commands.showDiscussions = {};
merge(config.commands.showDiscussions,{
	text: "discussions",
	tooltip:"Show discussions for this tiddler",
	popupNone: "No discussions",
	topicTooltip: "View this topic",
	template: "%0"
});

config.commands.showDiscussions.isEnabled = function(tiddler)
{
	return true;
};

config.commands.showDiscussions.handler = function(event,src,title)
{
console.log('showDiscussions',title);
	var t = store.fetchTiddler(title);
	var parentId = t.fields['server.page.id'];
	var topics = [];
	store.forEachTiddler(function(title,tiddler) {
		if(tiddler.fields['server.page_id']==parentId && tiddler.title.indexOf('_topic')==0) {
			topics.push(tiddler);
			console.log('push',tiddler.title);
		}
	});
//#displayMessage("config.commands.revisions.callback:"+revisions.length);
	popup = Popup.create(src);
	Popup.show(popup,false);
	if(topics.length==0) {
		createTiddlyText(createTiddlyElement(popup,'li',null,'disabled'),config.commands.showDiscussions.popupNone);
	} else {
		topics.sort(function(a,b) {return a.modified < b.modified ? +1 : -1;});
		for(var i=0; i<topics.length; i++) {
			var tiddler = topics[i];
			//var modified = tiddler.modified.formatString(context.dateFormat||userParams.dateFormat);
			//var revision = tiddler.fields['server.page.revision'];
			var btn = createTiddlyButton(createTiddlyElement(popup,'li'),
					config.commands.showDiscussions.template.format([tiddler.fields['server.subject'],tiddler.modifier]),
					tiddler.text||config.commands.showDiscussions.topicTooltip,
					function() {
						config.commands.showDiscussions.showTopic(this.getAttribute('tiddlerTitle'));
						return false;
						},
					'tiddlyLinkExisting tiddlyLink');
			btn.setAttribute('tiddlerTitle',tiddler.title);
			//btn.setAttribute('tiddlerModified',tiddler.modified.convertToYYYYMMDDHHMM());
		}
	}
};

config.commands.showDiscussions.showTopic = function(title)
{
console.log('showTopic',"'"+title+"'");
	//story.displayTiddler(null,title);
	var topic = store.getTiddler(title);
	var topicId = topic.fields['server.topic_id'];
	var messages = [];
	store.forEachTiddler(function(title,tiddler) {
		if(tiddler.fields['server.topic_id']==topicId && tiddler.title.indexOf('_message')==0) {
			messages.push(tiddler);
		}
	});
	messages.push(topic);
	messages.sort(function(a,b) {return a.modified < b.modified ? -1 : +1;});
	story.displayTiddlers(null,messages);
};

config.macros.importWorkspace.getTiddlersForAllFeeds = function()
{
	var tiddlers = store.getTaggedTiddlers('systemServer');
	var userCallback = config.options.chkImportWikispacesDiscussion ? config.macros.importWikispacesMessages.getTopicList : null;
	for(var i=0;i<tiddlers.length;i++) {
		config.macros.importWorkspace.getTiddlersForFeed(tiddlers[i].title,userCallback);
	}
};

config.macros.importWorkspace.onClick = function(e)
{
	clearMessage();
//#displayMessage("Starting import...");
	var customFields = this.getAttribute('customFields');
//#displayMessage("cf:"+customFields)
	var fields = customFields ? customFields.decodeHashMap() : config.defaultCustomFields;
	var userCallback = config.options.chkImportWikispacesDiscussion ? config.macros.importWikispacesMessages.getTopicList : null;
	config.macros.importWorkspace.getTiddlersForContext(config.macros.importWorkspace.createContext(fields,null,userCallback));
};

} //# end of 'install only once'
//}}}
