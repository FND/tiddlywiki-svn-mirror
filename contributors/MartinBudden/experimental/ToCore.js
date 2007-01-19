/***
|''Name:''|ToCore|
|''Description:''|Candidates for moving into TiddlyWiki core|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental|
|''Version:''|0.0.7|
|''Date:''|Dec 30, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.ToCore) {
version.extensions.ToCore = {installed:true};

function onClickTiddlerLink(e)
{
	if (!e) e = window.event;
	var theTarget = resolveTarget(e);
	var theLink = theTarget;
	var title = null;
	var fields = null;
	do {
		title = theLink.getAttribute("tiddlyLink");
		fields = theLink.getAttribute("tiddlyFields");
		theLink = theLink.parentNode;
	} while(title == null && theLink != null);
	if(title) {
		var toggling = e.metaKey || e.ctrlKey;
		if(config.options.chkToggleLinks)
			toggling = !toggling;
		var opening;
		if(toggling && document.getElementById("tiddler" + title)) {
			story.closeTiddler(title,true,e.shiftKey || e.altKey);
		} else {
			story.displayTiddler(theTarget,title,null,true,e.shiftKey || e.altKey,fields);
			if(fields) {
				var tiddlerElem = document.getElementById(story.idPrefix + title);
				tiddlerElem.setAttribute("tiddlyFields",fields);
			}
			if(!store.tiddlerExists(title))
				store.getMissingTiddler(title);
		}
	}
	//#clearMessage();
	return false;
}

// function redirectors
config.hostFunctions = {
	getTiddler: {},
	getTiddlerList: {},
	getTiddlerRevisionList: {},
	getTiddlerRevision: {},
	putTiddler: {},
	lockTiddler: {},
	unlockTiddler: {}
};

// params.workspace
// params.wikiformat
// params.serverHost
// params.serverType
// params.serverPageId
// params.serverPageName
// params.serverPageRevision
// params.token

TiddlyWiki.prototype.updateStory = function(tiddler)
{
//#displayMessage("updateStory");
	this.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields);
	//#story.refreshTiddler(tiddler.title,1,true);// not required, savetiddler refreshes
	if(config.options.chkAutoSave) {
		saveChanges();
	}
};

TiddlyWiki.getFields = function(title)
{
	var tiddlerElem = document.getElementById(story.idPrefix + title);
	var customFields = tiddlerElem.getAttribute("tiddlyFields");
	return convertCustomFieldsToHash(customFields);
};

//# Get the server type. If there is no server.type field, infer the server type
//# from the wikiformat.
TiddlyWiki.getServerType = function(fields)
{
	if(!fields)
		return null;
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	return serverType ? serverType.toLowerCase() : null;
};

TiddlyWiki.prototype.getMissingTiddler = function(title)
{
//#displayMessage("getMissingTiddler");
	fields = TiddlyWiki.getFields(title);
	if(!fields['server.host'])
		return false;
	var serverType = TiddlyWiki.getServerType(fields);
	if(!serverType)
		return false;
	var fn = config.hostFunctions.getTiddler[serverType];
	if(fn) {
		var params = {};
		params.serverHost = fields['server.host'];
		params.workspace = fields['server.workspace'];
		fn(title,params);
	}
	return true;
};

TiddlyWiki.prototype.getHostedTiddler = function(title,params)
{
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		var fields = tiddler.fields;
		var serverType = tiddler.getServerType();
	} else {
		fields = TiddlyWiki.getFields(title);
		serverType = this.getServerType(fields);
	}
	if(!serverType)
		return false;
	var fn = config.hostFunctions.getTiddler[serverType];
	if(fn) {
		if(!params)
			params = {};
		params.title = title;
		params.serverHost = fields['server.host'];
		params.workspace = fields['server.workspace'];
		fn(title,params);
		return true;
	}
	return false;
};

TiddlyWiki.prototype.putHostedTiddler = function(title,params)
{
	var tiddler = this.fetchTiddler(title);
	if(!tiddler)
		return false;
	var serverType = tiddler.getServerType();
	if(!serverType)
		return false;
	var fn = config.hostFunctions.putTiddler[serverType];
	if(fn) {
		if(!params)
			params = {};
		params.title = title;
		params.serverHost = fields['server.host'];
		params.workspace = fields['server.workspace'];
		fn(title,params);
		return true;
	}
	return false;
};

//# Get the server type used. If there is no server.type field, infer it from the
//# wikiformat. If no wikiformat use the Format tag to infer the server type.
Tiddler.prototype.getServerType = function()
{
	var serverType = this.fields['server.type'];
	if(!serverType)
		serverType = this.fields['wikiformat'];
	for(i in config.parsers) {
		var format = config.parsers[i].format;
		if(this.isTagged(format+'Format')) {
			serverType = format;
			break;
		}
	}
	return serverType ? serverType.toLowerCase() : null;
};

Tiddler.prototype.updateFieldsAndContent = function(params,content)
{
	if(content)
		this.text = content;
	this.fields['server.host'] = params.serverHost;
	if(params.workspace)
		this.fields['server.workspace'] = params.workspace;
	if(params.wikiformat)
		this.fields['wikiformat'] = params.wikiformat;
	if(params.serverType)
		this.fields['server.type'] = params.serverType;
	if(params.serverPageName)
		this.fields['server.page.name'] = params.serverPageName;
	if(params.serverPageId)
		this.fields['server.page.id'] = params.serverPageId;
	if(params.serverPageRevision)
		this.fields['server.page.revision'] = params.serverPageRevision;
	this.created = new Date();
	this.modified = this.created;
	this.modifier = params.serverHost;
	this.fields['downloaded'] = this.modified.convertToYYYYMMDDHHMM();
	this.fields['changecount'] = -1;
};

//# Returns true if function fnName is available for the tiddler's serverType
Tiddler.prototype.isFunctionSupported = function(fnName)
{
	if(!this.fields['server.host'])
		return false;
	var serverType = this.getServerType();
	if(!serverType)
		return false;
	if(config.hostFunctions[fnName][serverType]) {
		return true;
	}
	return false;
};

Tiddler.prototype.getRevisionList = function(params)
{
	var serverType = this.getServerType();
	if(!serverType)
		return false;
	var fn = config.hostFunctions.getTiddlerRevisionList[serverType];
	if(fn) {
		if(!params)
			params = {};
		params.title = title;
		params.serverHost = this.fields['server.host'];
		params.workspace = this.fields['server.workspace'];
		fn(this.title,params);
	}
	return true;
};

} // end of 'install only once'
//}}}
