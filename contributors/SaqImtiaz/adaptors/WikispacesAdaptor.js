/***
|''Name:''|WikispacesAdaptorPlugin|
|''Description:''|Adaptor for Wikispaces.com|
|''Author:''| Saq Imtiaz|
|''Version:''|0.2.1|
|''Status:''|Not for release - in development|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2.0|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.WikispacesAdaptorPlugin) {
version.extensions.WikispacesAdaptorPlugin = {installed:true};

function WikispacesAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

WikispacesAdaptor.serverType = 'wikispaces';
WikispacesAdaptor.serverParsingErrorMessage = "Error parsing result from server";
WikispacesAdaptor.errorInFunctionMessage = "Error in function WikispacesAdaptor.%0";
WikispacesAdaptor.mimeType = 'text/plain';

WikispacesAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = WikispacesAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

WikispacesAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

WikispacesAdaptor.doHttpPROPFIND = function(uri,callback,params,headers,data,username,password)
{
	data = '<?xml version="1.0" encoding="utf-8" ?>' +
		'<D:propfind xmlns:D="DAV:">' +
		'<D:allprop/>' +
		'</D:propfind>';

	headers = {'Depth':'1'};
	return doHttp('PROPFIND',uri,data,'text/xml',null,null,callback,params,headers);
};

WikispacesAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

WikispacesAdaptor.doHttpPUT = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('PUT',uri,data,contentType,username,password,callback,params,headers);
};

WikispacesAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if((host.substr(host.length-1)) !='/')
		host = host + '/';
	return host;
};

WikispacesAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
WikispacesAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'+').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
WikispacesAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

WikispacesAdaptor.prototype.openHost = function(host,context,userParams,callback)
{

	this.host = WikispacesAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function(){context.callback(context,userParams);},0);
	}
	return true;
};

WikispacesAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function(){context.callback(context,userParams);},0);
	}
	return true;
};

WikispacesAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	var list = [];
	list.push({title:"Main",name:"Main"});
	context.workspaces = list;
	if(context.callback) {
		context.status = true;
		window.setTimeout(function(){context.callback(context,userParams);},0);
	}
	return true;
};

WikispacesAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0space/dav/pages';
	var uri = uriTemplate.format([context.host,context.workspace]);
	var req = WikispacesAdaptor.doHttpPROPFIND(uri,WikispacesAdaptor.getTiddlerListCallback,context);
	return typeof req == 'string' ? req : true;
};


WikispacesAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = WikispacesAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			var list = [];
			var responseExp = /<(\w*?):response.*?>((?:.|\n|\r\n)*?)<\/\1:response>/mg;
			var responses =[];
			var response;
			while (response = responseExp.exec(responseText)){
				responses.push(response[2]);
			}
			function parseProp(prop,subject){
				var exp = new RegExp("<(\\w*?):"+prop+".*?>(.*?)<\\/\\1:"+prop+">");
				return exp.exec(subject)[2];
			}
			for(var k=0; k<responses.length; k++) {
				if(parseProp('getcontenttype',responses[k])=='httpd/unix-directory')
					continue;
				var href = parseProp('href',responses[k]);
				var title = href.substr(href.lastIndexOf("/")+1).replace(/\+/g, " ");
				if(title.match(/^\._.*/))
					continue;
				var tiddler = new Tiddler(title);
				tiddler.created = Date.fromISOString(parseProp('creationdate',responses[k]));
				tiddler.modified = new Date(parseProp('getlastmodified',responses[k]));
				tiddler.modifier = parseProp('author',responses[k]);
				tiddler.fields['server.page.revision'] = tiddler.modified.convertToYYYYMMDDHHMM();
				list.push(tiddler);
			}
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesAdaptor.serverParsingErrorMessage);
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

WikispacesAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : WikispacesAdaptor.fullHostName(tiddler.fields['server.host']);
	var uriTemplate = '%0%1';
	info.uri = uriTemplate.format([host,tiddler.title.replace(/ /g, "+")]);
	return info;
};

WikispacesAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;

	uriTemplate = '%0space/dav/pages/%1';
	uri = uriTemplate.format([context.host,WikispacesAdaptor.normalizedTitle(context.title)]);
	context.tiddler = new Tiddler(context.title);
	context.tiddler.fields.wikiformat = 'wikispaces';
	context.tiddler.fields['server.type'] = WikispacesAdaptor.serverType;
	context.tiddler.fields['server.host'] = WikispacesAdaptor.minHostName(context.host);
	context.tiddler.fields['server.workspace'] = context.workspace;

	var req = WikispacesAdaptor.doHttpGET(uri,WikispacesAdaptor.getTiddlerCallback,context);
	return typeof req == 'string' ? req : true;
};

WikispacesAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = WikispacesAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		try {
			context.tiddler.text = responseText;
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesAdaptor.serverParsingErrorMessage);
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

	uriTemplate = '%0space/dav/pages/%1';

	uri = uriTemplate.format([context.host,WikispacesAdaptor.normalizedTitle(context.tiddler.title)]);
	var req = WikispacesAdaptor.doHttpPROPFIND(uri,WikispacesAdaptor.getTiddlerCallback2,context);
};

WikispacesAdaptor.getTiddlerCallback2 = function(status,context,responseText,uri,xhr)
{
	if(status) {
		context.status = true;
		try {
			function parseProp(prop,subject) {
				var exp = new RegExp("<(\\w*?):"+prop+".*?>(.*?)<\\/\\1:"+prop+">");
				return exp.exec(subject)[2];
			}
			context.tiddler.created = Date.fromISOString(parseProp('creationdate',responseText));
			context.tiddler.modified = new Date(parseProp('getlastmodified',responseText));
			context.tiddler.modifier = parseProp('author',responseText);
			context.tiddler.fields['server.page.revision'] = context.tiddler.modified.convertToYYYYMMDDHHMM();
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	context.tiddler = tiddler;
	var uriTemplate = '%0space/dav/pages/%1';
	var host = context.host || WikispacesAdaptor.fullHostName(tiddler.fields['server.host']);
	var uri = uriTemplate.format([host,tiddler.title]);
	var req = WikispacesAdaptor.doHttpPUT(uri,WikispacesAdaptor.putTiddlerCallback,context,{"X-Http-Method": "PUT"},tiddler.text,WikispacesAdaptor.mimeType);
	return typeof req == 'string' ? req : true;
};

WikispacesAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
		if(context.callback)
			context.callback(context,context.userParams);
	}
	WikispacesAdaptor.doHttpPROPFIND(uri,WikispacesAdaptor.putTiddlerCallback2,context);
};

WikispacesAdaptor.putTiddlerCallback2 = function(status,context,responseText,uri,xhr)
{
	if(status) {
		context.status = true;
		try {
			var revision = responseText.match(/<(\w*?):getlastmodified.*?>(.*?)<\/\1:getlastmodified>/)[2];
			context.tiddler.fields['server.page.revision'] = revision;
		}
		catch(ex) {
			context.statusText = exceptionText(ex,WikispacesAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
	}
	else{
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[WikispacesAdaptor.serverType] = WikispacesAdaptor;
} //# end of 'install only once'

Date.fromISOString = function(str){
	var o = str.replace(/\D/g," ").split(" ");
	return new Date(o[0], (o[1]-1), o[2], o[3], o[4], o[5]);
};
//}}}
