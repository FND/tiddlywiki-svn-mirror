/***
|''Name:''|ConfabbAgendaAdaptorPlugin|
|''Description:''|Load RippleRap Agenda from a Confabb.com URI|
|''Author:''|Paul Downey (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/adaptors/ConfabbAgendaAdaptorPlugin.js|
|''Version:''|0.1|
|''Date:''|May 11, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.4.0|
*/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ConfabbAgendaAdaptorPlugin) {
version.extensions.ConfabbAgendaAdaptorPlugin = {installed:true};

function ConfabbAgendaAdaptor()
{
	this.host = null;
	this.store = null;
	return this;
}

ConfabbAgendaAdaptor.serverType = 'confabbagenda';
ConfabbAgendaAdaptor.serverParsingErrorMessage = "Error parsing result from server";
ConfabbAgendaAdaptor.errorInFunctionMessage = "Error in function ConfabbAgendaAdaptor.%0";
ConfabbAgendaAdaptor.emptyFeed = "No Confabb Agenda Items Found";

String.prototype.makeId = function() {
	return this.replace(/[^A-Za-z0-9]+/g, "");
}

Node.prototype.getFirstElementValue = function (tag, def) {
	var e = this.getElementsByTagName(tag);
	if (e && e.length && e[0].textContent)
	    return e[0].textContent
	return def;
}

/*
 *  takes a Confabb Agenda, returns list of tiddlers
 */
ConfabbAgendaAdaptor.parseAgenda = function(text)
{
	var tiddlers = [];

	/* 
	 *  parse XML
	 */
	var r = getXML(text);
	if (!r) 
		return tiddlers;

	/* 
	 *  build track tiddlers
	 */
	var tracks = {};
	var t = r.getElementsByTagName('track');
	for(var i=0;i<t.length;i++) {
		var name = t[i].textContent;
		if (!name.length) name = "DefaultTrack";
		tracks[name.makeId()] = name;
	}

	for(var trackid in tracks) {
		var tiddler = new Tiddler();
		tiddler.assign(tracks[trackid],'<<AgendaTrackSessions>>',undefined,undefined,['track'],undefined,{rr_session_tag: trackid});
		tiddlers.push(tiddler);
	}

	/* 
	 *  build session tiddlers
	 */
	var t = r.getElementsByTagName('session');
	for(var i=0;i<t.length;i++) {
		var node = t[i];
		var tiddler = new Tiddler();

		var id = node.getAttribute('id');
		var day = node.getFirstElementValue("day","");
		var track = node.getFirstElementValue("track","");
		var location = node.getFirstElementValue("location","");
		var content = node.getFirstElementValue("description","");

		var tags = ['session'];
		tags.push(track.makeId());
		tags.push(location.makeId());
		tags.push(day.makeId());

		/* list of speakers */
		var s = node.getElementsByTagName("speaker");
		var speakers = [];
		for(var j=0;j<s.length;j++) {
		       var speaker = s[j].getFirstElementValue("title");
		       speakers.push(speaker);
		       tags.push(speaker.makeId());
		}

		tiddler.assign(id,content,undefined,undefined,tags,undefined,{
			rr_session_title: node.getFirstElementValue("title",""),
			rr_session_starttime: node.getFirstElementValue("starttime",""),
			rr_session_endtime: node.getFirstElementValue("endtime",""),
			rr_session_link: node.getFirstElementValue("link",""),
			rr_session_day: day,
			rr_session_location: location,
			rr_session_track: track,
			rr_session_day: node.getFirstElementValue("day",""),
			rr_session_speakers: speakers.join(", ")
		});
		tiddlers.push(tiddler);
	}

	return tiddlers;
};


ConfabbAgendaAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = ConfabbAgendaAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

ConfabbAgendaAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	return host;
};

ConfabbAgendaAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

// Open the specified host
//#   host - url of host (eg, "http://www.tiddlywiki.com/" or "www.tiddlywiki.com")
//#   context is itself passed on as a parameter to the callback function
//#   userParams - user settable object object that is passed on unchanged to the callback function
//#   callback - optional function to be called on completion
//# Return value is true if the request was successfully issued, false if this connector doesn't support openHost(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(context)
//#   context.status - true if OK, string if error
//#   context.adaptor - reference to this adaptor object
//#   userParams - parameters as originally passed into the openHost function
ConfabbAgendaAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = host;
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {context.callback(context,userParams);},10);
	return true;
};

ConfabbAgendaAdaptor.loadTiddlyWikiCallback = function(status,context,responseText,url,xhr)
{
	context.status = status;
	if(!status) {
		context.statusText = "Error reading agenda file";
	} else {
		//# Load the content into a TiddlyWiki() object
		context.adaptor.store = new TiddlyWiki();
		var tiddlers = ConfabbAgendaAdaptor.parseAgenda(responseText);
		if(!tiddlers.length)
			context.statusText = config.messages.invalidFileError.format([url]);
		for(var i=0;i<tiddlers.length;i++) {
			console.log(tiddlers[i].title);
			context.adaptor.store.addTiddler(tiddlers[i]);
		}
	}
	if (context.complete)
	    context.complete(context,context.userParams);
};

