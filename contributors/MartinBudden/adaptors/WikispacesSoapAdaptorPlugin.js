/***
|''Name:''|WikispacesSoapAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data from Wikispaces|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#WikispacesSoapAdaptorPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/WikispacesSoapAdaptorPlugin.js |
|''Version:''|0.0.5|
|''Date:''|Feb 15, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
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
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(host.length-1) != '/')
		host = host + '/';
	return host;
};

WikispacesSoapAdaptor.SoapUri = function(context,uriTemplate)
{
	return uriTemplate.format(['http://'+context.workspace+'.'+WikispacesSoapAdaptor.minHostName(context.host)]);
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
console.log('login:'+context.host);
// http://www.wikispaces.com/site/api?wsdl
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0/site/api');
//#console.log('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('username',config.options.txtWikispacesUsername);
	pl.add('password',config.options.txtWikispacesPassword);
	SOAPClient.invoke(uri,'login',pl,true,WikispacesSoapAdaptor.loginCallback,context);
};

WikispacesSoapAdaptor.loginCallback = function(r,x,context)//status,context,responseText,url,xhr)
{
console.log('loginCallback');
	if(r instanceof Error) {
		context.status = false;
		context.statusText = "Error at login";
	} else {
		context.status = true;
		context.sessionToken = r;
		context.adaptor.sessionToken = r;
	}
	if(context.complete)
		context.complete(context,context.userParams);
};

WikispacesSoapAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
console.log('openHost:'+host);
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
console.log('openWorkspace:'+workspace);
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

WikispacesSoapAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
console.log('getWorkspaceList');
	context = this.setContext(context,userParams,callback);
	var workspace = userParams.getValue("feedWorkspace");//!! kludge until core fixed
	var list = [];
	list.push({title:workspace,name:workspace});
	context.workspace = workspace;
	context.workspaces = list;
	return this.complete(context,WikispacesSoapAdaptor.getWorkspaceListComplete);
};

WikispacesSoapAdaptor.getWorkspaceListComplete = function(context,userParams)
{
console.log('getWorkspaceListComplete');
// http://www.wikispaces.com/space/api?wsdl
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0/space/api');
//#console.log('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('name',context.workspaces[0].name);
	SOAPClient.invoke(uri,'getSpace',pl,true,WikispacesSoapAdaptor.getWorkspaceListCallback,context);
};

WikispacesSoapAdaptor.getWorkspaceListCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
console.log('getWorkspaceListCallback');
//console.log(r);
//console.log(x);
	var status = r instanceof Error ? false : true;
	context.status = false;
	function gev(p,i,n) {
		return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
	}
	if(status) {
		try {
			var p = x.getElementsByTagName('space');
			context.workspaceId = gev(p,0,'id');
			context.adaptor.workspaceId = context.workspaceId;
//#console.log("workspaceId:"+context.workspaceId);
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
			console.log(console.statusText);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
	} else {
		context.statusText = WikispacesSoapAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
		//context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesSoapAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
console.log('getTiddlerList');
	context = this.setContext(context,userParams,callback);
	return this.complete(context,WikispacesSoapAdaptor.getTiddlerListComplete);
};

WikispacesSoapAdaptor.getTiddlerListComplete = function(context,userParams)
{
console.log('getTiddlerListComplete');
// http://www.wikispaces.com/page/api?wsdl
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0/page/api');
//#console.log('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('spaceId',context.workspaceId);
	SOAPClient.invoke(uri,'listPages',pl,true,WikispacesSoapAdaptor.getTiddlerListCallback,context);
};

WikispacesSoapAdaptor.getTiddlerListCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
console.log('getTiddlerListCallback');
	var status = r instanceof Error ? false : true;
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
			//console.log(p);
			for(var i = 0;i<p.length;i++) {
				//#console.log(p[i]);
				var title = gev(p,i,'name');
				if(title.indexOf('._')!=0 && !store.isShadowTiddler(title)) {
					var tiddler = new Tiddler(title);
					//tiddler.modifier = gev();
					tiddler.tags = '';
					tiddler.text = gev(p,i,'content');
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
		context.adaptor.tiddlers = list;
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
// !!TODO set the uriTemplate
	uriTemplate = '%0%1%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

WikispacesSoapAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
console.log('getTiddlerRevision:'+title);
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

WikispacesSoapAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
console.log('getTiddler:'+title);
	context = this.setContext(context,userParams,callback);
	if(context.adaptor.tiddlers && !context.revision) {
		var i = context.adaptor.tiddlers.findByField('title',title);
		if(i!=-1) {
			///#console.log('using cached tiddlers');
			context.tiddler = context.adaptor.tiddlers[i];
			context.tiddler.fields = context.adaptor.tiddlers[i].fields;
			context.status = true;
			window.setTimeout(function() {callback(context,userParams);},0);
			return;
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
console.log('getTiddlerComplete:'+context.tiddler.title);
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0/page/api');
//#console.log('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('spaceId',context.workspaceId);
	pl.add('name',context.tiddler.title);
	SOAPClient.invoke(uri,'getPage',pl,true,WikispacesSoapAdaptor.getTiddlerCallback,context);
};

WikispacesSoapAdaptor.getTiddlerRevisionComplete = function(context,userParams)
{
console.log('getTiddlerRevisionComplete:'+context.tiddler.title);
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0/page/api');
//#console.log('uri:'+uri);
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('spaceId',context.workspaceId);
	pl.add('name',context.tiddler.title);
	pl.add('version',context.revision);
	SOAPClient.invoke(uri,'getPageWithVersion',pl,true,WikispacesSoapAdaptor.getTiddlerCallback,context);
};

WikispacesSoapAdaptor.getTiddlerCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
console.log('getTiddlerCallback:'+context.tiddler.title);
	var status = r instanceof Error ? false : true;
	context.status = false;
	context.statusText = WikispacesSoapAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	function gev(p,i,n) {
		return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
	}
	if(status) {
		try {
			var p = x.getElementsByTagName('page');
			var i = 0;
			var tiddler = context.tiddler;
			tiddler.tags = '';
			tiddler.text = gev(p,i,'content');
			tiddler.modified = WikispacesSoapAdaptor.dateFromTimestamp(gev(p,i,'date_created'));
			tiddler.fields['server.modifier.id'] = gev(p,i,'user_created');
			tiddler.fields['server.page.id'] = gev(p,i,'id');
			tiddler.fields['server.page.revision'] = gev(p,i,'versionId');
			tiddler.fields['server.workspace'] = context.workspace;
			tiddler.fields['server.workspaceid'] = gev(p,i,'spaceId');
			tiddler.fields.wikiformat = 'wikispaces';
			tiddler.fields['server.host'] = WikispacesSoapAdaptor.minHostName(context.host);
			context.tiddler = tiddler;
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesSoapAdaptor.serverParsingErrorMessage);
			console.log(statusText);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
		context.statusText = null;
	} else {
		context.statusText = '%0:%1 - %2%3'.format([r.name,r.message,r.fileName,r.lineNumber]);
		console.log('gtc:'+context.statusText);
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
console.log('getTiddlerRevisionListComplete');
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0/page/api');
//#console.log('uri:'+uri);
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
};

WikispacesSoapAdaptor.getTiddlerRevisionListCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
console.log('getTiddlerRevisionListCallback');
	var status = r instanceof Error ? false : true;
	context.status = false;
	function gev(p,i,n) {
		return p[i].getElementsByTagName(n)[0].childNodes[0].nodeValue;
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
		context.statusText = '%0:%1 - %2%3'.format([r.name,r.message,r.fileName,r.lineNumber]);
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesSoapAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
//#console.log('putTiddler:'+tiddler.title);
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	context.tiddler = tiddler;
	return this.complete(context,WikispacesSoapAdaptor.putTiddlerComplete);
};

WikispacesSoapAdaptor.putTiddlerComplete = function(context,userParams)
{
//#console.log('putTiddlerComplete');
	var uri = WikispacesSoapAdaptor.SoapUri(context,'%0/page/api');
//#console.log('uri:'+uri);
	var t = context.tiddler;
	//var page = {id,versionId,name,spaceId,latest_version,versions,is_read_only,comment,content,html,date_created,user_created};
	var page = {id:t.fields['server.workspaceid'],versionId:'',name:t.title,spaceId:t.fields['server.workspaceid'],
		latest_version:'',versions:'',is_read_only:false,html:'',date_created:'',//t.modified,
		comment:'',content:t.text,user_created:t.fields['server.modifier.id']};	
	var pl = new SOAPClientParameters();
	pl.add('session',context.sessionToken);
	pl.add('spaceId',t.fields['server.workspaceid']);
	pl.add('page',page);
	SOAPClient.invoke(uri,'updatePage',pl,true,WikispacesSoapAdaptor.putTiddlerCallback,context);
};

WikispacesSoapAdaptor.putTiddlerCallback = function(r,x,context)//(status,context,responseText,uri,xhr)
{
	var status = r instanceof Error ? false : true;
//#console.log('putTiddlerCallback:'+status);
	context.status = status;
	if(!status) {
		context.statusText = '%0:%1 - %2%3'.format([r.name,r.message,r.fileName,r.lineNumber]);
		console.log(context.statusText);
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesSoapAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[WikispacesSoapAdaptor.serverType] = WikispacesSoapAdaptor;
} //# end of 'install only once'
//}}}
