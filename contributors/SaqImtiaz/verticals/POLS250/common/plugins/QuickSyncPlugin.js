/***
|''Name:''|QuickSyncPlugin|
|''Description:''|Get tiddlers that have been changed on server but not locally and put tiddlers that have been changed locally but not on server|
|''Author:''|Martin Budden|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MyDirectory/plugins/QuickSyncPlugin.js |
|''Version:''|0.0.5|
|''Date:''|Jan 25, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.3.0|

!!Description
The QuickSyncPlugin synchronizes all tiddlers that have been changed either on the server or locally (but not changed on both).
It makes no attempt to deal with conflicted tiddlers, tiddlers that have been changed both on the server and locally.

!!Usage
To use, add <<quicksync>> to the SideBarOptions shadow tiddler.

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.QuickSyncPlugin) {
version.extensions.QuickSyncPlugin = {installed:true};

if(config.options.chkQuicksyncOnStartup == undefined)
	{config.options.chkQuicksyncOnStartup = false;}

if(config.options.chkQuicksyncNoUpload == undefined)
	config.options.chkQuicksyncNoUpload = false;

config.macros.quicksync = {};

merge(config.macros.quicksync,{
	label: "quicksync",
	prompt: "Sync tiddlers that have been changed locally or on server, but not both",
	tiddlerUploaded: "Tiddler: \"%0\" uploaded",
	tiddlerImported: "Tiddler: \"%0\" imported"
	});

config.macros.quicksync.init = function()
{
	if(config.options.chkQuicksyncOnStartup)
		config.macros.quicksync.onClick();
};

config.macros.quicksync.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams('anon',null,false,false,false);
/*	var customFields = getParam(params,'fields',false);
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
	customFields = String.encodeHashMap(customFields);*/
	var label = getParam(params,'label',this.label);
	var prompt = getParam(params,'prompt',this.promt);
	var btn = createTiddlyButton(place,label,prompt,this.onClick);
	/*btn.setAttribute('customFields',customFields);*/
};

config.macros.quicksync.onClick = function(e)
{
	// var customFields = this.getAttribute('customFields');
	// var fields = customFields ? customFields.decodeHashMap() : config.defaultCustomFields;
	//console.log('onClick',config.defaultCustomFields['server.host'].toString());
	config.macros.quicksync.syncServersLength = 0;
	var tiddlers = store.getTaggedTiddlers('systemServer');
	for(var i=0;i<tiddlers.length;i++) {
		var customFields = config.macros.quicksync.getCustomFieldsFromTiddler(tiddlers[i].title);
		var context = config.macros.quicksync.createContext(customFields);
		config.macros.quicksync.syncServersLength = tiddlers.length; 
		config.macros.quicksync.getTiddlers(context);
	}
	return false;
};

config.macros.quicksync.getCustomFieldsFromTiddler = function(title)
{
	//console.log('getCustomFieldsFromTiddler',config.defaultCustomFields['server.host'].toString());
	//displayMessage(config.defaultCustomFields['server.host'].toString());
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

config.macros.quicksync.createContext = function(fields)
{
	//console.log('createContext',config.defaultCustomFields['server.host'].toString());
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
		context.adaptor = adaptor;
		return context;
	}
	return false;
};

config.macros.quicksync.getTiddlers = function(context)
{
//	console.log('quicksync get tiddlers',arguments)
	//console.log('getTiddlers',config.defaultCustomFields['server.host'].toString());
	if(context) {
		context.adaptor.openHost(context.host,context);
		context.adaptor.openWorkspace(context.workspace,context,null,config.macros.quicksync.openWorkspaceCallback);
		return true;
	}
	return false;
};

config.macros.quicksync.openWorkspaceCallback = function(context,userParams)
{
//	console.log('qs openWS_CB',arguments)
	if(context.status) {
		context.adaptor.getTiddlerList(context,null,config.macros.quicksync.getTiddlerListCallback);
		return true;
	}
	//displayMessage(context.statusText);
	return false;
};

config.macros.quicksync.getTiddlerListCallback = function(context,userParams)
{
//console.log('qs getTiddlerListCB', arguments)
	if(context.status) {
		var tiddlers = context.tiddlers;
		//console.log(tiddlers)
		var getList = [];
		var putList = [];
		store.forEachTiddler(function(title,tiddler) {
			var f = tiddlers.findByField("title",title);
			if(f !== null && tiddler.fields['server.type'] && (tiddler.fields['server.host'] == context.host)) {
				if(tiddlers[f].fields['server.page.revision'] > tiddler.fields['server.page.revision']) {
					if(tiddler.isTouched())
						backstage.switchTab('sync');
					else
						getList.push(tiddler.title); // tiddler changed on server and not changed locally
				} else if(tiddlers[f].fields['server.page.revision'] == tiddler.fields['server.page.revision']) {
					if(tiddler.isTouched())
						putList.push(tiddler); // tiddler changed locally and not changed on server
				}
			} else {
				// tiddler not on server, so add to putList if it has been changed
				if(tiddler.fields['server.type'] && tiddler.isTouched() && (tiddler.fields['server.host'] == context.host)) {
					putList.push(tiddler);
				}
			}
		});
		if(!config.options.chkQuicksyncNoUpload){
			for(var i=0; i<putList.length; i++) {
				context.adaptor.putTiddler(putList[i],null,null,config.macros.quicksync.putTiddlerCallback);
			}		
		}
		// now add all tiddlers that only exist on server to getList
		for(i=0; i<tiddlers.length; i++) {
			title = tiddlers[i].title;
			var t = store.fetchTiddler(title);
			if(!t) {
				//# only get the tiddlers that are not available locally
				getList.push(title);
			}
		}
		context.adaptor.getTiddlerLength = getList.length;
		clearMessage();
		//console.log(getList);
		if(getList.length){
			displayMessage("%0 updated and new page(s) on server.".format([getList.length]));
			displayMessage("downloading updates...")
		}
		else
			displayMessage("no updates available.")
		for(i=0; i<getList.length; i++) {
			context.adaptor.getTiddler(getList[i],null,null,config.macros.quicksync.getTiddlerCallback);
		}
	}
};

config.macros.quicksync.putTiddlerCallback = function(context,userParams)
{
	if(context.status) {
		store.resetTiddler(context.tiddler.title);
		displayMessage(config.macros.quicksync.tiddlerUploaded.format([context.tiddler.title]));
	} else {
		displayMessage(context.statusText);
	}
};

config.macros.quicksync.getTiddlerCallback = function(context,userParams)
{
	if(context.status && context.tiddler) {
		var tiddler = context.tiddler;
		store.suspendNotifications();
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		store.resumeNotifications();
		//#story.refreshTiddler(tiddler.title,1,true);
		//displayMessage(config.macros.quicksync.tiddlerImported.format([context.tiddler.title]));
	} else if(!context.status) {
		displayMessage(context.statusText);
	}
	--context.adaptor.getTiddlerLength;
	if(context.adaptor.getTiddlerLength==0){
		--config.macros.quicksync.syncServersLength;
	}
	//console.log(context.adaptor.syncServersLength)
	if(config.macros.quicksync.syncServersLength==0){
		store.notifyAll();
		story.refreshAllTiddlers();
		clearMessage();
		//displayMessage('update completed. Please save your notebook');
		window.setTimeout(function() {displayMessage('update completed. Please save your notebook');},1000);
		//console.log(context)
	}
};

} //# end of 'install only once'
//}}}
