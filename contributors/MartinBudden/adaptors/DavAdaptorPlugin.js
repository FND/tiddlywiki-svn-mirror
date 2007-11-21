/***
|''Name:''|DavAdaptorPlugin|
|''Description:''|Adaptor to access a TiddlyWiki using WebDAV|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#DavAdaptorPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/DavAdaptorPlugin.js |
|''Version:''|0.0.2|
|''Status:''|Not for release - this is still a work in progress|
|''Date:''|Mar 11, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2.6|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.DavAdaptorPlugin) {
version.extensions.DavAdaptorPlugin = {installed:true};

function DavAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

DavAdaptor.serverType = 'dav';
DavAdaptor.serverParsingErrorMessage = "Error parsing result from server";
DavAdaptor.errorInFunctionMessage = "Error in function DavAdaptor.%0";
DavAdaptor.baseRevision = 1000;
DavAdaptor.contentDirectory = '';
DavAdaptor.revisionsDirectory = 'revisions';
DavAdaptor.propfindMethodError = "PROPFIND error for resource : %0";
DavAdaptor.webDavNotEnabled = "WebDAV is not enabled on this resource : %0";

DavAdaptor.prototype.setContext = function(context,userParams,callback)
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

DavAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

DavAdaptor.doHttpPROPFIND = function(uri,callback,params,headers,data,username,password)
{

data = '<?xml version="1.0" encoding="utf-8" ?><propfind xmlns="DAV:"><prop>' +
//    '<displayname/>' +
    '<resourcetype/>' +
    '<getcontenttype/>' +
    '<getetag/>' +
    '<creationdate/>' +
    '<getlastmodified/>' +
    '<creator-displayname/>' +
    '</prop></propfind>';
data = '<?xml version="1.0" encoding="utf-8" ?><propfind xmlns="DAV:"><allprop/></propfind>';
data = '<?xml version="1.0" encoding="utf-8" ?><propfind xmlns="DAV:"><propname/></propfind>';
data = null;
data = '<?xml version="1.0" encoding="utf-8" ?><propfind xmlns="DAV:"><prop>' +
    '<displayname/>' +
    '<resourcetype/>' +
    '<getcontenttype/>' +
    '<getetag/>' +
    '<creationdate/>' +
    '<getlastmodified/>' +
    '<creator-displayname/>' +
    '</prop></propfind>';
displayMessage("dd:"+data);
	//var uri = 'http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/verticals/testTiddlyFile/';
	//uri = 'http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/test/';
	//uri = 'http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/';
	//uri = 'http://zw.mcelrath.org/tiddlers/';

	//headers = {'Depth':'1','Propfind':'allprop'};
	//headers = {'Depth':'1','Propfind':'propname'};
	var headers = {'Depth':'1'};
	return doHttp('PROPFIND',uri,data,'text/xml',null,null,callback,params,headers);
};

DavAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

DavAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	return host;
};

DavAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

//# Convert a page title to the normalized form used in uris
DavAdaptor.normalizedTitle = function(title)
{
	var n = title;//title.toLowerCase();
	n = n.replace(/\s/g,'_').replace(/\//g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

DavAdaptor.getPath = function(localPath,folder)
{
	var slash = '\\';
	var dirPathPos = localPath.lastIndexOf('\\');
	if(dirPathPos == -1) {
		dirPathPos = localPath.lastIndexOf('/');
		slash = '/';
	}
	var path = localPath.substr(0,dirPathPos) + slash;
	if(folder)
		path += folder + slash;
	return path;
};

DavAdaptor.contentPath = function(uri)
{
//#displayMessage("contentPath:"+uri);
//#displayMessage("path:"+document.location.toString());
	return DavAdaptor.getPath(uri,DavAdaptor.contentDirectory);
};

DavAdaptor.revisionPath = function()
{
//#displayMessage("revisionPath");
	var file = getLocalPath(document.location.toString());
	var slash = file.lastIndexOf('\\') == -1 ? '/' : '\\';
	return DavAdaptor.getPath(file,DavAdaptor.contentDirectory + slash + DavAdaptor.revisionsDirectory);
};

// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
DavAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

DavAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = DavAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
//	var req = doHttp("OPTIONS",uri,null,null,null,null,DavAdaptor.checkWebDAVEnabledCallback,context,null);
//	var req = doHttp("GET",uri,null,null,null,null,DavAdaptor.checkWebDAVEnabledCallback,context,null);
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host,context.workspace]);
	//var req = DavAdaptor.doHttpPROPFIND(uri,DavAdaptor.openHostCallback,context);

	//if (typeof req == "string")
	//	displayMessage("r:"+req);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,10,context,userParams);
	}
	return true;
};

DavAdaptor.openHostCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('openHostCallback status:'+status);
		if (!status) {
			displayMessage(DavAdaptor.propfindMethodError.format([uri]));
			//#displayMessage("xs:"+xhr.status);
			//#displayMessage("rh:"+xhr.getResponseHeader("DAV"));
		} else {
//#displayMessage('rt2:'+responseText.substr(0,6000));
			/*if (!xhr.getResponseHeader("DAV"))
				alert(DavAdaptor.webDavNotEnabled.format([uri]));
			else
				displayMessage("rh:"+xhr.getResponseHeader("DAV"));*/
		}
};

DavAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,10,context,userParams);
	}
	return true;
};

DavAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
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

DavAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
//#displayMessage('getTiddlerList');
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host,context.workspace]);
//#displayMessage("uri:"+uri);
	var req = DavAdaptor.doHttpPROPFIND(uri,DavAdaptor.getTiddlerListCallback,context);
	return typeof req == 'string' ? req : true;
};

DavAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
	
	//console.log(this.host)
	context.status = false;
	context.statusText = WikispacesAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
			var list = [];
			var doc;
			if(window.ActiveXObject) {
				//# code for IE
				doc = new ActiveXObject("Microsoft.XMLDOM");
				doc.async = 'false';
				doc.loadXML(responseText);
			} else {
				//# code for Mozilla, Firefox, Opera, etc.
				var parser=new DOMParser();
				doc = parser.parseFromString(responseText,"text/xml");
			}
			var x = doc.documentElement;

			///console.log(responseText)
			//console.log(x.getElementsByTagName('prop')) //can simplify now using prop
			function getProp(e,p) {
				return e.getElementsByTagName('prop')[0].getElementsByTagName(p)[0].firstChild.data || '';
			};

			var responses = x.getElementsByTagName('response');
			for(var i=0; i<responses.length; i++) {
				var r = responses[i];
				if(getProp(r,'getcontenttype')=='httpd/unix-directory')
					continue;
				//console.log(r.getElementsByTagName('prop')[0].getElementsByTagName('displayname')[0].firstChild.data)
				var tiddler  = new Tiddler(r.getElementsByTagName('prop')[0].getElementsByTagName('displayname')[0].firstChild.data);
				//console.log(r.getElementsByTagName('prop')[0].getElementsByTagName('creationdate')[0].firstChild.data)
				tiddler.created = Date.fromISOString(r.getElementsByTagName('prop')[0].getElementsByTagName('creationdate')[0].firstChild.data);
				tiddler.modified = new Date(r.getElementsByTagName('prop')[0].getElementsByTagName('getlastmodified')[0].firstChild.data);
				tiddler.modifier = r.getElementsByTagName('prop')[0].getElementsByTagName('author')[0].firstChild.data;
				tiddler.fields['server.page.revision'] = new Date(r.getElementsByTagName('prop')[0].getElementsByTagName('getlastmodified')[0].firstChild.data).convertToYYYYMMDDHHMM();
				list.push(tiddler);
				//console.log(tiddler)
			}

		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.tiddlers = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};


/*
DavAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
displayMessage('getTiddlerListCallback status:'+status);
displayMessage('rt:'+responseText.substr(0,2000));
//#displayMessage('xhr:'+xhr);
//#displayMessage('rh:'+xhr.getAllResponseHeaders());
var xt = xhr.responseText;
displayMessage('xt:'+xt.substr(0,100));
displayMessage("x0");
var xml = xhr.responseXML;
displayMessage("x1:"+xml);
	var doc;
	if(window.ActiveXObject) {
		//# code for IE
		doc=new ActiveXObject("Microsoft.XMLDOM");
		doc.async="false";
		doc.loadXML(responseText);
	} else {
		//# code for Mozilla, Firefox, Opera, etc.
		var parser=new DOMParser();
		doc=parser.parseFromString(responseText,"text/xml");
	}
	var x=doc.documentElement;
displayMessage("x2:"+x.nodeName+" t:"+x.tagName);
	var y = getFirstChild(x);
displayMessage("x3:"+y.nodeName+" t:"+y.tagName);
	var c = y.getElementsByTagName("d:response");
	for(var i=0;i<c.length;i++) {
		displayMessage("nn:"+c[i].nodeName+" nt:"+c[i].tagName);
		//displayMessage("nn:");
	}

	function getFirstChild(n)
	{
		var x = n.firstChild;
		while(x.nodeType!=1) {
			x = x.nextSibling;
		}
		return x;
	}

displayMessage("x3");

var node=x;
displayMessage("x4");
	for(var i=0;i<node.childNodes.length;i++) {
		var c = node.childNodes[i]
		if (c.nodeType==1) {
			//Process only element nodes
			//displayMessage(c.nodeName+":"+c.nodeValue);
			displayMessage("n:"+c.nodeName+" t:"+c.tagName);
			var f = getFirstChild(c);
			displayMessage("c:"+f.nodeName+" v:"+f.childNodes[0].nodeValue);
		}
	}
displayMessage("x5");
	context.status = true;
	status = true;
	//context.status = false;
	//context.statusText = DavAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var tiddler = new Tiddler('Logo.tiddler');
			list.push(tiddler);
			tiddler = new Tiddler('News');
			list.push(tiddler);
		} catch (ex) {
			context.statusText = exceptionText(ex,DavAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.tiddlers = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};
*/

DavAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : DavAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	var uriTemplate = '%0%1%2.tiddler';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

DavAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#displayMessage("getTiddler");
	context = this.setContext(context,userParams,callback);
	context.title = title;
	return this.getTiddlerInternal(context,userParams,callback);
};

DavAdaptor.prototype.getTiddlerRevision = function(title,revision,context,userParams,callback)
{
//#displayMessage('LocalAdaptor.getTiddlerRev:' + context.modified);
	context = this.setContext(context,userParams,callback);
	if(revision)
		context.revision = revision;
	return this.getTiddler(title,context,userParams,callback);
};

DavAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;
	if(context.revision) {
		var path = DavAdaptor.revisionPath();
		var uriTemplate = '%0%1.%2.%3.tiddler';
	} else {
		path = DavAdaptor.contentPath(context.host);
		uriTemplate = '%0%2';
	}
	uri = uriTemplate.format([path,context.workspace,DavAdaptor.normalizedTitle(context.title),context.revision]);
displayMessage('uri: '+uri);

	context.tiddler = new Tiddler(context.title);
	//context.tiddler.fields['server.host'] = DavAdaptor.minHostName(context.host);
	//context.tiddler.fields['server.workspace'] = context.workspace;
	var req = DavAdaptor.doHttpGET(uri,DavAdaptor.getTiddlerCallback,context);
//displayMessage('req:'+req);
	return typeof req == 'string' ? req : true;
};

DavAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
//#displayMessage('getTiddlerCallback status:'+status);
//#displayMessage('rt:'+responseText.substr(0,500));
	context.status = false;
	context.statusText = DavAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		try {
			context.tiddler.fields['server.type'] = DavAdaptor.serverType;
			context.status = false;
			context.statusText = DavAdaptor.errorInFunctionMessage.format(['getTiddler',context.title]);
			var fields = null;
			var data = responseText;
//#displayMessage("data:"+data);
			var tiddlerRegExp = /<div([^>]*)>(?:\s*)(<pre>)?((?:.|\n|\[|\])*)/mg;
			tiddlerRegExp.lastIndex = 0;
			match = tiddlerRegExp.exec(data);
			if(match) {
				//#displayMessage("m1:"+match[1]);
				//#displayMessage("m2:"+match[2]);
				//#displayMessage("m3:"+match[3]);
				ft = match[1].replace(/\=\"/mg,':"');
				fields = ft.decodeHashMap();
				var text = match[3] ? match[3] : '';
				if(match[2]) {
					text = text.unescapeLineBreaks().htmlDecode();
				} else {
					text = text.replace(/\r/mg,'').htmlDecode();
				}
			} else {
				text = data;
			}
			context.tiddler.text = text;
			context.status = true;
		} catch (ex) {
			context.statusText = exceptionText(ex,DavAdaptor.serverParsingErrorMessage);
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

DavAdaptor.prototype.getTiddlerRevisionList = function(title,limit,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0%1%2';
	if(!limit)
		limit = 10;
	var uri = uriTemplate.format([this.host,this.workspace,DavAdaptor.normalizedTitle(title),limit]);
	var req = DavAdaptor.doHttpGET(uri,DavAdaptor.getTiddlerRevisionListCallback,context);
	return typeof req == 'string' ? req : true;
};

DavAdaptor.getTiddlerRevisionListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	if(status) {
		var content = null;
		try {
// !!TODO: parse the responseText here
			var list = [];
			var tiddler = new Tiddler('example');
// !!TODO: fill in tiddler fields as available
			//tiddler.modified = DavAdaptor.dateFromEditTime();
			//tiddler.modifier = ;
			//tiddler.tags = ;
			//tiddler.fields['server.page.id'] = ;
			//tiddler.fields['server.page.name'] = ;
			//tiddler.fields['server.page.revision'] = ;
			list.push(tiddler);
		} catch (ex) {
			context.statusText = exceptionText(ex,DavAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		var sortField = 'server.page.revision';
		list.sort(function(a,b) {return a.fields[sortField] < b.fields[sortField] ? +1 : (a.fields[sortField] == b.fields[sortField] ? 0 : -1);});
		context.revisions = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

/*DavAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
// !!TODO set the uriTemplate
	var uriTemplate = '%0%1%2';
	var host = this && this.host ? this.host : DavAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	var uri = uriTemplate.format([host,workspace,tiddler.title,tiddler.text]);
	var req = DavAdaptor.doHttpPOST(uri,DavAdaptor.putTiddlerCallback,context,{"X-Http-Method": "PUT"},tiddler.text,DavAdaptor.mimeType);
	return typeof req == 'string' ? req : true;
};

DavAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};*/

DavAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[DavAdaptor.serverType] = DavAdaptor;
} //# end of 'install only once'
//}}}
