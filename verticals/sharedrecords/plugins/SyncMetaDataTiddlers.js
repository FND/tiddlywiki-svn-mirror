/***
|''Name:''|SharedRecordsSyncPlugin|
|''Description:''|Allows metadata to be synchronised with a Shared Records server|
|''Source:''|http://sharedrecords.tiddlywiki.com/#SharedRecordsSyncPlugin|
|''Author:''|JeremyRuston|
|''Version:''|1.1.3|
|''Date:''|Jan 17, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.2.0|

This plugin allows metadata to be synchronised with a Shared Records (SR) server (see
http://www.sharedrecords.org/).

In SR terminology, a record on a particular server is addressed as a record UID (a
40-digit hex string). The items of metadata associated with a record are a sequence
of named blobs of text.

Mapping these terms to TWs synchronisation framework, a SR record UID corresponds to
a workspace within a server. The individual metadata items correspond to tiddlers within
that workspace.

This plugin performs the following actions:
* Installs the {{{<<importSharedRecordsMetaData>>}}} macro
* Installs the {{{recordUID}}} paramifier
* A hack to associate created and modified tiddlers with the default shared records server
* Automatically loads the recordUIDs in the tiddler "SharedRecordsAutoSyncRecordUIDs"
** the recordUIDs should be separated with newlines

***/

//{{{

// Ensure that the SharedRecordsSyncPlugin is only installed once.
if(!version.extensions.SharedRecordsSyncPlugin) {
version.extensions.SharedRecordsSyncPlugin = {installed:true};
// Check version number of core code
if(version.major < 2 || (version.major == 2 && version.minor < 2))
	{alertAndThrow("SharedRecordsSyncPlugin requires TiddlyWiki 2.2 or later.");}

// String constants
config.macros.sharedRecordsSync = {
	label: "sync",
	prompt: "Plug back in to the SharedRecords server and synchronize changes",
	postUrl: "%0%1_log?max-sequence-number=%2&format=json",
	jsonTag: '%0',
	jsonTagSep: ',',
	jsonEntry: '{"title":%0,"modified":"%1","modifier":%2,"created":"%3",\n"tags":[%4],"text":%5,\n"sharedRecords.recordUID":%6,"sharedRecords.url":%7,"contentType":%8,"sharedRecords.sequenceNumber":%9}\n',
	jsonEntrySep: ',',
	jsonWrapper: '{"tiddlers":[%0]}'
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
//displayMessage("Syncing");
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
//displayMessage("Syncing: number of items: " + syncList.length);
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
			tags.push(config.macros.sharedRecordsSync.jsonTag.format([tiddler.tags[tag].toJSONString()]));
		var shRecordUID = store.getValue(tiddler,"sharedRecords.recordUID");
		var shUrl = store.getValue(tiddler,"sharedRecords.url");
		var sequenceNumber = store.getValue(tiddler,"sharedRecords.sequenceNumber");
		if(sequenceNumber === undefined)
			sequenceNumber = "0";
		var contentType = store.getValue(tiddler,"sharedRecords.contentType");
		if(contentType === undefined)
			contentType = "text/html";
		entries.push(config.macros.sharedRecordsSync.jsonEntry.format([
			tiddler.title.toJSONString(),
			isoDate(tiddler.modified),
			tiddler.modifier.toJSONString(),
			isoDate(tiddler.created),
			tags.join(config.macros.sharedRecordsSync.jsonTagSep),
			tiddler.text.toJSONString(),
			shRecordUID.toJSONString(),
			shUrl.toJSONString(),
			contentType.toJSONString(),
			sequenceNumber.toJSONString()
			]));
		}
	var payload = config.macros.sharedRecordsSync.jsonWrapper.format([entries.join(config.macros.sharedRecordsSync.jsonEntrySep)]);
	shRecordUID = store.getValue(syncList[0],"sharedRecords.recordUID");
	shUrl = store.getValue(syncList[0],"sharedRecords.url");
	var url = config.macros.sharedRecordsSync.postUrl.format([shUrl,shRecordUID,maxSequenceNumber])
//displayMessage("Sync payload: " + payload);
//displayMessage("url: " + url);
	var r = doHttp("POST",
		url,
		payload,
		null,null,null,
		config.macros.sharedRecordsSync.donePut);
	if(typeof r == "string")
		{
		alert("Error depositing data to server: " + r);
		}
}

config.macros.sharedRecordsSync.donePut = function(status,params,responseText,url,xhr)
{
	if(status)
		displayMessage("Done");
	else
		displayMessage("Failed: " + xhr.statusText + " (" + xhr.status + ")");
}

} // end of "install only once"
//}}}
