/***
|''Name:''|ZiddlyWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from ZiddlyWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#ZiddlyWikiAdaptorPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/ZiddlyWikiAdaptorPlugin.js|
|''Version:''|0.2.1|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

''For debug:''
|''Default ZiddlyWiki Server''|<<option txtZiddlyWikiDefaultServer>>|
|''Default ZiddlyWiki Web(workspace)''|<<option txtZiddlyWikiDefaultWorkspace>>|
|''Default ZiddlyWiki username''|<<option txtZiddlyWikiUsername>>|
|''Default ZiddlyWiki password''|<<option txtZiddlyWikiPassword>>|

***/

//{{{
if(!config.options.txtZiddlyWikiDefaultServer)
	{config.options.txtZiddlyWikiDefaultServer = 'www.ziddlywiki.org';}
if(!config.options.txtZiddlyWikiDefaultWorkspace)
	{config.options.txtZiddlyWikiDefaultWorkspace = '';}
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

ZiddlyWikiAdaptor = function()
{
	this.host = null;
	this.workspace = null;
	return this;
};

ZiddlyWikiAdaptor.prototype.openHost = function(host,params)
{
//#displayMessage('MediaWikiAdaptor.openHost:'+host);
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1)!="/")
		host = host + "/";
	this.host = host;
	if(params && params.callback)
		window.setTimeout(params.callback,0,true,this,params.callbackParams);
	return true;
};

ZiddlyWikiAdaptor.prototype.openWorkspace = function(workspace,params)
{
	this.workspace = workspace;
	if(params && params.callback)
		window.setTimeout(params.callback,0,true,this,params.callbackParams);
	return true;
};

ZiddlyWikiAdaptor.prototype.getTiddlerList = function(params)
{
//#displayMessage('getTiddlerList');
//# http://www.ziddlywiki.com/ZiddlyWiki?action=get&id=News
	var urlTemplate = '%0data/workspaces/%1/pages';
	var url = urlTemplate.format([this.host,this.workspace]);
//#displayMessage('url:'+url);
	params.adaptor = this;
	var req = doHttpGET(url,ZiddlyWikiAdaptor.getTiddlerListCallback,params);
//#displayMessage('req:'+req);
	return (typeof req == 'string') ? req : true;
};

ZiddlyWikiAdaptor.getTiddlerListCallback = function(status,params,responseText,xhr)
{
//#displayMessage('getTiddlerListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	if(status) {
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
		} catch (ex) {
			params.status = false;
			params.statusText = exceptionText(ex,"Error parsing result from server");
			if(params.callback)
				params.callback(params);
			return;
		}
		var list = [];
		for(var i=0; i<info.length; i++) {
			list.push({title:info[i].name});
		}
		params.list = list;
		params.status = true;
	} else {
		params.status = false;
		params.statusText = xhr.statusText;
	}
	if(params.callback)
		params.callback(params);
};

//# News
//# [[Version 2.0.11.4]] has been released.\n\n[[Version 2.0.11.3]] has been released.\n\n[[Version 2.0.11.2]] has been released.\n\nWith this version the maintainership has changed.  Tim Morgan has retired and development has merged with the main TiddlyWiki systems at http://trac.tiddlywiki.org.  We are thankful to retain hosting by [[Zettai|http://zettai.net]].\n
//# BobMcElrath
//# 200609051750
//# 200601051659
//# about protected
//#
//# 871.64174.18161.45875

ZiddlyWikiAdaptor.prototype.getTiddler = function(tiddler)
{
	title = encodeURIComponent(tiddler.title);
//#displayMessage('ZiddlyWikiAdaptor.getTiddler:'+title);
//# http://www.ziddlywiki.com/ZiddlyWiki?action=get&id=News

	var urlTemplate = '%0ZiddlyWiki?action=get&id=%1';
	var url = urlTemplate.format([this.host,title]);
//#displayMessage('getZiddlyWwiki url: '+url);
//# http://www.ziddlywiki.org/ZiddlyWiki?action=get&id=ZiddlyWiki

	tiddler.fields['server.type'] = 'ziddlywiki';
	var req = doHttpGET(url,ZiddlyWikiAdaptor.getTiddlerCallback,tiddler);
//#displayMessage("req:"+req);
};

