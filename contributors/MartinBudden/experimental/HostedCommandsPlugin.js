/***
|''Name:''|HostedCommandsPlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#HostedCommandsPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/HostedCommandsPlugin.js|
|''Version:''|0.4.1|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.HostedCommandsPlugin) {
version.extensions.HostedCommandsPlugin = {installed:true};

Tiddler.prototype.getAdaptor = function()
{
	var serverType = this.fields['server.type'];
	if(!serverType)
		serverType = this.fields['wikiformat'];
	if(!serverType || !config.adaptors[serverType])
		return null;
	return new config.adaptors[serverType];
};

Story.loadTiddlerCallback = function(context)
{
	if(!context.status)
		return;
	var tiddler = context.tiddler;
	var downloaded = new Date();
	if(!tiddler.created)
		tiddler.created = downloaded;
	if(!tiddler.modified)
		tiddler.modified = tiddler.created;
	tiddler.fields['downloaded'] = downloaded.convertToYYYYMMDDHHMM();
	tiddler.fields['changecount'] = -1;
	store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields);
	saveChanges(true);
};

Story.prototype.loadMissingTiddler = function(title,fields,tiddlerElem)
{
	var tiddler = new Tiddler(title);
	tiddler.fields = typeof fields == "string" ?  fields.decodeHashMap() : fields;
	var ret = false;
	var adaptor = tiddler.getAdaptor();
	if(adaptor) {
		adaptor.openHost(tiddler.fields['server.host']);
		adaptor.openWorkspace(tiddler.fields['server.workspace']);
		context = {};
		ret = adaptor.getTiddler(tiddler,context,Story.loadTiddlerCallback);
		//ret = adaptor.getTiddler(tiddler,null,Story.loadTiddlerCallback);
		adaptor.close();
		delete adaptor;
	}
	return ret;
};

function getServerType(fields)
{
//#displayMessage("getServerType");
	if(!fields)
		return null;
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
//#displayMessage("serverType:"+serverType);
	return serverType;
}

function invokeAdaptor(fnName,param,context,callback,fields)
{
//#displayMessage("invokeAdaptor:"+fnName);
	var serverType = getServerType(fields);
	if(!serverType)
		return null;
	var adaptor = new config.adaptors[serverType];
	if(!adaptor)
		return false;
	adaptor.openHost(fields['server.host']);
	adaptor.openWorkspace(fields['server.workspace']);
	var ret = adaptor[fnName](param,context,callback);
	adaptor.close();
	delete adaptor;
	return ret;
}

//# Returns true if function fnName is available for the serverType specified in fields
//# Used by (eg): config.commands.download.isEnabled
function isAdaptorFunctionSupported(fnName,fields)
{
//#displayMessage("isAdaptorFunctionSupported:"+fnName);
	var serverType = getServerType(fields);
	if(!serverType || !config.adaptors[serverType])
		return false;
	var fn = config.adaptors[serverType].prototype[fnName];
	return fn ? true : false;
}

function isAdaptorFunctionSupportedX(fnName,fields)
{
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(!fields['server.host'] || !serverType || !config.adaptors[serverType] || !config.adaptors[serverType].name)
		return false;
	return false;
}

config.macros.viewTiddlerFields = {};
config.macros.viewTiddlerFields.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(tiddler instanceof Tiddler) {
		var value = '';
		var comma = '';
		for(i in tiddler.fields) {
			if (!i.match(/^temp[\._]/)) {
				value += comma + i + '=' + tiddler.fields[i];
				comma = ', ';
			}
		}
		value += comma + 'created=' + tiddler.created.convertToYYYYMMDDHHMM();
		value += ', modified=' + tiddler.modified.convertToYYYYMMDDHHMM();
		value += ', modifier=' + tiddler.modifier;
		value += ', touched=' + (tiddler.isTouched() ? 'true' : 'false');
		highlightify(value,place,highlightHack,tiddler);
	}
};

config.macros.list.updatedOffline = {};
config.macros.list.updatedOffline.handler = function(params)
{
	var results = [];
	store.forEachTiddler(function(title,tiddler) {
		if(tiddler.fields['server.host'] && tiddler.isTouched())
			results.push(tiddler);
		});
	results.sort();
	return results;
};

// getTiddler command definition
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
//#displayMessage("config.commands.getTiddler.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	if(!tiddler) {
		tiddler = new Tiddler(title);
		var fields = String(document.getElementById(this.idPrefix + title).getAttribute("tiddlyFields"));
		tiddler.fields = fields.decodeHashMap();
	}
	var context = {};
	return invokeAdaptor('getTiddler',tiddler,context,config.commands.getTiddler.callback,tiddler.fields);
};

config.commands.getTiddler.callback = function(context)
{
//#displayMessage("config.commands.getTiddler.callback:"+context.tiddler.title);
//#displayMessage("status:"+context.status);
	if(context.status) {
		story.refreshTiddler(context.tiddler.title,1,true);
		displayMessage(config.commands.getTiddler.done);
	} else {
		displayMessage(context.statusText);
	}
};

// putTiddler command definition
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
//#displayMessage("config.commands.putTiddler.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	if(!tiddler)
		return false;
	var context = {};
	return invokeAdaptor('putTiddler',tiddler,context,config.commands.putTiddler.callback,tiddler.fields);
};

config.commands.putTiddler.callback = function(context)
{
//#displayMessage("config.commands.putTiddler.callback:"+context.tiddler.title);
	if(context.status) {
		displayMessage(config.commands.putTiddler.done);
	} else {
		displayMessage(context.statusText);
	}
};

// revisions command definition
config.commands.revisions = {};
merge(config.commands.revisions,{
	text: "revisions",
	tooltip: "View another revision of this tiddler",
	loading: "loading...",
	done: "Revision downloaded",
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
	tiddler.fields['temp.revisionLimit'] = 10;
	context = {};
	context.src = src;
	context.dateFormat = 'YYYY mmm 0DD 0hh:0mm';
	if(!invokeAdaptor('getTiddlerRevisionList',tiddler,context,config.commands.revisions.callback,tiddler.fields))
		return false;
	event.cancelBubble = true;
	if(event.stopPropagation)
		event.stopPropagation();
	return true;
};

config.commands.revisions.callback = function(context)
// The revisions are returned in the context.revisions array
//# revisions[i].revision
//# revisions[i].modified
//# revisions[i].modifier
//# revisions[i].comment
{
//#displayMessage("config.commands.revisions.callback:"+context.tiddler.title);
	var title = context.tiddler.title;
	var revisions = context.revisions;
	popup = Popup.create(context.src);
	Popup.show(popup,false);
	if(revisions.length==0) {
		createTiddlyText(createTiddlyElement(popup,'li',null,'disabled'),config.commands.revisions.popupNone);
	} else {
		for(var i=0; i<revisions.length; i++) {
			var modified = revisions[i].modified;
			var revision = revisions[i].revision;
			var btn = createTiddlyButton(createTiddlyElement(popup,'li'),
					modified.formatString(context.dateFormat),
					config.commands.revisions.revisionTooltip,
					function() {
						config.commands.revisions.getTiddlerRevision(this.getAttribute('tiddlerTitle'),this.getAttribute('tiddlerRevision'),this);
						return false;
						},
					'tiddlyLinkExisting tiddlyLink');
			btn.setAttribute('tiddlerTitle',title);
			btn.setAttribute('tiddlerRevision',revision);
			if(context.tiddler.revision == revision || (!context.tiddler.revision && i==0))
				btn.className = 'revisionCurrent';
		}
	}
};

config.commands.revisions.getTiddlerRevision = function(title,revision)
{
	var tiddler = store.fetchTiddler(title);
	tiddler.fields.revision = revision;
	var context = {};
	return invokeAdaptor('getTiddler',tiddler,context,config.commands.displayTiddlerRevisionCallback.callback,tiddler.fields);
};

config.commands.revisions.getTiddlerRevisionCallback = function(context)
{
//#displayMessage("config.commands.getTiddlerRevisionCallback.callback:"+context.tiddler.title);
	if(context.status) {
		displayMessage(config.commands.revisions.done);
	} else {
		displayMessage(context.statusText);
	}
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
	if(!isAdaptorFunctionSupported('saveTiddlerHosted',tiddler.fields))
		return false;
	var context = {};
	return invokeAdaptor('saveTiddlerHosted',tiddler,context,config.commands.saveTiddlerHosted.callback,tiddler.fields);
};

config.commands.saveTiddlerHosted.callback = function(context)
{
//#displayMessage("config.commands.saveTiddlerHosted.callback:"+context.tiddler.title);
	if(context.status) {
		displayMessage(config.commands.saveTiddlerHosted.done);
	} else {
		displayMessage(context.statusText);
	}
};

/* temporary, for reference
config.commands.saveTiddler.handler = function(event,src,title)
{
	var newTitle = story.saveTiddler(title,event.shiftKey);
	if(newTitle)
		story.displayTiddler(null,newTitle);
	return false;
};*/

}//# end of 'install only once'
//}}}
