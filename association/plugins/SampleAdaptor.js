config.extensions.SampleAdaptor = function() {};
config.extensions.SampleAdaptor.prototype = new AdaptorBase();
config.extensions.SampleAdaptor.serverType = "sampletype";
config.extensions.SampleAdaptor.serverLabel = "Sample Type";
config.extensions.SampleAdaptor.mimeType = "application/json";

// retrieve a list of workspaces
config.extensions.SampleAdaptor.prototype.getWorkspaceList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var uriTemplate = "%0/workspaces";
	var uri = uriTemplate.format([context.host]);
	var req = httpReq("GET", uri, config.extensions.SampleAdaptor.getWorkspaceListCallback,
		context, { accept: config.extensions.SampleAdaptor.mimeType });
	return typeof req == "string" ? req : true;
};

config.extensions.SampleAdaptor.getWorkspaceListCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;&action=submit
	if(status) {
		context.workspaces = [];
		/* ... */ // parse responseText, determining workspaces
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

// retrieve a list of tiddlers
config.extensions.SampleAdaptor.prototype.getTiddlerList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var uriTemplate = "%0/tiddlers";
	var req = httpReq("GET", uri, config.extensions.SampleAdaptor.getTiddlerListCallback,
		context, null, null, { accept: config.extensions.SampleAdaptor.mimeType });
	return typeof req == "string" ? req : true;
};

config.extensions.SampleAdaptor.getTiddlerListCallback = function(status, context, responseText, uri, xhr) {
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
config.extensions.SampleAdaptor.prototype.getTiddler = function(title, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.title = title;
	context.tiddler = new Tiddler(title);
	context.tiddler.fields = {
		"server.type": config.extensions.SampleAdaptor.serverType,
		"server.host": AdaptorBase.minHostName(context.host),
		"server.workspace": context.workspace
	};
	var uriTemplate = "%0/tiddlers/%1";
	var uri = uriTemplate.format([context.host, title]);
	var req = httpReq("GET", uri, config.extensions.SampleAdaptor.getTiddlerCallback,
		context, null, null, { accept: config.extensions.SampleAdaptor.mimeType });
	return typeof req == "string" ? req : true;
};

config.extensions.SampleAdaptor.getTiddlerCallback = function(status, context, responseText, uri, xhr) {
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

config.adaptors[config.extensions.SampleAdaptor.serverType] = config.extensions.SampleAdaptor;
