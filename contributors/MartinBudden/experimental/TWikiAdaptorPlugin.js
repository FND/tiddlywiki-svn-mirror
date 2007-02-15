/***
|''Name:''|TWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from TWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#TWikiAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/TWikiAdaptorPlugin.js|
|''Version:''|0.3.5|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

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

// Ensure that the plugin is only installed once.
if(!version.extensions.TWikiAdaptorPlugin) {
version.extensions.TWikiAdaptorPlugin = {installed:true};

function doHttpGET(url,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',url,data,contentType,username,password,callback,params,headers);
}

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

TWikiAdaptor.normalizedTitle = function(title)
{
	return title;
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
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

TWikiAdaptor.prototype.openHost = function(host,context)
{
//#displayMessage("openHost:"+host);
	this.host = TWikiAdaptor.fullHostName(host);
//#displayMessage("host:"+host);
	if(context && context.callback)
		window.setTimeout(context.callback,0,true,this,context);
	return true;
};

TWikiAdaptor.prototype.getWorkspaceList = function(context)
{
//#displayMessage("getWorkspaceList");
	var urlTemplate = '%0data/workspaces';
	var host = this && this.host ? this.host : SocialtextAdaptor.fullHostName(context.host);
	var url = urlTemplate.format([host]);
	context.adaptor = this;
	var req = doHttpGET(url,TWikiAdaptor.getWorkspaceListCallback,context);
	return typeof req == 'string' ? req : true;
};

TWikiAdaptor.getWorkspaceListCallback = function(status,context,responseText,url,xhr)
{
//#displayMessage("getWorkspaceListCallback");
	if(!context)
		context = {};
	context.status = false;
	if(status) {
		try {
			eval('var info=' + responseText);
		} catch (ex) {
			context.statusText = exceptionText(ex,TWikiAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			list.push({title:info[i].title});
		}
		context.list = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context && context.callback)
		context.callback(context);
};

TWikiAdaptor.prototype.openWorkspace = function(workspace,context)
{
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(context && context.callback)
		window.setTimeout(context.callback,0,true,this,context);
	return true;
};

TWikiAdaptor.prototype.getTiddler = function(context)
{
	var tiddler = context.tiddler;
//#displayMessage('TWikiAdaptor.getTiddler:'+tiddler.title);
//# http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts
//# http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts?raw=text
//# http://twiki.org/cgi-bin/view/MyWeb/MyTopic?raw=text
//# http://twiki.org/cgi-bin/rest/EmptyPlugin/example?debugenableplugin=EmptyPlugin
//# http://my.host/bin/rest/<subject>/<verb>
//# where <subject> must be the WikiWord name of one of the installed TWikiPlugins,
//# and <verb> is the alias for the function registered using the registerRESTHandler.
//# http://twiki.org/cgi-bin/view/Sandbox/SandBox29?raw=text

	var urlTemplate = '%0view/%1/%2?raw=text';
	var host = this.host ? this.host : TWikiApaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	var url = urlTemplate.format([host,workspace,tiddler.title]);
//#displayMessage('getTwiki url: '+url);

	context.tiddler.fields.wikiformat = 'twiki';
	context.tiddler.fields['server.type'] = TWikiAdaptor.serverType;
	context.adaptor = this;
	var req = doHttpGET(url,TWikiAdaptor.getTiddlerCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

TWikiAdaptor.getTiddlerCallback = function(status,context,responseText,url,xhr)
{
//#displayMessage('TWiki.getTiddlerCallback');
//#displayMessage('status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
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
		context.callback(context);
};

TWikiAdaptor.prototype.putTiddler = function(context)
{
	var tiddler = context.tiddler;
//#displayMessage('TWikiAdaptor.putTiddler:'+tiddler.title);
	var urlTemplate = '%0save/%1/%2?text=%3';
	var host = this.host ? this.host : TWikiApaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	var url = urlTemplate.format([host,workspace,tiddler.title,tiddler.text]);
//#displayMessage('url:'+url);
	var req = doHttpGET(url,TWikiAdaptor.putTiddlerCallback,tiddler,null,null,null,this.username,this.password);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

TWikiAdaptor.putTiddlerCallback = function(status,context,responseText,url,xhr)
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
		context.callback(context);
};

TWikiAdaptor.prototype.close = function() {return true;};

config.adaptors[TWikiAdaptor.serverType] = TWikiAdaptor;
} //# end of 'install only once'
//}}}
