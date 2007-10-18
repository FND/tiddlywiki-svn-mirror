/***
|''Name:''|DavAdaptorPlugin|
|''Description:''|Adaptor to access a TiddlyWiki using WebDAV|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#DavAdaptorPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/DavAdaptorPlugin.js |
|''Version:''|0.0.1|
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
DavAdaptor.contentDirectory = 'content';
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

var data = '<?xml version="1.0" encoding="utf-8" ?>'
+'<propfind xmlns="DAV:">'
//  +'<allprop/>'
  +'<prop>'
  + '<resourcetype/>'
  + '<getcontenttype/>'
  + '<getetag/>'
  + '<creationdate/>'
  + '<getlastmodified/>'
  +'</prop>'
+'</propfind>';
displayMessage("dd"+data);

//data = '<?xml version="1.0" encoding="utf-8" ?><propfind xmlns="DAV:"><propname/></propfind>';

	headers = {'Depth':'1','Propfind':'allprop'};
	headers = {'Depth':'1','Propfind':'propname'};
	headers = {'Depth':'1'};//,'Propfind':'allprop'};
//	return doHttp('PROPFIND',uri,data,'text/xml; charset="UTF-8"',username,password,callback,params,headers);
//	return doHttp('PROPFIND',uri,data,'text/xml; charset="UTF-8"','MartinBudden','zz1234',callback,params,headers);
	//return doHttp('PROPFIND',uri,null,'text/xml','MartinBudden','zz1234',callback,params,headers);
	return doHttp('PROPFIND',uri,data,'text/xml',null,null,callback,params,headers);
};
/*
<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:" xmlns:ns0="DAV:">

<D:response xmlns:lp1="DAV:" xmlns:lp2="http://subversion.tigris.org/xmlns/dav/">
<D:href>/Trunk/contributors/MartinBudden/experimental/</D:href>
<D:propstat>
<D:prop>
<lp1:creationdate>2007-02-21T23:18:02.420103Z</lp1:creationdate>
</D:prop>
<D:status>HTTP/1.1 200 OK</D:status>
</D:propstat>
</D:response>

<D:response xmlns:lp1="DAV:" xmlns:lp2="http://subversion.tigris.org/xmlns/dav/">
<D:href>/Trunk/contributors/MartinBudden/experimental/AdaptorAPI.js</D:href>
<D:propstat>
<D:prop>
<lp1:creationdate>2007-02-10T00:02:33.712508Z</lp1:creationdate>
</D:prop>
<D:status>HTTP/1.1 200 OK</D:status>
</D:propstat>
</D:response>

</D:multistatus>
*/

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

