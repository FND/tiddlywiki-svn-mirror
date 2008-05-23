/***
|''Name:''|ConfabbNotesAdaptorPlugin|
|''Description:''|Example Adaptor which can be used as a basis for creating a new Adaptor|
|''Author:''|Phil Hawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/adaptors/ConfabbNotesAdaptorPlugin.js|
|''Version:''|0.0.1|
|''Date:''|May 21, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.4.0|

To make this example into a real TiddlyWiki adaptor, you need to:

# Do the actions indicated by the !!TODO comments, namely:
## Set the values of the main variables, eg ConfabbNotesAdaptor.serverType etc
## Fill in the uri templates in the .prototype functions
## Parse the responseText returned in the Callback functions and put the results in the appropriate variables

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ConfabbNotesAdaptorPlugin) {
version.extensions.ConfabbNotesAdaptorPlugin = {installed:true};

fnLog = function(text)
{
	if(window.console) console.log(text.substr(0,80)); else displayMessage(text.substr(0,80));
};

function ConfabbNotesAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

ConfabbNotesAdaptor.mimeType = 'text/x.';
ConfabbNotesAdaptor.serverType = 'confabbnotes'; // MUST BE LOWER CASE
ConfabbNotesAdaptor.serverParsingErrorMessage = "Error parsing result from server";
ConfabbNotesAdaptor.errorInFunctionMessage = "Error in function ConfabbNotesAdaptor.%0";

ConfabbNotesAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = ConfabbNotesAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

ConfabbNotesAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

ConfabbNotesAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

ConfabbNotesAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(host.length-1) != '/')
		host = host + '/';
	return host;
};

ConfabbNotesAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
ConfabbNotesAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

ConfabbNotesAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = ConfabbNotesAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

ConfabbNotesAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

ConfabbNotesAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host]);
	var req = ConfabbNotesAdaptor.doHttpGET(uri,ConfabbNotesAdaptor.getWorkspaceListCallback,context);
	return typeof req == 'string' ? req : true;
};

ConfabbNotesAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ConfabbNotesAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var item = {
				title:'exampleTitle',
				name:'exampleName'
				};
			list.push(item);
		} catch(ex) {
			context.statusText = exceptionText(ex,ConfabbNotesAdaptor.serverParsingErrorMessage);
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

ConfabbNotesAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0%1';
	var uri = uriTemplate.format([context.host,context.workspace]);
	var req = ConfabbNotesAdaptor.doHttpGET(uri,ConfabbNotesAdaptor.getTiddlerListCallback,context);
	return typeof req == 'string' ? req : true;
};

ConfabbNotesAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ConfabbNotesAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var tiddler = new Tiddler('example');
			list.push(tiddler);
		} catch(ex) {
			context.statusText = exceptionText(ex,ConfabbNotesAdaptor.serverParsingErrorMessage);
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

ConfabbNotesAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : ConfabbNotesAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
// !!TODO set the uriTemplate
	uriTemplate = '%0%1%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

ConfabbNotesAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;
// !!TODO set the uriTemplate
	uriTemplate = '%0%1%2';
	uri = uriTemplate.format([context.host,context.workspace,ConfabbNotesAdaptor.normalizedTitle(title),context.revision]);

	context.tiddler = new Tiddler(title);
	context.tiddler.fields.wikiformat = 'exampleformat';
	context.tiddler.fields['server.type'] = ConfabbNotesAdaptor.serverType;
	context.tiddler.fields['server.host'] = ConfabbNotesAdaptor.minHostName(context.host);
	context.tiddler.fields['server.workspace'] = context.workspace;
	var req = ConfabbNotesAdaptor.doHttpGET(uri,ConfabbNotesAdaptor.getTiddlerCallback,context);
	return typeof req == 'string' ? req : true;
};

ConfabbNotesAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ConfabbNotesAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
// !!TODO: fill in tiddler fields as available
			//context.tiddler.tags = ;
			//context.tiddler.fields['server.page.id'] = ;
			//context.tiddler.fields['server.page.name'] = ;
			//context.tiddler.fields['server.page.revision'] = String(...);
			//context.tiddler.modifier = ;
			//context.tiddler.modified = ConfabbNotesAdaptor.dateFromEditTime(...);
		} catch(ex) {
			context.statusText = exceptionText(ex,ConfabbNotesAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ConfabbNotesAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
// !!TODO set the uriTemplate
	var uriTemplate = '%0%1%2';
	var host = context.host ? context.host : ConfabbNotesAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = context.workspace ? context.workspace : tiddler.fields['server.workspace'];
	var uri = uriTemplate.format([host,workspace,tiddler.title,tiddler.text]);
	var req = ExampleAdaptor.doHttpPOST(uri,ConfabbNotesAdaptor.putTiddlerCallback,context,{"X-Http-Method": "PUT"},tiddler.text,ExampleAdaptor.mimeType);
	return typeof req == 'string' ? req : true;
};

ConfabbNotesAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
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

ConfabbNotesAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[ConfabbNotesAdaptor.serverType] = ConfabbNotesAdaptor;
} //# end of 'install only once'
//}}}
