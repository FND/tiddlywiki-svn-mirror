/***
|''Name:''|LocalAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from file-based TiddlyWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/LocalAdaptorPlugin.js|
|''Version:''|0.4.1|
|''Date:''|Feb 18, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.LocalAdaptorPlugin) {
version.extensions.LocalAdaptorPlugin = {installed:true};

function LocalAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

LocalAdaptor.serverType = 'local';
LocalAdaptor.errorInFunctionMessage = "Error in function LocalAdaptor.%0: %1";

LocalAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	return context;
};

// Convert a page title to the normalized form used in uris
LocalAdaptor.normalizedTitle = function(title)
{
	var id = title.toLowerCase();
	id = id.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(id.charAt(0)=='_')
		id = id.substr(1);
//#displayMessage("title:"+title+" id:"+id);
	return String(id);
};

LocalAdaptor.getPath = function(localPath,folder)
{
	var backSlash = '\\';
	var dirPathPos = localPath.lastIndexOf('\\');
	if(dirPathPos == -1) {
		dirPathPos = localPath.lastIndexOf('/');
		backSlash = '/';
	}
	if(!folder || folder == '')
		folder = '.';
	var path = localPath.substr(0,dirPathPos) + backSlash + folder + backSlash;
	return path;
};

LocalAdaptor.tiddlerPath = function()
{
//#displayMessage("tiddlerPath");
//#displayMessage("path:"+document.location.toString());
	var file = getLocalPath(document.location.toString());
	return LocalAdaptor.getPath(file,'tiddlers');
};

LocalAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'file://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	return host;
};

LocalAdaptor.minHostName = function(host)
{
	return host ? host.replace(/\\/,'/').host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

LocalAdaptor.prototype.openHost = function(host,context,callback)
{
//#displayMessage("openHost:"+host);
	context = this.setContext(context,userParams,callback);
	this.host = LocalAdaptor.fullHostName(host);
//#displayMessage("host:"+this.host);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

LocalAdaptor.prototype.getWorkspaceList = function(context,callback)
{
	return false;
};

LocalAdaptor.prototype.openWorkspace = function(workspace,context,callback)
{
//#displayMessage("openWorkspace:"+workspace);
	context = this.setContext(context,userParams,callback);
	this.workspace = workspace;
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

LocalAdaptor.prototype.getTiddlerList = function(context,callback)
{
	return false;
};

LocalAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#clearMessage();
displayMessage('LocalAdaptor.getTiddler:' + title);
	context = this.setContext(context,userParams,callback);
	var path = LocalAdaptor.tiddlerPath();
	var uriTemplate = '%0%1';
	var uri = uriTemplate.format([path,LocalAdaptor.normalizedTitle(title)]);
displayMessage('uri:'+uri);
	context.tiddler = new Tiddler(title);
	context.tiddler.fields['server.type'] = LocalAdaptor.serverType;
	context.status = false;
	context.statusText = LocalAdaptor.errorInFunctionMessage.format(['getTiddler',title]);
	var fields = null;
	var data = loadFile(uri + '.js');
displayMessage("data:"+data);
	if(data) {
		context.tiddler.text = data;
		meta = loadFile(uri + '.js.meta');
		if(meta) {
displayMessage("meta:"+meta);
			context.status = true;
			var ft = '';
			var fieldRegExp = /([^:]*):(?:\s*)(.*?)$/mg;
			fieldRegExp.lastIndex = 0;
			var match = fieldRegExp.exec(meta);
			while(match) {
				ft += match[1] + ':"' + match[2] + '" ';
				match = fieldRegExp.exec(meta);
			}
displayMessage("ft:"+ft);
			fields = ft.decodeHashMap();
		} else {
			alert("cannot load tiddler");
		}
	} else {
		data = loadFile(uri + '.tiddler');
displayMessage("data2:"+data);
		if(data) {
			var tiddlerRegExp = /<div([^>]*)>(?:\s*)(<pre>)?([^<]*?)</mg;
			tiddlerRegExp.lastIndex = 0;
			match = tiddlerRegExp.exec(data);
			if(match) {
				ft = match[1].replace(/\=\"/mg,':"');
displayMessage("ft:"+ft);
				fields = ft.decodeHashMap();
				var text = match[3] ? match[3] : '';
				if(match[2]) {
					text = text.unescapeLineBreaks();
				} else {
					text = text.replace(/\r/mg,'').htmlDecode();
				}
				context.tiddler.text = text;
				context.status = true;
			}
		}
	}
	for(var i in fields) {
		var accessor = TiddlyWiki.standardFieldAccess[i];
		if(accessor) {
			accessor.set(context.tiddler,fields[i]);
		} else if(i != 'anon' && i != 'changecount') {
			context.tiddler.fields[i] = fields[i];
		}
	}
	if(context.callback)
		context.callback(context,context.userParams);
	return context.status;
};

LocalAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
//#clearMessage();
//#displayMessage('LocalAdaptor.putTiddler:' + tiddler.title);
	context = this.setContext(context,userParams,callback);
	var path = LocalAdaptor.tiddlerPath();
	var uriTemplate = '%0%1';
	var uri = uriTemplate.format([path,LocalAdaptor.normalizedTitle(tiddler.title)]);
//#displayMessage('uri:'+uri);
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
	context.tiddler = tiddler;
	context.status = saveFile(uri + '.js',tiddler.text);
	if(context.status) {
		context.status = saveFile(uri + '.js.meta',meta);
	}
	if(context.callback)
		context.callback(context,context.userParams);
	return context.status;
};

LocalAdaptor.prototype.putTiddlerDiv = function(context)
{
//#clearMessage();
//#displayMessage('LocalAdaptor.putTiddler:'+context.tiddler.title);
	var urlTemplate = '%0%1.tiddler';
	var path = LocalAdaptor.tiddlerPath();
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

LocalAdaptor.prototype.close = function() {return true;};

config.adaptors[LocalAdaptor.serverType] = LocalAdaptor;
} //# end of 'install only once'
//}}}
