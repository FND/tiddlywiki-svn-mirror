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

function doHttpGET(url,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',url,data,contentType,username,password,callback,params,headers);
}

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

ZiddlyWikiAdaptor.prototype.openHost = function(host,context)
{
displayMessage("openHost:"+host);
	this.host = ZiddlyWikiAdaptor.fullHostName(host);
//#displayMessage("host:"+this.host);
	if(context && context.callback)
		window.setTimeout(context.callback,0,true,this,context);
	return true;
};

ZiddlyWikiAdaptor.prototype.openWorkspace = function(workspace,context)
{
displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(context && context.callback)
		window.setTimeout(context.callback,0,true,this,context);
	return true;
};

ZiddlyWikiAdaptor.prototype.getTiddlerList = function(context)
{
//#displayMessage('getTiddlerList');
//# http://www.ziddlywiki.com/ZiddlyWiki?action=get&id=News
	var urlTemplate = '%0data/workspaces/%1/pages';
	var host = this && this.host ? this.host : ZiddlyWikiAdaptor.fullHostName(context.tiddler.fields['server.host']);
	var url = urlTemplate.format([host]);
//#displayMessage('url:'+url);
	context.adaptor = this;
	var req = doHttpGET(url,ZiddlyWikiAdaptor.getTiddlerListCallback,context);
//#displayMessage('req:'+req);
	return typeof req == 'string' ? req : true;
};

