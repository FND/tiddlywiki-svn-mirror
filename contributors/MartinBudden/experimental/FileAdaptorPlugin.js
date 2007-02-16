/***
|''Name:''|FileAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from file-based TiddlyWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com) and JeremyRuston (jeremy (at) osmosoft (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#FileAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/FileAdaptorPlugin.js|
|''Version:''|0.3.1|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.FileAdaptorPlugin) {
version.extensions.FileAdaptorPlugin = {installed:true};

function FileAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

FileAdaptor.serverType = 'file';

// Convert a page title to the normalized form used in URLs
FileAdaptor.normalizedTitle = function(title)
{
	var id = title.toLowerCase();
	id = id.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(id.charAt(0)=='_')
		id = id.substr(1);
//#displayMessage("title:"+title+" id:"+id);
	return String(id);
};

FileAdaptor.getPath = function(localPath,folder)
{
	var backSlash = '\\';
	var dirPathPos = localPath.lastIndexOf('\\');
	if(dirPathPos == -1) {
		dirPathPos = localPath.lastIndexOf('/');
		backSlash = '/';
	}
	if(!folder || folder == '')
		folder = '.';
	var path = localPath.substr(0,dirPathPos) + backSlash + folder + backSlash;// + localPath.substr(dirPathPos);
	return path;
};

FileAdaptor.tiddlerPath = function()
{
//#displayMessage("tiddlerPath");
//#displayMessage("path:"+document.location.toString());
	var file = getLocalPath(document.location.toString());
	return FileAdaptor.getPath(file,'tiddlers');
};

FileAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'file://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	return host;
};

FileAdaptor.minHostName = function(host)
{
	return host ? host.replace(/\\/,'/').host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

FileAdaptor.prototype.openHost = function(host,context)
{
//#displayMessage("openHost:"+host);
	this.host = FileAdaptor.fullHostName(host);
//#displayMessage("host:"+this.host);
	if(context && context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,true,this,context);
	}
	return true;
};

FileAdaptor.prototype.getWorkspaceList = function(context)
{
	return false;
};


FileAdaptor.prototype.openWorkspace = function(workspace,context)
{
//#displayMessage("openWorkspace:"+workspace);
	this.workspace = workspace;
	if(context && context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,true,this,context);
	}
	return true;
};

FileAdaptor.prototype.getTiddlerList = function(context)
{
	return false;
};

FileAdaptor.prototype.getTiddler = function(context)
{
clearMessage();
displayMessage('FileAdaptor.getTiddler:'+context.tiddler.title);
	var path = FileAdaptor.tiddlerPath();
	var urlTemplate = '%0%1.js';
	var urljs = urlTemplate.format([path,context.tiddler.title]);
	var urlmeta = urljs + '.meta';
displayMessage('urljs:'+urljs);
	context.tiddler.fields['server.type'] = FileAdaptor.serverType;
	context.adaptor = this;
	context.status = false;
	context.statusText = "Error in FileAdaptor.getTiddler "+context.tiddler.title;
	text = loadFile(urljs);
	meta = loadFile(urlmeta);
	displayMessage("meta:"+meta);
	if(text && meta) {
		context.status = true;
		config.tiddler.text = text;
	} else {
		alert("cannot load tiddler");
	}
	if(context.callback)
		context.callback(context);
	return context.status;
};

FileAdaptor.prototype.putTiddler = function(context)
{
	var tiddler = context.tiddler;
//#clearMessage();
	var path = FileAdaptor.tiddlerPath();
	var urlTemplate = '%0%1.js';
	var urljs = urlTemplate.format([path,tiddler.title]);
	var urlmeta = urljs + '.meta';
	var meta = 'title: ' + tiddler.title + '\n';
	if(tiddler.modifier)
		meta += 'modifier: ' + tiddler.modifier + '\n';
	if(tiddler.created)
		meta += 'created: ' + tiddler.created.convertToYYYYMMDDHHMM() + '\n';
	if(tiddler.modified)
		meta += 'modified: ' + tiddler.modified.convertToYYYYMMDDHHMM() + '\n';
	if(tiddler.getTags())
		meta += 'tags: ' + tiddler.getTags() + '\n';
	var fields = tiddler.fields;
	for(var i in fields) {
		if(!TiddlyWiki.isStandardField(i) && i != 'anon' && i != 'changecount') {
			meta += i + ': ' + fields[i] + '\n';
		}
	}
	context.status = saveFile(urljs,context.tiddler.text);
	if(context.status) {
		context.status = saveFile(urlmeta,meta);
		//displayMessage(config.messages.backupSaved,url);
	} else {
		//alert(config.messages.backupFailed);
	}

	if(context.callback)
		context.callback(context);
	return context.status;
};

FileAdaptor.prototype.close = function() {return true;};

config.adaptors[FileAdaptor.serverType] = FileAdaptor;
} //# end of 'install only once'
//}}}
