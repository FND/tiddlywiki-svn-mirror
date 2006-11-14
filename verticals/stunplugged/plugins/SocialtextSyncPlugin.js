/***
|''Name:''|SocialtextSyncPlugin|
|''Description:''|Allows changes to be synchronised with a Socialtext server|
|''Source:''|http://stunplugged.tiddlywiki.com/#SocialtextSyncPlugin|
|''Author:''|JeremyRuston (jeremy (at) osmosoft (dot) com)|
|''Version:''|0.9.0|
|''Date:''|Nov 8, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.0|

This is an early release of the SocialtextSyncPlugin, which allows you to synchronise unplugged Socialtext content
back to the server.

This is an early alpha release and may contain defects.
Please report any defects you find at http://groups.google.co.uk/group/TiddlyWikiDev

***/

//{{{

// Ensure that the SocialtextSyncPlugin is only installed once.
if(!version.extensions.SocialtextSyncPlugin) {
version.extensions.SocialtextSyncPlugin = {installed:true};
// Check version number of core code
if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("SocialtextSyncPlugin requires TiddlyWiki 2.1 or later.");}

// Translateable strings
config.macros.socialtextSync = {
	label: "sync",
	prompt: "Plug back in to the Socialtext server and synchronize changes",
	urlGetPageset: "%0data/workspaces/%1/pages",
	urlPutPage: "%0data/workspaces/%1/pages/%2",
	urlViewPage: "%0%1/index.cgi?%2",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'selected', rowName: 'title', type: 'Selector'},
			{name: 'Title', field: 'title', tiddlerLink: 'title', title: "Title", type: 'TiddlerLink'},
			{name: 'Local Status', field: 'localStatus', title: "Local Status", type: 'String'},
			{name: 'Server Status', field: 'serverStatus', title: "Server Status", type: 'String'},
			{name: 'Server URL', field: 'serverUrl', title: "Server URL", text: "View", type: 'Link'},
			{name: 'Server', field: 'server', title: "Server", type: 'String'},
			{name: 'Workspace', field: 'workspace', title: "Workspace", type: 'String'}
			],
		rowClasses: [
			],
		buttons: [
			{caption: "Sync these tiddlers", name: 'sync'}
			]}
};

// Sync state data
sync = {
	syncList: [], // List of sync objects (title, tiddler, server, workspace, page, version)
	listView: null // DOM element of the listView table
};

// Core extensions to maintain a 'changeCount' extended field

var coreSaveTiddler = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields)
{
	var r = coreSaveTiddler.apply(this,arguments);
	incChangeCount(newTitle);
	return r;
}

var coreSetTiddlerTag = TiddlyWiki.prototype.setTiddlerTag;
TiddlyWiki.prototype.setTiddlerTag = function(title,status,tag)
{
	var r = coreSetTiddlerTag.apply(this,arguments);
	incChangeCount(title);
	return r;
}

function incChangeCount(title)
{
	var c = store.getValue(title,"changeCount");
	if(!c)
		c = 0;
	store.setValue(title,"changeCount",++c);
}

// socialtextSync macro
config.macros.socialtextSync.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(!wikifier.isStatic)
		config.macros.socialtextSync.doSync(place);
}

config.macros.socialtextSync.doSync = function(place)
{
	// Get the list of syncable tiddlers
	sync.syncList = [];
	store.forEachTiddler(function(title,tiddler) {
		var syncData = {title: title,
			tiddler: tiddler,
			server: store.getValue(tiddler,"socialtext.server"),
			workspace: store.getValue(tiddler,"socialtext.workspace"),
			page: store.getValue(tiddler,"socialtext.page"),
			version: store.getValue(tiddler,"socialtext.version"),
			changeCount: store.getValue(tiddler,"changeCount"),
			serverStatus: "Checking server..."
			};
		syncData.localStatus = syncData.changeCount > 0 ? "Changed while unplugged" : "Unchanged while unplugged";
		syncData.selected = syncData.changeCount > 0;
		syncData.serverUrl = config.macros.socialtextSync.urlViewPage.format([syncData.server,syncData.workspace,syncData.page]);
		if(syncData.server && syncData.workspace && syncData.page)
			sync.syncList.push(syncData);
		});
	// Create the UI, including listview and cancel button
	sync.listView = ListView.create(place,sync.syncList,this.listViewTemplate,this.onSelectCommand);
	// Get the pageset info from each server/workspace combo
	var done = {};
	for(t=0; t<sync.syncList.length; t++)
		{
		var s = sync.syncList[t];
		s.statusElement = s.colElements["serverStatus"];
		var u = s.server + s.workspace;
		if(!done[u])
			{
			done[u] = true;
			var url = this.urlGetPageset.format([s.server,s.workspace]);
			var r = doHttp("GET",
				url,
				undefined,
				null,null,
				config.macros.socialtextSync.doneGetPageset,
				{server: s.server, workspace: s.workspace},
				"application/json");
			if(typeof r == "string")
				{
				removeChildren(s.statusElement);
				createTiddlyError(s.statusElement,"Error »",r);
				}
			}
		}
}