ZiddlyWikiAdaptor.getTiddlerListCallback = function(status,context,responseText,url,xhr)
{
//#displayMessage('getTiddlerListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
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
		var list = [];
		for(var i=0; i<info.length; i++) {
			list.push({title:info[i].name});
		}
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

ZiddlyWikiAdaptor.prototype.getTiddler = function(context)
{
	title = encodeURIComponent(context.tiddler.title);
displayMessage('ZiddlyWikiAdaptor.getTiddler:'+title);
//# http://www.ziddlywiki.com/ZiddlyWiki?action=get&id=News

	var urlTemplate = '%0ZiddlyWiki?action=get&id=%1';
	var host = this && this.host ? this.host : ZiddlyWikiAdaptor.fullHostName(context.tiddler.fields['server.host']);
	var url = urlTemplate.format([host,title]);
displayMessage('getZiddlyWwiki url: '+url);
//# http://www.ziddlywiki.org/ZiddlyWiki?action=get&id=ZiddlyWiki

	context.tiddler.fields['server.type'] = 'ziddlywiki';
	context.adaptor = this;
	var req = doHttpGET(url,ZiddlyWikiAdaptor.getTiddlerCallback,context);
displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

ZiddlyWikiAdaptor.getTiddlerCallback = function(status,context,responseText,url,xhr)
{
displayMessage('Ziddly.getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	if(status && responseText.substr(0,1) != '-') {
		var x = responseText.split('\n');
		context.tiddler.text = x[1].unescapeLineBreaks();
		try {
			context.tiddler.modifier = x[2];
			context.tiddler.tags = x[5];
			if(x[3])
				context.tiddler.created = Date.convertFromYYYYMMDDHHMM(x[3]);
			if(x[4])
				context.tiddler.modified = Date.convertFromYYYYMMDDHHMM(x[4]);
		} catch(ex) {
			context.statusText = exceptionText(ex,config.messages.serverParsingError);
			if(context.callback)
				context.callback(context);
			return;
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

ZiddlyWikiAdaptor.prototype.getTiddlerRevisionList = function(context)
// get a list of the revisions for a tiddler
{
	var title = encodeURIComponent(context.tiddler.title);
//#displayMessage('ZiddlyWikiAdaptor.getTiddlerRevisionList:'+title);
// http://www.ziddlywiki.com/ZiddlyWiki?action=get_revisions&id=News

	var urlTemplate = '%0ZiddlyWiki?action=get_revisions&id=%1';
	var host = this && this.host ? this.host : ZiddlyWikiAdaptor.fullHostName(context.tiddler.fields['server.host']);
	var url = urlTemplate.format([host,title]);
//#displayMessage('getZiddlyWwiki url: '+url);
// http://www.ziddlywiki.org/ZiddlyWiki?action=get_revisions&id=ZiddlyWiki

	context.tiddler.fields['server.type'] = 'ziddlywiki';
	context.adaptor = this;
	var req = doHttpGET(url,ZiddlyWikiAdaptor.getTiddlerRevisionListCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

ZiddlyWikiAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,url,xhr)
{
//#displayMessage('Ziddly.getTiddlerRevisionListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
//#displayMessage('callback:'+context.callback);
	var revisions = [];
	if(responseText != '-') {
		var revs = responseText.split('\n');
		for(var i=0; i<revs.length; i++) {
			var parts = revs[i].split(' ');
			if(parts.length>1) {
				revisions[i] = {};
				revisions[i].modified = Date.convertFromYYYYMMDDHHMM(parts[0]);
				revisions[i].key = parts[1];
			}
		}
	}
	context.revisions = revisions;
	if(context.callback)
		context.callback(context);
};

//# placeholder, not working yet
ZiddlyWikiAdaptor.getTiddlerRevision = function(context)
{
//#displayMessage('getTiddlerRevision:'+context.tiddler.title);
	title = encodeURIComponent(context.tiddler.title);
	if(context.tiddler.fields['server.page.revision'] == revision)
		return true;
	zw.status('loading...');
	revision = revision ? '&revision=%2' + revision : '';
	updateTimeline = updateTimeline ? '&updatetimeline=1' : '';
	//ajax.get('?action=get&id=' + encodeURIComponent(title) + revision + updateTimeline + '&' + zw.no_cache(),displayTiddlerRevisionCallback)
	//return typeof req == 'string' ? req : true;
	var urlTemplate = '%0ZiddlyWiki?action=get&id=%1' + context.revision + context.updatetimeline;
	var host = this && this.host ? this.host : ZiddlyWikiAdaptor.fullHostName(context.tiddler.fields['server.host']);
	var url = urlTemplate.format([host,title,revision]);
	context.tiddler.fields['server.type'] = 'ziddlywiki';
	context.adaptor = this;
	var req = doHttpGET(url,ZiddlyWikiAdaptor.getTiddlerRevisionCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;

};

//# placeholder, not working yet
ZiddlyWikiAdaptor.getTiddlerRevisionCallback = function(status,context,responseText,url,xhr)
{
//#displayMessage('getTiddlerRevisionCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	var encoded = responseText;
	if(encoded.indexOf('\n') > -1) {
		var parts = encoded.split('\n');
		var title = parts[0];
		context.tiddler.set(title,Tiddler.unescapeLineBreaks(parts[1].htmlDecode()),parts[2],
				Date.convertFromYYYYMMDDHHMM(parts[3]),parts[5],
				Date.convertFromYYYYMMDDHHMM(parts[4]));
		tiddler.revisionKey = parts[7];
		store.addTiddler(tiddler);
		story.refreshTiddler(title,DEFAULT_VIEW_TEMPLATE,true);
		if(parts[6] == 'update timeline')
			store.notify('TabTimeline',true);
	} else if(encoded != '-') {
		alert(encoded); // error message
	}
	zw.status(false);
};

ZiddlyWikiAdaptor.prototype.putTiddler = function(context)
{
	var title = encodeURIComponent(context.tiddler.title);
	var urlTemplate = '%0RPC2/';
	var host = this && this.host ? this.host : ZiddlyWikiAdaptor.fullHostName(context.tiddler.fields['server.host']);
	var url = urlTemplate.format([host,encodeURIComponent(title)]);
//#displayMessage('putZiddlyWwiki url: '+url);

	context.tiddler.fields['server.type'] = 'ziddlywiki';
	var req =doHttp('POST',url,payload,null,this.username,this.password,ZiddlyWikiAdaptor.putTiddlerCallback,context);
//#displayMessage("req:"+req);
	return typeof req == 'string' ? req : true;
};

ZiddlyWikiAdaptor.putTiddlerCallback = function(status,context,responseText,url,xhr)
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

ZiddlyWikiAdaptor.prototype.getWorkspaceList = function(context) {return false;};
ZiddlyWikiAdaptor.prototype.close = function() {return true;};

config.adaptors['ziddlywiki'] = ZiddlyWikiAdaptor;
} // end of 'install only once'
//}}}
