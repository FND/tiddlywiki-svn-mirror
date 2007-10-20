/***
|''Name:''|ZiddlyWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from ZiddlyWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#ZiddlyWikiAdaptorPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ZiddlyWikiAdaptorPlugin.js|
|''Version:''|0.3.1|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

''For debug:''
|''Default ZiddlyWiki username''|<<option txtZiddlyWikiUsername>>|
|''Default ZiddlyWiki password''|<<option txtZiddlyWikiPassword>>|

***/

//{{{
if(!config.options.txtZiddlyWikiUsername)
	{config.options.txtZiddlyWikiUsername = '';}
if(!config.options.txtZiddlyWikiPassword)
	{config.options.txtZiddlyWikiPassword = '';}
//}}}

// Ensure that the plugin is only installed once.
if(!version.extensions.ZiddlyWikiAdaptorPlugin) {
version.extensions.ZiddlyWikiAdaptorPlugin = {installed:true};

config.messages.serverParsingError = "Error parsing result from server";

function ZiddlyWikiAdaptor()
{
	this.host = null;
	this.workspace = null;
	// for debug
	this.username = config.options.txtZiddlyWikiUsername;
	this.password = config.options.txtZiddlyWikiPassword;
	return this;
}

ZiddlyWikiAdaptor.serverType = 'ziddlywiki';

ZiddlyWikiAdaptor.HttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

ZiddlyWikiAdaptor.HttpPUT = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('PUT',uri,data,contentType,username,password,callback,params,headers);
};

ZiddlyWikiAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

ZiddlyWikiAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	return host;
};

ZiddlyWikiAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

ZiddlyWikiAdaptor.normalizedTitle = function(title)
{
	return title;
};

ZiddlyWikiAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
//#displayMessage("openHost:"+host);
	this.host = ZiddlyWikiAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
//#displayMessage("host:"+this.host);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,10,context,userParams);
	}
	return true;
};

ZiddlyWikiAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,10,context,userParams);
	}
	return true;
};

ZiddlyWikiAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
//#displayMessage("getWorkspaceList");
	context = this.setContext(context,userParams,callback);
	var list = [];
	list.push({title:"Main",name:"Main"});
	context.workspaces = list;
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,10,context,userParams);
	}
	return true;
};

ZiddlyWikiAdaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
{
displayMessage('getTiddlerList');
	context = this.setContext(context,userParams,callback);
//# http://zw.mcelrath.org/ziddlywiki.com/?action=get_all
	var uriTemplate = '%0%1/?action=get_all';
	var host = ZiddlyWikiAdaptor.fullHostName(context.host);
	var uri = uriTemplate.format([host,context.workspace]);
displayMessage('uri:'+uri);
	var req = ZiddlyWikiAdaptor.HttpGET(uri,ZiddlyWikiAdaptor.getTiddlerListCallback,context);
//#displayMessage('req:'+req);
	return typeof req == 'string' ? req : true;
};

ZiddlyWikiAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
displayMessage('getTiddlerListCallback status:'+status);
if(!status)
	displayMessage('http status:'+xhr.status);
displayMessage('rt:'+responseText ? responseText.substr(0,100) : 'none');
//#displayMessage('xhr:'+xhr);
	context.status = false;
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
		/*var list = [];
		for(var i=0; i<info.length; i++) {
			list.push({title:info[i].name});
		}*/
		var list = [];
		for(var i=0; i<info.length; i++) {
			var tiddler = new Tiddler(info[i].name);
			//tiddler.modified = 
			//tiddler.modifier = 
			//tiddler.tags = info[i].tags;
			//tiddler.fields['server.page.id'] = info[i].page_id;
			//tiddler.fields['server.page.name'] = info[i].name;
			list.push(tiddler);
		}
		context.list = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context);
};

ZiddlyWikiAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var uriTemplate = '%0#%2';
	info.uri = uriTemplate.format([this.host,this.workspace,tiddler.title]);
	return info;
};


//# News
//# [[Version 2.0.11.4]] has been released.\n\n[[Version 2.0.11.3]] has been released.\n\n[[Version 2.0.11.2]] has been released.\n\nWith this version the maintainership has changed.  Tim Morgan has retired and development has merged with the main TiddlyWiki systems at http://trac.tiddlywiki.org.  We are thankful to retain hosting by [[Zettai|http://zettai.net]].\n
//# BobMcElrath
//# 200609051750
//# 200601051659
//# about protected
//#
//# 871.64174.18161.45875

//#1. 2007 Sep 21 16:20 r:880.32920.53259.36590
//#2. 2006 Oct 28 04:29 r:878.7151.38480.2986
// http://zw.mcelrath.org/ziddlywiki.com/?action=get&title=GetYourOwn&revision=880.32920.53259.36590&1192874996515

ZiddlyWikiAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#displayMessage('getTiddler:'+title);
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;
//# http://zw.mcelrath.org/ziddlywiki.com/?action=get&title=News
//# http://zw.mcelrath.org/ziddlywiki.com/?action=get_revisions&title=News

	var uriTemplate = '%0%1/?action=get&title=%2';
	if(context.revision)
		uriTemplate += '&revision=%3';
	var host = ZiddlyWikiAdaptor.fullHostName(context.host);
	var uri = uriTemplate.format([host,context.workspace,title,context.revision]);
