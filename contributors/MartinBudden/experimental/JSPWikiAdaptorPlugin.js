/***
|''Name:''|JSPWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from JSP Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#JSPWikiAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/JSPWikiAdaptorPlugin.js|
|''Version:''|0.1.2|
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

JSPWikiAdaptor = function()
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
	if(host.substr(-1)!="/")
		host = host + "/";
	this.host = host;
//#displayMessage("host:"+host);
	if(callback)
		window.setTimeout(callback,0,true,this,callbackParams);
	return true;
};

JSPWikiAdaptor.prototype.getWorkspaceList = function(callback,callbackParams)
{
	var urlTemplate = '%0data/workspaces';
	var url = urlTemplate.format([this.host]);
	var params = {callback:callback,callbackParams:callbackParams,adaptor:this};
	var req = doHttp('GET',url,null,null,null,null,JSPWikiAdaptor.getWorkspaceListCallback,params,{'Accept':'application/json'});
	return (typeof req == 'string') ? req : true;
};

JSPWikiAdaptor.getWorkspaceListCallback = function(status,params,responseText,xhr)
{
	if(status) {
		try {
			eval('var info=' + responseText);
		} catch (ex) {
			params.callback(exceptionText(ex,"Error parsing result from server"),null,params.adaptor,params.callbackParams);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			list.push({title:info[i].name});
		}
		params.callback(true,list,params.adaptor,params.callbackParams);
	} else {
		params.callback(xhr.statusText,null,params.adaptor,params.callbackParams);
	}
};

JSPWikiAdaptor.prototype.openWorkspace = function(workspace,callback,callbackParams)
{
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(callback)
		window.setTimeout(callback,0,true,this,callbackParams);
	return true;
};

JSPWikiAdaptor.prototype.getTiddlerList = function(callback,callbackParams)
{
//#displayMessage('getTiddlerList');
//#displayMessage('url:'+url);
	var params = {callback:callback,callbackParams:callbackParams,adaptor:this};
	var req = doHttp("GET",url,null,null,null,null,JSPWikiAdaptor.getTiddlerListCallback,params);
//#displayMessage('req:'+req);
	return (typeof req == 'string') ? req : true;
};

JSPWikiAdaptor.getTiddlerListCallback = function(status,params,responseText,xhr)
{
//#displayMessage('getTiddlerListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	if(status) {
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
		} catch (ex) {
			params.callback(exceptionText(ex,"Error parsing result from server"),null,params.adaptor,params.callbackParams);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			list.push({title:info[i].name});
		}
		params.callback(true,list,params.adaptor,params.callbackParams);
	} else {
		params.callback(xhr.statusText,null,params.adaptor,params.callbackParams);
	}
};

JSPWikiAdaptor.prototype.getTiddler = function(tiddler)
{
// http://JSPWiki.org/wiki/WikiRPCInterface
// http://www.JSPWiki.org/RPCU/

	//#var fn = 'wiki.getRPCVersionSupported';
	//#var fn = 'wiki.getAllTiddlers';
	var fn = 'wiki.getPage';
	var urlTemplate = 'http://%0/RPCU/';
	var url = urlTemplate.format([params.serverHost,params.serverWorkspace,title]);
//#displayMessage('getJSPWwiki url: '+url);

	var fnParamsTemplate ='<params><param><value><string>%0</string></value></param></params>';
	var fnParams = fnParamsTemplate.format([title]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#displayMessage("payload:"+payload);

	tiddler.fields.wikiformat = 'jspwiki';
	tiddler.fields['server.type'] = 'jspwiki';
	tiddler.fields['temp.adaptor'] = this;
	var req =doHttp('POST',url,payload,null,params.username,params.password,JSPWikiAdaptor.getTiddlerCallback,tiddler);
//#displayMessage("req:"+req);
};

JSPWikiAdaptor.getTiddlerCallback = function(status,params,responseText,xhr)
{
//#displayMessage('JSP.getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	var content = responseText;
	content = content.replace('<?xml version="1.0" encoding="UTF-8"?><methodResponse><params><param><value>','');
	content = content.replace('</value></param></params></methodResponse>','');
	var tiddler = store.createTiddler(params.title);
	tiddler.updateFieldsAndContent(params,content);
};

JSPWikiAdaptor.prototype.putTiddler = function(tiddler)
{
// http://www.JSPWiki.org/wiki/WikiRPCInterface2
// http://www.JSPWiki.org/RPC2/
	var text = store.fetchTiddler(title).text;

//#putPage(utf8 page,utf8 content,struct attributes )
	var fn = 'wiki.putPage';
	var urlTemplate = 'http://%0/RPC2/';
	var url = urlTemplate.format([this.host,this.workspace,tiddler.title]);
//#displayMessage('putJSPWwiki url: '+url);

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
};

JSPWikiAdaptor.putTiddlerCallback = function(status,tiddler,responseText,xhr)
{
	displayMessage('putTiddlerCallback status:'+status);
	displayMessage('rt:'+responseText.substr(0,50));
	//#displayMessage('xhr:'+xhr);
};

JSPWikiAdaptor.prototype.close = function() {return true;};

config.adaptors['jspwiki'] = JSPWikiAdaptor;
} // end of 'install only once'
//}}}
