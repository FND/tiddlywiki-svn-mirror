/***
|''Name:''|WikispacesAdaptorPlugin|
|''Description:''|Adaptor for Wikispaces.com|
|''Author:''| Saq Imtiaz|
|''Version:''|0.2|
|''Status:''|Not for release - in development|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.WikispacesAdaptorPlugin) {
version.extensions.WikispacesAdaptorPlugin = {installed:true};

function WikispacesAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

// !!TODO set the variables below
WikispacesAdaptor.serverType = 'Wikispaces';
WikispacesAdaptor.serverParsingErrorMessage = "Error parsing result from server";
WikispacesAdaptor.errorInFunctionMessage = "Error in function WikispacesAdaptor.%0";
WikispacesAdaptor.mimeType = 'text/plain';

WikispacesAdaptor.prototype.setContext = function(context,userParams,callback)
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

WikispacesAdaptor.doHttpGET = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('GET',uri,data,contentType,username,password,callback,params,headers);
};

WikispacesAdaptor.doHttpPROPFIND = function(uri,callback,params,headers,data,username,password)
{
   data = '<?xml version="1.0" encoding="utf-8" ?>' +
   '<D:propfind xmlns:D="DAV:">' +
   '<D:allprop/>' +
   '</D:propfind>';

	headers = {'Depth':'1'};
	return doHttp('PROPFIND',uri,data,'text/xml',null,null,callback,params,headers);
};

WikispacesAdaptor.doHttpPOST = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('POST',uri,data,contentType,username,password,callback,params,headers);
};

WikispacesAdaptor.doHttpPUT = function(uri,callback,params,headers,data,contentType,username,password)
{
	return doHttp('PUT',uri,data,contentType,username,password,callback,params,headers);
};

WikispacesAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(-1) != '/')
		host = host + '/';
	return host;
};

WikispacesAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Convert a page title to the normalized form used in uris
WikispacesAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'+').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

// Convert a date in YYYY-MM-DD hh:mm format into a JavaScript Date object
WikispacesAdaptor.dateFromEditTime = function(editTime)
{
	var dt = editTime;
	return new Date(Date.UTC(dt.substr(0,4),dt.substr(5,2)-1,dt.substr(8,2),dt.substr(11,2),dt.substr(14,2)));
};

WikispacesAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = WikispacesAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

WikispacesAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,0,context,userParams);
	}
	return true;
};

WikispacesAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	var list = [];
	list.push({title:"Main",name:"Main"});
	context.workspaces = list;
	if(context.callback) {
		context.status = true;
		window.setTimeout(context.callback,10,context,userParams);
	}
	return true;
};

WikispacesAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	var uriTemplate = '%0space/dav/pages';
	var uri = uriTemplate.format([context.host,context.workspace]);
	var req = WikispacesAdaptor.doHttpPROPFIND(uri,WikispacesAdaptor.getTiddlerListCallback,context); //why not get?
	return typeof req == 'string' ? req : true;
};


WikispacesAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = WikispacesAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {

			var list = [];

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

			function getProp(e,p){
				return e.getElementsByTagName('prop')[0].getElementsByTagName(p)[0].firstChild.data || '';
			}

			var responses = x.getElementsByTagName('response');
			for (var i=0; i<responses.length; i++){
				var r = responses[i];
				if(getProp(r,'getcontenttype')=='httpd/unix-directory')
					continue;
				var href = r.getElementsByTagName('href')[0].firstChild.data;
				var tiddler  = new Tiddler(href.substr(href.lastIndexOf("/")+1).replace(/\+/g, " "));
				tiddler.created = Date.fromISOString(r.getElementsByTagName('prop')[0].getElementsByTagName('creationdate')[0].firstChild.data);
				tiddler.modified = new Date(r.getElementsByTagName('prop')[0].getElementsByTagName('getlastmodified')[0].firstChild.data);
				tiddler.modifier = r.getElementsByTagName('prop')[0].getElementsByTagName('author')[0].firstChild.data;
				tiddler.fields['server.page.revision'] = new Date(r.getElementsByTagName('prop')[0].getElementsByTagName('getlastmodified')[0].firstChild.data).convertToYYYYMMDDHHMM();
				list.push(tiddler);
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

WikispacesAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : WikispacesAdaptor.fullHostName(tiddler.fields['server.host']);
	var uriTemplate = '%0%1';
	info.uri = uriTemplate.format([host,tiddler.title.replace(/ /g, "+")]);
	return info;
};

WikispacesAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	return this.getTiddlerInternal(context,userParams,callback);
};

// @internal
WikispacesAdaptor.prototype.getTiddlerInternal = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);

	uriTemplate = '%0space/dav/pages/%1';

	uri = uriTemplate.format([context.host,WikispacesAdaptor.normalizedTitle(context.title)]);
	context.tiddler = new Tiddler(context.title);
	context.tiddler.fields.wikiformat = 'WikispacesFormat';
	context.tiddler.fields['server.type'] = WikispacesAdaptor.serverType;
	context.tiddler.fields['server.host'] = WikispacesAdaptor.minHostName(context.host);
	context.tiddler.fields['server.workspace'] = context.workspace;
	
	var req = WikispacesAdaptor.doHttpGET(uri,WikispacesAdaptor.getTiddlerCallback,context);
	return typeof req == 'string' ? req : true;
};

WikispacesAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = WikispacesAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		try {
			context.tiddler.text = responseText;
		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesAdaptor.serverParsingErrorMessage);
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
	
	uriTemplate = '%0space/dav/pages/%1';

	uri = uriTemplate.format([context.host,WikispacesAdaptor.normalizedTitle(context.tiddler.title)]);
	var req = WikispacesAdaptor.doHttpPROPFIND(uri,WikispacesAdaptor.getTiddlerCallback2,context);

};

WikispacesAdaptor.getTiddlerCallback2 = function(status,context,responseText,uri,xhr)
{
	if(status) {
		context.status = true;
		try {
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
			
			//console.log(responseText);
			
			var x=doc.documentElement.getElementsByTagName('prop')[0];

			context.tiddler.created = Date.fromISOString(x.getElementsByTagName('creationdate')[0].firstChild.data);
			context.tiddler.modified = new Date(x.getElementsByTagName('getlastmodified')[0].firstChild.data);
			context.tiddler.modifier = x.getElementsByTagName('author')[0].firstChild.data;
			context.tiddler.fields['server.page.revision'] = context.tiddler.modified.convertToYYYYMMDDHHMM();

		} catch (ex) {
			context.statusText = exceptionText(ex,WikispacesAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = tiddler.title;
// !!TODO set the uriTemplate
	var uriTemplate = '%0space/dav/pages/%1';
	var host = this && this.host ? this.host : WikispacesAdaptor.fullHostName(tiddler.fields['server.host']);
	//var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	var uri = uriTemplate.format([host,tiddler.title]);
	var req = WikispacesAdaptor.doHttpPUT(uri,WikispacesAdaptor.putTiddlerCallback,context,{"X-Http-Method": "PUT"},tiddler.text,WikispacesAdaptor.mimeType);
	return typeof req == 'string' ? req : true;
};

WikispacesAdaptor.putTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	if(status) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

WikispacesAdaptor.prototype.close = function()
{
	return true;
};

config.adaptors[WikispacesAdaptor.serverType] = WikispacesAdaptor;
} //# end of 'install only once'

Date.fromISOString = function(str){
	var o = str.replace(/\D/g," ").split(" ");
	return new Date(o[0], (o[1]-1), o[2], o[3], o[4], o[5]);
};
//}}}
//
// must either proppath remote files after put, or update local tiddler mod date 