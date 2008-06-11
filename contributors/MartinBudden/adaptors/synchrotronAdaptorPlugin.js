/***
|''Name:''|synchrotronAdaptorPlugin|
|''Description:''|Adaptor for working with synchrotron diff tool|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/synchrotronAdaptorPlugin.js |
|''Version:''|0.0.2|
|''Date:''|Jun 11, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.4.0|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.synchrotronAdaptorPlugin) {
version.extensions.synchrotronAdaptorPlugin = {installed:true};

function synchrotronAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

synchrotronAdaptor.serverType = 'synchrotron';
synchrotronAdaptor.errorInFunctionMessage = 'Error in function synchrotronAdaptor.%0: %1';
synchrotronAdaptor.revisionSavedMessage = 'Revision %0 saved';
synchrotronAdaptor.baseRevision = 1000;
synchrotronAdaptor.contentDirectory = 'content';
synchrotronAdaptor.revisionsDirectory = '_revisions';

synchrotronAdaptor.fromFileFormat = function(s)
{
	//# convert into unicode from file (which is in UTF8)
	return decodeURIComponent(escape(s));
};

synchrotronAdaptor.prototype.setContext = function(context,userParams,callback)
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
synchrotronAdaptor.normalizedTitle = function(title)
{
	var id = title;
	id = id.replace(/ /g,'_').replace(/%/g,'%25').replace(/\t/g,'%09').replace(/#/g,'%23').replace(/\*/g,'%2a').replace(/,/g,'%2c').replace(/\//,'%2f').replace(/:/g,'%3a').replace(/</g,'%3c').replace(/>/g,'%3e').replace(/\?/g,'%3f');
	if(id.charAt(0)=='_')
		id = id.substr(1);
	return String(id);
};

synchrotronAdaptor.dateFromTimestamp = function(timestamp)
{
console.log(timestamp);
	var dt = new Date();
//	dt = dt.setTime(timestamp);
	return dt;
};

synchrotronAdaptor.getPath = function(localPath,folder)
{
	var slash = '\\';
	var dirPathPos = localPath.lastIndexOf('\\');
	if(dirPathPos == -1) {
		dirPathPos = localPath.lastIndexOf('/');
		slash = '/';
	}
	if(!folder || folder == '')
		folder = '.';
	var path = folder + slash;
	if(folder.charAt(0)!=slash)
		path = localPath.substr(0,dirPathPos) + slash + path;
	return path;
};

synchrotronAdaptor.contentPath = function()
{
//#displayMessage('contentPath:'+document.location.toString());
	var file = getLocalPath(document.location.toString());
	return synchrotronAdaptor.getPath(file,synchrotronAdaptor.contentDirectory);
};

synchrotronAdaptor.revisionPath = function()
{
//#displayMessage('revisionPath');
	var file = getLocalPath(document.location.toString());
	var slash = file.lastIndexOf('\\') == -1 ? '/' : '\\';
	return synchrotronAdaptor.getPath(file,synchrotronAdaptor.contentDirectory + slash + synchrotronAdaptor.revisionsDirectory);
};

synchrotronAdaptor.fullHostName = function(host)
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

synchrotronAdaptor.minHostName = function(host)
{
	return host ? host.replace(/\\/,'/').host.replace(/^http:\/\//,'').replace(/\/$/,'') : ''; //'
};

synchrotronAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
//#displayMessage('openHost:'+host);
	this.host = synchrotronAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
//#displayMessage('host:'+this.host);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

synchrotronAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
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

synchrotronAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
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

synchrotronAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
console.log('synchrotronAdaptor.getTiddlerList');
	context = this.setContext(context,userParams,callback);
	var path = synchrotronAdaptor.contentPath();
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
		context.statusText = synchrotronAdaptor.errorInFunctionMessage.format(['getTiddlerList']);
	}
	if(context.callback)
		window.setTimeout(function() {callback(context,userParams);},0);
	return context;
};

synchrotronAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
// get a list of the revisions for a tiddler
{
console.log('synchrotronAdaptor.getTiddlerRevisionList');
	context = this.setContext(context,userParams,callback);
	var tiddler = store.getTiddler(title);
console.log(tiddler);
console.log('uuid:'+tiddler.fields.uuid);
	context.revisions = [];
	context.status = true;
	var entries = null;
	if(tiddler.fields.uuid)
		entries = synchrotron.repo.fileRevisions(tiddler.fields.uuid);
	if(entries) {
console.log('ec:'+entries.length);
		var list = [];
		for(var i=0; i<entries.length; i++) {
console.log('e:',entries[i]);
console.log('b:',entries[i].alive[tiddler.fields.uuid]);
			var body = synchrotron.repo.getBody(entries[i],tiddler.fields.uuid);
			if(!body.title)
				break;
console.log('li:'+i);
console.log(body.title);
console.log(body.text);
			title = body.title;
			tiddler = new Tiddler(title+i);
			tiddler.modified = synchrotronAdaptor.dateFromTimestamp(entries[i].timestamp);
			tiddler.text = body.text.join('\n');
			tiddler.fields['server.page.revision'] = i;
			list.push(tiddler);
		}
		context.revisions = list;
	} else {
		context.status = false;
		context.statusText = synchrotronAdaptor.errorInFunctionMessage.format(['getTiddlerList']);
	}
	if(context.callback) {
		//# direct callback doesn't work, not sure why
		//#context.callback(context,context.userParams);
		window.setTimeout(function() {callback(context,userParams);},0);
	}
};

synchrotronAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var uriTemplate = '%0#%1';
	var host = synchrotronAdaptor.fullHostName(this.host);
	info.uri = uriTemplate.format([host,tiddler.title]);
	return info;
};

synchrotronAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
//#displayMessage('synchrotronAdaptor.getTiddlerRev:' + context.modified);
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

synchrotronAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#displayMessage('synchrotronAdaptor.getTiddler:' + context.title);
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;

	//if(context.revision) {
	//} else {
	//}

	context.tiddler = new Tiddler(title);
	context.status = false;
	context.statusText = synchrotronAdaptor.errorInFunctionMessage.format(['getTiddler',title]);
	if(context.callback)
		window.setTimeout(function() {callback(context,userParams);},0);
	return context.status;
};

synchrotronAdaptor.prototype.close = function() {return true;};

config.adaptors[synchrotronAdaptor.serverType] = synchrotronAdaptor;
} //# end of 'install only once'
//}}}

/*
{
revisions:{
'f46827b5-c688-4548-860e-60c0d72cee85':{alive:{'04c07d45-a4fe-40a2-a584-c3b08bc6c2a4':"35db24a7-9db1-45d7-8df0-9139690429cc"}, dead:{}, changed:["04c07d45-a4fe-40a2-a584-c3b08bc6c2a4"], branch:null, timestamp:1213217922437, metadata:undefined, directParent:null, additionalParent:null}, 
'6dba819e-468c-43a3-8e11-246e5d5294b7':{alive:{'04c07d45-a4fe-40a2-a584-c3b08bc6c2a4':"48c06228-8f1f-4469-8b2d-47bf8239bae9"}, dead:{}, changed:["04c07d45-a4fe-40a2-a584-c3b08bc6c2a4"], branch:null, timestamp:1213217935140, metadata:undefined, directParent:"f46827b5-c688-4548-860e-60c0d72cee85", additionalParent:null}
},
	bodies:{
		'35db24a7-9db1-45d7-8df0-9139690429cc':{title:"New Tiddler", text:["aaa"]}, 
		'48c06228-8f1f-4469-8b2d-47bf8239bae9':{title:"New Tiddler", text:["aaa", "bbb"]
	}
}
}
*/
