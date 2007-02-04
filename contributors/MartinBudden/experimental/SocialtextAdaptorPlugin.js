/***
|''Name:''|SocialtextAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from Socialtext Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#SocialtextAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/SocialtextAdaptorPlugin.js|
|''Version:''|0.1.5|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

''For debug:''
|''Default Socialtext Server''|<<option txtsocialtextDefaultServer>>|
|''Default Socialtext Workspace''|<<option txtsocialtextDefaultWorkspace>>|
|''Default Socialtext username''|<<option txtsocialtextUsername>>|
|''Default Socialtext password''|<<option txtsocialtextPassword>>|
|''Socialtext password required''|<<option chksocialtextPasswordRequired>>|

***/

//{{{
if(!config.options.txtsocialtextDefaultServer)
	{config.options.txtsocialtextDefaultServer = 'Socialtext.org';}
if(!config.options.txtsocialtextDefaultWorkspace)
	{config.options.txtsocialtextDefaultWorkspace = 'Main';}
if(!config.options.txtsocialtextUsername)
	{config.options.txtsocialtextUsername = '';}
if(!config.options.txtsocialtextPassword)
	{config.options.txtsocialtextPassword = '';}
if(!config.options.chksocialtextPasswordRequired)
	{config.options.chksocialtextPasswordRequired = false;}
