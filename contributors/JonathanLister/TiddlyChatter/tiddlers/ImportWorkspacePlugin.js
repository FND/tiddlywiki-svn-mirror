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

|''Tag for import''|<<option txtImportTag>>|
|''Import workspace on startup''|<<option chkImportWorkspaceOnStartup>>|
|''Label for go button''|<<option txtImportLabel>>|

***/

// CHANGE: I have removed this line to tailor this plugin to select systemServer tiddlers by tag:
// |''Feed for import - DON'T USE''|<<option txtImportFeed>>|

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.ImportWorkspacePlugin) {
version.extensions.ImportWorkspacePlugin = {installed:true};

if(config.options.txtImportTag == undefined)
	{config.options.txtImportTag = '';}
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
		var tag = config.options.txtImportTag;
		var title = "";
		if(tag=='') {
			var tiddlers = store.getTaggedTiddlers("systemServer");
			if(tiddlers.length==0)
				return;
			title = tiddlers[0].title;
		} else {
			var tiddlers = store.getTaggedTiddlers(tag);
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

// I'm finding that this runs before the init function!
// My evidence for this is through config.log calls, so I assume that they execute in the order they are called
config.macros.importWorkspace.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams('anon',null,true,false,false);
	var customFields = getParam(params,'fields',false);
	if(!customFields) {
		customFields = config.defaultCustomFields;
	}
	if(!customFields['server.type']) {
		var title = "";
		var tag = config.options.txtImportTag;
		if (tag=='') {
			title = getParam(params,'anon');
			if(!title) {
				var tiddlers = store.getTaggedTiddlers("systemServer");
				if(tiddlers.length>0)
				title = tiddlers[0].title;
			}
		} else {
		// if we get here, the user has not provided field params and they have not been
		// set in the init function, and we have a tag to use for looking up a tiddler
			var tiddlers = store.getTaggedTiddlers(tag);
			if(tiddlers.length==0)
				return;
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
	if(config.options.txtImportLabel) this.label = config.options.txtImportLabel;
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute('customFields',customFields);
};

config.macros.importWorkspace.onClick = function(e)
{
	clearMessage();
// displayMessage("Starting import...");
	var customFields = this.getAttribute('customFields');
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
	displayMessage("using import filter: " + context.filter);
	context.adaptor.getTiddlerList(context,userParams,config.macros.importWorkspace.getTiddlerListCallback,context.filter);
};

config.macros.importWorkspace.getTiddlerListCallback = function(context,userParams)
{
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
			if(!local_tiddler || !local_tiddler.isTouched()) {
				context.adaptor.getTiddler(tiddler.title,null,null,config.macros.importWorkspace.getTiddlerCallback);
				import_count++;
			}
		}
	}
	// THIS IS A VERY BAD THING TO DO, AS IS IT SPECIFIC, NOT BUILT FOR RE-USE
	// I SUGGEST WE CHANGE THE PLUGIN TO TAKE A CALLBACK FOR EXECUTING AT THE END OF THE IMPORT I.E. HERE
	// now everything's done, open up the TiddlyChatterIncoming tiddler
	// config.macros.importWorkspace.finalise(context);
};


config.macros.importWorkspace.getTiddlerCallback = function(context,userParams)
{
	displayMessage("getting " + context.tiddler.title);
	if(context.status) {
		var tiddler = context.tiddler;
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		story.refreshTiddler(tiddler.title,1,true);
	} else {
		displayMessage(context.statusText);
	}
};

} // end of 'install only once'
//}}}