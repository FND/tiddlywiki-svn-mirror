/***
|''Name''|SampleAdaptor|
|''Description''|<...>|
|''Icon''|<...>|
|''Author''|<...>|
|''Contributors''|<...>|
|''Version''|<...>|
|''Date''|<...>|
|''Status''|<//unknown//; @@experimental@@; @@beta@@; //obsolete//; stable>|
|''Source''|<...>|
|''CodeRepository''|<...>|
|''Copyright''|<...>|
|''License''|<...>|
|''CoreVersion''|2.4.1|
|''Requires''|<...>|
|''Overrides''|<...>|
|''Feedback''|<...>|
|''Documentation''|<...>|
|''Keywords''|<...>|
!Code
***/
//{{{
if(!version.extensions.SampleAdaptor) { //# ensure that the plugin is only installed once
version.extensions.SampleAdaptor = { installed: true };

config.adaptors.sampletype = function() {};

(function(adaptor) { //# set up alias

adaptor.prototype = new AdaptorBase();
adaptor.serverType = "sampletype"; //# corresponds to config.adaptors entry
adaptor.serverLabel = "Sample Type";
adaptor.mimeType = "application/json";

// retrieve a list of workspaces
adaptor.prototype.getWorkspaceList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var uriTemplate = "%0/workspaces";
	var uri = uriTemplate.format([context.host]);
	var req = httpReq("GET", uri, adaptor.getWorkspaceListCallback,
		context, { accept: adaptor.mimeType });
	return typeof req == "string" ? req : true;
};

adaptor.getWorkspaceListCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		context.workspaces = [];
		/* ... */ // parse responseText, determining workspaces
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

// retrieve a list of tiddlers
adaptor.prototype.getTiddlerList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var uriTemplate = "%0/tiddlers";
	var req = httpReq("GET", uri, adaptor.getTiddlerListCallback,
		context, null, null, { accept: adaptor.mimeType });
	return typeof req == "string" ? req : true;
};

adaptor.getTiddlerListCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		context.tiddlers = [];
		/* ... */ // parse responseText, determining tiddlers
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

// retrieve an individual tiddler
adaptor.prototype.getTiddler = function(title, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.title = title;
	context.tiddler = new Tiddler(title);
	context.tiddler.fields = {
		"server.type": adaptor.serverType,
		"server.host": AdaptorBase.minHostName(context.host),
		"server.workspace": context.workspace
	};
	var uriTemplate = "%0/tiddlers/%1";
	var uri = uriTemplate.format([context.host, title]);
	var req = httpReq("GET", uri, adaptor.getTiddlerCallback,
		context, null, null, { accept: adaptor.mimeType });
	return typeof req == "string" ? req : true;
};

adaptor.getTiddlerCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		var tiddler = new Tiddler();
		/* ... */ // parse responseText, determining tiddler properties
		tiddler.fields = merge(context.tiddler.fields, tiddler.fields, true);
		context.tiddler = tiddler;
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

})(config.adaptors.sampletype); //# end of alias

} //# end of "install only once"
//}}}
