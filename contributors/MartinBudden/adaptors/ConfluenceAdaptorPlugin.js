/***
|''Name:''|ConfluenceAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from Confluence Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#ConfluenceAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ConfluenceAdaptorPlugin.js |
|''Version:''|0.5.3|
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
//	return doHttp('POST',uri,data,'text/xml',username,password,callback,params,headers);
//	var req = doHttp('POST',uri,payload,'text/xml',null,null,ConfluenceAdaptor.loginCallback,context,null,true);
	return httpReq('POST',uri,callback,params,headers,data,'text/xml',null,null,true);
};

ConfluenceAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	return context;
};

ConfluenceAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

ConfluenceAdaptor.normalizedTitle = function(title)
{
	return title;
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
console.log('login:'+context.host);
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
console.log('loginPromptCallback');
	// for debug
	context.username = config.options.txtConfluenceUsername;
	context.password = config.options.txtConfluencePassword;
	var uriTemplate = '%0/rpc/xmlrpc';
	var uri = uriTemplate.format([context.host]);
//#console.log('uri: '+uri);

	var fn = 'confluence1.login';
	var fnParamsTemplate = '<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([context.username,context.password]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log('payload:'+payload);
//	var req = doHttp('POST',uri,payload,'text/xml',null,null,ConfluenceAdaptor.loginCallback,context,null,true);
	var req = ConfluenceAdaptor.doHttpPOST(uri,ConfluenceAdaptor.loginCallback,context,null,payload);
//#console.log('req:'+req);
	return typeof req == 'string' ? req : true;
};

ConfluenceAdaptor.loginCallback = function(status,context,responseText,url,xhr)
{
console.log('loginCallback:'+status);
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
				text = text.replace('<fault><fault><struct>','');
				text = text.replace('</fault></fault></struct>','');
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
console.log("openWorkspace:"+workspace);
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
console.log('getWorkspaceList');
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
console.log('getWorkspaceListComplete');
//# http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-Spaces

	var uriTemplate = '%0/rpc/xmlrpc';
	var uri = uriTemplate.format([context.host]);
//#console.log('uri: '+uri);

	var fn = 'confluence1.getSpaces';
	var fnParamsTemplate = '<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([context.sessionToken]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log("payload:"+payload);
	var req =doHttp('POST',uri,payload,'text/xml',null,null,ConfluenceAdaptor.getWorkspaceListCallback,context,null,true);
//#console.log("req:"+req);
};

ConfluenceAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
console.log('getWorkspaceListCallback:'+status);
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
console.log('getTiddlerList');
	context = this.setContext(context,userParams,callback);
	return this.complete(context,ConfluenceAdaptor.getTiddlerListComplete);
};

ConfluenceAdaptor.getTiddlerListComplete = function(context)
{
console.log('getTiddlerListComplete');
	var uriTemplate = '%0/rpc/xmlrpc';
	var uri = uriTemplate.format([context.host]);
//#console.log('uri: '+uri);

	var fn = 'confluence1.getPages';
	var fnParamsTemplate = '<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([context.sessionToken,context.workspace]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log("payload:"+payload);
	var req =doHttp('POST',uri,payload,'text/xml',null,null,ConfluenceAdaptor.getTiddlerListCallback,context);
//#console.log("req:"+req);
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
console.log('getTiddlerListCallback status:'+status);
//#console.log('rt:'+responseText);

//# returns an array of PageSummaries, see
//# http://confluence.atlassian.com/display/DOC/Remote+API+Specification#RemoteAPISpecification-PageSummary
	context.status = false;
	context.statusText = ConfluenceAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
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
			var list = [];
			var matchRegExp = /<name>title<\/name><value>([^<]*)<\/value>/mg;
			matchRegExp.lastIndex = 0;
			match = matchRegExp.exec(text);
			while(match) {
				var tiddler = new Tiddler(match[1]);
				context.tiddlers.push(tiddler);
				match = matchRegExp.exec(text);
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
/*
<?xml version="1.0"?><methodCall><methodName>confluence1.getPage</methodName><params>
<param><value><string>vYAsl59MC6</string></value></param>
<param><value><string>vYAsl59MC6</string></value></param>
<param><value><string>vYAsl59MC6</string></value></param>
</params></methodCall>
payload:<?xml version="1.0"?><methodCall><methodName>confluence1.getPage</methodName><params>
<param><value><string>3CF5Dlsp52</string></value></param>
<param><value><string></string></value></param>
<param><value><string>Home</string></value></param></params></methodCall>

payload:
<?xml version="1.0"?><methodCall><methodName>confluence1.getPage</methodName>
<params>
<param><value><string>i71zYxzY3o</string></value></param>
<param><value><string>MartinTest</string></value></param>
<param><value><string>Home</string></value></param>
</params></methodCall>

*/
ConfluenceAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
console.log('getTiddler:'+tiddler.title);
	if(context && userParams && userParams.getValue) {
		context = userParams.getValue("context");
	}
	context = this.setContext(context,userParams,callback);
	context.title = title;
	this.complete(context,ConfluenceAdaptor.getTiddlerComplete);
};
/*
rt:<?xml version="1.0"?><methodResponse><params><param><value><struct>
<member><name>id</name><value>54694264</value></member>
<member><name>content</name><value>*Welcome&#32;to&#32;_your_&#32;Confluence&#32;evaluation&#32;space.*&#13; &#13; Confluence&#32;makes&#32;it&#32;simple&#32;to&#32;edit,&#32;create&#32;and&#32;share&#32;content&#32;with&#32;your&#32;colleagues.&#13; &#13; Why&#32;not&#32;start&#32;by&#32;editing&#32;this&#32;page&#32;itself?&#32;It's&#32;yours&#32;to&#32;customise!&#13; &#13; !home.gif|align=center!&#13; &#13; h4.&#32;Looking&#32;for&#32;more&#32;information?&#13; &#13; *&#32;The&#32;[Evaluation&#32;Resources|http://confluence.atlassian.com/display/CSH/Confluence+Hosted+Resources]&#32;page&#32;includes&#32;FAQ's&#32;and&#32;links&#32;to&#32;Confluence&#32;resources.&#13; *&#32;Our&#32;[Feature&#32;Tour|http://www.atlassian.com/software/confluence/features/]&#32;provides&#32;a&#32;great&#32;overview&#32;of&#32;Confluence's&#32;capabilities.&#13; *&#32;The&#32;[User&#32;Guide|http://confluence.atlassian.com/display/CONF20]&#32;explains&#32;how&#32;to&#32;use&#32;Confluence's&#32;features&#32;in&#32;detail.&#13; *&#32;[See|http://confluence.atlassian.com/display/DISC/Powered+by+Confluence]&#32;what&#32;others&#32;are&#32;doing&#32;with&#32;Confluence.&#13; &#13; Questions?&#32;Comments?&#32;[We're&#32;here&#32;to&#32;help!|http://www.atlassian.com/about/contactform.jsp]&#13; </value></member>
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
</struct></value></param></params></methodResponse>
*/
ConfluenceAdaptor.getTiddlerComplete = function(context)
{
console.log('ConfluenceAdaptor.getTiddler:'+context.title);
	var uriTemplate = '%0/rpc/xmlrpc';
	var uri = uriTemplate.format([context.host]);
//#console.log('uri:'+uri);


	var fn = 'confluence1.getPage';
	var fnParamsTemplate = '<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '<param><value><string>%2</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([context.sessionToken,context.workspace,context.title]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log("payload:"+payload);

	context.tiddler = new Tiddler(context.title);
	context.tiddler.fields.wikiformat = 'confluence';
	context.tiddler.fields['server.host'] = ConfluenceAdaptor.minHostName(context.host);
	context.tiddler.fields['server.workspace'] = context.workspace;
	var req = doHttp('POST',uri,payload,'text/xml',null,null,ConfluenceAdaptor.getTiddlerCallback,context);
//#console.log("req:"+req);
	return typeof req == 'string' ? req : true;
};

ConfluenceAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
console.log('getTiddlerCallback status:'+status);
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
/*		matchRegExp = /<name>modified<\/name><value>([^<]*)<\/value>/mg;
		matchRegExp.lastIndex = 0;
		match = matchRegExp.exec(text);
		if(match) {
			context.tiddler.modified = match[1];
		}*/
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
console.log('putTiddler:'+tiddler.title);
	context = this.setContext(context,userParams,callback);
	context.tiddler = tiddler;
	context.title = tiddler.title;
	return this.complete(context,ConfluenceAdaptor.putTiddlerComplete);
};

