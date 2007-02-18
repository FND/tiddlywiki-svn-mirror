/***
|''Name:''|JSPWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from JSP Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#JSPWikiAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/JSPWikiAdaptorPlugin.js|
|''Version:''|0.4.1|
|''Date:''|Feb 18, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

''For debug:''
|''Default JSPWiki Server''|<<option txtJSPWikiDefaultServer>>|
|''Default JSPWiki Web(workspace)''|<<option txtJSPWikiDefaultWorkspace>>|
|''Default JSPWiki username''|<<option txtJSPWikiUsername>>|
|''Default JSPWiki password''|<<option txtJSPWikiPassword>>|
***/

//{{{
if(!config.options.txtJSPWikiDefaultServer)
	{config.options.txtJSPWikiDefaultServer = 'www.jspwiki.org';}
if(!config.options.txtJSPWikiDefaultWorkspace)
	{config.options.txtJSPWikiDefaultWorkspace = '';}
if(!config.options.txtJSPWikiUsername)
	{config.options.txtJSPWikiUsername = '';}
if(!config.options.txtJSPWikiPassword)
	{config.options.txtJSPWikiPassword = '';}
if(!config.options.chkJSPWikiPasswordRequired)
	{config.options.chkJSPWikiPasswordRequired = true;}
//}}}

// Ensure that the plugin is only installed once.
if(!version.extensions.JSPWikiAdaptorPlugin) {
version.extensions.JSPWikiAdaptorPlugin = {installed:true};

function doHttpGET(url,callback,context,headers,data,contentType,username,password)
{
	return doHttp('GET',url,data,contentType,username,password,callback,context,headers);
}

function JSPWikiAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

JSPWikiAdaptor.serverType = 'jspwiki';
JSPWikiAdaptor.serverParsingErrorMessage = "Error parsing result from server";
JSPWikiAdaptor.errorInFunctionMessage = "Error in function JSPWikiAdaptor.%0";

JSPWikiAdaptor.fullHostName = function(host)
{
//#displayMessage("fullHostName:"+host);
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	return host;
};

JSPWikiAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

JSPWikiAdaptor.prototype.openHost = function(host,callback,callbackcontext)
{
//#displayMessage("openHost:"+host);
	this.host = JSPWikiAdaptor.fullHostName(host);
//#displayMessage("host:"+host);
	this.username = config.options.txttwikiUsername;
	this.password = config.options.txttwikiPassword;
	if(context && callback) {
		context.status = true;
		window.setTimeout(callback,0,true,this,context);
	}
	return true;
};

JSPWikiAdaptor.prototype.getWorkspaceList = function(context)
{
//#displayMessage("getWorkspaceList");
	var urlTemplate = '%0data/workspaces';
	var host = this && this.host ? this.host : JSPWikiAdaptor.fullHostName(context.host);
	var url = urlTemplate.format([host]);
//#displayMessage('url:'+url);
	context.adaptor = this;
	var req = doHttpGET(url,JSPWikiAdaptor.getWorkspaceListCallback,context);
	return typeof req == 'string' ? req : true;
};

JSPWikiAdaptor.getWorkspaceListCallback = function(status,context,responseText,url,xhr)
{
//#displayMessage("getWorkspaceListCallback");
	context.status = false;
	context.statusText = JSPWikiAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
	if(status) {
		try {
			eval('var info=' + responseText);
		} catch (ex) {
			context.statusText = exceptionText(ex,JSPWikiAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			var item = {
				title:info[i].name
				//name:info[i].name,
				//modified:JSPWikiAdaptor.dateFromEditTime(info[i].modified_time)
				};
			list.push(item);
		}
		context.workspaces = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context && context.callback)
		context.callback(context);
};

JSPWikiAdaptor.prototype.openWorkspace = function(workspace,context,callback)
{
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(context && context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,true,this,context);
	}
	return true;
};

JSPWikiAdaptor.prototype.getTiddlerList = function(context)
{
//#displayMessage('getTiddlerList');
	var urlTemplate = '';
	var host = this && this.host ? this.host : JSPWikiAdaptor.fullHostName(context.host);
	var workspace = this && this.workspace ? this.workspace : context.workspace;
	var url = urlTemplate.format([host,workspace]);
//#displayMessage('url:'+url);
	context.adaptor = this;
	if(callback) context.callback = callback;
	var req = doHttpGET(url,JSPWikiAdaptor.getTiddlerListCallback,context);
//#displayMessage('req:'+req);
	return typeof req == 'string' ? req : true;
};

JSPWikiAdaptor.getTiddlerListCallback = function(status,context,responseText,url,xhr)
{
//#displayMessage('getTiddlerListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	context.statusText = JSPWikiAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
		} catch (ex) {
			context.statusText = exceptionText(ex,config.messages.serverParsingError);
			if(context.callback)
				context.callback(context);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			var tiddler = new Tiddler(info[i].name);
			/*tiddler.modified = '';
			tiddler.modifier = '';
			tiddler.tags = '';
			tiddler.fields['server.page.id'] = '';
			tiddler.fields['server.page.name'] = '';*/
			list.push(tiddler);
		}
		context.tiddlers = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context);
};

