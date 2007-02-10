/***
|''Name:''|JSPWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from JSP Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#JSPWikiAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/JSPWikiAdaptorPlugin.js|
|''Version:''|0.2.1|
|''Date:''|Feb 4, 2007|
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
	{config.options.txtJSPWikiDefaultServer = 'www.JSPWiki.org';}
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

function doHttpGET(url,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',url,data,contentType,username,password,callback,params,headers);
}

config.messages.serverParsingError = "Error parsing result from server";

function JSPWikiAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
};

JSPWikiAdaptor.prototype.openHost = function(host,callback,callbackParams)
{
//#displayMessage("openHost:"+host);
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	this.host = host;
//#displayMessage("host:"+host);
	this.username = config.options.txttwikiUsername;
	this.password = config.options.txttwikiPassword;
	if(params && params.callback)
		window.setTimeout(params.callback,0,true,this,params);
	return true;
};

JSPWikiAdaptor.prototype.getWorkspaceList = function(params)
{
//#displayMessage("getWorkspaceList");
	var urlTemplate = '%0data/workspaces';
	var url = urlTemplate.format([this.host]);
	params.adaptor = this;
	var req = doHttpGET(url,JSPWikiAdaptor.getWorkspaceListCallback,params);
	return typeof req == 'string' ? req : true;
};

JSPWikiAdaptor.getWorkspaceListCallback = function(status,params,responseText,xhr)
{
//#displayMessage("getWorkspaceListCallback");
	if(!params)
		params = {};
	params.status = false;
	if(status) {
		try {
			eval('var info=' + responseText);
		} catch (ex) {
			params.statusText = exceptionText(ex,config.messages.serverParsingError);
			if(params.callback)
				params.callback(params);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			list.push({title:info[i].name});
		}
		params.list = list;
		params.status = true;
	} else {
		params.statusText = xhr.statusText;
	}
	if(params && params.callback)
		params.callback(params);
};

JSPWikiAdaptor.prototype.openWorkspace = function(workspace,callback,callbackParams)
{
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(params && params.callback)
		window.setTimeout(params.callback,0,true,this,params);
	return true;
};

JSPWikiAdaptor.prototype.getTiddlerList = function(params)
{
//#displayMessage('getTiddlerList');
//#displayMessage('url:'+url);
	var urlTemplate = '';
	var url = urlTemplate.format([this.host,this.workspace]);
//#displayMessage('url:'+url);
	params.adaptor = this;
	var req = doHttpGET(url,JSPWikiAdaptor.getTiddlerListCallback,params);
//#displayMessage('req:'+req);
	return typeof req == 'string' ? req : true;
};

JSPWikiAdaptor.getTiddlerListCallback = function(status,params,responseText,xhr)
{
//#displayMessage('getTiddlerListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	if(!params)
		params = {};
	params.status = false;
	if(status) {
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
		} catch (ex) {
			params.statusText = exceptionText(ex,config.messages.serverParsingError);
			if(params.callback)
				params.callback(params);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			list.push({title:info[i].name});
		}
		params.list = list;
		params.status = true;
	} else {
		params.statusText = xhr.statusText;
	}
	if(params.callback)
		params.callback(params);
};

JSPWikiAdaptor.prototype.getTiddler = function(tiddler)
{
//#displayMessage('JSPWikiAdaptor.getTiddler:'+tiddler.title);
//# http://JSPWiki.org/wiki/WikiRPCInterface
//# http://www.JSPWiki.org/RPCU/

	//#var fn = 'wiki.getRPCVersionSupported';
	//#var fn = 'wiki.getAllTiddlers';
	var fn = 'wiki.getPage';
	var urlTemplate = '%0RPCU/';
	var url = urlTemplate.format([this.host,this.workspace,tiddler.title]);
//#displayMessage('url: '+url);

	var fnParamsTemplate ='<params><param><value><string>%0</string></value></param></params>';
	var fnParams = fnParamsTemplate.format([tiddler.title]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#displayMessage("payload:"+payload);

	tiddler.fields.wikiformat = 'jspwiki';
	tiddler.fields['server.type'] = 'jspwiki';
	tiddler.fields['temp.adaptor'] = this;
	var req =doHttp('POST',url,payload,null,null,null,JSPWikiAdaptor.getTiddlerCallback,tiddler);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

JSPWikiAdaptor.getTiddlerCallback = function(status,tiddler,responseText,xhr)
{
//#displayMessage('JSP.getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	if(status) {
		var content = responseText;
		content = content.replace('<?xml version="1.0" encoding="UTF-8"?><methodResponse><params><param><value>','');
		content = content.replace('</value></param></params></methodResponse>','');
		tiddler.text = content;
		tiddler.fields['temp.status'] = true;
		tiddler.fields['temp.statusText'] = xhr.statusText;
	} else {
		tiddler.fields['temp.status'] = false;
	}
	var callback = tiddler.fields['temp.callback'];
	if(callback)
		callback(tiddler);
};

JSPWikiAdaptor.prototype.putTiddler = function(tiddler)
{
//#displayMessage('JSPWikiAdaptor.putTiddler:'+tiddler.title);
//# http://www.JSPWiki.org/wiki/WikiRPCInterface2
//# http://www.JSPWiki.org/RPC2/

//#putPage(utf8 page,utf8 content,struct attributes )
	var fn = 'wiki.putPage';
	var urlTemplate = '%0RPC2/';
	var url = urlTemplate.format([this.host,this.workspace,tiddler.title]);
//#displayMessage('url: '+url);

	var fnParamsTemplate ='<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([tiddler.title,tiddler.text]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#displayMessage("payload:"+payload);

	tiddler.fields.wikiformat = 'jspwiki';
	tiddler.fields['server.type'] = 'jspwiki';
	tiddler.fields['temp.adaptor'] = this;
	var req =doHttp('POST',url,payload,null,this.username,this.password,JSPWikiAdaptor.putTiddlerCallback,tiddler);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

JSPWikiAdaptor.putTiddlerCallback = function(status,tiddler,responseText,xhr)
{
	if(status) {
		tiddler.fields['temp.status'] = true;
		tiddler.fields['temp.statusText'] = xhr.statusText;
	} else {
		tiddler.fields['temp.status'] = false;
	}
	var callback = tiddler.fields['temp.callback'];
	if(callback)
		callback(tiddler);
};

JSPWikiAdaptor.prototype.close = function() {return true;};

config.adaptors['jspwiki'] = JSPWikiAdaptor;
} // end of 'install only once'
//}}}
