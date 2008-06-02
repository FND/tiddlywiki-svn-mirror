/***
|''Name:''|ExampleAdaptorPlugin|
|''Description:''|Example Adaptor which can be used as a basis for creating a new Adaptor|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#ExampleAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ExampleAdaptorPlugin.js|
|''Version:''|0.5.5|
|''Status:''|Not for release - this is a template for creating new adaptors|
|''Date:''|Mar 11, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

To make this example into a real TiddlyWiki adaptor, you need to:

# Globally search and replace ExampleAdpator with the name of your adaptor
# Delete any functionality not supported by you host (for example, putTiddler may not be supported)
# Do the actions indicated by the !!TODO comments, namely:
## Set the values of the main variables, eg ExampleAdaptor.serverType etc
## Fill in the uri templates in the .prototype functions
## Parse the responseText returned in the Callback functions and put the results in the appropriate variables

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ExampleAdaptorPlugin) {
version.extensions.ExampleAdaptorPlugin = {installed:true};

fnLog = function(text)
{
	if(window.console) console.log(text.substr(0,80)); else displayMessage(text.substr(0,80));
};

function ExampleAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

// !!TODO set the variables below
ExampleAdaptor.mimeType = 'text/x.';
ExampleAdaptor.serverType = 'example'; // MUST BE LOWER CASE
ExampleAdaptor.serverParsingErrorMessage = "Error parsing result from server";
ExampleAdaptor.errorInFunctionMessage = "Error in function ExampleAdaptor.%0";

ExampleAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = ExampleAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

ExampleAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

ExampleAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

ExampleAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	host = host.trim();
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(host.length-1) != '/')
		host = host + '/';
	return host;
};

ExampleAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
ExampleAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
ExampleAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

ExampleAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = ExampleAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

ExampleAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

ExampleAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host]);
	var req = ExampleAdaptor.doHttpGET(uri,ExampleAdaptor.getWorkspaceListCallback,context);
	return typeof req == 'string' ? req : true;
};

ExampleAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ExampleAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
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
			context.statusText = exceptionText(ex,ExampleAdaptor.serverParsingErrorMessage);
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

ExampleAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0%1';
	var uri = uriTemplate.format([context.host,context.workspace]);
	var req = ExampleAdaptor.doHttpGET(uri,ExampleAdaptor.getTiddlerListCallback,context);
	return typeof req == 'string' ? req : true;
};

ExampleAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ExampleAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var tiddler = new Tiddler('example');
			list.push(tiddler);
		} catch (ex) {
			context.statusText = exceptionText(ex,ExampleAdaptor.serverParsingErrorMessage);
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

ExampleAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : ExampleAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
// !!TODO set the uriTemplate
	uriTemplate = '%0%1%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

ExampleAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

ExampleAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
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
	uri = uriTemplate.format([context.host,context.workspace,ExampleAdaptor.normalizedTitle(title),context.revision]);

	context.tiddler = new Tiddler(title);
	context.tiddler.fields.wikiformat = 'exampleformat';
	context.tiddler.fields['server.type'] = ExampleAdaptor.serverType;
	context.tiddler.fields['server.host'] = ExampleAdaptor.minHostName(context.host);
	context.tiddler.fields['server.workspace'] = context.workspace;
	var req = ExampleAdaptor.doHttpGET(uri,ExampleAdaptor.getTiddlerCallback,context);
	return typeof req == 'string' ? req : true;
};

ExampleAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ExampleAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
// !!TODO: fill in tiddler fields as available
			//context.tiddler.tags = ;
			//context.tiddler.fields['server.page.id'] = ;
			//context.tiddler.fields['server.page.name'] = ;
			//context.tiddler.fields['server.page.revision'] = String(...);
			//context.tiddler.modifier = ;
			//context.tiddler.modified = ExampleAdaptor.dateFromEditTime(...);
		} catch (ex) {
			context.statusText = exceptionText(ex,ExampleAdaptor.serverParsingErrorMessage);
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

ExampleAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0%1%2';
	if(!limit)
		limit = 10;
	var uri = uriTemplate.format([context.host,context.workspace,ExampleAdaptor.normalizedTitle(title),limit]);
	var req = ExampleAdaptor.doHttpGET(uri,ExampleAdaptor.getTiddlerRevisionListCallback,context);
	return typeof req == 'string' ? req : true;
};

ExampleAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	if(status) {
		var content = null;
		try {
// !!TODO: parse the responseText here
			var list = [];
			var tiddler = new Tiddler('example');
// !!TODO: fill in tiddler fields as available
			//tiddler.modified = ExampleAdaptor.dateFromEditTime();
			//tiddler.modifier = ;
			//tiddler.tags = ;
			//tiddler.fields['server.page.id'] = ;
			//tiddler.fields['server.page.name'] = ;
			//tiddler.fields['server.page.revision'] = ;
			list.push(tiddler);
		} catch (ex) {
			context.statusText = exceptionText(ex,ExampleAdaptor.serverParsingErrorMessage);
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

ExampleAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
// !!TODO set the uriTemplate
	var uriTemplate = '%0%1%2';
	var host = context.host ? context.host : ExampleAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = context.workspace ? context.workspace : tiddler.fields['server.workspace'];
	var uri = uriTemplate.format([host,workspace,tiddler.title,tiddler.text]);
	var req = ExampleAdaptor.doHttpPOST(uri,ExampleAdaptor.putTiddlerCallback,context,{"X-Http-Method": "PUT"},tiddler.text,ExampleAdaptor.mimeType);
	return typeof req == 'string' ? req : true;
};

ExampleAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ExampleAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[ExampleAdaptor.serverType] = ExampleAdaptor;
} //# end of 'install only once'
//}}}