ZiddlyWikiAdaptor.getTiddlerCallback = function(status,tiddler,responseText,xhr)
{
//#displayMessage('Ziddly.getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	if(status && responseText.substr(0,1)!='-') {
		var x = responseText.split('\n');
		var content = x[1];
		tiddler.text = content.unescapeLineBreaks();
		try {
			tiddler.modifier = x[2];
			tiddler.tags = x[5];
			if(x[3])
				tiddler.created = Date.convertFromYYYYMMDDHHMM(x[3]);
			if(x[4])
				tiddler.modified = Date.convertFromYYYYMMDDHHMM(x[4]);
		} catch(ex) {
		}
		tiddler.updateAndSave();
	}
	//#else {
	//#	displayMessage('Error:'+responseText.substr(0,50));
	//#	displayMessage('putXh:'+xhr);
	//#}
};

ZiddlyWikiAdaptor.prototype.getTiddlerRevisionList = function(tiddler)
// get a list of the revisions for a tiddler
{
	var title = encodeURIComponent(tiddler.title);
//#displayMessage('ZiddlyWikiAdaptor.getTiddlerRevisionList:'+title);
// http://www.ziddlywiki.com/ZiddlyWiki?action=get_revisions&id=News
	//ajax.get('?action=get_revisions&id=' + encodeURIComponent(title) + '&' + zw.no_cache(), callback);

	var urlTemplate = '%0ZiddlyWiki?action=get_revisions&id=%1';
	var url = urlTemplate.format([this.host,title]);
//#displayMessage('getZiddlyWwiki url: '+url);
// http://www.ziddlywiki.org/ZiddlyWiki?action=get_revisions&id=ZiddlyWiki

	tiddler.fields['server.type'] = 'ziddlywiki';
	var req = doHttpGET(url,ZiddlyWikiAdaptor.getTiddlerRevisionListCallback,tiddler);
//#displayMessage("req:"+req);
};

ZiddlyWikiAdaptor.getTiddlerRevisionListCallback = function(status,tiddler,responseText,xhr)
{
//#displayMessage('Ziddly.getTiddlerRevisionListCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
//#displayMessage('callback:'+tiddler.callback);
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
	if(tiddler['temp.callback'])
		tiddler['temp.callback'](tiddler,revisions);
};

//# placeholder, not working yet
ZiddlyWikiAdaptor.getTiddlerRevision = function(tiddler,revision,src,updateTimeline)
{
	title = encodeURIComponent(tiddler.title);
	if(tiddler.fields['server.page.revision'] == revision)
		return;
	zw.status('loading...');
	revision = revision ? '&revision=' + revision : '';
	updateTimeline = updateTimeline ? '&updatetimeline=1' : '';
	//ajax.get('?action=get&id=' + encodeURIComponent(title) + revision + updateTimeline + '&' + zw.no_cache(),displayTiddlerRevisionCallback)
};

//# placeholder, not working yet
ZiddlyWikiAdaptor.getTiddlerRevisionCallback = function(status,tiddler,responseText,xhr)
{
//#displayMessage('getTiddlerRevisionCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//#displayMessage('xhr:'+xhr);
	var encoded = responseText;
	if(encoded.indexOf('\n') > -1) {
		var parts = encoded.split('\n');
		var title = parts[0];
		tiddler.set(title,Tiddler.unescapeLineBreaks(parts[1].htmlDecode()),parts[2],
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

ZiddlyWikiAdaptor.prototype.putTiddler = function(tiddler)
{
	var title = encodeURIComponent(tiddler.title);
	var urlTemplate = '%0RPC2/';
	var url = urlTemplate.format([this.host,encodeURIComponent(title)]);
//#displayMessage('putZiddlyWwiki url: '+url);

	tiddler.fields['server.type'] = 'ziddlywiki';
	var req =doHttp('POST',url,payload,null,this.username,this.password,ZiddlyWikiAdaptor.putTiddlerCallback,tiddler);
//#displayMessage("req:"+req);
};

ZiddlyWikiAdaptor.putTiddlerCallback = function(status,tiddler,responseText,xhr)
{
	//#displayMessage('putTiddlerCallback status:'+status);
	//#displayMessage('rt:'+responseText.substr(0,50));
	//#displayMessage('xhr:'+xhr);
};

ZiddlyWikiAdaptor.prototype.getWorkspaceList = function(params) {return false;};
ZiddlyWikiAdaptor.prototype.close = function() {return true;};

config.adaptors['ziddlywiki'] = ZiddlyWikiAdaptor;
} // end of 'install only once'
//}}}
