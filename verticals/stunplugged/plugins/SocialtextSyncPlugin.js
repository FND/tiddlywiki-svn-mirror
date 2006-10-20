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
	prompt: "Plug back in to the Socialtext server and synchronize changes"
};

// socialtextSync macro
config.macros.socialtextSync.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	createTiddlyButton(place,this.label,this.prompt,this.onClick);
}

config.macros.socialtextSync.onClick = function(e)
{
	var username = prompt("Please enter your Socialtext username");
	var password = prompt("Please enter your Socialtext password");
	var syncList = [];
	store.forEachTiddler(function(title,tiddler) {
			syncList.push({title: title,
				tiddler: tiddler,
				server: store.getValue(tiddler,"socialtext.server"),
				origin: store.getValue(tiddler,"socialtext.origin"),
				version: store.getValue(tiddler,"socialtext.version"),
				fingerprint: store.getValue(tiddler,"socialtext.fingerprint")});
		});
	for(var t=0; t<syncList.length; t++)
		{
		sync = syncList[t];
		if(sync.server && sync.origin)
			{
			var url = sync.server + sync.origin;
			displayMessage("Putting " + sync.title + " to " + url);
			doHttp("PUT",
				url,
				sync.tiddler.text,
				username,password,
				config.macros.socialtextSync.donePut,
				sync);
			}
		}
}


config.macros.socialtextSync.donePut = function(status,params,responseText,xhr)
{
	if(status)
		displayMessage("Synced " + params.title + " successfully");
	else
		displayMessage("Failed to save " + params.title);
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
// Return value is the underlying XMLHttpRequest object, or 'null' if there was an error
// Callback function is called like this:
//   callback(status,params,responseText,xhr)
//     status - true if OK, false if error
//     params - the parameter object provided to loadRemoteFile()
//     responseText - the text of the file
//     xhr - the underlying XMLHttpRequest object
function doHttp(type,url,data,username,password,callback,params)
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
			if ((x.status == 0 || x.status == httpStatus.OK || x.status == httpStatus.ContentCreated || x.status == httpStatus.NoContent))
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
