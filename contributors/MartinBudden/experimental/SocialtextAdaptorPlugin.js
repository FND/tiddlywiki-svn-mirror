/***
|''Name:''|SocialtextAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from Socialtext Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com) and JeremyRuston (jeremy (at) osmosoft (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#SocialtextAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/SocialtextAdaptorPlugin.js|
|''Version:''|0.2.1|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SocialtextAdaptorPlugin) {
version.extensions.SocialtextAdaptorPlugin = {installed:true};

SocialtextAdaptor = function()
{
	this.host = null;
	this.workspace = null;
	return this;
};

//#SocialtextAdaptor.mimeType = 'text/vnd.socialtext.wiki';
SocialtextAdaptor.mimeType = 'text/x.socialtext-wiki';

// Convert a page title to the normalized form used in URLs
SocialtextAdaptor.normalizedId = function(title)
{
	var id = title.toLowerCase();
	id = id.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(id.charAt(0)=='_')
		id = id.substr(1);
//#displayMessage("title:"+title+" id:"+id);
	return String(id);
};

// Convert a Socialtext date in YYYY-MM-DD hh:mm format into a JavaScript Date object
SocialtextAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

SocialtextAdaptor.prototype.openHost = function(host,callback,callbackParams)
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

// following gets list of workspaces
//# http://www.eu.socialtext.net/data/workspaces?accept=application/json
//# [
//# {"modified_time":"2006-09-13 08:31:38.217402-07",
//# "name":"wsname",
//# "uri":"/data/workspaces/wsname",
//# "title":"wsTitle"},
//# ...
//# ]
SocialtextAdaptor.prototype.getWorkspaceList = function(callback,callbackParams)
{
	var urlTemplate = '%0data/workspaces';
	var url = urlTemplate.format([this.host]);
	var params = {callback:callback,callbackParams:callbackParams,adaptor:this};
	var req = doHttp('GET',url,undefined,null,null,null,SocialtextAdaptor.getWorkspaceListCallback,params,{'Accept':'application/json'});
	return (typeof req == 'string') ? req : true;
};

SocialtextAdaptor.getWorkspaceListCallback = function(status,params,responseText,xhr)
{
	if(status) {
		try {
			var info = window.eval('(' + responseText + ')');
		} catch (ex) {
			params.callback(exceptionText(ex,"Error parsing result from server"),null,params.adaptor,params.callbackParams);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			list.push({title:info[i].title,name:info[i].name,modified:SocialtextAdaptor.dateFromEditTime(info[i].modified_time)});
		}
		params.callback(true,list,params.adaptor,params.callbackParams);
	} else {
		params.callback(xhr.statusText,null,params.adaptor,params.callbackParams);
	}
};

SocialtextAdaptor.prototype.openWorkspace = function(workspace,callback,callbackParams)
{
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(callback)
		window.setTimeout(callback,0,true,this,callbackParams);
	return true;
};

SocialtextAdaptor.prototype.getTiddlerList = function(callback,callbackParams)
{
//#displayMessage('getTiddlerList');
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages?accept=application/json
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages?accept=application/json;order=newest;count=4
//# data/workspaces/:ws/pages/:pname
	var urlTemplate = '%0data/workspaces/%1/pages';
	var url = urlTemplate.format([this.host,this.workspace]);
//#displayMessage('url:'+url);
	var params = {callback:callback,callbackParams:callbackParams,adaptor:this};
	var req = doHttp("GET",url,null,null,null,null,SocialtextAdaptor.getTiddlerListCallback,params,{'Accept':'application/json'});
//#displayMessage('req:'+req);
	return (typeof req == 'string') ? req : true;
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
//# "last_editor":
//# "chris.dent@socialtext.com"},
//# ...
//# ]

SocialtextAdaptor.getTiddlerListCallback = function(status,params,responseText,xhr)
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
			list.push({title:info[i].name,
						id:info[i].page_id,
						modified:SocialtextAdaptor.dateFromEditTime(info[i].last_edit_time),
						revCount:info[i].revision_count});
		}
		/*if(!store.hostedTiddlers)
			store.hostedTiddlers = {};
		if(!store.hostedTiddlers[this.host])
			store.hostedTiddlers[this.host] = {};
		store.hostedTiddlers[this.host][this.workspace] = list;*/
		params.callback(true,list,params.adaptor,params.callbackParams);
	} else {
		params.callback(xhr.statusText,null,params.adaptor,params.callbackParams);
	}
};

