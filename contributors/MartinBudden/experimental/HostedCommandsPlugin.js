/***
|''Name:''|HostedCommandsPlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#HostedCommandsPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/HostedCommandsPlugin.js|
|''Version:''|0.3.5|
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
		context.tiddler = tiddler;
		context.callback = Story.loadTiddlerCallback;
		ret = adaptor.getTiddler(context);
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

function invokeAdaptor(fnName,context,fields)
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
	var ret = adaptor[fnName](context);
	adaptor.close();
	delete adaptor;
	return ret;
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

//# Returns true if function fnName is available for the tiddler's serverType
//# Used by (eg): config.commands.download.isEnabled
function isAdaptorFunctionSupported(fnName,fields)
{
//#displayMessage("Tiddler.prototype.isFunctionSupported:"+fnName);
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(!fields['server.host'] || !serverType || !config.adaptors[serverType] || !config.adaptors[serverType].name)
		return false;
	return false;
}

// download command definition
config.commands.download = {};
merge(config.commands.download,{
	text: "download",
	tooltip:"Download this tiddler",
	downloaded: "Tiddler downloaded",
	readOnlyText: "download",
	readOnlyTooltip: "Download this tiddler"}
);

config.commands.download.isEnabled = function(tiddler)
{
return true;
	return isAdaptorFunctionSupported('getTiddler',tiddler.fields);
};

config.commands.download.handler = function(event,src,title)
{
//#displayMessage("config.commands.download.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	if(!tiddler) {
		tiddler = new Tiddler(title);
		var fields = String(document.getElementById(this.idPrefix + title).getAttribute("tiddlyFields"));
		tiddler.fields = fields.decodeHashMap();
	}
	var context = {};
	context.tiddler = tiddler;
	context.callback = config.commands.download.callback;
	return invokeAdaptor('getTiddler',context,tiddler.fields);
};

config.commands.download.callback = function(context)
{
//#displayMessage("config.commands.download.callback:"+context.tiddler.title);
//#displayMessage("status:"+context.status);
	if(context.status) {
		story.refreshTiddler(context.tiddler.title,1,true);
		displayMessage(config.commands.downloaded.downloaded);
	} else {
		displayMessage(context.statusText);
	}
};

// upload command definition
config.commands.upload = {};
merge(config.commands.upload,{
	text: "upload",
	tooltip: "Upload this tiddler",
	uploaded: "Tiddler uploaded",
	readOnlyText: "upload",
	readOnlyTooltip: "Upload this tiddler"});

config.commands.upload.isEnabled = function(tiddler)
{
return true;
	return tiddler && tiddler.isTouched() && isAdaptorFunctionSupported('putTiddler',tiddler.fields);
};

config.commands.upload.handler = function(event,src,title)
{
//#displayMessage("config.commands.upload.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	if(!tiddler)
		return false;
	var context = {};
	context.tiddler = tiddler;
	context.callback = config.commands.upload.callback;
	return invokeAdaptor('putTiddler',context,tiddler.fields);
};

config.commands.upload.callback = function(context)
{
	if(context.status) {
		displayMessage(config.commands.upload.uploaded);
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
	revisionTooltip: "View this revision",
	popupNone: "No revisions"});

config.commands.revisions.isEnabled = function(tiddler)
{
return true;
	return isAdaptorFunctionSupported('getTiddlerRevisionList',tiddler.fields);
};

config.commands.revisions.handler = function(event,src,title)
{
//#displayMessage("revisions.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	context = {};
	context.tiddler = tiddler;
	context.callback = config.commands.revisions.callback;
	context.src = src;
	if(!invokeAdaptor('getTiddlerRevisionList',context,tiddler.fields))
		return false;
	event.cancelBubble = true;
	if(event.stopPropagation)
		event.stopPropagation();
	return true;
};

config.commands.revisions.callback = function(context)
// The revisions are returned in the revisions array
//# revisions[i].modified
//# revisions[i].key
{
//#displayMessage("config.commands.revisions.callback:"+context.tiddler.title);
var t = context.tiddler.title;
	var revisions = context.revisions;
	popup = Popup.create(context.src);
	Popup.show(popup,false);
	if(revisions.length==0) {
		createTiddlyText(createTiddlyElement(popup,'li',null,'disabled'),config.commands.revisions.popupNone);
	} else {
		for(var i=0; i<revisions.length; i++) {
			var modified = revisions[i].modified;
			var key = revisions[i].key;
			var btn = createTiddlyButton(createTiddlyElement(popup,'li'),
					modified.toLocaleString(),
					config.commands.revisions.revisionTooltip,
					function() {
						config.commands.revisions.displayTiddlerRevision(this.getAttribute('tiddlerTitle'),this.getAttribute('revisionKey'),this);
						return false;
						},
					'tiddlyLinkExisting tiddlyLink');
			btn.setAttribute('tiddlerTitle',context.tiddler.title);
			btn.setAttribute('revisionKey',key);
			if(context.tiddler.revisionKey == key || (!context.tiddler.revisionKey && i==0))
				btn.className = 'revisionCurrent';
		}
	}
};

config.commands.revisions.displayTiddlerRevision = function(title,key)
{
};

}//# end of 'install only once'
//}}}
