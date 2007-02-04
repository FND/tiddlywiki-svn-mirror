/***
|''Name:''|MediaWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from MediaWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#MediaWikiAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/MediaWikiAdaptorPlugin.js|
|''Version:''|0.1.2|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

''For debug:''
|''Default MediaWiki Server''|<<option txtmediaWikiDefaultServer>>|

***/

//{{{
if(!config.options.txtmediaWikiDefaultServer)
	{config.options.txtmediaWikiDefaultServer = 'www.wikipedia.org';}
//}}}

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.MediaWikiAdaptorPlugin) {
version.extensions.MediaWikiAdaptorPlugin = {installed:true};

MediaWikiAdaptor = {}; // 'namespace' for local functions

MediaWikiAdaptor.anyChild = function(obj)
//# convenience function for getting children whose keys are unknown
//# such as children of pages subobjects, whose keys are numeric page ids
{
	for(var key in obj) {
		return obj[key];
	}
	return null;
};

MediaWikiAdaptor.canonicalTitle = function(title)
{
	var canonicalTitle = title.charAt(0).toUpperCase() + title.substr(1);
	return canonicalTitle.replace(/\s/g,'_');
};

MediaWikiAdaptor.getTiddler = function(title,params)
{
	var canonicalTitle = MediaWikiAdaptor.canonicalTitle(title);
//#displayMessage('MediaWikiAdaptor.getTiddler:'+canonicalTitle);
//# http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&titles=Elongation
	params.title = title;
	params.serverWorkspace = null;
	params.wikiformat = 'MediaWiki';
	params.serverType = 'mediawiki';
	var urlTemplate = '%0/w/api.php?format=json&action=%1&prop=revisions&rvprop=content&titles=%2';
	if(!params.serverHost.match(/:\/\//))
		urlTemplate = 'http://' + urlTemplate;
	var url = urlTemplate.format([params.serverHost,'query',canonicalTitle]);
//#displayMessage('url:'+url);
	var req = doHttp('GET',url,null,null,null,null,MediaWikiAdaptor.getTiddlerCallback,params,null);
//#displayMessage('req:'+req);
};

MediaWikiAdaptor.getTiddlerCallback = function(status,params,responseText,xhr)
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
		alert('Oh dear, the JSON stuff went awry');
		displayMessage('Response:'+responseText);
		// do something drastic here
	}

	/*var links = page.links;
	if (links && links.length) {
		alert(links[0]['*'] + ' is linked from ' + title);
		tiddler.text += links[0]['*'];
	} else {
		alert('No links on ' + title + ' found');
	}*/

	if(content) {
		var tiddler = store.createTiddler(params.title);
		tiddler.fields['mediawiki.revid'] = String(revid);
		tiddler.updateFieldsAndContent(params,content);
	}
};

MediaWikiAdaptor.putTiddler = function(title,params)
{
//#	var canonicalTitle = MediaWikiAdaptor.canonicalTitle(title);
//#displayMessage('MediaWikiAdaptor.putPage:'+canonicalTitle);
	displayMessage('MediaWiki does not have a REST API for PUT yet');
//#	var canonicalTitle = MediaWikiAdaptor.canonicalTitle(title);
//#	MediaWikiAdaptor.LoginAndPutPage(title);
//#	MediaWikiAdaptor.PutPageWithToken('Elongation','1234')
};

MediaWikiAdaptor.putTiddlerCallback = function(status,params,responseText,xhr)
{
//# displayMessage('putTiddlerCallback status:'+status);
//# displayMessage('rt:'+responseText.substr(0,50));
//# displayMessage('xhr:'+xhr);
};

config.hostFunctions.getTiddler['mediawiki'] = MediaWikiAdaptor.getTiddler;
//config.hostFunctions.putTiddler['mediawiki'] = MediaWikiAdaptor.putTiddler;

} // end of 'install only once'
//}}}
