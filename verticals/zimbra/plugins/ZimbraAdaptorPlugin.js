/***
|''Name:''|ZimbraAdaptorPlugin|
|''Description:''|Adaptor for Zimbra Collaboration Server (http://www.zimbra.com/)|
|''Author:''|Jeremy Ruston (jeremy (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/zimbra/plugins/ZimbraAdaptorPlugin.js|
|''Version:''|0.1.0|
|''Date:''|Feb 23, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ZimbraAdaptorPlugin) {
version.extensions.ZimbraAdaptorPlugin = {installed:true};

function ZimbraAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

merge(ZimbraAdaptor,{
	serverType: 'zimbra',
	getTiddlerListUrl: '%0service/home/%1/Notebook.rss',
	viewTiddlerUrl: '%0service/home/%1/Notebook/%2',
	getTiddlerUrl: '%0service/home/%1/Notebook/%2?fmt=native',
	tiddlerTemplate: '<html>%0</html>'
});

ZimbraAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = host;
	context.status = true;
	window.setTimeout(function() {callback(context,userParams);},10);
	return true;
}

ZimbraAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context.workspaces = [];
	context.status = true;
	window.setTimeout(function() {callback(context,userParams);},10);
	return true;
}

ZimbraAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context.status = true;
	window.setTimeout(function() {callback(context,userParams);},10);
	return true;
}

ZimbraAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	context.adaptor = this;
	context.callback = callback;
	context.userParams = userParams;
	var url = ZimbraAdaptor.getTiddlerListUrl.format([this.host,this.workspace]);
	var ret = loadRemoteFile(url,ZimbraAdaptor.getTiddlerListCallback,context);
	return typeof(ret) == "string" ? ret : true;
}

ZimbraAdaptor.getTiddlerListCallback = function(status,context,responseText,url,xhr)
{
	var adaptor = context.adaptor;
	context.status = status;
	if(!status) {
		context.statusText = "Error reading file: " + xhr.statusText;
	} else {
		context.tiddlers = adaptor.readRss(responseText);
	}
	context.callback(context,context.userParams);
}

ZimbraAdaptor.prototype.readRss = function(rssText)
{
	var tiddlers = [];
	var xml = (new DOMParser()).parseFromString(rssText,"text/xml");
	var root = xml.getElementsByTagName('rss')[0];
	var channel = root.getElementsByTagName('channel')[0];
	var items = channel.getElementsByTagName('item');
	for(var t=0; t<items.length; t++) {
		var title = items[t].getElementsByTagName('title')[0].firstChild.nodeValue;
		var c = title.lastIndexOf(" ver ");
		if(c != -1)
			title = title.substr(0,c);
		if(tiddlers.findByField("title",title) == null) {
			var tiddler = new Tiddler(title);
			var pubDate = items[t].getElementsByTagName('pubDate')[0].firstChild.nodeValue;
			tiddler.modified = new Date(pubDate);
			tiddlers.push(tiddler);
		}
	}
	return tiddlers;
}

ZimbraAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : tiddler.fields['server.host'];
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
	info.uri = ZimbraAdaptor.viewTiddlerUrl.format([host,workspace,encodeURI(tiddler.title)]);
	return info;
}

ZimbraAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context.adaptor = this;
	context.callback = callback;
	context.userParams = userParams;
	context.title = title;
	var url = ZimbraAdaptor.getTiddlerUrl.format([this.host,this.workspace,encodeURI(title)]);
	var ret = loadRemoteFile(url,ZimbraAdaptor.getTiddlerCallback,context);
	return typeof(ret) == "string" ? ret : true;
}

ZimbraAdaptor.getTiddlerCallback = function(status,context,responseText,url,xhr)
{
	var adaptor = context.adaptor;
	context.status = status;
	if(!status) {
		context.statusText = "Error reading file: " + xhr.statusText;
	} else {
		context.tiddler = new Tiddler(context.title);
		context.tiddler.text = ZimbraAdaptor.tiddlerTemplate.format([responseText]);
		context.tiddler.fields['server.type'] = ZimbraAdaptor.serverType;
		context.tiddler.fields['server.host'] = adaptor.host;
		context.tiddler.fields['server.workspace'] = adaptor.workspace;
	}
	context.callback(context,context.userParams);
}

ZimbraAdaptor.prototype.putTiddler = function(tiddler,context,userParams,callback)
{

}

ZimbraAdaptor.prototype.close = function() {return true;};

config.adaptors[ZimbraAdaptor.serverType] = ZimbraAdaptor;

} //# end of 'install only once'
//}}}
