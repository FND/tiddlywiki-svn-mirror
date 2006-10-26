/***
|''Name:''|SocialtextSyncPlugin|
|''Description:''|Pre-release - Allows changes to be synchronised with a Socialtext server|
|''Source:''|http://stunplugged.tiddlywiki.com/#SocialtextSyncPlugin|
|''Author:''|JeremyRuston (jeremy (at) osmosoft (dot) com)|
|''Version:''|0.1.0|
|''Status:''|alpha pre-release|
|''Date:''|Oct 13, 2006|
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
	urlPutPage: "%0data/workspaces/%1/pages/%2",
	urlGetPageset: "%0data/workspaces/%1/pages",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Title', field: 'title', title: "Title", type: 'String'},
			{name: 'Status', field: 'status', title: "Status", type: 'String'},
			{name: 'Server', field: 'server', title: "Server", type: 'String'},
			{name: 'Workspace', field: 'workspace', title: "Workspace", type: 'String'},
			{name: 'Page', field: 'page', title: "Page", type: 'String'},
			{name: 'Version', field: 'version', title: "Version", type: 'String'},
			{name: 'Fingerprint', field: 'fingerprint', title: "Fingerprint", type: 'String'}
			],
		rowClasses: [
			],
		actions: [
			{caption: "More actions...", name: ''},
			{caption: "Sync these tiddlers", name: 'sync'},
			{caption: "Cancel this sync", name: 'cancel'}
			]}
};

// Backstage handling
var backstage = {
	backstage: null, // Backstage element
	cloak: null, // Cloak element
	panel: null, // Panel element

	create: function()
	{
		this.cloak = document.getElementById("cloak");
		this.cloak.style.display = "block";
		this.backstage = document.getElementById("backstage");
		this.panel = createTiddlyElement(this.backstage,"div",null,"panel");
		return this.panel;
	},

	show: function()
	{
		if(this.panel)
			anim.startAnimating(new Slider(this.panel,true,false,"none"),new Scroller(this.panel,false));
	},
	
	remove: function(panel,cloak)
	{
		if(anim && config.options.chkAnimate)
			anim.startAnimating(new Slider(this.panel,false,false,"all"));
		else
			this.panel.parentNode.removeChild(this.panel);
		this.cloak.style.display = "none";
	}
};

// Sync state data
sync = {
	syncList: [], // List of sync objects (title, tiddler, server, workspace, page, version, fingerprint)
	listView: null // DOM element of the listView table
};

// socialtextSync macro
config.macros.socialtextSync.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	createTiddlyButton(place,this.label,this.prompt,this.onClick);
}

config.macros.socialtextSync.onClick = function(e)
{
	config.macros.socialtextSync.doSync();
	return false;
}
config.macros.socialtextSync.doSync = function()
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
			fingerprint: store.getValue(tiddler,"socialtext.fingerprint"),
			status: "Checking server..."};
		if(syncData.server && syncData.workspace && syncData.page)
			sync.syncList.push(syncData);
		});
	// Create the UI, including listview and cancel button
	var panel = backstage.create();
	sync.listView = ListView.create(panel,sync.syncList,this.listViewTemplate,this.onSelectCommand);
	backstage.show();
	// Get the pageset info from each server/workspace combo
	var done = {};
	for(t=0; t<sync.syncList.length; t++)
		{
		var s = sync.syncList[t];
		s.statusElement = s.colElements["status"];
		var u = s.server + s.workspace;
		if(!done[u])
			{
			done[u] = true;
			var url = this.urlGetPageset.format([s.server,s.workspace]);
			doHttp("GET",
				url,
				undefined,
				null,null,
				config.macros.socialtextSync.doneGetPageset,
				{server: s.server, workspace: s.workspace},
				"application/json");
			}
		}
}

config.macros.socialtextSync.onSelectCommand = function(listView,command,rowNames)
{
	switch(command)
		{
		case "cancel":
			backstage.remove();
			break;
		}
}

config.macros.socialtextSync.doneGetPageset = function(status,params,responseText,url,xhr)
{
	// Get the pageset info from the response
	var pagesetInfo = status ? window.eval(responseText) : null;
	// Save each syncable tiddler belonging to this server/workspace combo
	for(var t=0; t<sync.syncList.length; t++)
		{
		var s = sync.syncList[t];
		if(s.server == params.server && s.workspace == params.workspace)
			{
			//removeChildren(s.statusElement);
			if(status)
				{
				var url = config.macros.socialtextSync.urlPutPage.format([s.server,s.workspace,s.page]);
				var pageInfo = pagesetInfo.findByField("name",s.title);
				if(s.title == "Quick Start")
					alert("Got it " + pagesetInfo[3].name);
				if(pageInfo)
					{
					if(pageInfo.revision_id > s.version)
						createTiddlyElement(s.statusElement,"div",null,null,"Updating '" + s.title + "' even though server version " + pageInfo.revision_id + " is newer than " + s.version + " for " + url);
					else
						createTiddlyElement(s.statusElement,"div",null,null,"Updating '" + s.title + "' over unchanged server version " + pageInfo.revision_id + " same as " + s.version + " for " + url);
					}
				else
					createTiddlyElement(s.statusElement,"div",null,null,"Couldn't find existing '" + s.title + "'; creating at " + url);
				doHttp("PUT",
					url,
					s.tiddler.text,
					null,null,
					config.macros.socialtextSync.donePut,
					s);
				}
			else
				createTiddlyElement(s.statusElement,"div",null,null,"Failed: " + xhr.statusText + " (" + xhr.status + ")");
			}
		}
}

config.macros.socialtextSync.donePut = function(status,params,responseText,url,xhr)
{
	//removeChildren(params.statusElement);
	if(status)
		createTiddlyText(params.statusElement,"Done");
	else
		createTiddlyText(params.statusElement,"Failed: " + xhr.statusText + " (" + xhr.status + ")");
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
			return null;
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
		alert("Error while sending " + url + ":" + e);
		return null;
		}
	return x;
}

} // end of "install only once"
//}}}
