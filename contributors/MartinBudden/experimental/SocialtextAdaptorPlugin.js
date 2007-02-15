/***
|''Name:''|SocialtextAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from Socialtext Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com) and JeremyRuston (jeremy (at) osmosoft (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#SocialtextAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/SocialtextAdaptorPlugin.js|
|''Version:''|0.3.1|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SocialtextAdaptorPlugin) {
version.extensions.SocialtextAdaptorPlugin = {installed:true};

function doHttpGET(url,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',url,data,contentType,username,password,callback,params,headers);
}

function SocialtextAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

//#SocialtextAdaptor.mimeType = 'text/vnd.socialtext.wiki';
SocialtextAdaptor.mimeType = 'text/x.socialtext-wiki';
SocialtextAdaptor.serverType = 'socialtext';
SocialtextAdaptor.serverParsingErrorMessage = "Error parsing result from server";
SocialtextAdaptor.errorInFunctionMessage = "Error in function SocialtextAdaptor.%0";

// Convert a page title to the normalized form used in URLs
SocialtextAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
//#displayMessage("title:"+title+" n:"+n);
	return String(n);
};

// Convert a Socialtext date in YYYY-MM-DD hh:mm format into a JavaScript Date object
SocialtextAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

SocialtextAdaptor.fullHostName = function(host)
{
//#displayMessage("fullHostName:"+host);
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	return host;
};

SocialtextAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Open the specified host/server
//#   host - url of host (eg, "http://www.socialtext.net/" or "www.socialtext.net")
//#   context.callback - optional function to be called on completion
//#   context is itself passed on as a parameter to the callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support openHost(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(context)
//#   context.status - true if OK, string if error
//#   context.adaptor - reference to this adaptor object
//#   context - parameters as originally passed into the openHost function
SocialtextAdaptor.prototype.openHost = function(host,context)
{
//#displayMessage("openHost:"+host);
	this.host = SocialtextAdaptor.fullHostName(host);
//#displayMessage("host:"+this.host);
	if(context && context.callback)
		window.setTimeout(context.callback,0,true,this,context);
	return true;
};

//# http://www.eu.socialtext.net/data/workspaces?accept=application/json
//# [
//# {"modified_time":"2006-09-13 08:31:38.217402-07",
//# "name":"wsname",
//# "uri":"/data/workspaces/wsname",
//# "title":"wsTitle"},
//# ...
//# ]

// Gets the list of workspaces on a given server
//#   context.callback - optional function to be called on completion
//#   context is itself passed on as a parameter to the callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support getWorkspaceList(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(context)
//#   context.status - true if OK, false if error
//#   context.statusText - error message if there was an error
//#   context.adaptor - reference to this adaptor object
//#   context - parameters as originally passed into the getWorkspaceList function
SocialtextAdaptor.prototype.getWorkspaceList = function(context)
{
//#displayMessage("getWorkspaceList");
	var urlTemplate = '%0data/workspaces';
	var host = this && this.host ? this.host : SocialtextAdaptor.fullHostName(context.host);
	var url = urlTemplate.format([host]);
	context.adaptor = this;
	var req = doHttpGET(url,SocialtextAdaptor.getWorkspaceListCallback,context,{'accept':'application/json'});
	return typeof req == 'string' ? req : true;
};

SocialtextAdaptor.getWorkspaceListCallback = function(status,context,responseText,xhr)
{
//#displayMessage('getWorkspaceListCallback');
	context.status = false;
	context.statusText = SocialtextAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
	if(status) {
		try {
			eval('var info=' + responseText);
			//#var info = window.eval('(' + responseText + ')');
		} catch (ex) {
			context.statusText = exceptionText(ex,SocialtextAdaptor.serverParsingErrorMessage);
//#displayMessage('getWorkspaceListCallbackException:'+context.statusText);
			if(context.callback)
				context.callback(context);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			var item = {
				title:info[i].title,
				name:info[i].name,
				modified:SocialtextAdaptor.dateFromEditTime(info[i].modified_time)
				};
			list.push(item);
		}
		context.workspaces = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context && context.callback)
		context.callback(context);
};

// Open the specified workspace
//#   workspace - name of workspace to open
//#   context.callback - optional function to be called on completion
//#   context is passed to callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support openWorkspace(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(context)
//#   context.status - true if OK, false if error
//#   context.statusText - error message if there was an error
//#   context.adaptor - reference to this adaptor object
//#   context - parameters as originally passed into the openWorkspace function
SocialtextAdaptor.prototype.openWorkspace = function(workspace,context)
{
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(context && context.callback)
		window.setTimeout(context.callback,0,true,this,context);
	context.status = true;
	return true;
};

// Gets the list of tiddlers within a given workspace
//#   context.callback - optional function to be called on completion
//#   context is passed on to callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support getTiddlerList(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(context)
//#   context.status - true if OK, false if error
//#   context.statusText - error message if there was an error
//#   context.adaptor - reference to this adaptor object
//#   context - parameters as originally passed into the getTiddlerList function
SocialtextAdaptor.prototype.getTiddlerList = function(context)
{
//#displayMessage('SocialtextAdaptor.getTiddlerList');
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages?accept=application/json
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages?accept=application/json;order=newest;count=4
//# data/workspaces/:ws/pages/:pname
	var urlTemplate = '%0data/workspaces/%1/pages';
	var host = this && this.host ? this.host : SocialtextAdaptor.fullHostName(context.host);
	var workspace = this && this.workspace ? this.workspace : context.workspace;
	var url = urlTemplate.format([host,workspace]);
//#displayMessage('url:'+url);
	context.adaptor = this;
//#displayMessage('adaptor:'+this);
	var req = doHttpGET(url,SocialtextAdaptor.getTiddlerListCallback,context,{'accept':'application/json'});
//#displayMessage('req:'+req);
	return typeof req == 'string' ? req : true;
};

//# [
//# {"page_uri":"http://www.socialtext.net/st-rest-docs/index.cgi?rest_api_version_0_9x",
//# "name":"REST API version 0.9x",
//# "page_id":"rest_api_version_0_9x",
//# "modified_time":1162933753,
//# "uri":"rest_api_version_0_9x",
//# "tags":[],
//# "revision_id":20061107210913,
//# "last_edit_time":"2006-11-07 21:09:13 GMT",
//# "revision_count":1,
//# "last_editor":"chris.dent@socialtext.com"},
//# ...
//# ]

SocialtextAdaptor.getTiddlerListCallback = function(status,context,responseText,xhr)
{
//#displayMessage('getTiddlerListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	context.statusText = SocialtextAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
		} catch (ex) {
			context.statusText = exceptionText(ex,SocialtextAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context);
			return;
		}
		list = [];
		for(var i=0; i<info.length; i++) {
			var tiddler = new Tiddler(info[i].name);
			tiddler.modified = SocialtextAdaptor.dateFromEditTime(info[i].last_edit_time);
			tiddler.modifier = info[i].last_editor;
			tiddler.tags = info[i].tags;
			tiddler.fields['server.page.id'] = info[i].page_id;
			tiddler.fields['server.page.name'] = info[i].name;
			list.push(tiddler);
		}
		context.tiddlers = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context);
};

SocialtextAdaptor.prototype.viewTiddlerUrl = function(tiddler)
{
	urlTemplate = '%0%1/index.cgi?%2';
	var host = this && this.host ? this.host : SocialtextAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	return urlTemplate.format([host,workspace,tiddler.title]);
};

// Retrieves a tiddler from a given workspace on a given server
//#   context.tiddler.title - title of the tiddler to get
//#   context.callback - optional function to be called on completion
//#   context is passed on as a parameter to the callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support getTiddler(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(context)
//#   context.status - true if OK, false if error
//#   context.statusText - error message if there was an error, otherwise undefined
//#   context.adaptor - reference to this adaptor object
//#   context - as passed into the getTiddler function
SocialtextAdaptor.prototype.getTiddler = function(context)
{
//#displayMessage('SocialtextAdaptor.getTiddler:'+context.tiddler.title);
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages/socialtext_2_0_preview
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages/representation?accept=application/json
	// request the page in json format to get the page attributes
	//#var urlTemplate = '%0data/workspaces/%1/pages/%2?accept=application/json';
	var urlTemplate = '%0data/workspaces/%1/pages/%2';
	var host = this && this.host ? this.host : SocialtextAdaptor.fullHostName(context.tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : context.tiddler.fields['server.workspace'];
	var url = urlTemplate.format([host,workspace,SocialtextAdaptor.normalizedTitle(context.tiddler.title)]);
//#displayMessage('url: '+url);

	context.tiddler.fields.wikiformat = 'socialtext';
	context.tiddler.fields['server.type'] = SocialtextAdaptor.serverType;
	context.tiddler.fields['server.host'] = SocialtextAdaptor.minHostName(host);
	context.tiddler.fields['server.workspace'] = workspace;
	context.adaptor = this;
	var req = doHttpGET(url,SocialtextAdaptor.getTiddlerCallback,context,{'accept':'application/json'});
//#displayMessage('req:'+req);
	return typeof req == 'string' ? req : true;
};

//# www.eu.socialtext.netdata/workspaces/tiddlytext/pages/goals?accept=text/x.socialtext-wiki
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages/representation?accept=text/x.socialtext-wiki
//# {"page_uri":"http://www.socialtext.net/st-rest-docs/index.cgi?representation",
//# "modified_time":1163021802,
//# "name":"Representation",
//# "page_id":"representation",
//# "uri":"representation",
//# "tags":[0.91],
//# "revision_id":20061108213642,
//# "last_edit_time":"2006-11-08 21:36:42 GMT",
//# "revision_count":7,
//# "last_editor":"matt.liggett@socialtext.com"}

SocialtextAdaptor.getTiddlerCallback = function(status,context,responseText,xhr)
{
//#displayMessage('getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	context.status = false;
	context.statusText = SocialtextAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
			//#displayMessage('tags:'+info.tags);
			//#displayMessage('page_id:'+info.page_id);
			//#displayMessage('modifier:'+info.last_editor);
			//#displayMessage('modified:'+info.last_edit_time);
			context.tiddler.tags = info.tags;
			context.tiddler.fields['server.page.id'] = info.page_id;
			context.tiddler.fields['server.page.name'] = info.name;
			context.tiddler.modifier = info.last_editor;
			context.tiddler.modified = SocialtextAdaptor.dateFromEditTime(info.last_edit_time);
		} catch (ex) {
			context.statusText = exceptionText(ex,SocialtextAdaptor.serverParsingErrorMessage);
//#displayMessage('ex:'+context.statusText);
			if(context.callback)
				context.callback(context);
			return;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	// request the page's text
//#displayMessage('ws: '+this.workspace);
	var urlTemplate = '%0data/workspaces/%1/pages/%2';
	var host = SocialtextAdaptor.fullHostName(context.tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : context.tiddler.fields['server.workspace'];
	//var url = urlTemplate.format([host,workspace,tiddler.fields['server.page.id']]);
	var url = urlTemplate.format([host,workspace,SocialtextAdaptor.normalizedTitle(context.tiddler.title)]);
//#displayMessage('cb url: '+url);
	var req = doHttpGET(url,SocialtextAdaptor.getTiddlerCallback2,context,{'accept':SocialtextAdaptor.mimeType});
//#displayMessage('req:'+req);
};

SocialtextAdaptor.getTiddlerCallback2 = function(status,context,responseText,xhr)
{
//#displayMessage('getTiddlerCallback2 status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	context.tiddler.text = responseText;
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context);
};

// Puts a tiddler to a given workspace on a given server
//#   context.tiddler.title - title of the tiddler to put
//#   context.callback - optional function to be called on completion
//#   context is passed on as a parameter to the callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support putTiddler(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(context)
//#   context.status - true if OK, false if error
//#   context.adaptor - reference to this adaptor object
//#   context - as passed into the putTiddler function
SocialtextAdaptor.prototype.putTiddler = function(context)
{
//#displayMessage('SocialtextAdaptor.putTiddler:'+context.tiddler.title);
//# data/workspaces/:ws/pages/:pname
	var urlTemplate = '%0data/workspaces/%1/pages/%2';
	var host = this && this.host ? this.host : SocialtextAdaptor.fullHostName(context.tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : context.tiddler.fields['server.workspace'];
	var url = urlTemplate.format([host,workspace,context.tiddler.title,context.tiddler.text]);
//#displayMessage('url:'+url);
	context.adaptor = this;
	var req = doHttp('POST',url,context.tiddler.text,SocialtextAdaptor.mimeType,null,null,SocialtextAdaptor.putTiddlerCallback,context,{"X-Http-Method": "PUT"});
//#displayMessage('req:'+req);
	return typeof req == 'string' ? req : true;
};

SocialtextAdaptor.putTiddlerCallback = function(status,context,responseText,xhr)
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

SocialtextAdaptor.prototype.close = function() {return true;};

config.adaptors[SocialtextAdaptor.serverType] = SocialtextAdaptor;
} //# end of 'install only once'
//}}}
