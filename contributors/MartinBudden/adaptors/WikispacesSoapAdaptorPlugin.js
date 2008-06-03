/***
|''Name:''|WikispacesSoapAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data from Wikispaces|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#WikispacesSoapAdaptorPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/WikispacesSoapAdaptorPlugin.js |
|''Version:''|0.1.1|
|''Date:''|Feb 15, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.3.0|


''For debug:''
|''Default Wikispaces username''|<<option txtWikispacesUsername>>|
|''Default Wikispaces password''|<<option txtWikispacesPassword>>|

***/
//{{{
// For debug:
if(!config.options.txtWikispacesUsername)
	{config.options.txtWikispacesUsername = '';}
if(!config.options.txtWikispacesPassword)
	{config.options.txtWikispacesPassword = '';}
//}}}

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.WikispacesSoapAdaptorPlugin) {
version.extensions.WikispacesSoapAdaptorPlugin = {installed:true};

fnLog = function(text)
{
//	if(window.console) console.log(text.substr(0,80)); else displayMessage(text.substr(0,80));
};

function WikispacesSoapAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

WikispacesSoapAdaptor.mimeType = 'text/plain';
WikispacesSoapAdaptor.serverType = 'wikispaces'; // MUST BE LOWER CASE
WikispacesSoapAdaptor.serverParsingErrorMessage = "Error parsing result from server";
WikispacesSoapAdaptor.errorInFunctionMessage = "Error in function WikispacesSoapAdaptor.%0";
WikispacesSoapAdaptor.tiddlerNotFoundMessage = "Tiddler %0 not found";
WikispacesSoapAdaptor.createdWithTiddlyWikiMessage = "Created with TiddlyWiki";

WikispacesSoapAdaptor.soapTemplate = '<?xml version=\"1.0\" encoding="utf-8"?>' +
	'<soap:Envelope ' +
	'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
	'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
	'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
	'<soap:Body>' +
	'<%0 xmlns="%1">%2</%0>' +
	'</soap:Body></soap:Envelope>';

WikispacesSoapAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = WikispacesSoapAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	if(!context.workspaceId)
		context.workspaceId = this.workspaceId;
	if(!context.sessionToken)
		context.sessionToken = this.sessionToken;
	return context;
};

WikispacesSoapAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	host = host.trim();
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(host.length-1) != '/')
		host = host + '/';
	return host;
};

WikispacesSoapAdaptor.SoapUri = function(context,uriTemplate)
{
	return uriTemplate.format([WikispacesSoapAdaptor.fullHostName(context.host)]);
};

WikispacesSoapAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a unix timestamp into a JavaScript Date object
WikispacesSoapAdaptor.dateFromTimestamp = function(timestamp)
{
	var dt = new Date();
	dt.setTime(timestamp*1000);
	return dt;
};

WikispacesSoapAdaptor.prototype.complete = function(context,fn)
{
	context.complete = fn;
	if(context.sessionToken) {
		var ret = context.complete(context,context.userParams);
	} else {
		ret = this.login(context);
	}
	return ret;
};

WikispacesSoapAdaptor.prototype.login = function(context)
{
fnLog('login:'+context.host);
	if(config.options.txtWikispacesUsername && config.options.txtWikispacesPassword) {
		context.username = config.options.txtWikispacesUsername;
		context.password = config.options.txtWikispacesPassword;
		WikispacesSoapAdaptor.loginPromptCallback(context);
	} else if(context.loginPromptFn) {
		context.loginPromptCallback = WikispacesSoapAdaptor.loginPromptCallback;
		context.loginPromptFn(context);
	} else {
		return false;
	}
	return true;
};

WikispacesSoapAdaptor.loginPromptCallback = function(context)
{
fnLog('loginPromptCallback');
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0site/api');
//#fnLog('uri:'+uri);
	var pl = new SOAPClientParameters();
	config.options.txtWikispacesUsername = context.username;
	config.options.txtWikispacesPassword = context.password;
	pl.add('username',context.username);
	pl.add('password',context.password);
	SOAPClient.invoke(uri,'login',pl,true,WikispacesSoapAdaptor.loginCallback,context);
	return true;
};

