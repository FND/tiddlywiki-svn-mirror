/***
|''Name:''|SocialtextSyncPlugin|
|''Description:''|Allows changes to be synchronised with a Socialtext server|
|''Source:''|http://stunplugged.tiddlywiki.com/#SocialtextSyncPlugin|
|''Author:''|JeremyRuston (jeremy (at) osmosoft (dot) com)|
|''Version:''|1.0.0|
|''Date:''|Nov 28, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.3|

This is the SocialtextSyncPlugin, which allows you to synchronise unplugged Socialtext
content back to the server.

***/

//{{{

// Ensure that the SocialtextSyncPlugin is only installed once.
if(!version.extensions.SocialtextSyncPlugin) {
version.extensions.SocialtextSyncPlugin = {installed:true};
// Check version number of core code
if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("SocialtextSyncPlugin requires TiddlyWiki 2.1 or later.");}

config.syncers.socialtext = {
	urlGetPageset: "%0data/workspaces/%1/pages",
	urlPutPage: "%0data/workspaces/%1/pages/%2",
	urlViewPage: "%0%1/index.cgi?%2"
};

config.syncers.socialtext.init = function(sync)
{
	this.requestedPagesets = {}; // Hashmap indexed by requested url of array of syncItems
}

config.syncers.socialtext.addSyncable = function(sync,tiddler,syncItem)
{
	syncItem.socialtext = {
		server: store.getValue(tiddler,"server.host"),
		workspace: store.getValue(tiddler,"server.workspace"),
		page: store.getValue(tiddler,"server.page.id"),
		version: store.getValue(tiddler,"server.page.version")
		};
	if(!syncItem.socialtext.page)
		{
		syncItem.socialtext.page = encodeURIComponent(tiddler.title);
		store.setValue(tiddler,"socialtext.page.id",syncItem.socialtext.page);
		}
	syncItem.serverUrl = this.urlViewPage.format([syncItem.socialtext.server,syncItem.socialtext.workspace,syncItem.socialtext.page]);
	var url = this.urlGetPageset.format([syncItem.socialtext.server,syncItem.socialtext.workspace]);
	if(this.requestedPagesets[url] == undefined)
		{
		var r = doHttp("GET",
			url,
			undefined,
			null,
			null,null,
			config.syncers.socialtext.doneGetPageset,
			{server: syncItem.socialtext.server, workspace: syncItem.socialtext.workspace},
			{"Accept": "application/json"});
		if(typeof r == "string")
			syncItem.serverStatus = "Error\n(" + r + ")";
		else
			syncItem.serverStatus = "Checking server";
		this.requestedPagesets[url] = [];
		}
	this.requestedPagesets[url].push(syncItem);
}

config.syncers.socialtext.doneGetPageset = function(status,params,responseText,url,xhr)
{
	var url = config.syncers.socialtext.urlGetPageset.format([params.server,params.workspace]);
	var syncItems = config.syncers.socialtext.requestedPagesets[url];
	// Get the pageset info from the response
	var pagesetInfo = status ? window.eval(responseText) : null;
	// Save each syncable tiddler belonging to this server/workspace combo
	for(var t=0; t<syncItems.length; t++)
		{
		var syncItem = syncItems[t];
		var statusElem = syncItem.colElements["serverStatus"];
		removeChildren(statusElem);
		if(status)
			{
			var url = config.syncers.socialtext.urlPutPage.format([syncItem.socialtext.server,syncItem.socialtext.workspace,syncItem.socialtext.page]);
			var pageInfo = pagesetInfo.findByField("page_id",syncItem.socialtext.page);
			if(pageInfo != null)
				pageInfo = pagesetInfo[pageInfo];
			if(pageInfo)
				{
				syncItem.socialtext.serverVersion = pageInfo.revision_id;
				if(syncItem.socialtext.serverVersion > syncItem.socialtext.version)
					createTiddlyText(statusElem,"Changed on server");
				else
					createTiddlyText(statusElem,"Unchanged on server");
				}
			else
				createTiddlyText(statusElem,"Does not exist on server");
			}
		else
			createTiddlyError(statusElem,"Failed »",xhr.statusText + " (" + xhr.status + ")");
		}
}

config.syncers.socialtext.doSync = function(sync,syncItem)
{
	var statusElem = syncItem.colElements["serverStatus"];
	removeChildren(statusElem);
	var url = this.urlPutPage.format([syncItem.socialtext.server,syncItem.socialtext.workspace,syncItem.socialtext.page]);
	createTiddlyText(statusElem,"Saving...");
	var r = doHttp("POST",
		url,
		syncItem.tiddler.text,
		"text/x.socialtext-wiki",
		null,null,
		this.donePut,
		syncItem,
		{"X-Http-Method": "PUT"});
	if(typeof r == "string")
		{
		removeChildren(statusElem);
		createTiddlyError(statusElem,"Error »",r);
		}
}

config.syncers.socialtext.donePut = function(status,syncItem,responseText,url,xhr)
{
	var statusElem = syncItem.colElements["serverStatus"];
	removeChildren(statusElem);
	if(status)
		createTiddlyText(statusElem,"Done");
	else
		createTiddlyError(statusElem,"Failed »",xhr.statusText + " (" + xhr.status + ")");
}

} // end of "install only once"
//}}}