SocialtextAdaptor.prototype.getTiddler = function(tiddler)
{
//#displayMessage('SocialtextAdaptor.getTiddler:'+tiddler.title);
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages/socialtext_2_0_preview
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages/representation?accept=application/json
	// request the page in json format to get the page attributes
	//var urlTemplate = '%0data/workspaces/%1/pages/%2?accept=application/json';
	var urlTemplate = '%0data/workspaces/%1/pages/%2';
	var pageId = SocialtextAdaptor.normalizedId(tiddler.title);
	var url = urlTemplate.format([this.host,this.workspace,pageId]);
//#displayMessage('url: '+url);

	tiddler.fields.wikiformat = 'Socialtext';
	tiddler.fields['server.type'] = 'socialtext';
	tiddler.fields['temp.adaptor'] = this;
	var req = doHttp('GET',url,null,null,null,null,SocialtextAdaptor.getTiddlerCallback,tiddler,{'Accept':'application/json'});
//#displayMessage('req:'+req);
};

SocialtextAdaptor.getTiddlerCallback = function(status,tiddler,responseText,xhr)
{
//#displayMessage('getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);

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

	try {
		//# convert the downloaded data into a javascript object
		eval('var info=' + responseText);
//#displayMessage('tags:'+info.tags);
//#displayMessage('page_id:'+info.page_id);
//#displayMessage('modifier:'+info.last_editor);
		tiddler.tags = info.tags;
		tiddler.fields['server.page.id'] = info.page_id;
		tiddler.fields['server.page.name'] = info.name;
		tiddler.modifier = info.last_editor;
		tiddler.modified = SocialtextAdaptor.dateFromEditTime(info.last_edit_time);
//#displayMessage('modified:'+info.last_edit_time);
//#displayMessage('modified2:'+params.modified);
	} catch (ex) {
		//alert('SocialtextAdaptor.getTiddlerCallback: JSON error');
		displayMessage('Error response:'+responseText.substr(0,50));
		return;
	}
	// request the page's text
	var adaptor = tiddler.fields['temp.adaptor'];
//#displayMessage('ws: '+this.workspace);
	var urlTemplate = '%0data/workspaces/%1/pages/%2';
	var url = urlTemplate.format([adaptor.host,adaptor.workspace,tiddler.fields['server.page.id']]);
//#displayMessage('cb url: '+url);
	var req = doHttp('GET',url,null,null,null,null,SocialtextAdaptor.getTiddlerCallback2,tiddler,{'Accept':SocialtextAdaptor.mimeType});
//#displayMessage('req:'+req);
};

SocialtextAdaptor.getTiddlerCallback2 = function(status,tiddler,responseText,xhr)
{
//#displayMessage('getTiddlerCallback2 status:'+status);
//#displayMessage('rt:'+responseText);
//#displayMessage('xhr:'+xhr);
	if(responseText) {
		tiddler.text = responseText;
		tiddler.updateAndSave();
	}
};

SocialtextAdaptor.prototype.putTiddler = function(tiddler)
{
//#displayMessage('SocialtextAdaptor.putTiddler:'+tiddler.title);
//# data/workspaces/:ws/pages/:pname
	var urlTemplate = '%0data/workspaces/%1/pages/%2';
	var url = urlTemplate.format([this.host,this.workspace,tiddler.title,tiddler.text]);
//#displayMessage('url:'+url);
	var req = doHttp('POST',url,tiddler.text,SocialtextAdaptor.mimeType,null,null,SocialtextAdaptor.putTiddlerCallback,tiddler,{"X-Http-Method": "PUT"});
//#displayMessage('req:'+req);
};

SocialtextAdaptor.putTiddlerCallback = function(status,tiddler,responseText,xhr)
{
//#displayMessage('putTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	if(!status)
		displayMessage('Status text:'+xhr.statusText);
	if(tiddler.fields['temp.callback'])
		tiddler.fields['temp.callback'](tiddler);
};

SocialtextAdaptor.prototype.close = function() {return true;};

config.adaptors['socialtext'] = SocialtextAdaptor;
} //# end of 'install only once'
//}}}
