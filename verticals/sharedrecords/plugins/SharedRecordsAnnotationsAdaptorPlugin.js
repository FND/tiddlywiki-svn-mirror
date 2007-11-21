/***
|''Name:''|SharedRecordsAnnotationsAdaptorPlugin|
|''Description:''|Shared Records Annotations API Adaptor|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/SharedRecords/adaptors/SharedRecordsAnnotationsAdaptorPlugin.js|
|''Version:''|0.0.1|
|''Status:''|Not for release - under development|
|''Date:''|Nov 19, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.3.0|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SharedRecordsAnnotationsAdaptorPlugin) {
version.extensions.SharedRecordsAnnotationsAdaptorPlugin = {installed:true};

function SharedRecordsAnnotationsAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

SharedRecordsAnnotationsAdaptor.serverType = 'sharedrecordsannotations';
SharedRecordsAnnotationsAdaptor.serverParsingErrorMessage = "Error parsing result from server";
SharedRecordsAnnotationsAdaptor.errorInFunctionMessage = "Error in function SharedRecordsAnnotationsAdaptor.%0";

SharedRecordsAnnotationsAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

SharedRecordsAnnotationsAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

SharedRecordsAnnotationsAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

SharedRecordsAnnotationsAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	return host;
};

SharedRecordsAnnotationsAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
SharedRecordsAnnotationsAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
SharedRecordsAnnotationsAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

// Convert a date in the format yyyy-MM-ddTHH:mm:ss.SSSz (where z is the locale) into a JavaScript Date object
SharedRecordsAnnotationsAdaptor.dateFromUTCISO1806 = function(date)
{
	return new Date(Date.UTC(parseInt(date.substr(0,4),10),
		parseInt(date.substr(5,2),10)-1,
		parseInt(date.substr(8,2),10),
		parseInt(date.substr(11,2),10),
		parseInt(date.substr(14,2),10),
		parseInt(date.substr(17,2),10)));
};

SharedRecordsAnnotationsAdaptor.dateToUTCISO1806 = function(d)
{
	return d.formatString("YYYY-0MM-0DDT0hh:0mm:0ss.000UTC");
};



SharedRecordsAnnotationsAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = SharedRecordsAnnotationsAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

SharedRecordsAnnotationsAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,10,context,userParams);
	}
	return true;
};

SharedRecordsAnnotationsAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.workspaces = [];
	context.status = true;
	window.setTimeout(context.callback,10,context,userParams);
	return true;
};

SharedRecordsAnnotationsAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
//#http://test.sharedrecords.org:8080/annotations/385c7c019544dbe75736223ffd7ee18b872f6b08?format=json&attributes=all
	context = this.setContext(context,userParams,callback);
	//#var uriTemplate = '%0annotations/%1?format=json&attributes=allAttributes';
	var uriTemplate = '%0annotations/%1?format=json&attributes=title|tags';
	var uri = uriTemplate.format([context.host,context.workspace]);
//#displayMessage("uri:"+uri);
//#console.log("uri:"+uri);
	var req = SharedRecordsAnnotationsAdaptor.doHttpGET(uri,SharedRecordsAnnotationsAdaptor.getTiddlerListCallback,context);
	return typeof req == 'string' ? req : true;
};

//# {"tiddlers":[
//# {"deleted":false,"title":"title4","modifier":"user4","contentType":"contentType4","modified":"2007-11-07T22:45:14.500UTC",
//# "text":"ZGF0YVN0cmluZzQ=","fileName":"title4_0000000004_0e0964a496465e7204a95346a9d5e404f3f82c70",
//# "signature":"signature4","previousEntry":"title3_0000000003_6b136bf7c1722f5ab2df7260ed8cc6dc55322c32",
//# "tags":["tag1-4","tag2-4","tag3"],
//# "serverTimeStamp":"2007-11-07T22:45:08.577UTC",
//# "sharedRecords.url":"http://test.sharedrecords.org:8080/annotations/",
//# "sharedRecords.recordUID":"385c7c019544dbe75736223ffd7ee18b872f6b08","sharedRecords.sequenceNumber":4},
//# {"deleted":false,"title":"title5","modifier":"user5","contentType":"contentType5","modified":"2007-11-07T22:45:14.500UTC","text":"ZGF0YVN0cmluZzU=","fileName":"title5_0000000005_58ad793d490fd03df948b7a199037c2c529fd88e","signature":"signature5","previousEntry":"title4_0000000004_0e0964a496465e7204a95346a9d5e404f3f82c70","tags":["tag1-5","tag2-5","tag3"],"serverTimeStamp":"2007-11-07T22:45:08.580UTC","sharedRecords.url":"http://test.sharedrecords.org:8080/annotations/","sharedRecords.recordUID":"385c7c019544dbe75736223ffd7ee18b872f6b08","sharedRecords.sequenceNumber":5},{"deleted":false,"title":"title1","modifier":"userNEW1","contentType":"contentTypeNEW1","modified":"2007-11-07T22:45:15.406UTC","text":"ZGF0YVN0cmluZ05FVzE=","fileName":"title1_0000000006_7903fb3d320d25871d560238626becc36413b34f","signature":"signatureNEW1","previousEntry":"title5_0000000005_58ad793d490fd03df948b7a199037c2c529fd88e","tags":["tag1NEW-1","tag2NEW-1","tag3NEW"],"serverTimeStamp":"2007-11-07T22:45:09.166UTC","sharedRecords.url":"http://test.sharedrecords.org:8080/annotations/","sharedRecords.recordUID":"385c7c019544dbe75736223ffd7ee18b872f6b08","sharedRecords.sequenceNumber":6},{"deleted":false,"title":"title2","modifier":"userNEW2","contentType":"contentTypeNEW2","modified":"2007-11-07T22:45:15.406UTC","text":"ZGF0YVN0cmluZ05FVzI=","fileName":"title2_0000000007_e06efaeb93b8507f5993ac90040d7db8bb1e09a4","signature":"signatureNEW2","previousEntry":"title1_0000000006_7903fb3d320d25871d560238626becc36413b34f","tags":["tag1NEW-2","tag2NEW-2","tag3NEW"],"serverTimeStamp":"2007-11-07T22:45:09.170UTC","sharedRecords.url":"http://test.sharedrecords.org:8080/annotations/","sharedRecords.recordUID":"385c7c019544dbe75736223ffd7ee18b872f6b08","sharedRecords.sequenceNumber":7},{"deleted":false,"title":"title3","modifier":"userNEW3","contentType":"contentTypeNEW3","modified":"2007-11-07T22:45:15.406UTC","text":"ZGF0YVN0cmluZ05FVzM=","fileName":"title3_0000000008_94d1ca34a94a3488205a6d09450e011d46ebb1f1","signature":"signatureNEW3","previousEntry":"title2_0000000007_e06efaeb93b8507f5993ac90040d7db8bb1e09a4","tags":["tag1NEW-3","tag2NEW-3","tag3NEW"],"serverTimeStamp":"2007-11-07T22:45:09.172UTC","sharedRecords.url":"http://test.sharedrecords.org:8080/annotations/","sharedRecords.recordUID":"385c7c019544dbe75736223ffd7ee18b872f6b08","sharedRecords.sequenceNumber":8},{"deleted":false,"title":"title6","modifier":"user6","contentType":"contentType6","modified":"2007-11-07T22:45:15.406UTC","text":"ZGF0YVN0cmluZzY=","fileName":"title6_0000000009_5f4eb3a9d2df9f0156968c1cedceb0d698fd5d96","signature":"signature6","previousEntry":"title3_0000000008_94d1ca34a94a3488205a6d09450e011d46ebb1f1","tags":["tag1-6","tag2-6","tag3"],"serverTimeStamp":"2007-11-07T22:45:09.175UTC","sharedRecords.url":"http://test.sharedrecords.org:8080/annotations/","sharedRecords.recordUID":"385c7c019544dbe75736223ffd7ee18b872f6b08","sharedRecords.sequenceNumber":9},{"deleted":false,"title":"title7","modifier":"user7","contentType":"contentType7","modified":"2007-11-07T22:45:15.406UTC","text":"ZGF0YVN0cmluZzc=","fileName":"title7_0000000010_66d00b563769e97cdbeea83a47e446219de0c97d","signature":"signature7","previousEntry":"title6_0000000009_5f4eb3a9d2df9f0156968c1cedceb0d698fd5d96","tags":["tag1-7","tag2-7","tag3"],"serverTimeStamp":"2007-11-07T22:45:09.179UTC","sharedRecords.url":"http://test.sharedrecords.org:8080/annotations/","sharedRecords.recordUID":"385c7c019544dbe75736223ffd7ee18b872f6b08","sharedRecords.sequenceNumber":10},{"deleted":false,"title":"title8","modifier":"user8","contentType":"contentType8","modified":"2007-11-07T22:45:15.406UTC","text":"ZGF0YVN0cmluZzg=","fileName":"title8_0000000011_84350952c4dcd5b530c3c0174afe83d217f32f19","signature":"signature8","previousEntry":"title7_0000000010_66d00b563769e97cdbeea83a47e446219de0c97d","tags":["tag1-8","tag2-8","tag3"],"serverTimeStamp":"2007-11-07T22:45:09.182UTC","sharedRecords.url":"http://test.sharedrecords.org:8080/annotations/","sharedRecords.recordUID":"385c7c019544dbe75736223ffd7ee18b872f6b08","sharedRecords.sequenceNumber":11}
//# ]}
SharedRecordsAnnotationsAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
//#console.log("list status:"+status);
//#displayMessage("getTiddlerListCallback:"+status);
	context.statusText = SharedRecordsAnnotationsAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
//#console.log("rt:"+responseText);
//#displayMessage("rt:"+responseText);
			eval('var info=' + responseText);
			var list = [];
			for(var i=0;i<info.tiddlers.length;i++) {
				var t = info.tiddlers[i];
				var tiddler = new Tiddler(t.title);
				tiddler.tags = t.tags;
				tiddler.modifier = t.modifier;
				//# avoid overwriting shadow tiddlers
				if(!store.isShadowTiddler(tiddler.title))
					list.push(tiddler);
			}
			context.tiddlers = list;
		} catch (ex) {
			context.statusText = exceptionText(ex,SharedRecordsAnnotationsAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

SharedRecordsAnnotationsAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : SharedRecordsAnnotationsAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	var uriTemplate = '%0annotations/%1';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

SharedRecordsAnnotationsAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

SharedRecordsAnnotationsAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//# http://test.sharedrecords.org/annotations/12345/MyTitle 
//# http://test.sharedrecords.org:8080/annotations/385c7c019544dbe75736223ffd7ee18b872f6b08
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;
	var uriTemplate = context.revision ? '%0annotations/%1/%2%3?format=json' : '%0annotations/%1/%2?format=json';
	var uri = uriTemplate.format([context.host,context.workspace,SharedRecordsAnnotationsAdaptor.normalizedTitle(title),context.revision]);

	var req = SharedRecordsAnnotationsAdaptor.doHttpGET(uri,SharedRecordsAnnotationsAdaptor.getTiddlerCallback,context);
//#displayMessage("getTiddler uri:"+uri);
	return typeof req == 'string' ? req : true;
};

SharedRecordsAnnotationsAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage("get status:"+status+", "+context.title);
//#console.log("get status:"+status);
	context.status = false;
	context.statusText = SharedRecordsAnnotationsAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		try {
//#console.log("rt:"+responseText);
			eval('var info=' + responseText);
			var t = info.tiddlers[0];
			var tiddler = new Tiddler(t.title);
			tiddler.tags = t.tags;
			tiddler.modifier = t.modifier;
			tiddler.text = t.text;
			tiddler.modified = SharedRecordsAnnotationsAdaptor.dateFromUTCISO1806(t.modified);
			tiddler.fields['server.type'] = SharedRecordsAnnotationsAdaptor.serverType;
			tiddler.fields['server.host'] = SharedRecordsAnnotationsAdaptor.minHostName(context.host);
			tiddler.fields['server.workspace'] = context.workspace;
			tiddler.fields['server.page.revision'] = String.zeroPad(10,t['sharedRecords.sequenceNumber']);
			tiddler.fields['content.type'] = t.contentType;
			context.tiddler = tiddler;
		} catch (ex) {
			context.statusText = exceptionText(ex,SharedRecordsAnnotationsAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
		if(context.callback)
			context.callback(context,context.userParams);
		return;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

//# http://test.sharedrecords.org/385c7c019544dbe75736223ffd7ee18b872f6b08_log?max-sequence-number=-1&format=json
//# http://sra.sharedrecords.org:8080/SRCDataStore/RESTServlet/37105c154dd4956cc4e278a5b867a435b5250d19_log?max-sequence-number=-1&format=json
SharedRecordsAnnotationsAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	var jsonTag = '%0';
	var jsonTagSep = ',';
	var jsonEntry = '{"title":%0,"modified":"%1","modifier":%2,"created":"%3",\n"tags":[%4],"text":%5,\n"sharedRecords.recordUID":%6,"contentType":%7,"sharedRecords.sequenceNumber":%8}\n';
	var jsonWrapper ='{"tiddlers":[%0]}';

	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	var jsonTags = [];
	for(var i=0; i<tiddler.tags.length; i++)
		jsonTags.push(jsonTag.format([tiddler.tags[i].toJSONString()]));
	var sequenceNumber = tiddler.fields['server.page.revision'];
	sequenceNumber = sequenceNumber === undefined ? -1 : parseInt(sequenceNumber,10);
	sequenceNumber = -1; // Just for the moment
	var contentType = tiddler.fields['content.type'];
	if(contentType === undefined)
		contentType = 'text/html';
	var jsonTiddler = jsonEntry.format([
			tiddler.title.toJSONString(),
			SharedRecordsAnnotationsAdaptor.dateToUTCISO1806(tiddler.modified),
			tiddler.modifier.toJSONString(),
			SharedRecordsAnnotationsAdaptor.dateToUTCISO1806(tiddler.created),
			jsonTags.join(jsonTagSep),
			tiddler.text.toJSONString(),
			this.workspace.toJSONString(),
			contentType.toJSONString(),
			sequenceNumber
			]);
	var host = context.host ? context.host : SharedRecordsAnnotationsAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	var uriTemplate = '%0%1_log?max-sequence-number=%2&format=json';
	var uri = uriTemplate.format([host,workspace,sequenceNumber]);
//#displayMessage("put uri:"+uri);

	var data = jsonWrapper.format([jsonTiddler]);
	var req = SharedRecordsAnnotationsAdaptor.doHttpPOST(uri,SharedRecordsAnnotationsAdaptor.putTiddlerCallback,context,null,data);

	return typeof req == 'string' ? req : true;
};

SharedRecordsAnnotationsAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage("put status:"+status+", "+context.title);
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

SharedRecordsAnnotationsAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[SharedRecordsAnnotationsAdaptor.serverType] = SharedRecordsAnnotationsAdaptor;
} //# end of 'install only once'
//}}}
