/***
|''Name:''|ConfabbAgendaAdaptorPlugin|
|''Description:''|ConfabbAgenda Adaptor - import Confabb.com XML as RippleRap Agenda tiddlers|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/adaptors/ConfabbAgendaAdaptorPlugin|
|''Tests:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/tests/ConfabbAgendaAdaptorPlugin.jsspec.js|
|''Version:''|0.0.1|
|''Date:''|May 8, 2008|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.2.0|

# Do the actions indicated by the !!TODO comments, namely:
## Set the values of the main variables, eg ConfabbAgendaAdaptor.serverType etc
## Fill in the uri templates in the .prototype functions
## Parse the responseText returned in the Callback functions and put the results in the appropriate variables

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ConfabbAgendaAdaptorPlugin) {
version.extensions.ConfabbAgendaAdaptorPlugin = {installed:true};

function ConfabbAgendaAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

ConfabbAgendaAdaptor.serverType = 'confabb';
ConfabbAgendaAdaptor.serverParsingErrorMessage = "Error parsing result from server";
ConfabbAgendaAdaptor.errorInFunctionMessage = "Error in function ConfabbAgendaAdaptor.%0";

ConfabbAgendaAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = ConfabbAgendaAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

ConfabbAgendaAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

ConfabbAgendaAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

ConfabbAgendaAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(host.length-1) != '/')
		host = host + '/';
	return host;
};

ConfabbAgendaAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
ConfabbAgendaAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
ConfabbAgendaAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

ConfabbAgendaAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = ConfabbAgendaAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

ConfabbAgendaAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

ConfabbAgendaAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host]);
	var req = ConfabbAgendaAdaptor.doHttpGET(uri,ConfabbAgendaAdaptor.getWorkspaceListCallback,context);
	return typeof req == 'string' ? req : true;
};

ConfabbAgendaAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ConfabbAgendaAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var item = {
				title:'exampleTitle',
				name:'exampleName'
				};
			list.push(item);
		} catch (ex) {
			context.statusText = exceptionText(ex,ConfabbAgendaAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.workspaces = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ConfabbAgendaAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0%1';
	var uri = uriTemplate.format([context.host,context.workspace]);
	var req = ConfabbAgendaAdaptor.doHttpGET(uri,ConfabbAgendaAdaptor.getTiddlerListCallback,context);
	return typeof req == 'string' ? req : true;
};

ConfabbAgendaAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ConfabbAgendaAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var tiddler = new Tiddler('example');
			list.push(tiddler);
		} catch (ex) {
			context.statusText = exceptionText(ex,ConfabbAgendaAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.tiddlers = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ConfabbAgendaAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : ConfabbAgendaAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
// !!TODO set the uriTemplate
	uriTemplate = '%0%1%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

ConfabbAgendaAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

ConfabbAgendaAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;
	if(context.revision) {
// !!TODO set the uriTemplate
		var uriTemplate = '%0%1%2%3';
	} else {
// !!TODO set the uriTemplate
		uriTemplate = '%0%1%2';
	}
	uri = uriTemplate.format([context.host,context.workspace,ConfabbAgendaAdaptor.normalizedTitle(title),context.revision]);

	context.tiddler = new Tiddler(title);
	context.tiddler.fields.wikiformat = 'exampleformat';
	context.tiddler.fields['server.type'] = ConfabbAgendaAdaptor.serverType;
	context.tiddler.fields['server.host'] = ConfabbAgendaAdaptor.minHostName(context.host);
	context.tiddler.fields['server.workspace'] = context.workspace;
	var req = ConfabbAgendaAdaptor.doHttpGET(uri,ConfabbAgendaAdaptor.getTiddlerCallback,context);
	return typeof req == 'string' ? req : true;
};

ConfabbAgendaAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ConfabbAgendaAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
// !!TODO: fill in tiddler fields as available
			//context.tiddler.tags = ;
			//context.tiddler.fields['server.page.id'] = ;
			//context.tiddler.fields['server.page.name'] = ;
			//context.tiddler.fields['server.page.revision'] = String(...);
			//context.tiddler.modifier = ;
			//context.tiddler.modified = ConfabbAgendaAdaptor.dateFromEditTime(...);
		} catch (ex) {
			context.statusText = exceptionText(ex,ConfabbAgendaAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
		if(context.callback)
			context.callback(context,context.userParams);
		return;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ConfabbAgendaAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0%1%2';
	if(!limit)
		limit = 10;
	var uri = uriTemplate.format([context.host,context.workspace,ConfabbAgendaAdaptor.normalizedTitle(title),limit]);
	var req = ConfabbAgendaAdaptor.doHttpGET(uri,ConfabbAgendaAdaptor.getTiddlerRevisionListCallback,context);
	return typeof req == 'string' ? req : true;
};

ConfabbAgendaAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	if(status) {
		var content = null;
		try {
// !!TODO: parse the responseText here
			var list = [];
			var tiddler = new Tiddler('example');
// !!TODO: fill in tiddler fields as available
			//tiddler.modified = ConfabbAgendaAdaptor.dateFromEditTime();
			//tiddler.modifier = ;
			//tiddler.tags = ;
			//tiddler.fields['server.page.id'] = ;
			//tiddler.fields['server.page.name'] = ;
			//tiddler.fields['server.page.revision'] = ;
			list.push(tiddler);
		} catch (ex) {
			context.statusText = exceptionText(ex,ConfabbAgendaAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		var sortField = 'server.page.revision';
		list.sort(function(a,b) {return a.fields[sortField] < b.fields[sortField] ? +1 : (a.fields[sortField] == b.fields[sortField] ? 0 : -1);});
		context.revisions = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ConfabbAgendaAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[ConfabbAgendaAdaptor.serverType] = ConfabbAgendaAdaptor;
} //# end of 'install only once'
//}}}