WikispacesSoapAdaptor.loginCallback = function(r,x,context)//status,context,responseText,url,xhr)
{
	context.status = r instanceof Error ? false : true;
fnLog('loginCallback:'+status);
	if(context.status) {
		context.sessionToken = r;
		context.adaptor.sessionToken = r;
		if(context.complete)
			context.complete(context,context.userParams);
	} else {
		context.statusText = "Error at login";
		if(context.callback)
			context.callback(context,context.userParams);
	}
};

WikispacesSoapAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
fnLog('openHost:'+host);
	this.host = WikispacesSoapAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

WikispacesSoapAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
fnLog('openWorkspace:'+workspace);
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	context.workspace = workspace;
	return this.complete(context,WikispacesSoapAdaptor.openWorkspaceComplete);
};

WikispacesSoapAdaptor.openWorkspaceComplete = function(context,userParams)
{
fnLog('openWorkspaceComplete');
//# http://www.wikispaces.com/space/api?wsdl
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0space/api');
//#fnLog('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('name',context.workspace);
	SOAPClient.invoke(uri,'getSpace',pl,true,WikispacesSoapAdaptor.openWorkspaceCallback,context);
	return true;
};

WikispacesSoapAdaptor.openWorkspaceCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
	var status = r instanceof Error ? false : true;
