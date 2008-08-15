/***
|''Name:''|ConfluenceAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from Confluence Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#ConfluenceAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ConfluenceAdaptorPlugin.js |
|''Version:''|0.6.1|
|''Date:''|Feb 25, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/ ]]|
|''~CoreVersion:''|2.4.1|

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
	this.sessionToken = null; // From 1.3 onwards, supply an empty string as the token to be treated as being the anonymous user.
	return this;
}

ConfluenceAdaptor.prototype = new AdaptorBase();

ConfluenceAdaptor.serverType = 'confluence';
ConfluenceAdaptor.serverParsingErrorMessage = "Error parsing result from server";
ConfluenceAdaptor.errorInFunctionMessage = "Error in function ConfluenceAdaptor.%0";

ConfluenceAdaptor.doHttpPOST = function(uri,callback,params,headers,data)
{
	return httpReq('POST',uri,callback,params,headers,data,'text/xml',null,null,true);
};

ConfluenceAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

ConfluenceAdaptor.normalizedTitle = function(title)
{
	return title;
};

// Convert a ConfluenceAdaptor iso8601 DateTime in YYYYMMDDThh:mm:ss  format into a JavaScript Date object
ConfluenceAdaptor.dateFromIso8601DateTime = function(timestamp)
{
	var dt = timestamp;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(4,2)-1,dt.substr(6,2),dt.substr(9,2),dt.substr(12,2)));
};

ConfluenceAdaptor.prototype.complete = function(context,fn)
{
//#console.log("complete:"+context.sessionToken);
	context.complete = fn;
	if(context.sessionToken!==undefined) {
		var ret = context.complete(context,context.userParams);
	} else {
		ret = this.login(context);
	}
	return ret;
};

ConfluenceAdaptor.prototype.login = function(context)
{
//#console.log('login:'+context.host);
	if(config.options.txtConfluenceUsername && config.options.txtConfluencePassword) {
		context.username = config.options.txtWikispacesUsername;
		context.password = config.options.txtWikispacesPassword;
		ConfluenceAdaptor.loginPromptCallback(context);
	} else if(context.loginPromptFn) {
		context.loginPromptCallback = ConfluenceAdaptor.loginPromptCallback;
		context.loginPromptFn(context);
	} else {
		return false;
	}
	return true;
};

ConfluenceAdaptor.loginPromptCallback = function(context)
{
//#console.log('loginPromptCallback');
	// for debug
	context.username = config.options.txtConfluenceUsername;
	context.password = config.options.txtConfluencePassword;
	var uriTemplate = '%0/rpc/xmlrpc';
	var uri = uriTemplate.format([context.host]);
//#console.log('uri: '+uri);

	var fn = 'confluence1.login';
	var fnParamsTemplate = '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	var fnParams = fnParamsTemplate.format([context.username,context.password]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName><params>%1</params></methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log('payload:'+payload);
	var req = ConfluenceAdaptor.doHttpPOST(uri,ConfluenceAdaptor.loginCallback,context,null,payload);
	return typeof req == 'string' ? req : true;
};

ConfluenceAdaptor.loginCallback = function(status,context,responseText,url,xhr)
{
//#console.log('loginCallback:'+status);
//#console.log('rt:'+responseText);
	context.status = false;
	context.statusText = ConfluenceAdaptor.errorInFunctionMessage.format(['loginCallback']);
	if(status) {
		try {
			var text = responseText;
//<?xml version="1.0"?><methodResponse><fault><value><struct><member><name>faultString</name><value>java.lang.Exception: com.atlassian.confluence.rpc.NotPermittedException: Anonymous RPC access is disabled on this server</value></member><member><name>faultCode</name><value><int>0</int></value></member></struct></value></fault></methodResponse>
//<?xml version="1.0"?><methodResponse><params><param><value>WsUS1CnaA4</value></param></params></methodResponse>
//			text = text.replace('<?xml version="1.0" encoding="UTF-8"?><methodResponse>','');
//			text = text.replace('</methodResponse>','');
			var faultRegExp = /<member><name>faultString<\/name><value>([^<]*)<\/value>/mg;
			faultRegExp.lastIndex = 0;
			var match = faultRegExp.exec(text);
			if(match) {
				context.statusText = match[1];
				if(context.callback)
					context.callback(context,context.userParams);
				return;
			}
			
			//text = text.replace('<params><param><string>','');
			//text = text.replace('</string></param></params>','');
			var matchRegExp = /<value>([^<]*)<\/value>/mg;
			matchRegExp.lastIndex = 0;
			match = matchRegExp.exec(text);
			if(match)
				context.sessionToken = match[1];
			else
				context.sessionToken = '';
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
	if(context.complete)
		context.complete(context,context.userParams);
};

ConfluenceAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
//#console.log("openHost:"+host);
	context = this.setContext(context,userParams,callback);
	context.host = this.fullHostName(host);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

ConfluenceAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
//#console.log("openWorkspace:"+workspace);
	context = this.setContext(context,userParams,callback);
	context.workspace = workspace;
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

ConfluenceAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
//#console.log('getWorkspaceList');
	context = this.setContext(context,userParams,callback);
	var workspace = userParams ? userParams.getValue("feedWorkspace") : context.workspace;//!! kludge until core fixed
	if(!workspace)
		return this.complete(context,ConfluenceAdaptor.getWorkspaceListComplete);
	var list = [];
	list.push({title:workspace,name:workspace});
	context.workspace = workspace;
	context.workspaces = list;
	if(context.callback)
		context.callback(context,context.userParams);
	return true;
};

ConfluenceAdaptor.getWorkspaceListComplete = function(context)
{
//#console.log('getWorkspaceListComplete');
//# http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-Spaces

	var uriTemplate = '%0/rpc/xmlrpc';
	var uri = uriTemplate.format([context.host]);
//#console.log('uri: '+uri);

	var fn = 'confluence1.getSpaces';
	var fnParamsTemplate = '<param><value><string>%0</string></value></param>';
	var fnParams = fnParamsTemplate.format([context.sessionToken]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName><params>%1</params></methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log("payload:"+payload);
	var req = ConfluenceAdaptor.doHttpPOST(uri,ConfluenceAdaptor.getWorkspaceListCallback,context,null,payload);
//#console.log("req:"+req);
};

ConfluenceAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('getWorkspaceListCallback:'+status);
//#console.log('rt:'+responseText);

//# returns an array of SpaceSummaries, see
//# http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-SpaceSummary
	context.status = false;
	context.statusText = ConfluenceAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	context.workspaces = [];
/*
<?xml version="1.0"?><methodResponse><params><param><value><array><data><value>
<struct>
<member><name>name</name><value>MartinTest</value></member>
<member><name>url</name><value>http://try.atlassian.com/display/MartinTest</value></member>
<member><name>key</name><value>MartinTest</value></member>
<member><name>type</name><value>global</value></member>
</struct>
</value></data></array></value></param></params></methodResponse>
*/
	if(status) {
		try {
			var text = responseText;
			text = text.replace('<methodResponse><params><param><value><array><data>','');
			text = text.replace('</data></array></value></param></params></methodResponse>','');
			var matchRegExp = /<name>key<\/name><value>([^<]*)<\/value>/mg;
			matchRegExp.lastIndex = 0;
			var match = matchRegExp.exec(text);
			while(match) {
				var item = {title:match[1],name:match[1]};
				context.workspaces.push(item);
				match = matchRegExp.exec(text);
			}
			if(context.workspaces.length==1)
				context.workspace = context.workspaces[0].title;
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

ConfluenceAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
//#console.log('getTiddlerList');
	context = this.setContext(context,userParams,callback);
	return this.complete(context,ConfluenceAdaptor.getTiddlerListComplete);
};

ConfluenceAdaptor.getTiddlerListComplete = function(context)
{
//#console.log('getTiddlerListComplete');
	var uriTemplate = '%0/rpc/xmlrpc';
	var uri = uriTemplate.format([context.host]);
//#console.log('uri: '+uri);

	var fn = 'confluence1.getPages';
	var fnParamsTemplate = '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	var fnParams = fnParamsTemplate.format([context.sessionToken,context.workspace]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName><params>%1</params></methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log("payload:"+payload);
	var req = ConfluenceAdaptor.doHttpPOST(uri,ConfluenceAdaptor.getTiddlerListCallback,context,null,payload);
	return typeof req == 'string' ? req : true;
};

//*<?xml version="1.0" encoding="UTF-8"?><methodResponse><params><param><value><array><data>
//#<value>IdeasInstantMessagingWiki</value>
//#...
//#</data></array></value></param></params></methodResponse>


/*<?xml version="1.0"?><methodResponse><params>
<param><value><array><data><value><struct>
<member><name>id</name><value>54694264</value></member>
<member><name>parentId</name><value>0</value></member>
<member><name>title</name><value>Home</value></member>
<member><name>url</name><value>http://try.atlassian.com/display/MartinTest/Home</value></member>
<member><name>permissions</name><value>0</value></member>
<member><name>space</name><value>MartinTest</value></member>
</struct></value></data></array></value></param>
</params></methodResponse>*/

ConfluenceAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('getTiddlerListCallback status:'+status);
//#console.log('rt:'+responseText);

//# returns an array of PageSummaries, see
//# http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-PageSummary
	context.status = true;
	//context.statusText = ConfluenceAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	context.statusText = "";
	context.tiddlers = [];
	if(status) {
		try {
//<?xml version="1.0"?><methodResponse>
//<fault><value><struct><member><name>faultString</name>
//<value>
//java.lang.Exception: com.atlassian.confluence.rpc.RemoteException: You're not allowed to view that space, or it does not exist.
//</value>
//</member><member><name>faultCode</name><value><int>0</int></value></member></struct></value></fault></methodResponse>
			var text = responseText;
			text = text.replace('<?xml version="1.0" encoding="UTF-8"?><methodResponse><params><param><value><array><data>','');
			text = text.replace('</data></array></value></param></params></methodResponse>','');
			var matchRegExp = /<name>faultString<\/name><value>([^<]*)<\/value>/mg;
			matchRegExp.lastIndex = 0;
			match = matchRegExp.exec(text);
			if(match) {
				context.status = false;
				context.statusText = match[1];
			}
			matchRegExp = /<name>title<\/name><value>([^<]*)<\/value>/mg;
			matchRegExp.lastIndex = 0;
			match = matchRegExp.exec(text);
			while(match) {
				if(!store.isShadowTiddler(match[1])) {
					//# avoid overwriting shadow tiddlers
					var tiddler = new Tiddler(match[1]);
					tiddler.fields.wikiformat = 'confluence';
					tiddler.fields['server.host'] = ConfluenceAdaptor.minHostName(context.host);
					tiddler.fields['server.workspace'] = context.workspace;
					context.tiddlers.push(tiddler);
				}
				match = matchRegExp.exec(text);
			}
		} catch (ex) {
			context.status = false;
			context.statusText = exceptionText(ex,config.messages.serverParsingError);
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

ConfluenceAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
//# http://confluence.atlassian.com/display/TEST/Home
	var info = {};
	var host = this && this.host ? this.host : this.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	uriTemplate = '%0/display/%1/%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

ConfluenceAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#console.log('getTiddler:'+title);
	if(!context)
		context = {};
	if(!context.sessionToken && userParams && userParams.getValue) {
		var cc = userParams.getValue("context");
		if(cc) {
			for(var i in cc) {
				context[i] = cc[i];
			}
		}
	}
	context = this.setContext(context,userParams,callback);
	var tiddler = store.getTiddler(title);
	context.host = context.host||this.fullHostName(tiddler.fields['server.host']);
	context.workspace = context.workspace||tiddler.fields['server.workspace'];
	context.title = title;
	this.complete(context,ConfluenceAdaptor.getTiddlerComplete);
};
/*
<?xml version="1.0"?><methodResponse><params><param>
<value>
<struct>
<member><name>id</name><value>54694264</value></member>
<member><name>content</name><value></value></member>
<member><name>current</name><value>true</value></member>
<member><name>version</name><value>1</value></member>
<member><name>title</name><value>Home</value></member>
<member><name>modifier</name><value>csh_admin</value></member>
<member><name>url</name><value>http://try.atlassian.com/display/MartinTest/Home</value></member>
<member><name>homePage</name><value>true</value></member>
<member><name>creator</name><value>csh_admin</value></member>
<member><name>contentStatus</name><value>current</value></member>
<member><name>modified</name><value><dateTime.iso8601>20080815T04:30:44</dateTime.iso8601></value></member>
<member><name>created</name><value><dateTime.iso8601>20080815T04:30:44</dateTime.iso8601></value></member>
<member><name>space</name><value>MartinTest</value></member>
<member><name>parentId</name><value>0</value></member>
<member><name>permissions</name><value>0</value></member>
</struct>
</value>
</param></params></methodResponse>
*/
ConfluenceAdaptor.getTiddlerComplete = function(context)
{
//#console.log('ConfluenceAdaptor.getTiddler:'+context.title);
	var uriTemplate = '%0/rpc/xmlrpc';
	var uri = uriTemplate.format([context.host]);
//#console.log('uri:'+uri);


	var fn = 'confluence1.getPage';
	var fnParamsTemplate = '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '<param><value><string>%2</string></value></param>';
	var fnParams = fnParamsTemplate.format([context.sessionToken,context.workspace,context.title]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName><params>%1</params></methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log("payload:"+payload);

	context.tiddler = new Tiddler(context.title);
	context.tiddler.fields.wikiformat = 'confluence';
	context.tiddler.fields['server.host'] = ConfluenceAdaptor.minHostName(context.host);
	context.tiddler.fields['server.workspace'] = context.workspace;
	var req = ConfluenceAdaptor.doHttpPOST(uri,ConfluenceAdaptor.getTiddlerCallback,context,null,payload);
//#console.log("req:"+req);
	return typeof req == 'string' ? req : true;
};

ConfluenceAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('getTiddlerCallback status:'+status);
//#console.log('rt:'+responseText);

//# returns a page, see
//# http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-Page
	if(status) {
		var text = responseText;
		text = text.replace(/&#32;/mg,' ');
		text = text.replace(/&#13;/mg,'');
		text = text.replace('<methodResponse><params><param><value>','');
		text = text.replace('</value></param></params></methodResponse>','');
		var matchRegExp = /<name>content<\/name><value>([^<]*)<\/value>/mg;
		matchRegExp.lastIndex = 0;
		match = matchRegExp.exec(text);
		if(match) {
			context.tiddler.text = match[1];
		}
		matchRegExp = /<name>modifier<\/name><value>([^<]*)<\/value>/mg;
		matchRegExp.lastIndex = 0;
		match = matchRegExp.exec(text);
		if(match) {
			context.tiddler.modifier = match[1];
		}
		matchRegExp = /<name>version<\/name><value>([^<]*)<\/value>/mg;
		matchRegExp.lastIndex = 0;
		match = matchRegExp.exec(text);
		if(match) {
			context.tiddler.fields['server.page.revision'] = match[1];
		}
		matchRegExp = /<name>id<\/name><value>([^<]*)<\/value>/mg;
		matchRegExp.lastIndex = 0;
		match = matchRegExp.exec(text);
		if(match) {
			context.tiddler.fields['server.page.id'] = match[1];
		}
		matchRegExp = /<name>modified<\/name><value><dateTime.iso8601>([^<]*)<\/dateTime.iso8601><\/value>/mg;
		matchRegExp.lastIndex = 0;
		match = matchRegExp.exec(text);
		if(match) {
			context.tiddler.modified = ConfluenceAdaptor.dateFromIso8601DateTime(match[1]);
		}

		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ConfluenceAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
//#console.log('putTiddler:'+tiddler.title);
	context = this.setContext(context,userParams,callback);
	context.host = context.host||this.fullHostName(tiddler.fields['server.host']);
	context.workspace = context.workspace||tiddler.fields['server.workspace'];
	context.tiddler = tiddler;
	context.title = tiddler.title;
	return this.complete(context,ConfluenceAdaptor.putTiddlerComplete);
};

ConfluenceAdaptor.putTiddlerComplete = function(context)
{
//#console.log('ConfluenceAdaptor.putTiddlerComplete:'+context.tiddler.title);
	var tiddler = context.tiddler;

//#putPage(utf8 page,utf8 content,struct attributes )
	var fn = 'confluence1.storePage';
	var uriTemplate = '%0/rpc/xmlrpc';
	var host = context.host || this.fullHostName(tiddler.fields['server.host']);
	var uri = uriTemplate.format([host]);
//#console.log('uri: '+uri);

	var fnParamsTemplate = '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><struct>%1</struct></value></param>';
//For adding, the Page given as an argument should have space, title and content fields at a minimum.
//For updating, the Page given should have id, space, title, content and version fields at a minimum.
//The parentId field is always optional. All other fields will be ignored.
	var pageTemplate = "<member><name>space</name><value>%0</value></member>"+
		"<member><name>title</name><value>%1</value></member>"+
		"<member><name>content</name><value>%2</value></member>";
	if(tiddler.fields['server.page.id']) {
		pageTemplate += "<member><name>id</name><value>%3</value></member>";
		pageTemplate += "<member><name>version</name><value>%4</value></member>";
	}

	var pageStruct = pageTemplate.format([context.workspace,tiddler.title,tiddler.text,tiddler.fields['server.page.id'],tiddler.fields['server.page.revision']]);
	var fnParams = fnParamsTemplate.format([context.sessionToken,pageStruct]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName><params>%1</params></methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log("payload:"+payload);

	var req = ConfluenceAdaptor.doHttpPOST(uri,ConfluenceAdaptor.putTiddlerCallback,context,null,payload);
	return typeof req == 'string' ? req : true;
};

ConfluenceAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('putTiddlerCallback status:'+status);
//#console.log('rt:'+responseText);
/*<?xml version="1.0"?><methodResponse>
<fault><value><struct>
<member><name>faultString</name><value>java.lang.Exception: com.atlassian.confluence.rpc.InvalidSessionException: User not authenticated or session expired. Call login() to open a new session</value></member><member>
<name>faultCode</name><value><int>0</int></value></member>
</struct></value></fault>
</methodResponse>
*/
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	var faultRegExp = /<member><name>faultString<\/name><value>([^<]*)<\/value>/mg;
	faultRegExp.lastIndex = 0;
	var match = faultRegExp.exec(responseText);
	if(match) {
		context.status = false;
		context.statusText = match[1].replace(/&#32;/mg,' ');
		//#console.log('err:'+context.statusText);
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

//# placeholder, not complete
/*ConfluenceAdaptor.prototype.deleteTiddler = function(title,context,userParams,callback)
{
console.log('deleteTiddler:'+tiddler.title);
	context = this.setContext(context,userParams,callback);
	context.title = title;
	var tiddler = store.getTiddler(title);
	context.host = context.host||this.fullHostName(tiddler.fields['server.host']);
	context.workspace = context.workspace||tiddler.fields['server.workspace'];
	return this.complete(context,ConfluenceAdaptor.deleteTiddlerComplete);
};*/

ConfluenceAdaptor.deleteTiddlerComplete = function(context)
{
//#console.log('ConfluenceAdaptor.deleteTiddlerComplete:'+context.title);

//#putPage(utf8 page,utf8 content,struct attributes )
	var fn = 'confluence1.removePage';
	var uriTemplate = '%0/rpc/xmlrpc';
	var host = context.host || context.adaptor.fullHostName(context.tiddler.fields['server.host']);
	var uri = uriTemplate.format([host]);
//#console.log('uri: '+uri);

	var fnParamsTemplate = '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	var fnParams = fnParamsTemplate.format([context.sessionToken,context.tiddler.fields['server.page.id']]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName><params>%1</params></methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log("payload:"+payload);

	var req = ConfluenceAdaptor.doHttpPOST(uri,ConfluenceAdaptor.deleteTiddlerCallback,context,null,payload);
//#console.log("req:"+req);
	return typeof req == 'string' ? req : true;
};

ConfluenceAdaptor.deleteTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('deleteTiddlerCallback:'+status);
//#console.log('rt:'+responseText);
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	var faultRegExp = /<member><name>faultString<\/name><value>([^<]*)<\/value>/mg;
	faultRegExp.lastIndex = 0;
	var match = faultRegExp.exec(responeseText);
	if(match) {
		context.status = false;
		context.statusText = match[1].replace(/&#32;/mg,' ');
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

config.adaptors[ConfluenceAdaptor.serverType] = ConfluenceAdaptor;
} // end of 'install only once'
//}}}
