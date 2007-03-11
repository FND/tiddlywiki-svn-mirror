/***
|''Name:''|TWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from TWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#TWikiAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/TWikiAdaptorPlugin.js|
|''Version:''|0.5.1|
|''Date:''|Feb 25, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

TWiki REST documentation is at:
http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts

''For debug:''
|''Default TWiki Server''|<<option txttwikiDefaultServer>>|
|''Default TWiki Web(workspace)''|<<option txttwikiDefaultWorkspace>>|
|''Default TWiki username''|<<option txttwikiUsername>>|
|''Default TWiki password''|<<option txttwikiPassword>>|
***/

//{{{
if(!config.options.txttwikiDefaultServer)
	{config.options.txttwikiDefaultServer = 'twiki.org';}
if(!config.options.txttwikiDefaultWorkspace)
	{config.options.txttwikiDefaultWorkspace = 'Main';}
if(!config.options.txttwikiUsername)
	{config.options.txttwikiUsername = '';}
if(!config.options.txttwikiPassword)
	{config.options.txttwikiPassword = '';}
//}}}

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.TWikiAdaptorPlugin) {
version.extensions.TWikiAdaptorPlugin = {installed:true};

function TWikiAdaptor()
{
	this.host = null;
	this.workspace = null;
	// for debug
	this.username = config.options.txttwikiUsername;
	this.password = config.options.txttwikiPassword;
	return this;
}

TWikiAdaptor.serverType = 'twiki';
TWikiAdaptor.serverParsingErrorMessage = "Error parsing result from server";
TWikiAdaptor.errorInFunctionMessage = "Error in function TWikiAdaptor.%0";

TWikiAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

TWikiAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	return context;
};

TWikiAdaptor.fullHostName = function(host)
{
//#displayMessage("fullHostName:"+host);
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1) != '/')
		host = host + '/cgi-bin/';
	return host;
};

TWikiAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/cgi-bin\/$/,'').replace(/\/$/,'') : '';
};

TWikiAdaptor.normalizedTitle = function(title)
{
	return title;
};

TWikiAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#displayMessage("openHost:"+host);
	this.host = TWikiAdaptor.fullHostName(host);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

TWikiAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

TWikiAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
//#displayMessage("getWorkspaceList");
	if(!context) context = {};
	context.userParams = userParams;
	context.adaptor = this;
	if(callback) context.callback = callback;
	var list = [];
	list.push({title:"Main",name:"Main"});
	list.push({title:"Sandbox",name:"Sandbox"});
	context.workspaces = list;
	context.status = true;
	if(context && callback) {
		window.setTimeout(callback,0,context,userParams);
	}
	return true;
};

TWikiAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage("getWorkspaceListCallback");
	context.status = false;
	if(status) {
		try {
			eval('var info=' + responseText);
		} catch (ex) {
			context.statusText = exceptionText(ex,TWikiAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			list.push({title:info[i].title});
		}
		context.workspaces = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};


/*
TWikiAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#displayMessage('getTiddlerList');
	var uriTemplate = '';
	var uri = uriTemplate.format([this.host,this.workspace]);
//#displayMessage('uri:'+uri);
	var req = TWikiAdaptor.doHttpGET(uri,TWikiAdaptor.getTiddlerListCallback);
//#displayMessage('req:'+req);
	return typeof req == 'string' ? req : true;
};
*/

TWikiAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('getTiddlerListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	context.statusText = TWikiAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			list = [];
			context.tiddlers = list;
		} catch (ex) {
			context.statusText = exceptionText(ex,TWikiAdaptor.serverParsingErrorMessage);
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

TWikiAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var uriTemplate = '%0view/%1/%2';
	info.uri = uriTemplate.format([this.host,this.workspace,tiddler.title]);
	return info;
};

/*TWikiAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	return this.getTiddlerRevision(title,null,context,userParams,callback);
};*/

TWikiAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#displayMessage('TWikiAdaptor.getTiddler:'+title);
//# http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts
//# http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts?raw=text
//# http://twiki.org/cgi-bin/view/MyWeb/MyTopic?raw=text
//# http://twiki.org/cgi-bin/rest/EmptyPlugin/example?debugenableplugin=EmptyPlugin
//# http://my.host/bin/rest/<subject>/<verb>
//# where <subject> must be the WikiWord name of one of the installed TWikiPlugins,
//# and <verb> is the alias for the function registered using the registerRESTHandler.
//# http://twiki.org/cgi-bin/view/Sandbox/SandBox29?raw=text

	var uriTemplate = '%0view/%1/%2?raw=text';
	var uri = uriTemplate.format([this.host,this.workspace,title]);
//#displayMessage('uri:'+uri);

	context.tiddler = new Tiddler(title);
	context.tiddler.fields.wikiformat = 'twiki';
	context.tiddler.fields['server.host'] = TWikiAdaptor.minHostName(this.host);
	var req = TWikiAdaptor.doHttpGET(uri,TWikiAdaptor.getTiddlerCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

TWikiAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
displayMessage('getTiddlerCallback:'+status);
displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	if(status) {
		var content = responseText;
		//<form><textarea readonly="readonly" wrap="virtual" rows="50" cols="80">
		var contentRegExp = /<textarea.*?>((?:.|\n)*?)<\/textarea>/mg;
		contentRegExp.lastIndex = 0;
		var match = contentRegExp.exec(responseText);
		if(match) {
			content = match[1].htmlDecode();
		}
		context.tiddler.text = content;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

TWikiAdaptor.prototype.putTiddler = function(tiddler,context,callback)
{
	context = this.setContext(context,userParams,callback);
//#displayMessage('TWikiAdaptor.putTiddler:'+tiddler.title);
	var uriTemplate = '%0save/%1/%2?text=%3';
	var host = this.host ? this.host : TWikiApaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	var uri = uriTemplate.format([host,workspace,tiddler.title,tiddler.text]);
//#displayMessage('uri:'+uri);
	context.tiddler = tiddler;
	context.tiddler.fields.wikiformat = 'twiki';
	context.tiddler.fields['server.host'] = TWikiAdaptor.minHostName(this.host);
	var req = TWikiAdaptor.doHttpGET(uri,TWikiAdaptor.putTiddlerCallback,context,null,null,null,this.username,this.password);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

TWikiAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('putTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

TWikiAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[TWikiAdaptor.serverType] = TWikiAdaptor;
} //# end of 'install only once'
//}}}
