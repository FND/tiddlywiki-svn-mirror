/***
|''Name:''|QuickSyncPlugin|
|''Description:''|My Description|
|''Author:''|Martin Budden|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MyDirectory/plugins/QuickSyncPlugin.js |
|''Version:''|0.0.1|
|''Status:''|Not for release - this is a template for creating new plugins|
|''Date:''|Jan 25, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.3|

To make this example into a real TiddlyWiki plugin, you need to:

# Globally search and replace ExamplePlugin with the name of your plugin
# Globally search and replace example with the name of your macro
# Update the header text above with your description, name etc
# Do the actions indicated by the !!TODO comments, namely:
## Write the code for the plugin
## Write the documentation for the plugin

!!Description
//!!TODO write a brief description of the plugin here

!!Usage
//!!TODO describe how to use the plugin - how a user should include it in their TiddlyWiki, parameters to the plugin etc

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.QuickSyncPlugin) {
version.extensions.QuickSyncPlugin = {installed:true};

config.macros.quicksync = {};

merge(config.macros.quicksync,{
	label: "quicksync",
	prompt: "Sync tiddlers that have been changed locally or on server, but not both"});

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
	//#displayMessage("cf:"+customFields)
	var label = getParam(params,'label',this.label);
	var btn = createTiddlyButton(place,label,this.prompt,this.onClick);
	btn.setAttribute('customFields',customFields);
};

config.macros.quicksync.onClick = function(e)
{
	var customFields = this.getAttribute('customFields');
//#displayMessage("cf:"+customFields)
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
console.log('quicksync.getTiddlers');
	if(context) {
		context.adaptor.openHost(context.host,context);
		context.adaptor.openWorkspace(context.workspace,context,null,config.macros.quicksync.openWorkspaceCallback);
		return true;
	}
	return false;
};

config.macros.quicksync.openWorkspaceCallback = function(context,userParams)
{
console.log('quicksync.openWorkspaceCallback:'+context.status);
	if(context.status) {
		context.adaptor.getTiddlerList(context,null,config.macros.quicksync.getTiddlerListCallback);
		return true;
	}
	displayMessage(context.statusText);
	return false;
};

config.macros.quicksync.getTiddlerListCallback = function(context,userParams)
{
console.log('quicksync.getTiddlerListCallback:'+context.status);
	if(context.status) {
		var tiddlers = context.tiddlers;
		var getList = [];
		var putList = [];
		store.forEachTiddler(function(title,tiddler) {
			var f = tiddlers.findByField("title",title);
			if(f !== null && tiddler.fields['server.type']) {
				// tiddler is on server, so add to getList if not changed locally
				//console.log("uu:"+si.title+" r1:"+tiddlers[f].fields['server.page.revision'] +" r2:"+ si.tiddler.fields['server.page.revision']);
				if(tiddlers[f].fields['server.page.revision'] > tiddler.fields['server.page.revision']) {
					// changed on server
					if(!tiddler.isTouched())
						getList.push(tiddler.title);
				} else if(tiddlers[f].fields['server.page.revision'] < tiddler.fields['server.page.revision']) {
					// changed on server
					if(tiddler.isTouched())
						putList.push(tiddler);
				}
			} else {
				// tiddler not on server, so add to putList if it has been changed
				if(tiddler.fields['server.type'] && tiddler.isTouched()) {
					console.log("pl0:"+title);
					console.log("pl1:"+tiddler.title);
					putList.push(tiddler);
				}
			}
		});
		for(i=0; i<putList.length; i++) {
			context.adaptor.putTiddler(putList[i],null,null,config.macros.quicksync.putTiddlerCallback);
		}

		// now add all tiddlers that only exist on server to getList
		for(var i=0; i<tiddlers.length; i++) {
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
console.log("config.macros.quicksync.putTiddlerCallback:"+context.status+" t:"+context.tiddler.title);
};

config.macros.quicksync.getTiddlerCallback = function(context,userParams)
{
console.log("config.macros.quicksync.getTiddlerCallback:"+context.status+" t:"+context.tiddler.title);
	if(context.status) {
		var tiddler = context.tiddler;
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		story.refreshTiddler(tiddler.title,1,true);
		//# displayMessage(config.messages.tiddlerImported.format([tiddler.title]));
	} else {
		displayMessage(context.statusText);
	}
};




} //# end of 'install only once'
//}}}
