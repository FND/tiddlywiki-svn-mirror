/***
|''Name:''|ToCore|
|''Description:''|Candidates for moving into TiddlyWiki core|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|None|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/ToCore.js|
|''Version:''|0.1.3|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.ToCore) {
version.extensions.ToCore = {installed:true};

//# change in Macros.js
//# list.handler has been tweeked to pass additional parameters to list type handler
config.macros.list.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var type = params[0] ? params[0] : "all";
	var theList = document.createElement("ul");
	place.appendChild(theList);
	if(this[type].prompt)
		createTiddlyElement(theList,"li",null,"listTitle",this[type].prompt);
	var results;
	if(this[type].handler)
		results = this[type].handler(params,wikifier,paramString,tiddler);
	for(var t = 0; t < results.length; t++) {
		var theListItem = document.createElement("li");
		theList.appendChild(theListItem);
		var title = typeof results[t] == "string" ? results[t] : results[t].title;
		createTiddlyLink(theListItem,title,true,null,false,tiddler);
	}
};

//# change in Utilities.js
//# onClickTiddlerLink has been tweeked to get missing links from host
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
	if(!fields && !store.isShadowTiddler(title))
		fields = store.getDefaultCustomFields();
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
				if(!store.tiddlerExists(title))
					store.getMissingTiddler(title,convertCustomFieldsToHash(fields));
			}
		}
	}
	clearMessage();
	return false;
}

//# change in config.js
// function redirectors
config.hostFunctions = {
	getTiddler: {},
	getTiddlerList: {},
	getTiddlerRevisionList: {},
	getTiddlerRevision: {},
	getWorkspace: {},
	putTiddler: {},
	lockTiddler: {},
	unlockTiddler: {}
};

//#
//# changes in TiddlyWiki.js
//#

TiddlyWiki.prototype.setDefaultCustomFields = function(fields)
{
	this.defaultCustomFields = fields;
};

TiddlyWiki.prototype.getDefaultCustomFields = function()
{
	return this.defaultCustomFields;
};

//# Get the server type. If there is no server.type field, infer the server type
//# from the wikiformat.
TiddlyWiki.prototype.getServerType = function(fields)
{
	if(!fields)
		return null;
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	return serverType ? serverType.toLowerCase() : null;
};

TiddlyWiki.prototype.getMissingTiddler = function(title,fields)
{
//#displayMessage("getMissingTiddler");
	var serverType = this.getServerType(fields);
	if(!serverType || !fields['server.host'])
		return false;
	var fn = config.hostFunctions.getTiddler[serverType];
	if(fn) {
		var params = {};
		params.serverHost = fields['server.host'];
		params.serverWorkspace = fields['server.workspace'];
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
		fields = convertCustomFieldsToHash(document.getElementById(story.idPrefix + title).getAttribute("tiddlyFields"));
		serverType = this.getServerType(fields);
	}
	if(!serverType)
		return false;
	var fn = config.hostFunctions.getTiddler[serverType];
	if(fn) {
		if(!params)
			params = {};
		params.serverHost = fields['server.host'];
		params.serverWorkspace = fields['server.workspace'];
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
		params.serverHost = fields['server.host'];
		params.serverWorkspace = fields['server.workspace'];
		fn(title,params);
		return true;
	}
	return false;
};

//#
//# changes in TiddlyWiki.js follow
//#

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

Tiddler.prototype.getRevisionList = function(params)
{
	var serverType = this.getServerType();
	if(!serverType)
		return false;
	var fn = config.hostFunctions.getTiddlerRevisionList[serverType];
	if(fn) {
		if(!params)
			params = {};
		params.title = this.title;
		params.serverHost = this.fields['server.host'];
		params.serverWorkspace = this.fields['server.workspace'];
		fn(this.title,params);
	}
	return true;
};

} // end of 'install only once'
//}}}
