/***
|''Name:''|MediaWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from MediaWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#MediaWikiAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/MediaWikiAdaptorPlugin.js|
|''Version:''|0.2.0|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.MediaWikiAdaptorPlugin) {
version.extensions.MediaWikiAdaptorPlugin = {installed:true};

MediaWikiAdaptor = function()
{
	this.host = null;
	this.workspace = null;
	return this;
};

MediaWikiAdaptor.anyChild = function(obj)
//# convenience function for getting children whose keys are unknown
//# such as children of pages subobjects, whose keys are numeric page ids
{
	for(var key in obj) {
		return obj[key];
	}
	return null;
};

MediaWikiAdaptor.normalizedTitle = function(title)
{
	var normalizedTitle = title.charAt(0).toUpperCase() + title.substr(1);
	return normalizedTitle.replace(/\s/g,'_');
};

MediaWikiAdaptor.prototype.openHost = function(host,callback,callbackParams)
{
displayMessage('MediaWikiAdaptor.openHost:'+host);
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1)!="/")
		host = host + "/";
	this.host = host;
	if(callback)
		window.setTimeout(callback,0,true,this,callbackParams);
	return true;
};

MediaWikiAdaptor.prototype.getTiddler = function(tiddler)
{
	var normalizedTitle = MediaWikiAdaptor.normalizedTitle(tiddler.title);
displayMessage('MediaWikiAdaptor.getTiddler:'+normalizedTitle);
//# http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&titles=Elongation
	tiddler.fields.wikiformat = 'MediaWiki';
	tiddler.fields['server.type'] = 'mediawiki';
	var urlTemplate = '%0w/api.php?format=json&action=%1&prop=revisions&rvprop=content&titles=%2';
	var url = urlTemplate.format([this.host,'query',normalizedTitle]);
displayMessage('url:'+url);
	var req = doHttp('GET',url,null,null,null,null,MediaWikiAdaptor.getTiddlerCallback,tiddler);
//#displayMessage('req:'+req);
};

MediaWikiAdaptor.getTiddlerCallback = function(status,tiddler,responseText,xhr)
{
//#displayMessage('getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,50));
//# displayMessage('xhr:'+xhr);
	var content = null;
	try {
		//# convert the downloaded data into a javascript object
		eval('var queryResult=' + responseText);
		var page = MediaWikiAdaptor.anyChild(queryResult.query.pages);
		var revision = MediaWikiAdaptor.anyChild(page.revisions);
		content = revision['*'];
		var revid = revision['revid'];
	} catch (ex) {
		displayMessage('Error response:'+responseText);
	}
	/*var links = page.links;
	if (links && links.length) {
		alert(links[0]['*'] + ' is linked from ' + title);
		tiddler.text += links[0]['*'];
	} else {
		alert('No links on ' + title + ' found');
	}*/
	if(content) {
		tiddler.text = content;
		tiddler.fields['mediawiki.revid'] = String(revid);
		tiddler.updateAndSave();
	}
};

MediaWikiAdaptor.prototype.getWorkspaceList = function(callback,callbackParams) {return false;};
MediaWikiAdaptor.prototype.openWorkspace = function(workspace,callback,callbackParams) {return false;};
MediaWikiAdaptor.prototype.getTiddlerList = function(callback,callbackParams) {return false;};
MediaWikiAdaptor.prototype.putTiddler = function(tiddler) {return false;};
MediaWikiAdaptor.prototype.close = function() {return true;};

config.adaptor['mediawiki'] = MediaWikiAdaptor;
} // end of 'install only once'
//}}}
