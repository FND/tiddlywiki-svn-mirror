/***
|''Name:''|ConfabbNotesAdaptorPlugin|
|''Description:''|Adaptor to POST notes to the Confabb server|
|''Author:''|Paul Downey|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/adaptors/ConfabbNotesAdaptorPlugin.js|
|''Version:''|0.0.1|
|''Date:''|May 21, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.4.0|
!Notes
A small adaptor used to save a set of note tiddlers in the form used by [[confabb.com|http://confabb.com]].

Note tiddlers posted to a URI, typically on [[confabb.com|http://confabb.com]], containing the CGI parameters:
*''username'' - the service username
The adaptor may be used to save notes on, an example form exists on [[ripplerap.com|]] 

It is anticpated the adaptor may be swapped for another implementing the puRss function to save notes on other services such as Google Pages, Tumber or to a service implementing WebDAV based on [[RippleRap Edition Configuration]].
!Code
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

	log('POST',ConfabbNotesAdaptor.uri,body,null,null,null,callback,params,{},true);

	return doHttp('POST',ConfabbNotesAdaptor.uri,body,null,null,null,callback,params,{},true);
};

config.adaptors[ConfabbNotesAdaptor.serverType] = ConfabbNotesAdaptor;
} //# end of 'install only once'
//}}}
