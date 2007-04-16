/***
|''Name:''|SharedRecordsAdaptorPlugin|
|''Description:''|Adaptor for Shared Record Server (http://www.sharedrecords.org/)|
|''Author:''|Jeremy Ruston (jeremy (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/sharedrecords/plugins/SharedRecordsAdaptorPlugin.js|
|''Version:''|0.2.1|
|''Date:''|Apr 15, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SharedRecordsAdaptorPlugin) {
version.extensions.SharedRecordsAdaptorPlugin = {installed:true};

function SharedRecordsAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

merge(SharedRecordsAdaptor,{
	serverType: 'sharedrecords',
	getTiddlersUrl: '%0%1_log.json',
	viewTiddlersUrl: '%0%1.data',
	putTiddlersUrl: '%0%1_log?max-sequence-number=%2&format=json',
	notLoadedError: "SharedRecords data has not been loaded",
	notFoundError: "SharedRecords tiddler not found",
	jsonTag: '%0',
	jsonTagSep: ',',
	jsonEntry: '{"title":%0,"modified":"%1","modifier":%2,"created":"%3",\n"tags":[%4],"text":%5,\n"sharedRecords.recordUID":%6,"contentType":%7,"sharedRecords.sequenceNumber":%8}\n',
	jsonWrapper: '{"tiddlers":[%0]}'
});

SharedRecordsAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	return context;
};

// Static method to create a Date() from a string in the format yyyy-MM-ddTHH:mm:ss.SSSz where z is the locale
SharedRecordsAdaptor.convertFromFullUTCISO1806 = function(dateString)
{
	var theDate = new Date(Date.UTC(parseInt(dateString.substr(0,4),10),
							parseInt(dateString.substr(5,2),10)-1,
							parseInt(dateString.substr(8,2),10),
							parseInt(dateString.substr(11,2),10),
							parseInt(dateString.substr(14,2),10),
							parseInt(dateString.substr(17,2), 10)));
	return(theDate);
};

// Static method to convert string in ISO date format to a Date() object
SharedRecordsAdaptor.convertToFullUTCISO1806 = function(d)
{
	return d.formatString("YYYY-0MM-0DDT0hh:0mm:0ss.000UTC");
};

SharedRecordsAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	this.host = host;
	context.status = true;
	window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

SharedRecordsAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.workspaces = [];
	context.status = true;
	window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

SharedRecordsAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	this.workspace = workspace;
	var url = SharedRecordsAdaptor.getTiddlersUrl.format([this.host,this.workspace]);
	var ret = loadRemoteFile(url,SharedRecordsAdaptor.openWorkspaceCallback,context);
	return typeof(ret) == "string" ? ret : true;
};

SharedRecordsAdaptor.openWorkspaceCallback = function(status,context,responseText,url,xhr)
{
	var adaptor = context.adaptor;
	context.status = status;
	if(!status) {
		context.statusText = "Error reading file: " + xhr.statusText;
	} else {
		adaptor.serverData = eval("(" + responseText + ")");
	}
	context.callback(context,context.userParams);
};

SharedRecordsAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(!this.serverData)
		return SharedRecordsAdaptor.notLoadedError;
	context.tiddlers = [];
	for(var t=0; t<this.serverData.tiddlers.length; t++) {
		var serverTiddler = this.serverData.tiddlers[t];
		var tiddler = new Tiddler(serverTiddler.title);
		tiddler.text = serverTiddler.text;
		tiddler.modified = SharedRecordsAdaptor.convertFromFullUTCISO1806(serverTiddler.modified);
		tiddler.modifier = serverTiddler.modifier;
		tiddler.fields['server.page.revision'] = String.zeroPad(10,serverTiddler['sharedRecords.sequenceNumber']);
		tiddler.tags = serverTiddler.tags;
		context.tiddlers.push(tiddler);
	}
	context.status = true;
	window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};


SharedRecordsAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : tiddler.fields['server.host'];
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	info.uri = SharedRecordsAdaptor.viewTiddlersUrl.format([host,workspace,tiddler.title]);
	return info;
};

SharedRecordsAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(!this.serverData)
		return SharedRecordsAdaptor.notLoadedError;
	var t = this.serverData.tiddlers.findByField('title',title);
	if(t != -1) {
		var serverTiddler = this.serverData.tiddlers[t];
		context.tiddler = new Tiddler(title);
		context.tiddler.text = serverTiddler.text;
		context.tiddler.modified = SharedRecordsAdaptor.convertFromFullUTCISO1806(serverTiddler.modified);
		context.tiddler.modifier = serverTiddler.modifier;
		context.tiddler.tags = serverTiddler.tags;
		context.tiddler.fields['server.type'] = SharedRecordsAdaptor.serverType;
		context.tiddler.fields['server.host'] = this.host;
		context.tiddler.fields['server.workspace'] = this.workspace;
		context.tiddler.fields['server.page.revision'] = String.zeroPad(10,serverTiddler['sharedRecords.sequenceNumber']);
		context.tiddler.fields['content.type'] = serverTiddler.contentType;
		context.status = true;
	} else {
		context.status = false;
		context.statusText = SharedRecordsAdaptor.notFoundError;
	}
	window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

SharedRecordsAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	var jsonTags = [];
	for(var tag=0; tag<tiddler.tags.length; tag++)
		jsonTags.push(SharedRecordsAdaptor.jsonTag.format([tiddler.tags[tag].toJSONString()]));
	var sequenceNumber = tiddler.fields['server.page.revision'];
	sequenceNumber = sequenceNumber === undefined ? -1 : parseInt(sequenceNumber,10);
	sequenceNumber = -1; // Just for the moment
	var contentType = tiddler.fields['content.type'];
	if(contentType === undefined)
		contentType = 'text/html';
	var jsonTiddler = SharedRecordsAdaptor.jsonEntry.format([
			tiddler.title.toJSONString(),
			SharedRecordsAdaptor.convertToFullUTCISO1806(tiddler.modified),
			tiddler.modifier.toJSONString(),
			SharedRecordsAdaptor.convertToFullUTCISO1806(tiddler.created),
			jsonTags.join(SharedRecordsAdaptor.jsonTagSep),
			tiddler.text.toJSONString(),
			this.workspace.toJSONString(),
			contentType.toJSONString(),
			sequenceNumber
			]);
	var jsonRecord = SharedRecordsAdaptor.jsonWrapper.format([jsonTiddler]);
	var url = SharedRecordsAdaptor.putTiddlersUrl.format([this.host,this.workspace,sequenceNumber]);
	var r = doHttp("POST",
		url,
		jsonRecord,
		null,null,null,
		SharedRecordsAdaptor.putTiddlerCallback,context);
	return typeof r == 'string' ? r : true;
};

SharedRecordsAdaptor.putTiddlerCallback = function(status,context,responseText,url,xhr)
{
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText + " (" + xhr.status + ")";
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

SharedRecordsAdaptor.prototype.close = function() {return true;};

config.adaptors[SharedRecordsAdaptor.serverType] = SharedRecordsAdaptor;

} //# end of 'install only once'
//}}}
