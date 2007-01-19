/***
|''Name:''|SocialtextChannelPlugin|
|''Description:''|Channel for moving data to and from Socialtext Wikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#SocialtextChannelPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins|
|''Version:''|0.0.5|
|''Status:''|alpha pre-release|
|''Date:''|Dec 30, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

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
if(!version.extensions.SocialtextChannelPlugin) {
version.extensions.SocialtextChannelPlugin = {installed:true};

SocialtextChannel = {}; // 'namespace' for local functions

//#SocialtextChannel.mimeType = 'text/vnd.socialtext.wiki';
SocialtextChannel.mimeType = 'text/x.socialtext-wiki';

SocialtextChannel.getTiddler = function(title,params)
{
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages/socialtext_2_0_preview
//# http://www.socialtext.net/data/workspaces/st-rest-docs/pages/representation?accept=application/json

	// request the page in json format to get the page attributes
	var urlTemplate = '%0/data/workspaces/%1/pages/%2?accept=application/json';
	if(!params.serverHost.match(/:\/\//))
		urlTemplate = 'http://' + urlTemplate;
	var url = urlTemplate.format([params.serverHost,params.workspace,title]);
//#displayMessage('getSocialtext url: '+url);

	params.title = title;
	params.wikiformat = 'Socialtext';
	params.serverType = 'socialtext';
	var req = doHttp('GET',url,null,null,null,null,SocialtextChannel.getTiddlerCallback,params);
//#displayMessage('req:'+req);
};

SocialtextChannel.getTiddlerCallback = function(status,params,responseText,xhr)
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
		var dt = queryResult.last_edit_time;
		var modified = new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
//#displayMessage('modified:'+queryResult.last_edit_time);
//#displayMessage('modified2:'+modified);
		params.modified = modified;
	} catch (ex) {
		//alert('SocialtextChannel.getTiddlerCallback: JSON error');
		displayMessage('Response:'+responseText.substr(0,50));
	}
	// request the page's text
	//#var urlTemplate = 'http://%0/data/workspaces/%1/pages/%2?accept=text/vnd.socialtext.wiki';
	var urlTemplate = '%0/data/workspaces/%1/pages/%2?accept=%3';
	if(!params.serverHost.match(/:\/\//))
		urlTemplate = 'http://' + urlTemplate;
	var url = urlTemplate.format([params.serverHost,params.workspace,params.title,SocialtextChannel.mimeType]);
	var req = doHttp('GET',url,null,null,null,null,SocialtextChannel.getTiddlerCallback2,params);
//#displayMessage('req:'+req);
};

SocialtextChannel.getTiddlerCallback2 = function(status,params,responseText,xhr)
{
//#displayMessage('getTiddlerCallback2 status:'+status);
//#displayMessage('rt:'+responseText);
//#displayMessage('xhr:'+xhr);
	var content = responseText;
	if(content) {
		var tiddler = store.createTiddler(params.title);
		tiddler.updateFieldsAndContent(params,content);
		if(params.tags)
			tiddler.tags = params.tags;
		if(params.modified)
			tiddler.modified = params.modified;
		if(params.serverPageName)
			tiddler.fields['server.page.name'] = params.serverPageName;
		if(params.serverPageId)
			tiddler.fields['server.page.id'] = params.serverPageId;
		tiddler.modifier = params.modifier ? params.modifier : params.serverHost;
		store.updateStory(tiddler);
	}
};

SocialtextChannel.putTiddler = function(title,params)
{
	var text = store.fetchTiddler(title).text;
//# data/workspaces/:ws/pages/:pname
	var urlTemplate = '%0/data/workspaces/%1/pages/%2';
	if(!params.serverHost.match(/:\/\//))
		urlTemplate = 'http://' + urlTemplate;
	var url = urlTemplate.format([params.serverHost,params.workspace,title,text]);
//#displayMessage('putUrl:'+url);

	params.title = title;
	var req = doHttp('POST',url,text,SocialtextChannel.mimeType,null,null,SocialtextChannel.putTiddlerCallback,params,{"X-Http-Method": "PUT"});
//#displayMessage('req:'+req);
};

SocialtextChannel.putTiddlerCallback = function(status,params,responseText,xhr)
{
	//#displayMessage('putTiddlerCallback status:'+status);
	//#displayMessage('rt:'+responseText.substr(0,50));
	//#displayMessage('xhr:'+xhr);
	if(!status)
		displayMessage('Status text:'+xhr.statusText);
	if(params.callback)
		params.callback(params);
};

config.hostFunctions.getTiddler['socialtext'] = SocialtextChannel.getTiddler;
config.hostFunctions.putTiddler['socialtext'] = SocialtextChannel.putTiddler;

} // end of 'install only once'
//}}}