config.macros.socialtextSync.onSelectCommand = function(listView,command,rowNames)
{
	switch(command)
		{
		case "cancel":
			break;
		case "sync":
			config.macros.socialtextSync.doPutPages(rowNames);
			break;
		}
}

config.macros.socialtextSync.doneGetPageset = function(status,params,responseText,url,xhr)
{
	displayMessage(responseText);
	// Get the pageset info from the response
	var pagesetInfo = status ? window.eval(responseText) : null;
	// Save each syncable tiddler belonging to this server/workspace combo
	for(var t=0; t<sync.syncList.length; t++)
		{
		var s = sync.syncList[t];
		if(s.server == params.server && s.workspace == params.workspace)
			{
			removeChildren(s.statusElement);
			if(status)
				{
				var url = config.macros.socialtextSync.urlPutPage.format([s.server,s.workspace,s.page]);
				var pageInfo = pagesetInfo.findByField("page_id",s.page);
				if(pageInfo != null)
					pageInfo = pagesetInfo[pageInfo];
				if(pageInfo)
					{
					s.serverVersion = pageInfo.revision_id;
					if(s.serverVersion > s.version)
						createTiddlyText(s.statusElement,"Changed on server");
					else
						createTiddlyText(s.statusElement,"Unchanged on server");
					}
				else
					createTiddlyText(s.statusElement,"Does not exist on server");
				}
			else
				createTiddlyError(s.statusElement,"Failed »",xhr.statusText + " (" + xhr.status + ")");
			}
		}
}

config.macros.socialtextSync.doPutPages = function(selNames)
{
	var syncCount = 0;
	// Save each syncable tiddler belonging to this server/workspace combo
	for(var t=0; t<selNames.length; t++)
		{
		var f = sync.syncList.findByField("title",selNames[t]);
		var s = f == null ? null : sync.syncList[f];
		if(s)
			{
			syncCount++;
			removeChildren(s.statusElement);
			var url = config.macros.socialtextSync.urlPutPage.format([s.server,s.workspace,s.page]);
			createTiddlyText(s.statusElement,"Saving...");
			var r = doHttp("PUT",
				url,
				s.tiddler.text,
				null,null,
				config.macros.socialtextSync.donePut,
				s);
			if(typeof r == "string")
				{
				removeChildren(s.statusElement);
				createTiddlyError(s.statusElement,"Error »",r);
				}
			}
		}
	if(syncCount == 0)
		alert("No tiddlers were synced");
}

config.macros.socialtextSync.donePut = function(status,params,responseText,url,xhr)
{
	removeChildren(params.statusElement);
	if(status)
		createTiddlyText(params.statusElement,"Done");
	else
		createTiddlyError(params.statusElement,"Failed »",xhr.statusText + " (" + xhr.status + ")");
}

// HTTP status codes
var httpStatus = {
	OK: 200,
	ContentCreated: 201,
	NoContent: 204,
	Unauthorized: 401,
	Forbidden: 403,
	NotFound: 404,
	MethodNotAllowed: 405
};

// Perform an http request
//   type - GET/POST/PUT/DELETE
//   url - the source url
//   data - optional data for POST and PUT
//   username - optional username for basic authentication
//   password - optional password for basic authentication
//   callback - function to call when there's a response
//   params - parameter object that gets passed to the callback for storing it's state
//   accept - optional MIME type for Accept header
// Return value is the underlying XMLHttpRequest object, or 'null' if there was an error
// Callback function is called like this:
//   callback(status,params,responseText,xhr)
//     status - true if OK, false if error
//     params - the parameter object provided to loadRemoteFile()
//     responseText - the text of the file
//     url - requested URL
//     xhr - the underlying XMLHttpRequest object
function doHttp(type,url,data,username,password,callback,params,accept)
{
	// Get an xhr object
	var x;
	try
		{
		x = new XMLHttpRequest(); // Modern
		}
	catch(e)
		{
		try
			{
			x = new ActiveXObject("Msxml2.XMLHTTP"); // IE 6
			}
		catch (e)
			{
			return "Can't create XMLHttpRequest object";
			}
		}
	// Install callback
	x.onreadystatechange = function()
		{
		if (x.readyState == 4 && callback)
			{
			if([0, httpStatus.OK, httpStatus.ContentCreated, httpStatus.NoContent].contains(x.status))
				callback(true,params,x.responseText,url,x);
			else
				callback(false,params,null,url,x);
			x.onreadystatechange = function(){};
			x = null;
			}
		}
	// Send request
	if(window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
		window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	try
		{
		url = url + (url.indexOf("?") < 0 ? "?" : "&") + "nocache=" + Math.random();
		x.open(type,url,true,username,password);
		if (data)
			x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		if (x.overrideMimeType)
			x.setRequestHeader("Connection", "close");
		if(accept)
			x.setRequestHeader("Accept",accept);
		x.setRequestHeader("X-Requested-With", "TiddlyWiki " + version.major + "." + version.minor + "." + version.revision + (version.beta ? " (beta " + version.beta + ")" : ""));
		x.send(data);
		}
	catch (e)
		{
		return exceptionText(e);
		}
	return x;
}

} // end of "install only once"
//}}}
