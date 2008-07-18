/***
|''Name:''|AdaptorCommandsPlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#AdaptorCommandsPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/AdaptorCommandsPlugin.js |
|''Version:''|0.5.11|
|''Date:''|Aug 23, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.AdaptorCommandsPlugin) {
version.extensions.AdaptorCommandsPlugin = {installed:true};
function getServerType(fields)
{
	if(!fields)
		return null;
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(!serverType)
		serverType = config.defaultCustomFields['server.type'];
	if(!serverType && typeof RevisionAdaptor != 'undefined' && fields.uuid)
		serverType = RevisionAdaptor.serverType;
//#console.log("serverType:",serverType);
	return serverType;
}

function invokeAdaptor(fnName,param1,param2,context,userParams,callback,fields)
{
//#console.log("invokeAdaptor:"+fnName);
	var serverType = getServerType(fields);
	if(!serverType)
		return null;
	var adaptor = new config.adaptors[serverType];
	if(!adaptor)
		return false;
	if(!config.adaptors[serverType].prototype[fnName])
		return false;
	adaptor.openHost(fields['server.host']);
	adaptor.openWorkspace(fields['server.workspace']);
	var ret = false;
	if(param1)
		ret = param2 ? adaptor[fnName](param1,param2,context,userParams,callback) : adaptor[fnName](param1,context,userParams,callback);
	else
		ret = adaptor[fnName](context,userParams,callback);
	
	//adaptor.close();
	//delete adaptor;
	return ret;
}

//# Returns true if function fnName is available for the serverType specified in fields
//# Used by (eg): config.commands.download.isEnabled
function isAdaptorFunctionSupported(fnName,fields)
{
//#console.log("isAdaptorFunctionSupported:",fnName,"f:",fields);
	var serverType = getServerType(fields);
//#console.log("st:"+serverType);
	if(!serverType || !config.adaptors[serverType])
		return false;
	if(!config.adaptors[serverType].isLocal && !fields['server.host'])
		return false;
	var fn = config.adaptors[serverType].prototype[fnName];
	return fn ? true : false;
}

//# getTiddler command definition
config.commands.getTiddler = {};
merge(config.commands.getTiddler,{
	text: "get",
	tooltip:"Download this tiddler",
	readOnlyText: "get",
	readOnlyTooltip: "Download this tiddler",
	done: "Tiddler downloaded"
	});

config.commands.getTiddler.isEnabled = function(tiddler)
{
	return isAdaptorFunctionSupported('getTiddler',tiddler.fields);
};

config.commands.getTiddler.handler = function(event,src,title)
{
//#console.log("config.commands.getTiddler.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	if(tiddler) {
		var fields = tiddler.fields;
	} else {
		fields = String(document.getElementById(story.idPrefix + title).getAttribute("tiddlyFields"));
		fields = fields ? fields.decodeHashMap() : null;
	}
	return invokeAdaptor('getTiddler',title,null,null,null,config.commands.getTiddler.callback,fields);
};

config.commands.getTiddler.callback = function(context,userParams)
{
//#console.log("config.commands.getTiddler.callback:"+context.tiddler.title);
//#displayMessage("status:"+context.status);
	if(context.status) {
		var tiddler = context.tiddler;
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields);
		story.refreshTiddler(tiddler.title,1,true);
		displayMessage(config.commands.getTiddler.done);
	} else {
		displayMessage(context.statusText);
	}
};

//# putTiddler command definition
config.commands.putTiddler = {};
merge(config.commands.putTiddler,{
	text: "put",
	tooltip: "Upload this tiddler",
	hideReadOnly: true,
	done: "Tiddler uploaded"
	});

config.commands.putTiddler.isEnabled = function(tiddler)
{
	return tiddler && tiddler.isTouched() && isAdaptorFunctionSupported('putTiddler',tiddler.fields);
};

config.commands.putTiddler.handler = function(event,src,title)
{
//#console.log("config.commands.putTiddler.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	if(!tiddler)
		return false;
	return invokeAdaptor('putTiddler',tiddler,null,null,null,config.commands.putTiddler.callback,tiddler.fields);
};

config.commands.putTiddler.callback = function(context,userParams)
{
//#console.log("config.commands.putTiddler.callback:"+context.tiddler.title);
	if(context.status) {
		store.fetchTiddler(context.title).clearChangeCount();
		displayMessage(config.commands.putTiddler.done);
	} else {
		displayMessage(context.statusText);
	}
};

config.commands.putTiddlerRevision = {};
merge(config.commands.putTiddlerRevision,{
	text: "putRevision",
	tooltip: "Upload this tiddler as revision",
	hideReadOnly: true,
	done: "Tiddler revision uploaded"
	});

config.commands.putTiddlerRevision.isEnabled = function(tiddler)
{
	return tiddler && tiddler.isTouched() && isAdaptorFunctionSupported('putTiddlerRevision',tiddler.fields);
};

config.commands.putTiddlerRevision.handler = function(event,src,title)
{
//#displayMessage("config.commands.putTiddler.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	if(!tiddler)
		return false;
	return invokeAdaptor('putTiddlerRevision',tiddler,null,null,null,config.commands.putTiddlerRevision.callback,tiddler.fields);
};

config.commands.putTiddlerRevision.callback = function(context,userParams)
{
//#displayMessage("config.commands.putTiddler.callback:"+context.tiddler.title);
	if(context.status) {
		store.fetchTiddler(context.title).clearChangeCount();
		displayMessage(config.commands.putTiddlerRevision.done);
	} else {
		displayMessage(context.statusText);
	}
};

//# revisions command definition
config.commands.revisions = {};
merge(config.commands.revisions,{
	text: "revisions",
	tooltip: "View another revision of this tiddler",
	loading: "loading...",
	done: "Revision downloaded",
	revisionTooltip: "View this revision",
	popupNone: "No revisions",
	revisionTemplate: "%0 r:%1"
	});

config.commands.revisions.isEnabled = function(tiddler)
{
	return isAdaptorFunctionSupported('getTiddlerRevisionList',tiddler.fields);
};

config.commands.revisions.handler = function(event,src,title)
{
//#console.log("revisions.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	userParams = {};
	userParams.tiddler = tiddler;
	userParams.src = src;
	userParams.dateFormat = 'YYYY mmm 0DD 0hh:0mm';
	var revisionLimit = 10;
	if(!invokeAdaptor('getTiddlerRevisionList',title,revisionLimit,null,userParams,config.commands.revisions.callback,tiddler.fields))
		return false;
	event.cancelBubble = true;
	if(event.stopPropagation)
		event.stopPropagation();
	return true;
};

config.commands.revisions.callback = function(context,userParams)
// The revisions are returned as tiddlers in the context.revisions array
{
	var revisions = context.revisions;
//#displayMessage("config.commands.revisions.callback:"+revisions.length);
	popup = Popup.create(userParams.src);
	Popup.show(popup,false);
	if(revisions.length==0) {
		createTiddlyText(createTiddlyElement(popup,'li',null,'disabled'),config.commands.revisions.popupNone);
	} else {
		revisions.sort(function(a,b) {return a.modified < b.modified ? +1 : -1;});
		for(var i=0; i<revisions.length; i++) {
			var tiddler = revisions[i];
			var modified = tiddler.modified.formatString(context.dateFormat||userParams.dateFormat);
			var revision = tiddler.fields['server.page.revision'];
			var btn = createTiddlyButton(createTiddlyElement(popup,'li'),
					config.commands.revisions.revisionTemplate.format([modified,revision,tiddler.modifier]),
					tiddler.text||config.commands.revisions.revisionTooltip,
					function() {
						config.commands.revisions.getTiddlerRevision(this.getAttribute('tiddlerTitle'),this.getAttribute('tiddlerModified'),this.getAttribute('tiddlerRevision'),this);
						return false;
						},
					'tiddlyLinkExisting tiddlyLink');
			btn.setAttribute('tiddlerTitle',userParams.tiddler.title);
			btn.setAttribute('tiddlerRevision',revision);
			btn.setAttribute('tiddlerModified',tiddler.modified.convertToYYYYMMDDHHMM());
			if(userParams.tiddler.fields['server.page.revision'] == revision || (!userParams.tiddler.fields['server.page.revision'] && i==0))
				btn.className = 'revisionCurrent';
		}
	}
};

config.commands.revisions.getTiddlerRevision = function(title,modified,revision)
{
//#console.log("config.commands.getTiddlerRevision:"+title+" r:"+revision);
	var tiddler = store.fetchTiddler(title);
	var context = {modified:modified};
	return invokeAdaptor('getTiddlerRevision',title,revision,context,null,config.commands.revisions.getTiddlerRevisionCallback,tiddler.fields);
};

config.commands.revisions.getTiddlerRevisionCallback = function(context,userParams)
{
//#console.log("config.commands.getTiddlerRevisionCallback:"+context.tiddler.title);
	if(context.status) {
		var tiddler = context.tiddler;
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields);
		story.refreshTiddler(tiddler.title,1,true);
		displayMessage(config.commands.revisions.done);
	} else {
		displayMessage(context.statusText);
	}
};

config.commands.saveTiddlerAndPut = {};
merge(config.commands.saveTiddlerAndPut,{
	text: "done",
	tooltip: "Save this tiddler and upload",
	hideReadOnly: true,
	done: "Tiddler uploaded"
	});

config.commands.saveTiddlerAndPut.handler = function(event,src,title)
{
	config.commands.putTiddlerRevision.handler(event,src,title);// save the old tiddler as a revision
	var newTitle = story.saveTiddler(title,event.shiftKey);
	if(newTitle)
		story.displayTiddler(null,newTitle);
	return config.commands.putTiddler.handler(event,src,newTitle);
};

config.commands.saveTiddlerHosted = {};
merge(config.commands.saveTiddlerHosted,{
	text: "done",
	tooltip: "Save changes to this tiddler",
	hideReadOnly: true,
	done: "done"
	});
	
config.commands.saveTiddlerHosted.handler = function(event,src,title)
{
//#displayMessage("config.commands.saveTiddlerHosted.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	if(!tiddler)
		return false;
	return invokeAdaptor('saveTiddlerHosted',tiddler,null,null,null,config.commands.saveTiddlerHosted.callback,tiddler.fields);
};

config.commands.saveTiddlerHosted.callback = function(context,userParams)
{
//#displayMessage("config.commands.saveTiddlerHosted.callback:"+context.tiddler.title);
	if(context.status) {
		displayMessage(config.commands.saveTiddlerHosted.done);
	} else {
		displayMessage(context.statusText);
	}
};

config.commands.deleteTiddlerHosted = {};
merge(config.commands.deleteTiddlerHosted,{
	text: "delete",
	tooltip: "Delete this tiddler",
	warning: "Are you sure you want to delete '%0'?",
	hideReadOnly: true,
	done: "done"
	});
	
config.commands.deleteTiddlerHosted.handler = function(event,src,title)
{
//#displayMessage("config.commands.deleteTiddlerHosted.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	if(!tiddler)
		return false;
	return invokeAdaptor('deleteTiddler',title,null,null,null,config.commands.deleteTiddlerHosted.callback,tiddler);
};

config.commands.deleteTiddlerHosted.callback = function(context,userParams)
{
//#displayMessage("config.commands.deleteTiddlerHosted.callback:"+context.tiddler.title);
	if(context.status) {
		displayMessage(config.commands.saveTiddlerHosted.done);
	} else {
		displayMessage(context.statusText);
	}
};

}//# end of 'install only once'
//}}}