fnLog('openWorkspaceCallback:'+status);
	context.status = false;
	function gev(p,i,n) {
		try {
			return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
		} catch(ex) {
		}
		return null;
	}
	if(status) {
		try {
			var p = x.getElementsByTagName('space');
			context.workspaceId = gev(p,0,'id');
			context.adaptor.workspaceId = context.workspaceId;
//#fnLog("workspaceId:"+context.workspaceId);
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
	} else {
		context.statusText = WikispacesSoapAdaptor.errorInFunctionMessage.format(['openWorkspaceCallback']);
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesSoapAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
fnLog('getWorkspaceList');
	context = this.setContext(context,userParams,callback);
	var workspace = userParams ? userParams.getValue("feedWorkspace") : context.workspace;//!! kludge until core fixed
	var list = [];
	list.push({title:workspace,name:workspace});
	context.workspace = workspace;
	context.workspaces = list;
	return this.complete(context,WikispacesSoapAdaptor.getWorkspaceListComplete);
};

WikispacesSoapAdaptor.getWorkspaceListComplete = function(context,userParams)
{
fnLog('getWorkspaceListComplete');
//# http://www.wikispaces.com/space/api?wsdl
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0space/api');
//#fnLog('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('name',context.workspaces[0].name);
	SOAPClient.invoke(uri,'getSpace',pl,true,WikispacesSoapAdaptor.getWorkspaceListCallback,context);
	return true;
};

WikispacesSoapAdaptor.getWorkspaceListCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
	var status = r instanceof Error ? false : true;
fnLog('getWorkspaceListCallback:'+status);
	context.status = false;
	function gev(p,i,n) {
		try {
			return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
		} catch(ex) {
		}
		return null;
	}
	if(status) {
		try {
			var p = x.getElementsByTagName('space');
			context.workspaceId = gev(p,0,'id');
			context.adaptor.workspaceId = context.workspaceId;
//#fnLog("workspaceId:"+context.workspaceId);
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
	} else {
		context.statusText = WikispacesSoapAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesSoapAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
fnLog('getTiddlerList');
	context = this.setContext(context,userParams,callback);
	return this.complete(context,WikispacesSoapAdaptor.getTiddlerListComplete);
};

WikispacesSoapAdaptor.getTiddlerListComplete = function(context,userParams)
{
fnLog('getTiddlerListComplete');
// http://www.wikispaces.com/page/api?wsdl
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0page/api');
fnLog('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('spaceId',context.workspaceId);
	SOAPClient.invoke(uri,'listPages',pl,true,WikispacesSoapAdaptor.getTiddlerListCallback,context);
	return true;
};

WikispacesSoapAdaptor.getTiddlerListCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
	var status = r instanceof Error ? false : true;
fnLog('getTiddlerListCallback:'+status);
	context.status = false;
	context.statusText = WikispacesSoapAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	function gev(p,i,n) {
		return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
	}
	if(status) {
		try {
// /envelope/body/listpagesresponse/pagelist/page[0]/name
			var list = [];
			var p = x.getElementsByTagName('page');
			for(var i = 0;i<p.length;i++) {
				var title = gev(p,i,'name');
				//#fnLog(title);
				if(title.indexOf('._')!=0 && !store.isShadowTiddler(title)) {
					var tiddler = new Tiddler(title);
					//tiddler.modifier = gev();
					/*
					// seems like Wikispaces have changed what is returned, so this does not work anymore
					tiddler.text = gev(p,i,'content');
					*/
					tiddler.tags = '';
					tiddler.modified = WikispacesSoapAdaptor.dateFromTimestamp(gev(p,i,'date_created'));
					tiddler.fields['server.modifier.id'] = gev(p,i,'user_created');
					tiddler.fields['server.page.id'] = gev(p,i,'id');
					tiddler.fields['server.page.revision'] = gev(p,i,'versionId');
					tiddler.fields['server.workspace'] = context.workspace;
					tiddler.fields['server.workspaceid'] = gev(p,i,'spaceId');
					tiddler.fields.wikiformat = 'wikispaces';
					tiddler.fields['server.host'] = WikispacesSoapAdaptor.minHostName(context.host);
					list.push(tiddler);
				}
			}
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}

		context.tiddlers = list;
		//context.adaptor.tiddlers = list;
		context.status = true;
		context.statusText = null;
	} else {
		context.statusText = '%0:%1 - %2%3'.format([r.name,r.message,r.fileName,r.lineNumber]);
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesSoapAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : WikispacesSoapAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	uriTemplate = '%0%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

WikispacesSoapAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
//#fnLog('getTiddlerRevision:'+title);
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

WikispacesSoapAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
fnLog('getTiddler:'+title);
	context = this.setContext(context,userParams,callback);
	if(context.adaptor.tiddlers && !context.revision) {
		var i = context.adaptor.tiddlers.findByField('title',title);
		if(i!=-1) {
			///#fnLog('using cached tiddlers');
			context.tiddler = context.adaptor.tiddlers[i];
			context.tiddler.fields = context.adaptor.tiddlers[i].fields;
			context.status = true;
			window.setTimeout(function() {callback(context,userParams);},0);
			return true;
		}
	}

	if(!context.workspaceId) {
		var tiddler = store.fetchTiddler(title);
		if(tiddler)
			context.workspaceId = tiddler.fields['server.workspaceid'];
	}
	context.tiddler = new Tiddler(title);
	context.tiddler.fields.wikiformat = 'wikispaces';
	context.tiddler.fields['server.type'] = WikispacesSoapAdaptor.serverType;
	context.tiddler.fields['server.host'] = WikispacesSoapAdaptor.minHostName(context.host);

	return this.complete(context,context.revision ? WikispacesSoapAdaptor.getTiddlerRevisionComplete : WikispacesSoapAdaptor.getTiddlerComplete);
};

WikispacesSoapAdaptor.getTiddlerComplete = function(context,userParams)
{
fnLog('getTiddlerComplete:'+context.tiddler.title);
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0page/api');
fnLog('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('spaceId',context.workspaceId);
	pl.add('name',context.tiddler.title);
	SOAPClient.invoke(uri,'getPage',pl,true,WikispacesSoapAdaptor.getTiddlerCallback,context);
	return true;
};

WikispacesSoapAdaptor.getTiddlerRevisionComplete = function(context,userParams)
{
fnLog('getTiddlerRevisionComplete:'+context.tiddler.title);
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0page/api');
fnLog('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('spaceId',context.workspaceId);
	pl.add('name',context.tiddler.title);
	pl.add('version',context.revision);
	SOAPClient.invoke(uri,'getPageWithVersion',pl,true,WikispacesSoapAdaptor.getTiddlerCallback,context);
	return true;
};

WikispacesSoapAdaptor.getTiddlerCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
fnLog('getTiddlerCallback:'+context.tiddler.title);
//#console.log(x);
	var status = r instanceof Error ? false : true;
	context.status = false;
	context.statusText = WikispacesSoapAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	function gev(p,i,n) {
		try {
			return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
		} catch(ex) {
		}
		return null;
	}
	if(status) {
		try {
			var p = x.getElementsByTagName('page');
			//#console.log("page");
			//#console.log(p[0].getElementsByTagName('content')[0].childNodes);
			//#console.log(p[0].getElementsByTagName('content')[0].childNodes.length);
			var tiddler = context.tiddler;
			tiddler.tags = ['page'];
			tiddler.text = "";
			var contentNodes = p[0].getElementsByTagName('content')[0].childNodes;
			for(var i=0;i<contentNodes.length;i++) {
				tiddler.text += contentNodes[i].nodeValue;
			}
			i = 0;
			tiddler.modified = WikispacesSoapAdaptor.dateFromTimestamp(gev(p,i,'date_created'));
			tiddler.fields['server.modifier.id'] = gev(p,i,'user_created');
			tiddler.fields['server.page.id'] = gev(p,i,'id');
			tiddler.fields['server.page.revision'] = gev(p,i,'versionId');
			tiddler.fields['server.workspace'] = context.workspace;
			tiddler.fields['server.workspaceid'] = gev(p,i,'spaceId');
			//tiddler.fields.wikiformat = 'wikispaces';
			//tiddler.fields['server.host'] = WikispacesSoapAdaptor.minHostName(context.host);
//#fnLog("fields");
//#fnLog(tiddler.fields);
			context.tiddler = tiddler;
		} catch(ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
		context.statusText = null;
	} else {
		context.statusText = '%0:%1 - %2 (line:%3)'.format([r.name,r.message,r.fileName,r.lineNumber]);
		//#fnLog('gtc:'+context.statusText);
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesSoapAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;
	return this.complete(context,WikispacesSoapAdaptor.getTiddlerRevisionListComplete);
};

WikispacesSoapAdaptor.getTiddlerRevisionListComplete = function(context,userParams)
{
//#fnLog('getTiddlerRevisionListComplete');
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0page/api');
//#fnLog('uri:'+uri);
	if(!context.workspaceId) {
		var tiddler = store.fetchTiddler(context.title);
		if(tiddler)
			context.workspaceId = tiddler.fields['server.workspaceid'];
	}
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('spaceId',context.workspaceId);
	pl.add('name',context.title);
	SOAPClient.invoke(uri,'listPageVersions',pl,true,WikispacesSoapAdaptor.getTiddlerRevisionListCallback,context);
	return true;
};

WikispacesSoapAdaptor.getTiddlerRevisionListCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
//#fnLog('getTiddlerRevisionListCallback');
	var status = r instanceof Error ? false : true;
	context.status = false;
	function gev(p,i,n) {
		try {
			return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
		} catch(ex) {
		}
		return null;
	}
	if(status) {
		var content = null;
		try {
			var p = x.getElementsByTagName('page');
			var list = [];
			for(var i = 0;i<p.length;i++) {
				var title = gev(p,i,'name');
				var tiddler = new Tiddler(title);
				tiddler.modified = WikispacesSoapAdaptor.dateFromTimestamp(gev(p,i,'date_created'));
				tiddler.fields['server.modifier.id'] = gev(p,i,'user_created');
				tiddler.fields['server.page.id'] = gev(p,i,'id');
				tiddler.fields['server.page.revision'] = gev(p,i,'versionId');
				tiddler.fields['server.workspace'] = context.workspace;
				tiddler.fields['server.workspaceid'] = gev(p,i,'spaceId');
				tiddler.fields.wikiformat = 'wikispaces';
				tiddler.fields['server.type'] = WikispacesSoapAdaptor.serverType;
				tiddler.fields['server.host'] = WikispacesSoapAdaptor.minHostName(context.host);
				list.push(tiddler);
			}
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		var sortField = 'server.page.revision';
		list.sort(function(a,b) {return a.fields[sortField] < b.fields[sortField] ? +1 : (a.fields[sortField] == b.fields[sortField] ? 0 : -1);});
		context.revisions = list;
		context.status = true;
	} else {
		context.statusText = '%0:%1 - %2 (line:%3)'.format([r.name,r.message,r.fileName,r.lineNumber]);
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesSoapAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
fnLog('putTiddler:'+tiddler.title);
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	context.tiddler = tiddler;
	return this.complete(context,WikispacesSoapAdaptor.createTiddlerComplete);
};

WikispacesSoapAdaptor.createTiddlerComplete = function(context,userParams)
{
fnLog('createTiddlerComplete');
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0page/api');
//#fnLog('uri:'+uri);
	var t = context.tiddler;
	context.workspaceId = t.fields['server.workspaceid'];
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('spaceId',t.fields['server.workspaceid']);
	pl.add('name',t.title);
	pl.add('content',t.text);
	pl.add('comment',WikispacesSoapAdaptor.createdWithTiddlyWikiMessage);
	SOAPClient.invoke(uri,'createPage',pl,true,WikispacesSoapAdaptor.createTiddlerCallback,context);
	return true;
};

WikispacesSoapAdaptor.createTiddlerCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
fnLog('createTiddlerCallback');
	var status = r instanceof Error ? false : true;
	function gev(p,i,n) {
		try {
			return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
		} catch(ex) {
		}
		return null;
	}
	context.status = status;
	if(status) {
		WikispacesSoapAdaptor.getTiddlerComplete(context,context.userParams);
		return;
	}
	WikispacesSoapAdaptor.updateTiddlerComplete(context,context.userParams);
};

WikispacesSoapAdaptor.updateTiddlerComplete = function(context,userParams)
{
fnLog('updateTiddlerComplete');
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0page/api');
//#fnLog('uri:'+uri);
	var t = context.tiddler;
	var page = {id:t.fields['server.workspaceid'],versionId:'',name:t.title,spaceId:t.fields['server.workspaceid'],
		latest_version:'',versions:'',is_read_only:false,html:'',date_created:'',//t.modified,
		comment:'',content:t.text,user_created:t.fields['server.modifier.id']};	
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('spaceId',t.fields['server.workspaceid']);
	pl.add('page',page);
	SOAPClient.invoke(uri,'updatePage',pl,true,WikispacesSoapAdaptor.updateTiddlerCallback,context);
	return true;
};

WikispacesSoapAdaptor.updateTiddlerCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
	var status = r instanceof Error ? false : true;
fnLog('updateTiddlerCallback:'+status);
	context.status = status;
	if(!status) {
		context.statusText = '%0:%1 - %2%3'.format([r.name,r.message,r.fileName,r.lineNumber]);
		//#fnLog(context.statusText);
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesSoapAdaptor.prototype.close = function()
{
	return true;
};

// Wikispaces specific Message hanlding follows:

WikispacesSoapAdaptor.prototype.getTopicList = function(title,context,userParams,callback)
{
fnLog('getTopicList:'+title);
	context = this.setContext(context,userParams,callback);
	var tiddler = store.getTiddler(title);
	if(tiddler) {
		context.pageId = tiddler.fields['server.page.id'];
		context.parentTitle = title;
		return this.complete(context,WikispacesSoapAdaptor.getTopicListComplete);
	} else {
		context.status = false;
		context.statusText = WikispacesSoapAdaptor.tiddlerNotFoundMessage.format([title]);
		if(context.callback)
			context.callback(context,context.userParams);
	}
	return true;
};

WikispacesSoapAdaptor.getTopicListComplete = function(context,userParams)
{
fnLog('getTopicListComplete');
// http://www.wikispaces.com/message/api?wsdl
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0message/api');
//#fnLog('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('pageId',context.pageId);
	SOAPClient.invoke(uri,'listTopics',pl,true,WikispacesSoapAdaptor.getTopicListCallback,context);
	return true;
};

WikispacesSoapAdaptor.getTopicListCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
	var status = r instanceof Error ? false : true;
fnLog('getTopicListCallback:'+status);
	context.status = false;
	context.statusText = WikispacesSoapAdaptor.errorInFunctionMessage.format(['getTopicListCallback']);
	function gev(p,i,n) {
		return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
	}
	if(status) {
		try {
			var list = [];
			var p = x.getElementsByTagName('message');
			for(var i = 0;i<p.length;i++) {
				var id = String(gev(p,i,'id'));
				var subject = gev(p,i,'subject');
				var title = '_topic:' + id + ' parent:' + context.parentTitle+' Subject:' + subject;
				//var title = gev(p,i,'subject');
				if(title.indexOf('._')!=0 && !store.isShadowTiddler(title)) {
					var tiddler = new Tiddler(title);
					tiddler.text = gev(p,i,'body');
					tiddler.fields['server.id'] = id;
					tiddler.fields['server.subject'] = subject;
					tiddler.fields['server.page_id'] = gev(p,i,'page_id');
					tiddler.fields['server.topic_id'] = gev(p,i,'topic_id');
					tiddler.fields['server.responses'] = gev(p,i,'responses');
					tiddler.modified = WikispacesSoapAdaptor.dateFromTimestamp(gev(p,i,'date_created'));
					tiddler.fields['server.modifier.id'] = gev(p,i,'user_created');
					tiddler.fields.wikiformat = 'wikispaces';
					tiddler.fields['server.type'] = WikispacesSoapAdaptor.serverType;
					tiddler.fields['server.host'] = WikispacesSoapAdaptor.minHostName(context.host);
					tiddler.tags = ["topic"];
					list.push(tiddler);
				}
			}
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.topics = list;
		context.status = true;
		context.statusText = null;
	} else {
		context.statusText = '%0:%1 - %2%3'.format([r.name,r.message,r.fileName,r.lineNumber]);
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesSoapAdaptor.prototype.getMessageList = function(topicId,context,userParams,callback)
{
fnLog('getMessageList:'+topicId);
	context = this.setContext(context,userParams,callback);
	context.topicId = topicId;
	return this.complete(context,WikispacesSoapAdaptor.getMessageListComplete);
};

WikispacesSoapAdaptor.getMessageListComplete = function(context,userParams)
{
fnLog('getMessageListComplete');
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0message/api');
//#fnLog('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('topicId',context.topicId);
	SOAPClient.invoke(uri,'listMessagesInTopic',pl,true,WikispacesSoapAdaptor.getMessageListCallback,context);
	return true;
};

WikispacesSoapAdaptor.getMessageListCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
	var status = r instanceof Error ? false : true;
fnLog('getMessageListCallback:'+status);
	context.statusText = WikispacesSoapAdaptor.errorInFunctionMessage.format(['getMessageListCallback']);
	function gev(p,i,n) {
		return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
	}
	if(status) {
		try {
			var list = [];
			var p = x.getElementsByTagName('message');
			for(var i = 0;i<p.length;i++) {
				var id = String(gev(p,i,'id'));
				var subject = gev(p,i,'subject');
				var title = '_message:' + id + ' parent:' + context.parentTitle+' Subject:' + subject;
				//var title = '_message:' + String(gev(p,i,'id')) + ' Subject:' + gev(p,i,'subject');
				fnLog("msg:"+title);
				//var title = gev(p,i,'subject');
				if(title.indexOf('._')!=0 && !store.isShadowTiddler(title)) {
					var responses = gev(p,i,'responses');
					if(responses==0) {// if responses is non-zero then this is a topic
						var tiddler = new Tiddler(title);
						tiddler.text = gev(p,i,'body');
						tiddler.fields['server.id'] = id;
						tiddler.fields['server.subject'] = subject;
						tiddler.fields['server.page_id'] = gev(p,i,'page_id');
						tiddler.fields['server.topic_id'] = gev(p,i,'topic_id');
						tiddler.fields['server.responses'] = responses;
						tiddler.modified = WikispacesSoapAdaptor.dateFromTimestamp(gev(p,i,'date_created'));
						tiddler.fields['server.modifier.id'] = gev(p,i,'user_created');
						tiddler.fields.wikiformat = 'wikispaces';
						tiddler.fields['server.type'] = WikispacesSoapAdaptor.serverType;
						tiddler.fields['server.host'] = WikispacesSoapAdaptor.minHostName(context.host);
						tiddler.fields['server.message_index'] = String(i);
						tiddler.tags = ["message"];
						list.push(tiddler);
					}
				}
			}
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.messages = list;
		context.status = true;
		context.statusText = null;
	} else {
		context.statusText = '%0:%1 - %2%3'.format([r.name,r.message,r.fileName,r.lineNumber]);
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

config.adaptors[WikispacesSoapAdaptor.serverType] = WikispacesSoapAdaptor;
} //# end of 'install only once'
//}}}
