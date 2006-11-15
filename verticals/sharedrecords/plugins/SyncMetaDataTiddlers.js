/***
|''Name:''|SharedRecordsSyncPlugin|
|''Description:''|Allows changes to be synchronised with a SharedRecords server|
|''Source:''|http://sharedrecords.tiddlywiki.com/#SyncMetaDataTiddlers|
|''Author:''|JeremyRuston (jeremy (at) osmosoft (dot) com)|
|''Version:''|0.9.0|
|''Date:''|Nov 14, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.0|
***/

//{{{

// Ensure that the SharedRecordsSyncPlugin is only installed once.
if(!version.extensions.SharedRecordsSyncPlugin) {
version.extensions.SharedRecordsSyncPlugin = {installed:true};
// Check version number of core code
if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("SharedRecordsSyncPlugin requires TiddlyWiki 2.1 or later.");}

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

// Translateable strings
config.macros.sharedRecordsSync = {
	label: "sync",
	prompt: "Plug back in to the SharedRecords server and synchronize changes",
	jsonTag: '"%0"',
	jsonTagSep: ',',
	jsonEntry: '{"title":"%0","modified":"%1","modifier":"%2","created":"%3",\n"tags":[%4],"text":"%5",\n"sharedRecords.recordUID":"%6","sharedRecords.url":"%7","sharedRecords.sequenceNumber":"%8"}\n',
	jsonEntrySep: ',',
	jsonWrapper: '{"sharedRecords.maxSequenceNumber":"%0","tiddlers":[%1]}'
};

// sharedRecordsSync macro
config.macros.sharedRecordsSync.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(!wikifier.isStatic)
		createTiddlyButton(place,this.label,this.prompt,this.doSync);
}

config.macros.sharedRecordsSync.doSync = function(place)
{
	var isoDate = function(d) {
		return d.formatString("YYYY-0MM-0DDT0hh:0mm:0ss.000UTC");
		};
	// Get the list of syncable tiddlers
	var syncList = [];
	var maxSequenceNumber = 0;
	store.forEachTiddler(function(title,tiddler) {
		var shRecordUID = store.getValue(tiddler,"sharedRecords.recordUID");
		var shUrl = store.getValue(tiddler,"sharedRecords.url");
		var sequenceNumber = parseInt(store.getValue(tiddler,"sharedRecords.sequenceNumber"));
		if(sequenceNumber > maxSequenceNumber)
			maxSequenceNumber = sequenceNumber;
		//maxSequenceNumber = Math.max(sequenceNumber,maxSequenceNumber);
		var changeCount = store.getValue(tiddler,"changeCount");
		if(shRecordUID && shUrl && changeCount > 0)
			syncList.push(tiddler);
		});
	if(syncList.length == 0)
		{
		displayMessage("Nothing to deposit");
		return;
		}
	var entries = [];
	for(var t=0; t<syncList.length; t++)
		{
		var tiddler = syncList[t];
		var tags = [];
		for(var tag=0; tag<tiddler.tags.length; tag++)
			tags.push(config.macros.sharedRecordsSync.jsonTag.format([tiddler.tags[tag]]));
		var shRecordUID = store.getValue(tiddler,"sharedRecords.recordUID");
		var shUrl = store.getValue(tiddler,"sharedRecords.url");
		var sequenceNumber = store.getValue(tiddler,"sharedRecords.sequenceNumber");
		entries.push(config.macros.sharedRecordsSync.jsonEntry.format([
			tiddler.title,
			isoDate(tiddler.modified),
			tiddler.modifier,
			isoDate(tiddler.created),
			tags.join(config.macros.sharedRecordsSync.jsonTagSep),
			tiddler.text,
			shRecordUID,
			shUrl,
			sequenceNumber
			]));
		}
	var payload = config.macros.sharedRecordsSync.jsonWrapper.format([maxSequenceNumber,entries.join(config.macros.sharedRecordsSync.jsonEntrySep)]);
	shRecordUID = store.getValue(syncList[0],"sharedRecords.recordUID");
	shUrl = store.getValue(syncList[0],"sharedRecords.url");
	displayMessage("Depositing: " + payload + " to " + shUrl);
	var r = doHttp("POST",
		shUrl,
		"recordUID=" + encodeURI(shRecordUID) + "&payload=" + encodeURI(payload),
		null,null,
		config.macros.sharedRecordsSync.donePut);
	if(typeof r == "string")
		{
		alert("Error depositing data to server");
		}
}

config.macros.sharedRecordsSync.donePut = function(status,params,responseText,url,xhr)
{
	if(status)
		displayMessage("Done");
	else
		displayMessage("Failed: " + xhr.statusText + " (" + xhr.status + ")");
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
