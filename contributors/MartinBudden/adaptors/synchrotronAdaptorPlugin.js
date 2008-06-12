/***
|''Name:''|SynchrotronAdaptorPlugin|
|''Description:''|Adaptor for working with synchrotron diff tool|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/SynchrotronAdaptorPlugin.js |
|''Version:''|0.0.5|
|''Date:''|Jun 11, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.4.0|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SynchrotronAdaptorPlugin) {
version.extensions.SynchrotronAdaptorPlugin = {installed:true};

function SynchrotronAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

SynchrotronAdaptor.serverType = 'synchrotron';
SynchrotronAdaptor.isLocal = true;
SynchrotronAdaptor.errorInFunctionMessage = 'Error in function SynchrotronAdaptor.%0: %1';
SynchrotronAdaptor.revisionSavedMessage = 'Revision %0 saved';
SynchrotronAdaptor.baseRevision = 1000;

SynchrotronAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

// Convert a page title to the normalized form used in uris
SynchrotronAdaptor.normalizedTitle = function(title)
{
	var id = title;
	id = id.replace(/ /g,'_').replace(/%/g,'%25').replace(/\t/g,'%09').replace(/#/g,'%23').replace(/\*/g,'%2a').replace(/,/g,'%2c').replace(/\//,'%2f').replace(/:/g,'%3a').replace(/</g,'%3c').replace(/>/g,'%3e').replace(/\?/g,'%3f');
	if(id.charAt(0)=='_')
		id = id.substr(1);
	return String(id);
};

SynchrotronAdaptor.dateFromTimestamp = function(timestamp)
{
	var dt = new Date();
	dt.setTime(parseInt(timestamp,10));
	return dt;
};

SynchrotronAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	host = host.trim();
	if(!host.match(/:\/\//))
		host = 'file://' + host;
	if(host.substr(host.length-1) != '/')
		host = host + '/';
	return host;
};

SynchrotronAdaptor.minHostName = function(host)
{
	return host ? host.replace(/\\/,'/').host.replace(/^http:\/\//,'').replace(/\/$/,'') : ''; //'
};

SynchrotronAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
//#displayMessage('openHost:'+host);
	this.host = SynchrotronAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
//#displayMessage('host:'+this.host);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

SynchrotronAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
//#displayMessage('openWorkspace:'+workspace);
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

SynchrotronAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#displayMessage('getWorkspaceList');
	var list = [];
	list.push({title:'Main',name:'Main'});
	context.workspaces = list;
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

SynchrotronAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
//#console.log('SynchrotronAdaptor.getTiddlerList');
	context = this.setContext(context,userParams,callback);
	var path = SynchrotronAdaptor.contentPath();
	var entries = this.dirList(path);
	if(entries) {
		context.status = true;
		var list = [];
		var hash = {};
		for(var i=0; i<entries.length; i++) {
			var title = entries[i].name;
			if(title.match(/\.tiddler$/)) {
				title = title.replace(/\.tiddler$/,'');
				title = title.replace(/_/g,' ').replace(/%09/g,'\t').replace(/%23/g,'#').replace(/%2a/g,'*').replace(/%2c/g,',').replace(/%2f/g,'/').replace(/%3a/g,':').replace(/%3c/g,'<').replace(/%3e/g,'>').replace(/%3f/g,'?').replace(/%25/g,'%');
				var tiddler = new Tiddler(title);
				tiddler.modified = entries[i].modified;
				list.push(tiddler);
				hash[title] = tiddler;
			}
		}
		context.tiddlers = list;
		context.content = hash;
	} else {
		context.status = false;
		context.statusText = SynchrotronAdaptor.errorInFunctionMessage.format(['getTiddlerList']);
	}
	if(context.callback)
		window.setTimeout(function() {callback(context,userParams);},0);
	return context;
};

SynchrotronAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
// get a list of the revisions for a tiddler
{
//#console.log('SynchrotronAdaptor.getTiddlerRevisionList');
	context = this.setContext(context,userParams,callback);
	context.dateFormat = 'YYYY mmm 0DD 0hh:0mm:0ss';
	var tiddler = store.getTiddler(title);
//#console.log(tiddler);
	context.revisions = [];
	context.status = true;
	var entries = null;
	if(tiddler.fields.uuid)
		entries = synchrotron.repo.fileRevisions(tiddler.fields.uuid);
	if(entries) {
//#console.log('ec:'+entries.length);
//#console.log('uuid:'+tiddler.fields.uuid);
		var uuid = tiddler.fields.uuid;
		var list = [];
		for(var i=0; i<entries.length; i++) {
			var alive = entries[i].alive;
//#console.log('a:',alive);
			var bodyId = entries[i].alive[uuid];
//#console.log('bodyId:',bodyId);
			var body = synchrotron.repo.getBody(entries[i],uuid);
//#console.log('body:',body);
//#console.log('li:'+i);
//#console.log(body.title);
//#console.log(body.text);
			if(body.title) {
				title = body.title;
				tiddler = new Tiddler(title+i);
				tiddler.modified = SynchrotronAdaptor.dateFromTimestamp(entries[i].timestamp);
				tiddler.text = body.text.join('\n');
				tiddler.fields['server.page.revision'] = i;
				list.push(tiddler);
			}
		}
		context.revisions = list;
	} else {
		context.status = false;
		context.statusText = SynchrotronAdaptor.errorInFunctionMessage.format(['getTiddlerList']);
	}
	if(context.callback) {
		//# direct callback doesn't work, not sure why
		//#context.callback(context,context.userParams);
		window.setTimeout(function() {callback(context,userParams);},0);
	}
};

SynchrotronAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var uriTemplate = '%0#%1';
	var host = SynchrotronAdaptor.fullHostName(this.host);
	info.uri = uriTemplate.format([host,tiddler.title]);
	return info;
};

SynchrotronAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
//#displayMessage('SynchrotronAdaptor.getTiddlerRev:' + context.modified);
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

SynchrotronAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#console.log('SynchrotronAdaptor.getTiddler:',context.title,'rev:',context.revision);
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;
	var t = store.getTiddler(title);
	var uuid = t.fields.uuid;
	var revision = parseInt(context.revision,10);

	context.status = false;
	context.statusText = SynchrotronAdaptor.errorInFunctionMessage.format(['getTiddler',title]);

	//if(context.revision) {
	//} else {
	//}
	entries = synchrotron.repo.fileRevisions(uuid);
	if(entries) {
		var body = synchrotron.repo.getBody(entries[revision],uuid);
//#console.log('body:',body);
//#console.log('li:'+i);
//#console.log(body.title);
//#console.log(body.text);
		if(body.title) {
			title = body.title;
			tiddler = new Tiddler(title);
			tiddler.modified = SynchrotronAdaptor.dateFromTimestamp(entries[revision].timestamp);
			tiddler.text = body.text.join('\n');
			tiddler.fields.uuid = uuid;
			context.tiddler = tiddler;
			context.status = true;
			context.statusText = "";
		}
	}
	if(context.callback)
		window.setTimeout(function() {callback(context,userParams);},0);
	return context.status;
};

SynchrotronAdaptor.prototype.close = function() {return true;};

config.adaptors[SynchrotronAdaptor.serverType] = SynchrotronAdaptor;
} //# end of 'install only once'
//}}}
