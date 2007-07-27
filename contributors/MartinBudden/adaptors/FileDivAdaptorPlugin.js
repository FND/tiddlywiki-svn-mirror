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
	if(context && context.callback)
		window.setTimeout(context.callback,0,true,this,context);
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
	if(context && context.callback)
		window.setTimeout(context.callback,0,true,this,context);
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
	var urlTemplate = '%0%1.tiddler';
	var path = FileAdaptor.tiddlerPath();
	var url = urlTemplate.format([path,context.tiddler.title]);
displayMessage('url:'+url);
	context.tiddler.fields['server.type'] = FileAdaptor.serverType;
	context.adaptor = this;
	context.status = false;
	context.statusText = "Error in FileAdaptor.getTiddler "+context.tiddler.title;
	var data = loadFile(url);
	displayMessage("data:"+data);
	if(data) {
		//var tiddlerRegExp = /<div([^>]*)>([.\n]*?)<\/div>(?:\s*)/mg
		var tiddlerRegExp = /<div([^>]*)>(?:\s*)(<pre>)?([^<]*?)</mg
		tiddlerRegExp.lastIndex = 0;
		var match = tiddlerRegExp.exec(data)
//#displayMessage("match:"+match);
		if(match) {
//#displayMessage("match1:"+match[1]);
//#displayMessage("match2:"+match[2]);
//#displayMessage("match3:"+match[3]);
			var ft = match[1];
			ft = ft.replace(/\=\"/mg,':"');
//#displayMessage("ft:"+ft);
			var fields = ft.decodeHashMap();
			for(var i in fields) {
				if(TiddlyWiki.isStandardField(i)) {
					context.tiddler[i] = fields[i];
				} else {
					context.tiddler.fields[i] = fields[i];
				}
			}
			var content = match[3] ? match[3] : '';
			if(match[2]) {
				var text = content.unescapeLineBreaks();
			} else {
				text = content.replace(/\r/mg,'').htmlDecode();
			}
			displayMessage("text:"+text);
			context.tiddler.text = text;
			context.status = true;
		}
	} else {
		alert("cannot load tiddler");
	}
	if(context.callback)
		context.callback(context);
	return context.status;
};

FileAdaptor.prototype.putTiddler = function(context)
{
//#clearMessage();
//#displayMessage('FileAdaptor.putTiddler:'+context.tiddler.title);
	var urlTemplate = '%0%1.tiddler';
	var path = FileAdaptor.tiddlerPath();
	var url = urlTemplate.format([path,context.tiddler.title]);
//#displayMessage('url:'+url);
	context.status = saveFile(url,store.getSaver().externalizeTiddler(store,context.tiddler));
	if(context.status)
		displayMessage(config.messages.backupSaved,url);
	else
		alert(config.messages.backupFailed);
	
	if(context.callback)
		context.callback(context);
	return context.status;
};

FileAdaptor.prototype.close = function() {return true;};

config.adaptors[FileAdaptor.serverType] = FileAdaptor;
} //# end of 'install only once'
//}}}
