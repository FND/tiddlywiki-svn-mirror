/***
|''Name:''|WikispacesSoapAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data from Wikispaces|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#WikispacesSoapAdaptorPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/WikispacesSoapAdaptorPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Feb 15, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3.0|

To make this example into a real TiddlyWiki adaptor, you need to:

# Do the actions indicated by the !!TODO comments, namely:
## Set the values of the main variables, eg WikispacesSoapAdaptor.serverType etc
## Fill in the uri templates in the .prototype functions
## Parse the responseText returned in the Callback functions and put the results in the appropriate variables

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.WikispacesSoapAdaptorPlugin) {
version.extensions.WikispacesSoapAdaptorPlugin = {installed:true};

function WikispacesSoapAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

// !!TODO set the variables below
WikispacesSoapAdaptor.mimeType = 'text/plain';
WikispacesSoapAdaptor.serverType = 'wikispaces'; // MUST BE LOWER CASE
WikispacesSoapAdaptor.serverParsingErrorMessage = "Error parsing result from server";
WikispacesSoapAdaptor.errorInFunctionMessage = "Error in function WikispacesSoapAdaptor.%0";
WikispacesSoapAdaptor.soapTemplate = '<?xml version=\"1.0\" encoding="utf-8"?>' +
	'<soap:Envelope ' +
	'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
	'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
	'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
	'<soap:Body>' +
	'<%0 xmlns="%1">%2</%0>' +
	'</soap:Body></soap:Envelope>';

WikispacesSoapAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = WikispacesSoapAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
//console.log('setContext:'+context.host);
	return context;
};

WikispacesSoapAdaptor.HttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

WikispacesSoapAdaptor.HttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

WikispacesSoapAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(host.length-1) != '/')
		host = host + '/';
	return host;
};

WikispacesSoapAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
WikispacesSoapAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'+').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
WikispacesSoapAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

/*WikispacesSoapAdaptor.prototype.login = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	//if(!context.host)
		context.host = 'http://wikispaces.com/';
console.log('login:'+context.host);
// http://www.wikispaces.com/site/api?wsdl
	var uriTemplate = '%0/site/api?wsdl';
	var uri = uriTemplate.format([context.host]);
	var uri = uriTemplate.format(['http://www.wikispaces.com/']);
	var fn = 'login';
	var ns = 'wikispaces';
	var fnParamsTemplate = '<p>%0</p><p>%1</p>';
	context.username = 'uu';
	context.password = 'pp';
	//var fnParams = fnParamsTemplate.format([context.username,context.password]);
	var fnParams = fnParamsTemplate.format(['uu','pp']);
	var payload = WikispacesSoapAdaptor.soapTemplate.format([fn,ns,fnParams]);
console.log('login POST:'+uri);
console.log('login payload:'+payload);
	var req = WikispacesSoapAdaptor.HttpPOST(uri,WikispacesSoapAdaptor.loginCallback,context,null,payload);
	return typeof req == 'string' ? req : true;
};*/

WikispacesSoapAdaptor.prototype.login = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(!context.host)
		context.host = 'http://wikispaces.com/';
console.log('login:'+context.host);
// http://www.wikispaces.com/site/api?wsdl
	var uriTemplate = '%0/site/api';
	var uri = uriTemplate.format(['http://tw-test.wikispaces.com']);
	var pl = new SOAPClientParameters();
	pl.add('username','');
	pl.add('password','');
console.log('uri:'+uri);
	SOAPClient.invoke(uri,'login',pl,true,WikispacesSoapAdaptor.loginCallback);
}

WikispacesSoapAdaptor.loginCallback = function(r,x)//status,context,responseText,url,xhr)
{
console.log('loginCallback');
console.log(r);
console.log(x);
/*	context.status = status;
	if(status) {
		context.sessionToken = '';
	} else {
		context.statusText = "Error reading file: " + xhr.statusText;
	}
	if(context.complete)
		context.complete(context,context.userParams);*/
};

WikispacesSoapAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = WikispacesSoapAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

WikispacesSoapAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

WikispacesSoapAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
console.log('getWorkspaceList');
	context = this.setContext(context,userParams,callback);
	var list = [];
	list.push({title:"tw-test",name:"tw-test"});
	context.workspaces = list;
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

WikispacesSoapAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
console.log('getWorkspaceListCallback');
console.log(responseText);
	context.status = false;
	context.statusText = WikispacesSoapAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
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
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
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

WikispacesSoapAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
console.log('getWorkspaceList');
	context = this.setContext(context,userParams,callback);
	context.complete = WikispacesSoapAdaptor.getTiddlerListComplete;
	if(context.sessionId) {
		var ret = context.complete(context,context.userParams);
	} else {
		ret = this.login(context,WikispacesSoapAdaptor.getTiddlerListCallback);
	}
	return ret;
};