JSPWikiAdaptor.prototype.getTiddlerUrl = function(tiddler)
{
	urlTemplate = '';
	var host = this && this.host ? this.host : JSPWikiAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	return urlTemplate.format([host,workspace,tiddler.title]);
};

JSPWikiAdaptor.prototype.getTiddler = function(tiddler,context,callback)
{
//#displayMessage('JSPWikiAdaptor.getTiddler:'+tiddler.title);
//# http://JSPWiki.org/wiki/WikiRPCInterface
//# http://www.JSPWiki.org/RPCU/

	//#var fn = 'wiki.getRPCVersionSupported';
	//#var fn = 'wiki.getAllTiddlers';
	var fn = 'wiki.getPage';
	var urlTemplate = '%0RPCU/';
	var host = this && this.host ? this.host : JSPWikiAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	var url = urlTemplate.format([host,workspace,tiddler.title]);
//#displayMessage('url: '+url);

	var fncontextTemplate ='<context><param><value><string>%0</string></value></param></context>';
	var fncontext = fncontextTemplate.format([tiddler.title]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fncontext]);
//#displayMessage("payload:"+payload);

	context.tiddler = tiddler;
	context.tiddler.fields.wikiformat = 'jspwiki';
	context.tiddler.fields['server.host'] = JSPWikiAdaptor.minHostName(host);
	//context.tiddler.fields['server.workspace'] = workspace;
	context.adaptor = this;
	if(callback) context.callback = callback;
	var req =doHttp('POST',url,payload,null,null,null,JSPWikiAdaptor.getTiddlerCallback,tiddler);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

JSPWikiAdaptor.getTiddlerCallback = function(status,tiddler,responseText,url,xhr)
{
//#displayMessage('JSP.getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	if(status) {
		var text = responseText;
		text = text.replace('<?xml version="1.0" encoding="UTF-8"?><methodResponse><context><param><value>','');
		text = text.replace('</value></param></context></methodResponse>','');
		context.tiddler.text = text;
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context);
};

JSPWikiAdaptor.prototype.putTiddler = function(tiddler,context,callback)
{
//#displayMessage('JSPWikiAdaptor.putTiddler:'+tiddler.title);
//# http://www.JSPWiki.org/wiki/WikiRPCInterface2
//# http://www.JSPWiki.org/RPC2/

//#putPage(utf8 page,utf8 content,struct attributes )
	var fn = 'wiki.putPage';
	var urlTemplate = '%0RPC2/';
	var host = this && this.host ? this.host : JSPWikiAdaptor.fullHostName(context.tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : context.tiddler.fields['server.workspace'];
	var url = urlTemplate.format([host,workspace,tiddler.title]);
//#displayMessage('url: '+url);

	var fncontextTemplate ='<context>';
	fncontextTemplate += '<param><value><string>%0</string></value></param>';
	fncontextTemplate += '<param><value><string>%1</string></value></param>';
	fncontextTemplate += '</context>';
	var fncontext = fncontextTemplate.format([tiddler.title,tiddler.text]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fncontext]);
//#displayMessage("payload:"+payload);

	context.adaptor = this;
	if(callback) context.callback = callback;
	var req =doHttp('POST',url,payload,null,this.username,this.password,JSPWikiAdaptor.putTiddlerCallback,tiddler);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

JSPWikiAdaptor.putTiddlerCallback = function(status,context,responseText,url,xhr)
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

JSPWikiAdaptor.prototype.close = function() {return true;};

config.adaptors[JSPWikiAdaptor.serverType] = JSPWikiAdaptor;
} // end of 'install only once'
//}}}
