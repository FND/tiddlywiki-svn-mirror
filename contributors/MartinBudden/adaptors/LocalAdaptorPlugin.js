/***
|''Name:''|LocalAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from file-based TiddlyWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#LocalAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/LocalAdaptorPlugin.js|
|''Version:''|0.5.1|
|''Date:''|Feb 18, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

path/TiddlyFile.html
path/tiddlers/<x>.tiddler
path/tiddlers/revisions/<x>.tiddler.<nnnn>
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
LocalAdaptor.baseRevision = 1000;

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

LocalAdaptor.revisionPath = function()
{
//#displayMessage("revisionPath");
	var file = getLocalPath(document.location.toString());
	return LocalAdaptor.getPath(file,'tiddlers\\revisions');
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

LocalAdaptor.prototype.openHost = function(host,context,userParams,callback)
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

LocalAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
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

LocalAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#displayMessage("getWorkspaceList");
	var list = [];
	list.push({title:"Main",name:"Main"});
	context.workspaces = list;
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

LocalAdaptor.prototype.dirList = function(path)
{
	var r = this.mozillaDirList(path);
	if(!r)
		r = this.ieDirList(path);
	if(!r)
		r = this.javaDirList(path);
	return r;
};

LocalAdaptor.prototype.ieDirList = function(path)
{
	return null;
};

LocalAdaptor.prototype.javaDirList = function(path)
{
	return null;
};

LocalAdaptor.prototype.mozillaDirList = function(path)
{
//#displayMessage("mozillaDirList:"+path);
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(path);
	// file is the given directory (nsIFile)
	var list = [];
	var entries = file.directoryEntries;
	while(entries.hasMoreElements()) {
		var entry = entries.getNext();
		entry.QueryInterface(Components.interfaces.nsIFile);
		if(entry.isFile()) {
			list.push({name:entry.leafName,modified:entry.lastModifiedTime,size:entry.fileSize});
		}
	}
	return list;
};

LocalAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
//#displayMessage('LocalAdaptor.getTiddlerList');
	context = this.setContext(context,userParams,callback);
	var path = LocalAdaptor.tiddlerPath();
	var entries = this.dirList(path);
	if(entries) {
		context.status = true;
		var list = [];
		for(var i=0; i<entries.length; i++) {
			var title = entries[i].name;
			if(title.match(/\.tiddler$/)) {
				title = title.replace(/\.tiddler$/,'');
//#displayMessage("title:"+title);
				var tiddler = new Tiddler(title);
				tiddler.modified = entries[i].modified;
				list.push(tiddler);
			}
		}
		context.tiddlers = list;
	} else {
		context.status = false;
		context.statusText = LocalAdaptor.errorInFunctionMessage.format(['getTiddlerList']);
	}
	if(context.callback)
		window.setTimeout(context.callback,0,context,userParams);
};

LocalAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
// get a list of the revisions for a tiddler
{
//#displayMessage('LocalAdaptor.getTiddlerRevisionList');
	context = this.setContext(context,userParams,callback);
	var path = LocalAdaptor.revisionPath();
//#displayMessage("revisionPath:"+path);
	var entries = this.dirList(path);
	if(entries) {
		var list = [];
		for(var i=0; i<entries.length; i++) {
			var name = entries[i].name;
			name = LocalAdaptor.normalizedTitle(name);
			var tiddler = new Tiddler(title);
			tiddler.modified = new Date();
			tiddler.modified.setTime(entries[i].modified);
			tiddler.fields['server.page.revision'] = '1001';
			list.push(tiddler);
		}
		context.revisions = list;
		context.status = true;
	} else {
		context.status = false;
		context.statusText = LocalAdaptor.errorInFunctionMessage.format(['getTiddlerList']);
	}
	if(context.callback) {
		//# direct callback doesn't work, not sure why
		//#context.callback(context,context.userParams);
		window.setTimeout(context.callback,0,context,userParams);
	}
};

LocalAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var uriTemplate = '%0#%1';
	var host = LocalAdaptor.fullHostName(this.host);
	info.uri = uriTemplate.format([host,tiddler.title]);
	return info;
};

LocalAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	return this.getTiddlerInternal(context,userParams,callback);
};

LocalAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.revision = revision;
	return this.getTiddlerInternal(context,userParams,callback);
};

// @internal
LocalAdaptor.prototype.getTiddlerInternal = function(context,userParams,callback)
{
//#clearMessage();
//#displayMessage('LocalAdaptor.getTiddler:' + title);
	context = this.setContext(context,userParams,callback);
	var title = context.title;
	var path = LocalAdaptor.tiddlerPath();
	var uriTemplate = '%0%1';
	var uri = uriTemplate.format([path,LocalAdaptor.normalizedTitle(title)]);
//#displayMessage('uri:'+uri);
	context.tiddler = new Tiddler(title);
	context.tiddler.fields['server.type'] = LocalAdaptor.serverType;
	context.status = false;
	context.statusText = LocalAdaptor.errorInFunctionMessage.format(['getTiddler',title]);
	var fields = null;
	var data = loadFile(uri + '.js');
//#displayMessage("data:"+data);
	if(data) {
		context.tiddler.text = data;
		meta = loadFile(uri + '.js.meta');
		if(meta) {
//#displayMessage("meta:"+meta);
			context.status = true;
			var ft = '';
			var fieldRegExp = /([^:]*):(?:\s*)(.*?)$/mg;
			fieldRegExp.lastIndex = 0;
			var match = fieldRegExp.exec(meta);
			while(match) {
				ft += match[1] + ':"' + match[2] + '" ';
				match = fieldRegExp.exec(meta);
			}
//#displayMessage("ft:"+ft);
			fields = ft.decodeHashMap();
		} else {
			alert("cannot load tiddler");
		}
	} else {
		data = loadFile(uri + '.tiddler');
//#displayMessage("data2:"+data);
		if(data) {
			var tiddlerRegExp = /<div([^>]*)>(?:\s*)(<pre>)?([^<]*?)</mg;
			tiddlerRegExp.lastIndex = 0;
			match = tiddlerRegExp.exec(data);
			if(match) {
				ft = match[1].replace(/\=\"/mg,':"');
//#displayMessage("ft:"+ft);
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
		window.setTimeout(context.callback,0,context,userParams);
	return context.status;
};

LocalAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
//#clearMessage();
//#displayMessage('LocalAdaptor.putTiddler:' + tiddler.title);
	context = this.setContext(context,userParams,callback);
	var revision = tiddler.fields['server.page.revision'];
	if(!revision)
		revision = LocalAdaptor.baseRevision;
	tiddler.fields['server.page.revision'] = String(revision);
	context.tiddler = tiddler;
	// save the tiddler as a revision
	this.saveTiddlerAsDiv(context,true);
	++revision;
	context.tiddler.fields['server.page.revision'] = String(revision);
	context = this.saveTiddlerAsDiv(context);
	if(context.callback)
		window.setTimeout(context.callback,0,context,userParams);
	return context.status;
};

LocalAdaptor.prototype.saveTiddlerAsDiv = function(context,isRevision)
{
//#displayMessage('LocalAdaptor.saveTiddlerAsDiv:'+context.tiddler.title);
	if(isRevision) {
		var path = LocalAdaptor.revisionPath();
		var uriTemplate = '%0%1.tiddler.%2';
		var revision = context.tiddler.fields['server.page.revision'];
	} else {
		path = LocalAdaptor.tiddlerPath();
		uriTemplate = '%0%1.tiddler';
	}
	var uri = uriTemplate.format([path,context.tiddler.title,revision]);
//#displayMessage('uri:'+uri);
	context.status = saveFile(uri,store.getSaver().externalizeTiddler(store,context.tiddler));
	if(context.status)
		displayMessage(config.messages.backupSaved,uri);
	else
		alert(config.messages.backupFailed);
	return context;
};

LocalAdaptor.prototype.saveTiddlerAsJs = function(context)
{
	var tiddler = context.tiddler;
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
	context.status = saveFile(uri + '.js',tiddler.text);
	if(context.status) {
		context.status = saveFile(uri + '.js.meta',meta);
	}
	if(context.status)
		displayMessage(config.messages.backupSaved,uri);
	else
		alert(config.messages.backupFailed);
	return context;
};

LocalAdaptor.prototype.close = function() {return true;};

config.adaptors[LocalAdaptor.serverType] = LocalAdaptor;
} //# end of 'install only once'
//}}}
