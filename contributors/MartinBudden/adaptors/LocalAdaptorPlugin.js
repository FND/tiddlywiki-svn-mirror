/***
|''Name:''|LocalAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data to and from file-based TiddlyWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#LocalAdaptorPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/LocalAdaptorPlugin.js |
|''Version:''|0.5.5|
|''Date:''|Jun 13, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2.0|

path/TiddlyFile.html
path/content/<x>.tiddler
path/content/revisions/<x>.<nnnn>.tiddler
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
LocalAdaptor.revisionSavedMessage = "Revision %0 saved";
LocalAdaptor.baseRevision = 1000;
LocalAdaptor.contentDirectory = 'content';
LocalAdaptor.revisionsDirectory = 'revisions';

LocalAdaptor.prototype.setContext = function(context,userParams,callback)
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

// Convert a page title to the normalized form used in uris
LocalAdaptor.normalizedTitle = function(title)
{
	var id = title;
	id = id.replace(/[<>]/g,'_').replace(/\t/g,'%09').replace(/#/g,'%23').replace(/%/g,'%25').replace(/\*/g,'%2a').replace(/,/g,'%2c').replace(/\//,'%2f').replace(/:/g,'%3a').replace(/\?/g,'%3f')
	if(id.charAt(0)=='_')
		id = id.substr(1);
	return String(id);
};

LocalAdaptor.getPath = function(localPath,folder)
{
	var slash = '\\';
	var dirPathPos = localPath.lastIndexOf('\\');
	if(dirPathPos == -1) {
		dirPathPos = localPath.lastIndexOf('/');
		slash = '/';
	}
	if(!folder || folder == '')
		folder = '.';
	var path = localPath.substr(0,dirPathPos) + slash + folder + slash;
	return path;
};

LocalAdaptor.contentPath = function()
{
//#displayMessage('contentPath");
//#displayMessage("path:"+document.location.toString());
	var file = getLocalPath(document.location.toString());
	return LocalAdaptor.getPath(file,LocalAdaptor.contentDirectory);
};

LocalAdaptor.revisionPath = function()
{
//#displayMessage("revisionPath");
	var file = getLocalPath(document.location.toString());
	var slash = file.lastIndexOf('\\') == -1 ? '/' : '\\';
	return LocalAdaptor.getPath(file,LocalAdaptor.contentDirectory + slash + LocalAdaptor.revisionsDirectory);
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
	this.host = LocalAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
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
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,10,context,userParams);
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
		window.setTimeout(context.callback,10,context,userParams);
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
	var path = LocalAdaptor.contentPath();
	var entries = this.dirList(path);
	if(entries) {
		context.status = true;
		var list = [];
		var hash = {};
		for(var i=0; i<entries.length; i++) {
			var title = entries[i].name;
			if(title.match(/\.tiddler$/)) {
				title = title.replace(/\.tiddler$/,'');
				title = title.replace(/%09/g,'\t').replace(/%23/g,'#').replace(/%25/g,'%').replace(/%2a/g,'*').replace(/%2c/g,',').replace(/%2f/g,'/').replace(/%3a/g,':').replace(/%3f/g,'?')
				var tiddler = new Tiddler(title);
				tiddler.modified = entries[i].modified;
				list.push(tiddler);
				hash[title] = tiddler;
			}
		}
		context.tiddlers = list;
		context.content = hash;
	} else {
		context.status = false;
		context.statusText = LocalAdaptor.errorInFunctionMessage.format(['getTiddlerList']);
	}
	if(context.callback)
		window.setTimeout(context.callback,0,context,userParams);
	return context;
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
//#displayMessage("name:"+name);
			// need to match name with
			//dirlist/<title>.<nnnn>.tiddler
			var matchRegExp = /(.*?)\.([0-9]*)\.([0-9]*)\.tiddler/;
			matchRegExp.lastIndex = 0;
			var match = matchRegExp.exec(name);
			if(match) {
				if(match[1]==title) {
//#displayMessage("name:"+name);
					var tiddler = new Tiddler(title);
					tiddler.modified = Date.convertFromYYYYMMDDHHMM(match[2]);
					//#tiddler.modified = new Date();
					//#tiddler.modified.setTime(entries[i].modified);
					tiddler.fields['server.page.revision'] = match[3];
					list.push(tiddler);
				}
			}
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

LocalAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
//#displayMessage('LocalAdaptor.getTiddlerRev:' + context.modified);
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

LocalAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#displayMessage('LocalAdaptor.getTiddler:' + context.title);
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;

	if(context.revision) {
//#displayMessage("cr:"+context.revision);
		var path = LocalAdaptor.revisionPath();
		var uriTemplate = '%0%1.%2.%3';
	} else {
		path = LocalAdaptor.contentPath();
		uriTemplate = '%0%1';
	}

	var uri = uriTemplate.format([path,LocalAdaptor.normalizedTitle(title),context.modified,context.revision]);
	//var uri = uriTemplate.format([path,title,context.modified,context.revision]);
//#displayMessage('uri:'+uri);
	context.tiddler = new Tiddler(title);
	context.tiddler.fields['server.type'] = LocalAdaptor.serverType;
	context.status = false;
	context.statusText = LocalAdaptor.errorInFunctionMessage.format(['getTiddler',title]);
	var fields = null;
	var t1, t0 = new Date();
	var data = loadFile(uri + '.tiddler');
	if(config.options.chkDisplayInstrumentation) {
		t1 = new Date();
		displayMessage('Tiddler file:"'+title+'" loaded in ' + (t1-t0) + ' ms');
	}
//#displayMessage("data:"+data);
	if(data) {
		var tiddlerRegExp = /<div([^>]*)>(?:\s*)(<pre>)?([^<]*?)</mg;
		tiddlerRegExp.lastIndex = 0;
		match = tiddlerRegExp.exec(data);
		if(match) {
			ft = match[1].replace(/\=\"/mg,':"');
			fields = ft.decodeHashMap();
			var text = match[3] ? match[3] : '';
			if(match[2]) {
				text = text.unescapeLineBreaks().htmlDecode();
			} else {
				text = text.replace(/\r/mg,'').htmlDecode();
			}
			context.tiddler.text = text;
			context.status = true;
		}
	} else {
		data = loadFile(uri + '.js');
//#displayMessage("data2:"+data);
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
			//alert("cannot load tiddler");
			displayMessage("cannot load tiddler");
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
	context.title = tiddler.title;
	var revision = tiddler.fields['server.page.revision'];
	if(!revision)
		revision = LocalAdaptor.baseRevision;
	++revision;
	tiddler.fields['server.page.revision'] = String(revision);
	context.tiddler = tiddler;
	// save the tiddler as a revision
	this.saveTiddlerAsDiv(context,true);
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
		var uriTemplate = '%0%1.%2.%3.tiddler';
		var revision = context.tiddler.fields['server.page.revision'];
		var modified = context.tiddler.modified.convertToYYYYMMDDHHMM();
	} else {
		path = LocalAdaptor.contentPath();
		uriTemplate = '%0%1.tiddler';
	}
	var uri = uriTemplate.format([path,context.tiddler.title,modified,revision]);
//#displayMessage('uri:'+uri);
	context.status = saveFile(uri,store.getSaver().externalizeTiddler(store,context.tiddler));
	if(context.status) {
		if(isRevision) {
			displayMessage(LocalAdaptor.revisionSavedMessage.format([revision]));
		}
	} else {
		alert(config.messages.backupFailed);
	}
	return context;
};

LocalAdaptor.prototype.saveTiddlerAsJs = function(context)
{
	var tiddler = context.tiddler;
	var path = LocalAdaptor.contentPath();
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