//#displayMessage('uri: '+uri);

	context.tiddler = new Tiddler(context.title);
	context.tiddler.fields['server.type'] = ZiddlyWikiAdaptor.serverType;
	context.tiddler.fields['server.host'] = ZiddlyWikiAdaptor.minHostName(host);
	context.tiddler.fields['server.workspace'] = context.workspace;
	var req = ZiddlyWikiAdaptor.HttpGET(uri,ZiddlyWikiAdaptor.getTiddlerCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

ZiddlyWikiAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,100));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	if(status) {
		var tiddlerRegExp = /<div([^>]*)>(?:\s*)(<pre>)?([^<]*?)</mg;
		tiddlerRegExp.lastIndex = 0;
		match = tiddlerRegExp.exec(responseText);
		if(match) {
			//#displayMessage("m1:"+match[1]);
			//#displayMessage("m2:"+match[2]);
			//#displayMessage("m3:"+match[3]);
			var ft = match[1].replace(/\=\"/mg,':"');
			var fields = ft.decodeHashMap();
			var text = match[3] ? match[3] : '';
			if(match[2]) {
				text = text.replace(/\r/mg,'').htmlDecode();
			} else {
				text = text.unescapeLineBreaks().htmlDecode();
			}
			context.tiddler.text = text;
			//#displayMessage('tt:'+text.substr(0,100));
			context.status = true;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText+responseText.substr(0,50);
	}
	if(context.callback)
		context.callback(context);
	//#else {
	//#	displayMessage('Error:'+responseText.substr(0,50));
	//#	displayMessage('putXh:'+xhr);
	//#}
};

ZiddlyWikiAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
displayMessage('getTiddler:'+title+' revision:'+revision);
	context = this.setContext(context,userParams,callback);
	context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

ZiddlyWikiAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
// get a list of the revisions for a tiddler
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
//#displayMessage('getTiddlerRevisionList:'+title);
//# http://zw.mcelrath.org/ziddlywiki.com/?action=get_revisions&title=ZiddlyWiki
//# http://zw.mcelrath.org/ziddlywiki.com/?action=get_revisions&title=GetYourOwn

	var uriTemplate = '%0%1/?action=get_revisions&title=%2';
	var host = ZiddlyWikiAdaptor.fullHostName(context.host);
	var uri = uriTemplate.format([host,context.workspace,title]);
//#displayMessage('getZiddlyWwiki uri: '+uri);

	context.adaptor = this;
	var req = ZiddlyWikiAdaptor.HttpGET(uri,ZiddlyWikiAdaptor.getTiddlerRevisionListCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

//# 200609051750 878.7151.38480.2986 mcelrath
ZiddlyWikiAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('getTiddlerRevisionListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,100));
//#displayMessage('xhr:'+xhr);
//#displayMessage('callback:'+context.callback);
	var revisions = [];
	if(responseText != '-') {
		var revs = responseText.split('\n');
		for(var i=0; i<revs.length; i++) {
			var parts = revs[i].split(' ');
			if(parts.length>1) {
				var tiddler = new Tiddler(context.title);
				tiddler.modified = Date.convertFromYYYYMMDDHHMM(parts[0]);
				tiddler.fields['server.page.revision'] = parts[1];
				tiddler.modifier = parts[2];
				tiddler.fields['server.page.name'] = context.title;
				//tiddler.fields['server.page.id'] = ZiddlyWikiAdaptor.normalizedTitle(title);
				revisions.push(tiddler);
			}
		}
	}
	context.status = true;
	context.revisions = revisions;
	if(context.callback)
		context.callback(context,context.userParams);
};

/*
ajax.post(zw.get_url(), callback, 'action=save&id=' + encodeURIComponent(title) + '&title=' 
	+ encodeURIComponent(newTitle) + '&body=' + encodeURIComponent(newBody) + '&tags=' 
	+ encodeURIComponent(tags) + '&modified=' 
	+ encodeURIComponent((modified||store.fetchTiddler(title).modified).convertToYYYYMMDDHHMM()) 
	+ '&' + zw.no_cache());
*/

//# placeholder, not working yet
ZiddlyWikiAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
displayMessage('putTiddler:'+tiddler.title);
	context = this.setContext(context,userParams,callback);
	context.tiddler = tiddler;
	context.title = tiddler.title;
	//var title = encodeURIComponent(context.tiddler.title);
	var uriTemplate = '%0%1/action=save&id=%2&title=%3&body=%4&tags=%5&modified=%6';
	var id = tiddler.title;
	var tags = '';
	var modified = tiddler.modified.convertToYYYYMMDDHHMM();
	var uri = uriTemplate.format([context.host,context.workspace,id,tiddler.title,tiddler.text,tags,modified]);
displayMessage('uri: '+uri);

	context.tiddler.fields['server.type'] = ZiddlyWikiAdaptor.serverType;
	var req = ZiddlyWikiAdaptor.HttpPUT(uri,ZiddlyWikiAdaptor.putTiddlerCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

ZiddlyWikiAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
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

ZiddlyWikiAdaptor.prototype.close = function() {return true;};

config.adaptors[ZiddlyWikiAdaptor.serverType] = ZiddlyWikiAdaptor;
} // end of 'install only once'
//}}}
