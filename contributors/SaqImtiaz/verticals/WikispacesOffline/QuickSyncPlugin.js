/***
|''Name:''|QuickSyncPlugin|
|''Description:''|Get tiddlers that have been changed on server but not locally and put tiddlers that have been changed locally but not on server|
|''Author:''|Martin Budden|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MyDirectory/plugins/QuickSyncPlugin.js |
|''Version:''|0.0.4|
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

config.macros.quicksync = {};

merge(config.macros.quicksync,{
	label: "quicksync",
	prompt: "Sync tiddlers that have been changed locally or on server, but not both",
	tiddlerUploaded: "Tiddler: \"%0\" uploaded",
	tiddlerImported: "Tiddler: \"%0\" imported"
	});

config.macros.quicksync.handler = function(place,macroName,params,wikifier,paramString,tiddler)
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
	var label = getParam(params,'label',this.label);
	var btn = createTiddlyButton(place,label,this.prompt,this.onClick);
	btn.setAttribute('customFields',customFields);
};

config.macros.quicksync.onClick = function(e)
{
	var customFields = this.getAttribute('customFields');
	var fields = customFields ? customFields.decodeHashMap() : config.defaultCustomFields;
	var context = config.macros.quicksync.createContext(fields);
	config.macros.quicksync.getTiddlers(context);
	return false;
};

config.macros.quicksync.createContext = function(fields)
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
		context.adaptor = adaptor;
		return context;
	}
	return false;
};

config.macros.quicksync.getTiddlers = function(context)
{
	if(context) {
		context.adaptor.openHost(context.host,context);
		context.adaptor.openWorkspace(context.workspace,context,null,config.macros.quicksync.openWorkspaceCallback);
		return true;
	}
	return false;
};

config.macros.quicksync.openWorkspaceCallback = function(context,userParams)
{
	if(context.status) {
		context.adaptor.getTiddlerList(context,null,config.macros.quicksync.getTiddlerListCallback);
		return true;
	}
	displayMessage(context.statusText);
	return false;
};

config.macros.quicksync.getTiddlerListCallback = function(context,userParams)
{
	if(context.status) {
		var tiddlers = context.tiddlers;
		var getList = [];
		var putList = [];
		store.forEachTiddler(function(title,tiddler) {
			var f = tiddlers.findByField("title",title);
			if(f !== null && tiddler.fields['server.type']) {
				if(tiddlers[f].fields['server.page.revision'] > tiddler.fields['server.page.revision']) {
					if(!tiddler.isTouched())
						getList.push(tiddler.title); // tiddler changed on server and not changed locally
					else
						backstage.switchTab('sync');
				} else if(tiddlers[f].fields['server.page.revision'] == tiddler.fields['server.page.revision']) {
					if(tiddler.isTouched())
						putList.push(tiddler); // tiddler changed locally and not changed on server
				}
			} else {
				// tiddler not on server, so add to putList if it has been changed
				if(tiddler.fields['server.type'] && tiddler.isTouched()) {
					putList.push(tiddler);
				}
			}
		});
		for(var i=0; i<putList.length; i++) {
			context.adaptor.putTiddler(putList[i],null,null,config.macros.quicksync.putTiddlerCallback);
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
	if(context.status) {
		var tiddler = context.tiddler;
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		story.refreshTiddler(tiddler.title,1,true);
		displayMessage(config.macros.quicksync.tiddlerImported.format([context.tiddler.title]));
	} else {
		displayMessage(context.statusText);
	}
};

} //# end of 'install only once'
//}}}
