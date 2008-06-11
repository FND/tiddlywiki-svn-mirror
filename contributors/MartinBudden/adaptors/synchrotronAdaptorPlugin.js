/***
|''Name:''|synchrotronAdaptorPlugin|
|''Description:''|Adaptor for working with synchrotron diff tool|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/synchrotronAdaptorPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Jun 11, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.4.0|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.synchrotronAdaptorPlugin) {
version.extensions.synchrotronAdaptorPlugin = {installed:true};

function synchrotronAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

synchrotronAdaptor.serverType = 'synchrotron';
synchrotronAdaptor.errorInFunctionMessage = 'Error in function synchrotronAdaptor.%0: %1';
synchrotronAdaptor.revisionSavedMessage = 'Revision %0 saved';
synchrotronAdaptor.baseRevision = 1000;
synchrotronAdaptor.contentDirectory = 'content';
synchrotronAdaptor.revisionsDirectory = '_revisions';

synchrotronAdaptor.toFileFormat = function(s)
{
	//# file format is utf8, unless browser is IE
	return config.browser.isIE ? manualConvertUnicodeToUTF8(s) : unescape(encodeURIComponent(s)); // convert to utf8	
};

synchrotronAdaptor.fromFileFormat = function(s)
{
	//# convert into unicode from file (which is in UTF8)
	return decodeURIComponent(escape(s));
};

synchrotronAdaptor.prototype.setContext = function(context,userParams,callback)
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
synchrotronAdaptor.normalizedTitle = function(title)
{
	var id = title;
	id = id.replace(/ /g,'_').replace(/%/g,'%25').replace(/\t/g,'%09').replace(/#/g,'%23').replace(/\*/g,'%2a').replace(/,/g,'%2c').replace(/\//,'%2f').replace(/:/g,'%3a').replace(/</g,'%3c').replace(/>/g,'%3e').replace(/\?/g,'%3f');
	if(id.charAt(0)=='_')
		id = id.substr(1);
	return String(id);
};

synchrotronAdaptor.getPath = function(localPath,folder)
{
	var slash = '\\';
	var dirPathPos = localPath.lastIndexOf('\\');
	if(dirPathPos == -1) {
		dirPathPos = localPath.lastIndexOf('/');
		slash = '/';
	}
	if(!folder || folder == '')
		folder = '.';
	var path = folder + slash;
	if(folder.charAt(0)!=slash)
		path = localPath.substr(0,dirPathPos) + slash + path;
	return path;
};

synchrotronAdaptor.contentPath = function()
{
//#displayMessage('contentPath:'+document.location.toString());
	var file = getLocalPath(document.location.toString());
	return synchrotronAdaptor.getPath(file,synchrotronAdaptor.contentDirectory);
};

synchrotronAdaptor.revisionPath = function()
{
//#displayMessage('revisionPath');
	var file = getLocalPath(document.location.toString());
	var slash = file.lastIndexOf('\\') == -1 ? '/' : '\\';
	return synchrotronAdaptor.getPath(file,synchrotronAdaptor.contentDirectory + slash + synchrotronAdaptor.revisionsDirectory);
};

synchrotronAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	host = host.trim();
	if(!host.match(/:\/\//))
		host = 'file://' + host;
	if(host.substr(host.length-1) != '/')
		host = host + '/';
	return host;
};

synchrotronAdaptor.minHostName = function(host)
{
	return host ? host.replace(/\\/,'/').host.replace(/^http:\/\//,'').replace(/\/$/,'') : ''; //'
};

synchrotronAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
//#displayMessage('openHost:'+host);
	this.host = synchrotronAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
//#displayMessage('host:'+this.host);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

synchrotronAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
//#displayMessage('openWorkspace:'+workspace);
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

synchrotronAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
//#displayMessage('getWorkspaceList');
	var list = [];
	list.push({title:'Main',name:'Main'});
	context.workspaces = list;
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() {callback(context,userParams);},0);
	}
	return true;
};

synchrotronAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
//#console.log('synchrotronAdaptor.getTiddlerList');
	context = this.setContext(context,userParams,callback);
	var path = synchrotronAdaptor.contentPath();
	var entries = this.dirList(path);
	if(entries) {
		context.status = true;
		var list = [];
		var hash = {};
		for(var i=0; i<entries.length; i++) {
			var title = entries[i].name;
			if(title.match(/\.tiddler$/)) {
				title = title.replace(/\.tiddler$/,'');
				title = title.replace(/_/g,' ').replace(/%09/g,'\t').replace(/%23/g,'#').replace(/%2a/g,'*').replace(/%2c/g,',').replace(/%2f/g,'/').replace(/%3a/g,':').replace(/%3c/g,'<').replace(/%3e/g,'>').replace(/%3f/g,'?').replace(/%25/g,'%');
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
		context.statusText = synchrotronAdaptor.errorInFunctionMessage.format(['getTiddlerList']);
	}
	if(context.callback)
		window.setTimeout(function() {callback(context,userParams);},0);
	return context;
};

synchrotronAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
// get a list of the revisions for a tiddler
{
//#displayMessage('synchrotronAdaptor.getTiddlerRevisionList');
	context = this.setContext(context,userParams,callback);
	var path = synchrotronAdaptor.revisionPath();
//#displayMessage('revisionPath:'+path);
	var entries = this.dirList(path);
	if(entries) {
		var list = [];
		for(var i=0; i<entries.length; i++) {
			var name = entries[i].name;
			//# need to match name with
			//# dirlist/<title>.<nnnn>.tiddler
			var matchRegExp = /(.*?)\.([0-9]*)\.([0-9]*)\.tiddler/;
			matchRegExp.lastIndex = 0;
			var match = matchRegExp.exec(name);
			if(match) {
				if(match[1]==title) {
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
		context.statusText = synchrotronAdaptor.errorInFunctionMessage.format(['getTiddlerList']);
	}
	if(context.callback) {
		//# direct callback doesn't work, not sure why
		//#context.callback(context,context.userParams);
		window.setTimeout(function() {callback(context,userParams);},0);
	}
};

synchrotronAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var uriTemplate = '%0#%1';
	var host = synchrotronAdaptor.fullHostName(this.host);
	info.uri = uriTemplate.format([host,tiddler.title]);
	return info;
};

synchrotronAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
//#displayMessage('synchrotronAdaptor.getTiddlerRev:' + context.modified);
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

synchrotronAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#displayMessage('synchrotronAdaptor.getTiddler:' + context.title);
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;

	if(context.revision) {
//#displayMessage('cr:'+context.revision);
		var path = synchrotronAdaptor.revisionPath();
		var uriTemplate = '%0%1.%2.%3';
	} else {
		path = synchrotronAdaptor.contentPath();
		uriTemplate = '%0%1';
	}

	var uri = uriTemplate.format([path,synchrotronAdaptor.normalizedTitle(title),context.modified,context.revision]);
	//var uri = uriTemplate.format([path,title,context.modified,context.revision]);
//#displayMessage('uri:'+uri);
	context.tiddler = new Tiddler(title);
	context.tiddler.fields['server.type'] = synchrotronAdaptor.serverType;
	context.status = false;
	context.statusText = synchrotronAdaptor.errorInFunctionMessage.format(['getTiddler',title]);
	var fields = null;
	var t1, t0 = new Date();
	var data = loadFile(uri + '.tiddler');
	if(config.options.chkDisplayInstrumentation) {
		t1 = new Date();
		displayMessage('Tiddler file:"'+title+'" loaded in ' + (t1-t0) + ' ms');
	}
	if(data) {
		var tiddlerRegExp = /<div([^>]*)>(?:\s*)(<pre>)?([^<]*?)</mg;
		tiddlerRegExp.lastIndex = 0;
		match = tiddlerRegExp.exec(data);
		if(match) {
			ft = match[1].replace(/\=\"/mg,':"'); //'
			fields = ft.decodeHashMap();
			var text = match[3] ? match[3] : '';
			if(match[2]) {
				//# pre format
				text = synchrotronAdaptor.fromFileFormat(text);
				text = text.replace(/\r/mg,'');
			} else {
				text = text.unescapeLineBreaks().htmlDecode();
			}
			context.tiddler.text = text;
			context.status = true;
		}
	} else {
		data = loadFile(uri + '.js');
		context.tiddler.text = data;
		meta = loadFile(uri + '.js.meta');
		if(meta) {
			context.status = true;
			var ft = '';
			var fieldRegExp = /([^:]*):(?:\s*)(.*?)$/mg;
			fieldRegExp.lastIndex = 0;
			var match = fieldRegExp.exec(meta);
			while(match) {
				ft += match[1] + ':"' + match[2] + '" ';
				match = fieldRegExp.exec(meta);
			}
			fields = ft.decodeHashMap();
		} else {
			//#alert('cannot load tiddler');
			displayMessage('cannot load tiddler');
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
		window.setTimeout(function() {callback(context,userParams);},0);
	return context.status;
};

synchrotronAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
//#clearMessage();
//#displayMessage('synchrotronAdaptor.putTiddler:' + tiddler.title);
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	var revision = tiddler.fields['server.page.revision'] || synchrotronAdaptor.baseRevision;
	++revision;
	if(synchrotronAdaptor.revisionsDirectory)
		tiddler.fields['server.page.revision'] = String(revision);
	else
		delete tiddler.fields['server.page.revision'];
		
	tiddler.clearChangeCount();
	context.tiddler = tiddler;
	//# save the tiddler as a revision
	//#if(synchrotronAdaptor.revisionsDirectory)
	//#	this.saveTiddlerAsDiv(context,true);
	context = this.saveTiddlerAsDiv(context);
	if(context.callback)
		window.setTimeout(function() {callback(context,userParams);},0);
	return context.status;
};

synchrotronAdaptor.prototype.putTiddlerRevision = function(tiddler,context,userParams,callback)
{
//#clearMessage();
//#displayMessage('synchrotronAdaptor.putTiddler:' + tiddler.title);
	if(!synchrotronAdaptor.revisionsDirectory)
		return;
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
	if(!tiddler.fields['server.page.revision'])
		tiddler.fields['server.page.revision'] = String(synchrotronAdaptor.baseRevision);
		
	tiddler.clearChangeCount();
	context.tiddler = tiddler;
	// save the tiddler as a revision
	this.saveTiddlerAsDiv(context,true);
	if(context.callback)
		window.setTimeout(function() {callback(context,userParams);},0);
	return context.status;
};

synchrotronAdaptor.prototype.saveTiddlerAsDiv = function(context,isRevision)
{
//#displayMessage('synchrotronAdaptor.saveTiddlerAsDiv:'+context.tiddler.title);
	var tiddler = context.tiddler;
	if(isRevision) {
		if(!synchrotronAdaptor.revisionsDirectory)
			return;
		var path = synchrotronAdaptor.revisionPath();
		var uriTemplate = '%0%1.%2.%3.tiddler';
		var revision = tiddler.fields['server.page.revision'];
		var modified = tiddler.modified.convertToYYYYMMDDHHMM();
	} else {
		path = synchrotronAdaptor.contentPath();
		uriTemplate = '%0%1.tiddler';
	}
	var uri = uriTemplate.format([path,tiddler.title,modified,revision]);
//#displayMessage('uri:'+uri);
	var extendedAttributes = "";
	store.forEachField(tiddler,
		function(tiddler,fieldName,value) {
			if(typeof value != "string")
				value = "";
			if(!fieldName.match(/^temp\./))
				extendedAttributes += ' %0="%1"'.format([fieldName,value.escapeLineBreaks().htmlEncode()]);
		},true);
	var created = tiddler.created;
	var modified = tiddler.modified;
	var attributes = tiddler.modifier ? ' modifier="' + tiddler.modifier.htmlEncode() + '"' : "";
	attributes += (created == version.date) ? "" :' created="' + created.convertToYYYYMMDDHHMM() + '"';
	attributes += (modified == created) ? "" : ' modified="' + modified.convertToYYYYMMDDHHMM() +'"';
	var tags = tiddler.getTags();
	if(tags)
		attributes += ' tags="' + tags.htmlEncode() + '"';
	var text = synchrotronAdaptor.toFileFormat(tiddler.text);
	var div = ('<div title="%0"%1%2>%3</div>').format([tiddler.title.htmlEncode(),attributes,extendedAttributes,"\n<pre>" + text + "</pre>\n"]);
	context.status = saveFile(uri,div);
	if(context.status) {
		if(isRevision) {
			displayMessage(synchrotronAdaptor.revisionSavedMessage.format([revision]));
		}
	} else {
		alert(config.messages.backupFailed);
	}
	return context;
};

synchrotronAdaptor.prototype.saveTiddlerAsJs = function(context)
{
	var tiddler = context.tiddler;
	var path = synchrotronAdaptor.contentPath();
	var uriTemplate = '%0%1';
	var uri = uriTemplate.format([path,synchrotronAdaptor.normalizedTitle(tiddler.title)]);
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

synchrotronAdaptor.prototype.close = function() {return true;};

config.adaptors[synchrotronAdaptor.serverType] = synchrotronAdaptor;
} //# end of 'install only once'
//}}}