WikispacesSoapAdaptor.getTiddlerListComplete = function(context,userParams)
{
console.log('getWorkspaceListComplete');
// http://www.wikispaces.com/page/api?wsdl
	var uriTemplate = '%0/page/api?wsdl';
	var uri = uriTemplate.format([context.host]);
	var fn = 'listPages';
	var ns = '';
	var fnParamsTemplate = '<p>%0</p><p>%1</p>';
	var fnParams = fnParamsTemplate.format([context.session,context.workspaceId]);
	var payload = WikispacesSoapAdaptor.soapTemplate.format([fn,ns,fnParams]);
	var req = WikispacesSoapAdaptor.HttpPOST(uri,WikispacesSoapAdaptor.getTiddlerListComplete,context,null,payload);
	return typeof req == 'string' ? req : true;
};

WikispacesSoapAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
console.log('getWorkspaceListCallback');
console.log(responseText);
	context.status = false;
	context.statusText = WikispacesSoapAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var tiddler = new Tiddler('example');
			list.push(tiddler);
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
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

WikispacesSoapAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : WikispacesSoapAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
// !!TODO set the uriTemplate
	uriTemplate = '%0%1%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

WikispacesSoapAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

WikispacesSoapAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// http://www.wikispaces.com/page/api?wsdl
	if(title)
		context.title = title;
	var fn = 'getPage';
	var fnParamsTemplate = '<p>%0</p><p>%1</p>';
	if(context.revision) {
		fnParamsTemplate += '<p>%2</p>';
		fn = 'getPageWithVersion';
	}
	var uriTemplate = '%0/page/api?wsdl';
	var uri = uriTemplate.format([context.host]);
	var ns = '';
	var fnParams = fnParamsTemplate.format([context.session,context.workspaceId,WikispacesSoapAdaptor.normalizedTitle(title),context.revision]);
	var payload = WikispacesSoapAdaptor.soapTemplate.format([fn,ns,fnParams]);

	context.tiddler = new Tiddler(title);
	context.tiddler.fields.wikiformat = 'exampleformat';
	context.tiddler.fields['server.type'] = WikispacesSoapAdaptor.serverType;
	context.tiddler.fields['server.host'] = WikispacesSoapAdaptor.minHostName(context.host);
	context.tiddler.fields['server.workspace'] = context.workspace;

	var req = WikispacesSoapAdaptor.HttpPOST(uri,WikispacesSoapAdaptor.getWorkspaceListCallback,context,null,payload);
	return typeof req == 'string' ? req : true;
};

WikispacesSoapAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
console.log(responseText);
	context.status = false;
	context.statusText = WikispacesSoapAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
// !!TODO: fill in tiddler fields as available
			context.tiddler.tags = '';
			//context.tiddler.fields['server.page.id'] = ;
			//context.tiddler.fields['server.page.name'] = ;
			//context.tiddler.fields['server.page.revision'] = String(...);
			//context.tiddler.modifier = ;
			//context.tiddler.modified = WikispacesSoapAdaptor.dateFromEditTime(...);
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
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

WikispacesSoapAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// http://www.wikispaces.com/page/api?wsdl
	if(title)
		context.title = title;
	var fn = 'listPageVersions';
	var fnParamsTemplate = '<p>%0</p><p>%1</p><p>%2</p>';
	var uriTemplate = '%0/page/api?wsdl';
	var uri = uriTemplate.format([context.host]);
	var ns = '';
	var fnParams = fnParamsTemplate.format([context.session,context.workspaceId,WikispacesSoapAdaptor.normalizedTitle(title)]);
	var payload = WikispacesSoapAdaptor.soapTemplate.format([fn,ns,fnParams]);

	var req = WikispacesSoapAdaptor.HttpPOST(uri,WikispacesSoapAdaptor.getWorkspaceListCallback,context,null,payload);
	return typeof req == 'string' ? req : true;
};

WikispacesSoapAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	if(status) {
		var content = null;
		try {
// !!TODO: parse the responseText here
			var list = [];
			var tiddler = new Tiddler('example');
// !!TODO: fill in tiddler fields as available
			//tiddler.modified = WikispacesSoapAdaptor.dateFromEditTime();
			//tiddler.modifier = ;
			//tiddler.tags = ;
			//tiddler.fields['server.page.id'] = ;
			//tiddler.fields['server.page.name'] = ;
			//tiddler.fields['server.page.revision'] = ;
			list.push(tiddler);
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
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

WikispacesSoapAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	// must use updatePage or createPage
	var fn = 'updatePage';
	var fnParamsTemplate = '<p>%0</p><p>%1</p><p>%2</p>';
	var uriTemplate = '%0/page/api?wsdl';
	var uri = uriTemplate.format([context.host]);
	var ns = '';
	var pageStruct = '';
	var fnParams = fnParamsTemplate.format([context.session,context.workspaceId,pageStruct]);
	var payload = WikispacesSoapAdaptor.soapTemplate.format([fn,ns,fnParams]);

	var req = WikispacesSoapAdaptor.HttpPOST(uri,WikispacesSoapAdaptor.getWorkspaceListCallback,context,null,payload);
	return typeof req == 'string' ? req : true;
};

WikispacesSoapAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
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

WikispacesSoapAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[WikispacesSoapAdaptor.serverType] = WikispacesSoapAdaptor;
} //# end of 'install only once'
//}}}