// Convert a page title to the normalized form used in uris
DavAdaptor.normalizedTitle = function(title)
{
	var n = title;//title.toLowerCase();
	n = n.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
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
	if(!folder || folder == '')
		folder = '.';
	var path = localPath.substr(0,dirPathPos) + slash + folder + slash;
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
/*
<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:"> 
<D:response xmlns:S="http://subversion.tigris.org/xmlns/svn/" xmlns:C="http://subversion.tigris.org/xmlns/custom/" xmlns:V="http://subversion.tigris.org/xmlns/dav/" xmlns:lp1="DAV:" xmlns:lp2="http://subversion.tigris.org/xmlns/dav/"> <D:href>/Trunk/contributors/MartinBudden/experimental/</D:href>
<D:propstat>
<D:prop>
<lp1:resourcetype><D:collection/></lp1:resourcetype>
<lp1:getcontenttype>text/html; charset=UTF-8</lp1:getcontenttype>
<lp1:getetag>W/"1619//Trunk/contributors/MartinBudden/experimental"</lp1:getetag>
<lp1:creationdate>2007-02-21T23:18:02.420103Z</lp1:creationdate>
<lp1:getlastmodified>Wed, 21 Feb 2007 23:18:02 GMT</lp1:getlastmodified>
<lp1:checked-in><D:href>/!svn/ver/1619/Trunk/contributors/MartinBudden/experimental</D:href></lp1:checked-in>
<lp1:version-controlled-configuration><D:href>/!svn/vcc/default</D:href></lp1:version-controlled-configuration>
<lp1:version-name>1619</lp1:version-name>
<lp1:creator-displayname>MartinBudden</lp1:creator-displayname>
<lp2:baseline-relative-path>Trunk/contributors/MartinBudden/experimental</lp2:baseline-relative-path>
<lp2:repository-uuid>bb0f57cd-c710-0410-a8fb-e8bc1be0d679</lp2:repository-uuid>
<lp2:deadprop-count>0</lp2:deadprop-count>
<D:lockdiscovery/>
</D:prop>
<D:status>HTTP/1.1 200 OK</D:status>
</D:propstat>
</D:response>

<D:response xmlns:S="http://subversion.tigris.org/xmlns/svn/" xmlns:C="http://subversion.tigris.org/xmlns/custom/" xmlns:V="http://subversion.tigris.org/xmlns/dav/" xmlns:lp1="DAV:" xmlns:lp2="http://subversion.tigris.org/xmlns/dav/">
<D:href>/Trunk/contributors/MartinBudden/experimental/AdaptorAPI.js</D:href>
<D:propstat>
<D:prop>
<lp1:resourcetype/>
<lp1:getcontentlength>8317</lp1:getcontentlength>
<lp1:getcontenttype>text/xml; charset="utf-8"</lp1:getcontenttype>
<lp1:getetag>"1513//Trunk/contributors/MartinBudden/experimental/AdaptorAPI.js"</lp1:getetag>
<lp1:creationdate>2007-02-10T00:02:33.712508Z</lp1:creationdate>
<lp1:getlastmodified>Sat, 10 Feb 2007 00:02:33 GMT</lp1:getlastmodified>
<lp1:checked-in><D:href>/!svn/ver/1513/Trunk/contributors/MartinBudden/experimental/AdaptorAPI.js</D:href></lp1:checked-in>
<lp1:version-controlled-configuration><D:href>/!svn/vcc/default</D:href></lp1:version-controlled-configuration>
<lp1:version-name>1513</lp1:version-name>
<lp1:creator-displayname>MartinBudden</lp1:creator-displayname>
<lp2:baseline-relative-path>Trunk/contributors/MartinBudden/experimental/AdaptorAPI.js</lp2:baseline-relative-path>
<lp2:md5-checksum>1ebf6673db289174c72777341510d162</lp2:md5-checksum>
<lp2:repository-uuid>bb0f57cd-c710-0410-a8fb-e8bc1be0d679</lp2:repository-uuid>
<lp2:deadprop-count>0</lp2:deadprop-count>
<D:supportedlock><D:lockentry> <D:lockscope><D:exclusive/></D:lockscope> <D:locktype><D:write/></D:locktype> </D:lockentry> </D:supportedlock>
<D:lockdiscovery/>
</D:prop>
<D:status>HTTP/1.1 200 OK</D:status>
</D:propstat>
</D:response>
</D:multistatus>
*/
DavAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = DavAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
//	var req = doHttp("OPTIONS",uri,null,null,null,null,DavAdaptor.checkWebDAVEnabledCallback,context,null);
//	var req = doHttp("GET",uri,null,null,null,null,DavAdaptor.checkWebDAVEnabledCallback,context,null);
	var uri = 'http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/verticals/testTiddlyFile/';
	var uri = 'http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/test/';
	var uri = 'http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/';
displayMessage("openHost");
displayMessage("uri:"+uri);
	//var req = doHttp("OPTIONS",uri,null,null,null,null,DavAdaptor.openHostCallback,context,null);
	var req = DavAdaptor.doHttpPROPFIND(uri,DavAdaptor.openHostCallback,context);
	//var req = DavAdaptor.doHttpGET(uri,DavAdaptor.openHostCallback,context);

	if (typeof req == "string")
		displayMessage("r:"+req);
	/*if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}*/
	return true;
};
/*<?xml version="1.0" encoding="utf-8"?>
<D:multistatus xmlns:D="DAV:" xmlns:ns0="DAV:">
<D:response xmlns:S="http://subversion.tigris.org/xmlns/svn/" xmlns:C="http://subversion.tigris.org/xmlns/custom/" xmlns:V="http://subversion.tigris.org/xmlns/dav/" xmlns:lp1="DAV:" xmlns:lp2="http://subversion.tigris.org/xmlns/dav/">
<D:href>/Trunk/contributors/MartinBudden/verticals/testTiddlyFile/</D:href>
<D:propstat> 
<D:prop>
<lp1:resourcetype><D:collection/></lp1:resourcetype>
<lp1:getcontenttype>text/html; charset=UTF-8</lp1:getcontenttype>
<lp1:getetag>W/"2553//Trunk/contributors/MartinBudden/verticals/testTiddlyFile"</lp1:getetag>
<lp1:creationdate>2007-09-28T16:10:54.602626Z</lp1:creationdate>
<lp1:getlastmodified>Fri, 28 Sep 2007 16:10:54 GMT</lp1:getlastmodified>
<lp1:checked-in><D:href>/!svn/ver/2553/Trunk/contributors/MartinBudden/verticals/testTiddlyFile</D:href></lp1:checked-in> 
<lp1:version-controlled-configuration><D:href>/!svn/vcc/default</D:href></lp1:version-controlled-configuration> <lp1:version-name>2553</lp1:version-name> <lp1:creator-displayname>MartinBudden</lp1:creator-displayname> <lp2:baseline-relative-path>Trunk/contributors/MartinBudden/verticals/testTiddlyFile</lp2:baseline-relative-path> <lp2:repository-uuid>bb0f57cd-c710-0410-a8fb-e8bc1be0d679</lp2:repository-uuid> <lp2:deadprop-count>0</lp2:deadprop-count> <D:lockdiscovery/> </D:prop>
<D:status>HTTP/1.1 200 OK</D:status>
</D:propstat>
</D:response>
</D:multistatus>
*/
DavAdaptor.openHostCallback = function(status,context,responseText,uri,xhr)
{
displayMessage('openHostCallback status:'+status);
		if (!status) {
			displayMessage("xs:"+xhr.status);
			displayMessage(DavAdaptor.propfindMethodError.format([uri]));
			displayMessage("rh:"+xhr.getResponseHeader("DAV"));
displayMessage('rt:'+x.responseText.substr(0,150));
		} else {
displayMessage('rt2:'+responseText.substr(0,6000));
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
displayMessage('getTiddlerList');
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host,context.workspace]);
displayMessage("uri:"+uri);
	var req = DavAdaptor.doHttpPROPFIND(uri,DavAdaptor.getTiddlerListCallback,context);
	return typeof req == 'string' ? req : true;
};

DavAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
displayMessage('getTiddlerListCallback status:'+status);
displayMessage('rt:'+responseText.substr(0,60));
//displayMessage('xhr:'+xhr);
	context.status = true;
	status = true;
	//context.status = false;
	//context.statusText = DavAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var tiddler = new Tiddler('Copyright');
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

DavAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : DavAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
// !!TODO set the uriTemplate
	uriTemplate = '%0%1%2.tiddler';
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
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.revision = revision;
	return this.getTiddlerInternal(context,userParams,callback);
};

// @internal
DavAdaptor.prototype.getTiddlerInternal = function(context)
{
//#displayMessage("getTiddlerInternal");
	if(context.revision) {
		var path = DavAdaptor.revisionPath();
		var uriTemplate = '%0%1.%2.%3.tiddler';
	} else {
		path = DavAdaptor.contentPath(context.host);
		uriTemplate = '%0%2.tiddler';
	}
	uri = uriTemplate.format([path,context.workspace,DavAdaptor.normalizedTitle(context.title),context.revision]);
//#displayMessage('uri: '+uri);

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
//#displayMessage('rt:'+responseText.substr(0,60));
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
