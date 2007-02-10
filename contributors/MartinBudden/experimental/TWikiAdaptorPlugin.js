/***
|''Name:''|TWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from TWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#TWikiAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/TWikiAdaptorPlugin.js|
|''Version:''|0.2.3|
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

config.messages.serverParsingError = "Error parsing result from server";

function TWikiAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

TWikiAdaptor.prototype.openHost = function(host,params)
{
//#displayMessage("openHost:"+host);
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(!host.match(/\/bin$/))
		host += '/cgi-bin';
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

TWikiAdaptor.prototype.getWorkspaceList = function(params)
{
//#displayMessage("getWorkspaceList");
	var urlTemplate = '%0data/workspaces';
	var url = urlTemplate.format([this.host]);
	params.adaptor = this;
	var req = doHttpGET(url,TWikiAdaptor.getWorkspaceListCallback,params);
	return typeof req == 'string' ? req : true;
};

TWikiAdaptor.getWorkspaceListCallback = function(status,params,responseText,xhr)
{
//#displayMessage("getWorkspaceListCallback");
	if(!params)
		params = {};
	params.status = false;
	if(status) {
		try {
			eval('var info=' + responseText);
		} catch (ex) {
			params.statusText = exceptionText(ex,"Error parsing result from server");
			if(params.callback)
				params.callback(params);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			list.push({title:info[i].title});
		}
		params.list = list;
		params.status = true;
	} else {
		params.statusText = xhr.statusText;
	}
	if(params && params.callback)
		params.callback(params);
};

TWikiAdaptor.prototype.openWorkspace = function(workspace,params)
{
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(params && params.callback)
		window.setTimeout(params.callback,0,true,this,params);
	return true;
};

TWikiAdaptor.prototype.getTiddler = function(tiddler)
{
displayMessage('TWikiAdaptor.getTiddler:'+tiddler.title);
//# http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts
//# http://twiki.org/cgi-bin/view/TWiki04/TWikiScripts?raw=text
//# http://twiki.org/cgi-bin/view/MyWeb/MyTopic?raw=text
//# http://twiki.org/cgi-bin/rest/EmptyPlugin/example?debugenableplugin=EmptyPlugin
//# http://my.host/bin/rest/<subject>/<verb>
//# where <subject> must be the WikiWord name of one of the installed TWikiPlugins,
//# and <verb> is the alias for the function registered using the registerRESTHandler.
//# http://twiki.org/cgi-bin/view/Sandbox/SandBox29?raw=text

	var urlTemplate = '%0view/%1/%2?raw=text';
	var url = urlTemplate.format([this.host,this.workspace,tiddler.title]);
displayMessage('getTwiki url: '+url);

	tiddler.fields.wikiformat = 'TWiki';
	tiddler.fields['server.type'] = 'twiki';
	tiddler.fields['temp.adaptor'] = this;
	var req = doHttpGET(url,TWikiAdaptor.getTiddlerCallback,tiddler);
displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

TWikiAdaptor.getTiddlerCallback = function(status,tiddler,responseText,xhr)
{
//#displayMessage('TWiki.getTiddlerCallback');
//#displayMessage('status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	tiddler.fields['temp.status'] = false;
	if(status) {
		var content = responseText;
		//<form><textarea readonly="readonly" wrap="virtual" rows="50" cols="80">
		var contentRegExp = /<textarea.*?>((?:.|\n)*?)<\/textarea>/mg;
		contentRegExp.lastIndex = 0;
		var match = contentRegExp.exec(responseText);
		if(match) {
			content = match[1].htmlDecode();
		}
		tiddler.text = content;
		tiddler.fields['temp.status'] = true;
	} else {
		tiddler.fields['temp.statusText'] = xhr.statusText;
	}
	var callback = tiddler.fields['temp.callback'];
	if(callback)
		callback(tiddler);
};

TWikiAdaptor.prototype.putTiddler = function(tiddler)
{
//#displayMessage('TWikiAdaptor.putTiddler:'+tiddler.title);
	var urlTemplate = '%0save/%1/%2?text=%3';
	var url = urlTemplate.format([this.host,this.workspace,tiddler.title,tiddler.text]);
//#displayMessage('url:'+url);
	var req = doHttpGET(url,TWikiAdaptor.putTiddlerCallback,tiddler,null,null,null,this.username,this.password);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

TWikiAdaptor.putTiddlerCallback = function(status,tiddler,responseText,xhr)
{
//#displayMessage('response:'+responseText.substr(0,30));
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

TWikiAdaptor.prototype.close = function() {return true;};

config.adaptors['twiki'] = TWikiAdaptor;
} //# end of 'install only once'
//}}}