//}}}

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.SocialtextAdaptorPlugin) {
version.extensions.SocialtextAdaptorPlugin = {installed:true};

SocialtextAdaptor = {}; // 'namespace' for local functions

//#SocialtextAdaptor.mimeType = 'text/vnd.socialtext.wiki';
SocialtextAdaptor.mimeType = 'text/x.socialtext-wiki';

SocialtextAdaptor.normalizedId = function(title)
{
	var id = title.toLowerCase();
	id = id.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(id.charAt(0)=='_')
		id = id.substr(1);
//#displayMessage("title:"+title+" id:"+id);
	return String(id);
};

SocialtextAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

SocialtextAdaptor.getTiddler = function(title,params)
{
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages/socialtext_2_0_preview
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages/representation?accept=application/json

	// request the page in json format to get the page attributes
	var urlTemplate = '%0/data/workspaces/%1/pages/%2?accept=application/json';
	if(!params.serverHost.match(/:\/\//))
		urlTemplate = 'http://' + urlTemplate;
	var pageId = SocialtextAdaptor.normalizedId(title);
	var url = urlTemplate.format([params.serverHost,params.serverWorkspace,pageId]);
//#displayMessage('getSocialtext url: '+url);

	params.title = title;
	params.wikiformat = 'Socialtext';
	params.serverType = 'socialtext';
	var req = doHttp('GET',url,null,null,null,null,SocialtextAdaptor.getTiddlerCallback,params);
//#displayMessage('req:'+req);
};

SocialtextAdaptor.getTiddlerCallback = function(status,params,responseText,xhr)
{
//#displayMessage('getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);

//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages/representation?accept=text/x.socialtext-wiki
/*
{"page_uri":"http://www.socialtext.net/st-rest-docs/index.cgi?representation",
"modified_time":1163021802,
"name":"Representation",
"page_id":"representation",
"uri":"representation",
"tags":[0.91],
"revision_id":20061108213642,
"last_edit_time":"2006-11-08 21:36:42 GMT",
"revision_count":7,
"last_editor":"matt.liggett@socialtext.com"}
*/

	try {
		//# convert the downloaded data into a javascript object
		eval('var queryResult=' + responseText);
//#displayMessage('tags:'+queryResult.tags);
//#displayMessage('page_id:'+queryResult.page_id);
//#displayMessage('modifier:'+queryResult.last_editor);
		params.tags = queryResult.tags;
		params.serverPageId = queryResult.page_id;
		params.serverPageName = queryResult.name;
		params.modifier = queryResult.last_editor;
		params.modified = SocialtextAdaptor.dateFromEditTime(queryResult.last_edit_time)
//#displayMessage('modified:'+queryResult.last_edit_time);
//#displayMessage('modified2:'+params.modified);
	} catch (ex) {
		//alert('SocialtextAdaptor.getTiddlerCallback: JSON error');
		displayMessage('Response:'+responseText.substr(0,50));
		return;
	}
	// request the page's text
	var urlTemplate = '%0/data/workspaces/%1/pages/%2?accept=%3';
	if(!params.serverHost.match(/:\/\//))
		urlTemplate = 'http://' + urlTemplate;
	var url = urlTemplate.format([params.serverHost,params.serverWorkspace,params.serverPageId,SocialtextAdaptor.mimeType]);
	var req = doHttp('GET',url,null,null,null,null,SocialtextAdaptor.getTiddlerCallback2,params);
//#displayMessage('req:'+req);
};

SocialtextAdaptor.getTiddlerCallback2 = function(status,params,responseText,xhr)
{
//#displayMessage('getTiddlerCallback2 status:'+status);
//#displayMessage('rt:'+responseText);
//#displayMessage('xhr:'+xhr);
	var content = responseText;
	if(content) {
		var tiddler = store.createTiddler(params.title);
		tiddler.updateFieldsAndContent(params,content);
	}
};

SocialtextAdaptor.putTiddler = function(title,params)
{
	var tiddler = store.fetchTiddler(title);
	var text = tiddler.text;
	var pageId = tiddler.fields.serverPageId ? tiddler.fields.serverPageId : SocialtextAdaptor.normalizedId(title);
//# data/workspaces/:ws/pages/:pname
	var urlTemplate = '%0/data/workspaces/%1/pages/%2';
	if(!params.serverHost.match(/:\/\//))
		urlTemplate = 'http://' + urlTemplate;
	var url = urlTemplate.format([params.serverHost,params.serverWorkspace,title,text]);
//#displayMessage('url:'+url);

	params.title = title;
	var req = doHttp('POST',url,text,SocialtextAdaptor.mimeType,null,null,SocialtextAdaptor.putTiddlerCallback,params,{"X-Http-Method": "PUT"});
//#displayMessage('req:'+req);
};

SocialtextAdaptor.putTiddlerCallback = function(status,params,responseText,xhr)
{
	//#displayMessage('putTiddlerCallback status:'+status);
	//#displayMessage('rt:'+responseText.substr(0,50));
	//#displayMessage('xhr:'+xhr);
	if(!status)
		displayMessage('Status text:'+xhr.statusText);
	if(params.callback)
		params.callback(params);
};

SocialtextAdaptor.getTiddlerList = function(params)
{
//#displayMessage('getTiddlerList');
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages?accept=application/json
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages?accept=application/json;order=newest;count=4
//# data/workspaces/:ws/pages/:pname
	var urlTemplate = '%0/data/workspaces/%1/pages?accept=application/json';
	if(!params.serverHost.match(/:\/\//))
		urlTemplate = 'http://' + urlTemplate;
	var url = urlTemplate.format([params.serverHost,params.serverWorkspace]);
//#displayMessage('url:'+url);
	var req = doHttp('GET',url,null,null,null,null,SocialtextAdaptor.getTiddlerListCallback,params);
//#displayMessage('req:'+req);
};

/*
[
{"page_uri":"http://www.socialtext.net/st-rest-docs/index.cgi?rest_api_version_0_9x",
"name":"REST API version 0.9x",
"page_id":"rest_api_version_0_9x",
"modified_time":1162933753,
"uri":"rest_api_version_0_9x",
"tags":[],
"revision_id":20061107210913,
"last_edit_time":"2006-11-07 21:09:13 GMT",
"revision_count":1,
"last_editor":
"chris.dent@socialtext.com"},
...
]
*/

SocialtextAdaptor.getTiddlerListCallback = function(status,params,responseText,xhr)
{
	//#displayMessage('getTiddlerListCallback status:'+status);
	//#displayMessage('rt:'+responseText.substr(0,50));
	//#displayMessage('xhr:'+xhr);
	if(!status)
		displayMessage('Status text:'+xhr.statusText);
	try {
		//# convert the downloaded data into a javascript object
		eval('var queryResult=' + responseText);
		var list = [];
		for(var i=0; i< queryResult.length; i++) {
			list[i] = {title:queryResult[i].name,
						id:queryResult[i].page_id,
						modified:SocialtextAdaptor.dateFromEditTime(queryResult[i].last_edit_time),
						revCount:queryResult[i].revision_count};
			//list[i] = {title:queryResult[i].page_id};
		}
		if(!store.hostedTiddlers)
			store.hostedTiddlers = {};
		if(!store.hostedTiddlers[params.serverHost])
			store.hostedTiddlers[params.serverHost] = {};
		store.hostedTiddlers[params.serverHost][params.serverWorkspace] = list;
	} catch (ex) {
		//alert('SocialtextAdaptor.getTiddlerCallback: JSON error');
		displayMessage('Response:'+responseText.substr(0,50));
	}
	if(params.callback)
		params.callback(params);
};

// following gets list of workspaces
//# http://www.eu.socialtext.net/data/workspaces?accept=application/json

config.hostFunctions.getTiddler['socialtext'] = SocialtextAdaptor.getTiddler;
config.hostFunctions.putTiddler['socialtext'] = SocialtextAdaptor.putTiddler;
config.hostFunctions.getTiddlerList['socialtext'] = SocialtextAdaptor.getTiddlerList;

} // end of 'install only once'
//}}}