ConfluenceAdaptor.putTiddlerComplete = function(context)
{
//#console.log('ConfluenceAdaptor.putTiddlerComplete:'+tiddler.title);

//#putPage(utf8 page,utf8 content,struct attributes )
	var fn = 'confluence1.storePage';
	var uriTemplate = '%0/rpc/xmlrpc';
	var host = context.host || this.fullHostName(context.tiddler.fields['server.host']);
	var uri = uriTemplate.format([host]);
//#console.log('uri: '+uri);

	var fnParamsTemplate ='<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '<param><value><string>%1</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([tiddler.title,tiddler.text]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log("payload:"+payload);

	var req = doHttp('POST',uri,payload,'text/xml',null,null,ConfluenceAdaptor.putTiddlerCallback,tiddler);
//#console.log("req:"+req);
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

//# placeholder, not complete
/*ConfluenceAdaptor.prototype.deleteTiddler = function(tiddler,context,userParams,callback)
{
console.log('deleteTiddler:'+tiddler.title);
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	return this.complete(context,MediaWikiAdaptor.deleteTiddlerComplete);
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

	var fnParamsTemplate ='<params>';
	fnParamsTemplate += '<param><value><string>%0</string></value></param>';
	fnParamsTemplate += '</params>';
	var fnParams = fnParamsTemplate.format([context.tiddler.fields['server.page.id']]);
	var fnTemplate = '<?xml version="1.0"?><methodCall><methodName>%0</methodName>%1</methodCall>';
	var payload = fnTemplate.format([fn,fnParams]);
//#console.log("payload:"+payload);

	var req = doHttp('POST',uri,payload,'text/xml',null,null,ConfluenceAdaptor.deleteTiddlerCallback);
//#console.log("req:"+req);
	return typeof req == 'string' ? req : true;
};

ConfluenceAdaptor.deleteTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#console.log('deleteTiddlerCallback:'+status);
//#console.log('rt:'+responseText.substr(0,50));
//#console.log('xhr:'+xhr);
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};



config.adaptors[ConfluenceAdaptor.serverType] = ConfluenceAdaptor;
} // end of 'install only once'
//}}}
