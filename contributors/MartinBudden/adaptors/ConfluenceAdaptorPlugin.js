/***
|''Name:''|ConfluenceAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from Confluence Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#ConfluenceAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ConfluenceAdaptorPlugin.js|
|''Version:''|0.5.2|
|''Date:''|Feb 25, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

Confluence Wiki RPC documentation is at:
http://confluence.atlassian.com/display/DOC/Remote+API+Specification
http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-Page

The URL for XML-RPC requests is http://confluence-install/rpc/xmlrpc

https://confluence.atlassian.com/confluence/rpc/xmlrpc
http://confluence.atlassian.com/display/TEST/Home

''For debug:''
|''Default Confluence username''|<<option txtConfluenceUsername>>|
|''Default Confluence password''|<<option txtConfluencePassword>>|

***/

//{{{
// For debug:
if(!config.options.txtConfluenceUsername)
	{config.options.txtConfluenceUsername = '';}
if(!config.options.txtConfluencePassword)
	{config.options.txtConfluencePassword = '';}
//}}}

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.ConfluenceAdaptorPlugin) {
version.extensions.ConfluenceAdaptorPlugin = {installed:true};

function ConfluenceAdaptor()
{
	this.host = null;
	this.workspace = null;
	this.token = ''; // From 1.3 onwards, supply an empty string as the token to be treated as being the anonymous user.
	return this;
}

ConfluenceAdaptor.serverType = 'confluence';
ConfluenceAdaptor.serverParsingErrorMessage = "Error parsing result from server";
ConfluenceAdaptor.errorInFunctionMessage = "Error in function ConfluenceAdaptor.%0";

ConfluenceAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	return context;
};

ConfluenceAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
//#displayMessage("doHttpGet");
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

ConfluenceAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

ConfluenceAdaptor.fullHostName = function(host)
{
//#displayMessage("fullHostName:"+host);
	if(!host)
		return '';
	host = host.trim();
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(host.length-1) != '/')
		host = host + '/';
	return host;
};

ConfluenceAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

ConfluenceAdaptor.normalizedTitle = function(title)
{
	return title;
};

ConfluenceAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
displayMessage("openHost:"+host);
// The default session lifetime is 30 minutes, but that can be controlled by the deployer from the applicationContext.xml file. 

	context = this.setContext(context,userParams,callback);
	this.host = ConfluenceAdaptor.fullHostName(host);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;


	// for debug
	this.username = config.options.txtConfluenceUsername;
	this.password = config.options.txtConfluencePassword;
	var uriTemplate = '%0rpc/xmlrpc';
	var uri = uriTemplate.format([this.host]);
displayMessage('uri: '+uri);

	var fn = 'confluence1.login';
	var fnParamsTemplate = '<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([this.username,this.password]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
displayMessage("payload:"+payload.substr(0,80));
displayMessage("payload:"+payload.substr(80,80));
displayMessage("payload:"+payload.substr(160,80));
	var req =doHttp('POST',uri,payload,null,null,null,ConfluenceAdaptor.openHostCallback,context);
displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

/*
<?xml version="1.0"?><methodResponse>
<fault><fault>
<struct>
<member><name>faultString</name><value>java.lang.NullPointerException</value></member>
<member><name>faultCode</name><value><int>0</int></value></member>
</struct>
</value></fault>
</methodResponse>
*/