// Get the list of workspaces on a given server
//#   context - passed on as a parameter to the callback function
//#   userParams - user settable object object that is passed on unchanged to the callback function
//#   callback - function to be called on completion
//# Return value is true if the request was successfully issued, false if this connector doesn't support getWorkspaceList(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(context,userParams)
//#   context.status - true if OK, false if error
//#   context.statusText - error message if there was an error
//#   context.adaptor - reference to this adaptor object
//#   userParams - parameters as originally passed into the getWorkspaceList function
ConfabbAgendaAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.workspaces = [{title:"(default)"}];
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

// Open the specified workspace
//#   workspace - name of workspace to open
//#   context - passed on as a parameter to the callback function
//#   userParams - user settable object object that is passed on unchanged to the callback function
//#   callback - function to be called on completion
//# Return value is true if the request was successfully issued
//#   or an error description string if there was a problem
//# The callback parameters are callback(context,userParams)
//#   context.status - true if OK, false if error
//#   context.statusText - error message if there was an error
//#   context.adaptor - reference to this adaptor object
//#   userParams - parameters as originally passed into the openWorkspace function
ConfabbAgendaAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

// Gets the list of tiddlers within a given workspace
//#   context - passed on as a parameter to the callback function
//#   userParams - user settable object object that is passed on unchanged to the callback function
//#   callback - function to be called on completion
//#   filter - filter expression
//# Return value is true if the request was successfully issued,
//#   or an error description string if there was a problem
//# The callback parameters are callback(context,userParams)
//#   context.status - true if OK, false if error
//#   context.statusText - error message if there was an error
//#   context.adaptor - reference to this adaptor object
//#   context.tiddlers - array of tiddler objects
//#   userParams - parameters as originally passed into the getTiddlerList function
ConfabbAgendaAdaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
{
	context = this.setContext(context,userParams,callback);
	if(!context.filter)
		context.filter = filter;
	context.complete = ConfabbAgendaAdaptor.getTiddlerListComplete;
	if(this.store) {
		var ret = context.complete(context,context.userParams);
	} else {
		ret = loadRemoteFile(context.host,ConfabbAgendaAdaptor.loadTiddlyWikiCallback,context);
		if(typeof ret != "string")
			ret = true;
	}
	return ret;
};

ConfabbAgendaAdaptor.getTiddlerListComplete = function(context,userParams)
{
	if(context.status) {
		if(context.filter) {
			context.tiddlers = context.adaptor.store.filterTiddlers(context.filter);
		} else {
			context.tiddlers = [];
			context.adaptor.store.forEachTiddler(function(title,tiddler) {context.tiddlers.push(tiddler);});
		}
		for(var i=0; i<context.tiddlers.length; i++) {
			context.tiddlers[i].fields['server.type'] = ConfabbAgendaAdaptor.serverType;
			context.tiddlers[i].fields['server.host'] = ConfabbAgendaAdaptor.minHostName(context.host);
			context.tiddlers[i].fields['server.page.revision'] = context.tiddlers[i].modified.convertToYYYYMMDDHHMM();
		}
		context.status = true;
	}
	if(context.callback) {
		window.setTimeout(function() {context.callback(context,userParams);},10);
	}
	return true;
};

ConfabbAgendaAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	info.uri = tiddler.fields['server.host'] + "#" + tiddler.title;
	return info;
};

// Retrieve a tiddler from a given workspace on a given server
//#   title - title of the tiddler to get
//#   context - passed on as a parameter to the callback function
//#   userParams - user settable object object that is passed on unchanged to the callback function
//#   callback - function to be called on completion
//# Return value is true if the request was successfully issued,
//#   or an error description string if there was a problem
//# The callback parameters are callback(context,userParams)
//#   context.status - true if OK, false if error
//#   context.statusText - error message if there was an error
//#   context.adaptor - reference to this adaptor object
//#   context.tiddler - the retrieved tiddler, or null if it cannot be found
//#   userParams - parameters as originally passed into the getTiddler function
ConfabbAgendaAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.complete = ConfabbAgendaAdaptor.getTiddlerComplete;
	return context.adaptor.store ?
		context.complete(context,context.userParams) :
		alert(context.host); //loadRemoteFile(context.host,ConfabbAgendaAdaptor.loadTiddlyWikiCallback,context);
};

ConfabbAgendaAdaptor.getTiddlerComplete = function(context,userParams)
{
	var t = context.adaptor.store.fetchTiddler(context.title);
	t.fields['server.type'] = ConfabbAgendaAdaptor.serverType;
	t.fields['server.host'] = ConfabbAgendaAdaptor.minHostName(context.host);
	t.fields['server.page.revision'] = t.modified.convertToYYYYMMDDHHMM();
	context.tiddler = t;
	context.status = true;
	if(context.allowSynchronous) {
		context.isSynchronous = true;
		context.callback(context,userParams);
	} else {
		window.setTimeout(function() {context.callback(context,userParams);},10);
	}
	return true;
};

ConfabbAgendaAdaptor.prototype.close = function()
{
	delete this.store;
	this.store = null;
};


config.adaptors[ConfabbAgendaAdaptor.serverType] = ConfabbAgendaAdaptor;

} //# end of 'install only once'
//}}}
