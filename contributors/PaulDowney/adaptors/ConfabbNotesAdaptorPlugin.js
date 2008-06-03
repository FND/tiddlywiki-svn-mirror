/***
|''Name:''|ConfabbNotesAdaptorPlugin|
|''Description:''||
|''Author:''|Paul Downey|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/adaptors/ConfabbNotesAdaptorPlugin.js|
|''Version:''|0.0.1|
|''Date:''|May 21, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.4.0|

Minimal Adaptor to put a set of notes serialized as RSS/Atom on Confabb.com

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ConfabbNotesAdaptorPlugin) {
version.extensions.ConfabbNotesAdaptorPlugin = {installed:true};

function ConfabbNotesAdaptor()
{
	this.host = null;
	this.store = null;
	return this;
}

ConfabbNotesAdaptor.serverType = 'confabbnotes';

/*
 *  Save an RSS feed
 */
ConfabbNotesAdaptor.putRss = function(text,callback,params)
{
	var body = encodeURIComponent('username') + '=' + encodeURIComponent(config.options.txtUserName)
			+ '&' + encodeURIComponent('feed') + '=' + encodeURIComponent(text);

console.log('POST',ConfabbNotesAdaptor.uri,body.length,null,null,null,callback,params);

	return doHttp('POST',ConfabbNotesAdaptor.uri,body,null,null,null,callback,params,{},true);
};

config.adaptors[ConfabbNotesAdaptor.serverType] = ConfabbNotesAdaptor;
} //# end of 'install only once'
//}}}