ConfluenceAdaptor.openHostCallback = function(status,context,responseText,uri,xhr)
{
displayMessage('openHostCallback');
displayMessage('rt:'+responseText.substr(0,80));
displayMessage('rt:'+responseText.substr(80,80));
displayMessage('rt:'+responseText.substr(160,80));
//#displayMessage('uri:'+uri);
//#displayMessage('xhr:'+xhr);

//# returns an authentication token to be passed to all subsequent XML-RPC calls
//# http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-AuthenticationMethods
	context.status = false;
	context.statusText = ConfluenceAdaptor.errorInFunctionMessage.format(['openHostCallback']);
	if(status) {
		try {
			var text = responseText;
			text = text.replace('<?xml version="1.0" encoding="UTF-8"?><methodResponse>','');
			text = text.replace('</methodResponse>','');
			var faultRegExp = /<value>([^<]*)<\/value>/mg;
			faultRegExp.lastIndex = 0;
			var match = faultRegExp.exec(text);
			if(match) {
				text = text.replace('<fault><fault><struct>','');
				text = text.replace('</fault></fault></struct>','');
				displayMessage(text.substr(0,80));
				displayMessage(text.substr(80,80));
				displayMessage(text.substr(160,80));
				return;
			}
			
			text = text.replace('<params><param><string>','');
			text = text.replace('</string></param></params>','');
			var matchRegExp = /<value>([^<]*)<\/value>/mg;
			matchRegExp.lastIndex = 0;
			match = matchRegExp.exec(text);
			if(match) {
				this.token = match[1];
			}
		} catch (ex) {
			context.statusText = exceptionText(ex,config.messages.serverParsingError);
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

ConfluenceAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
//#displayMessage("openWorkspace:"+workspace);
	context = this.setContext(context,userParams,callback);
	this.workspace = workspace;
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

ConfluenceAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
displayMessage('getWorkspaceList');
//# http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-Spaces
	context = this.setContext(context,userParams,callback);

	var uriTemplate = '%0rpc/xmlrpc';
	var uri = uriTemplate.format([this.host]);
displayMessage('uri: '+uri);

	var fn = 'confluence1.getSpaces';
	var fnParamsTemplate = '<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([this.token]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
displayMessage("payload:"+payload.substr(0,80));
displayMessage("payload:"+payload.substr(80,80));
displayMessage("payload:"+payload.substr(160,80));
	var req =doHttp('POST',uri,payload,null,null,null,ConfluenceAdaptor.openHostCallback,context);
displayMessage("req:"+req);
};


ConfluenceAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
displayMessage('getWorkspaceListCallback status:'+status);
displayMessage('rt:'+responseText.substr(0,80));
displayMessage('rt:'+responseText.substr(80,80));
displayMessage('rt:'+responseText.substr(160,80));
//#displayMessage('uri:'+uri);
//#displayMessage('xhr:'+xhr);

//# returns an array of SpaceSummaries, see
//# http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-SpaceSummary
	context.status = false;
	context.statusText = ConfluenceAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			var text = responseText;
			text = text.replace('<?xml version="1.0" encoding="UTF-8"?><methodResponse><params><param><value><array><data>','');
			text = text.replace('</data></array></value></param></params></methodResponse>','');
			var list = [];
			var matchRegExp = /<value>([^<]*)<\/value>/mg;
			matchRegExp.lastIndex = 0;
			match = matchRegExp.exec(text);
			while(match) {
				var item = {};
				item.title = match[1];
				item.name = match[1];
				list.push(item);
				match = matchRegExp.exec(text);
			}
		} catch (ex) {
			context.statusText = exceptionText(ex,config.messages.serverParsingError);
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

ConfluenceAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
//#displayMessage('getTiddlerList');
	context = this.setContext(context,userParams,callback);

	var uriTemplate = '%0rpc/xmlrpc';
	var uri = uriTemplate.format([this.host]);
//#displayMessage('uri: '+uri);

	var fn = 'confluence1.getAllPages';
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName></methodCall>';
	var payload = fnTemplate.format([fn]);
//#displayMessage("payload:"+payload);
	var req =doHttp('POST',uri,payload,null,null,null,ConfluenceAdaptor.getTiddlerListCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

//*<?xml version="1.0" encoding="UTF-8"?><methodResponse><params><param><value><array><data>
//#<value>IdeasInstantMessagingWiki</value>
//#...
//#</data></array></value></param></params></methodResponse>

ConfluenceAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('getTiddlerListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,80));
//#displayMessage('uri:'+uri);
//#displayMessage('xhr:'+xhr);

//# returns an array of PageSummaries, see
//# http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-PageSummary
	context.status = false;
	context.statusText = ConfluenceAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			var text = responseText;
			text = text.replace('<?xml version="1.0" encoding="UTF-8"?><methodResponse><params><param><value><array><data>','');
			text = text.replace('</data></array></value></param></params></methodResponse>','');
			var list = [];
			var matchRegExp = /<value>([^<]*)<\/value>/mg;
			matchRegExp.lastIndex = 0;
			match = matchRegExp.exec(text);
			while(match) {
				var tiddler = new Tiddler(match[1]);
				list.push(tiddler);
				match = matchRegExp.exec(text);
			}
		} catch (ex) {
			context.statusText = exceptionText(ex,config.messages.serverParsingError);
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

ConfluenceAdaptor.prototype.generateTiddlerUri = function(tiddler)
{
//# http://confluence.atlassian.com/display/TEST/Home
	var info = {};
	var host = this && this.host ? this.host : ConfluenceAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	uriTemplate = '%0display/%1/%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

ConfluenceAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#displayMessage('ConfluenceAdaptor.getTiddler:'+title);
	context = this.setContext(context,userParams,callback);

	var uriTemplate = '%0rpc/xmlrpc';
	var uri = uriTemplate.format([this.host]);
//#displayMessage('uri: '+uri);

	//#var fn = 'confluence1.getRPCVersionSupported';
	//#var fn = 'confluence1.getAllPages';
	var fn = 'confluence1.getPage';
	var fnParamsTemplate ='<params><param><value><string>%0</string></value></param></params>';
	var fnParams = fnParamsTemplate.format([title]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#displayMessage("payload:"+payload);

	context.tiddler = new Tiddler(title);
	context.tiddler.fields.wikiformat = 'confluence';
	context.tiddler.fields['server.host'] = ConfluenceAdaptor.minHostName(this.host);
	//context.tiddler.fields['server.workspace'] = this.workspace;
	var req = doHttp('POST',uri,payload,null,null,null,ConfluenceAdaptor.getTiddlerCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

ConfluenceAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);

//# returns a page, see
//# http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-Page
	if(status) {
		var text = responseText;
		text = text.replace('<?xml version="1.0" encoding="UTF-8"?><methodResponse><params><param><value>','');
		text = text.replace('</value></param></params></methodResponse>','');
		context.tiddler.text = text;
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ConfluenceAdaptor.prototype.putTiddler = function(tiddler,context,callback)
{
//#displayMessage('ConfluenceAdaptor.putTiddler:'+tiddler.title);
	context = this.setContext(context,userParams,callback);

//#putPage(utf8 page,utf8 content,struct attributes )
	var fn = 'confluence1.putPage';
	var uriTemplate = '%0rpc/xmlrpc';
	var host = this && this.host ? this.host : ConfluenceAdaptor.fullHostName(context.tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : context.tiddler.fields['server.workspace'];
	var uri = uriTemplate.format([host,workspace,tiddler.title]);
//#displayMessage('uri: '+uri);

	var fnParamsTemplate ='<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([tiddler.title,tiddler.text]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#displayMessage("payload:"+payload);

	var req = doHttp('POST',uri,payload,null,this.username,this.password,ConfluenceAdaptor.putTiddlerCallback,tiddler);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

ConfluenceAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
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

ConfluenceAdaptor.prototype.close = function() {return true;};

config.adaptors[ConfluenceAdaptor.serverType] = ConfluenceAdaptor;
} // end of 'install only once'
//}}}
