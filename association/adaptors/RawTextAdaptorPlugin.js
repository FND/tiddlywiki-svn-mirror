/***
|''Name''|RawTextAdaptorPlugin|
|''Description''|adaptor for importing plain-text files (e.g. from Subversion) as tiddlers|
|''Author''|FND|
|''Version''|0.2.0|
|''Status''|@@beta@@|
|''Source''|http://devpad.tiddlyspot.com/#RawTextAdaptorPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''CoreVersion''|2.5|
!Revision History
!!v0.1 (2008-10-28)
* initial release
!To Do
* properly normalize URIs (cf. {{{trimURI}}})
!Code
***/
//{{{
function RawTextAdaptor() {}

RawTextAdaptor.prototype = new AdaptorBase();
RawTextAdaptor.serverType = "rawtext";
RawTextAdaptor.serverLabel = "Raw Text";
RawTextAdaptor.defaultModifier = "..."; // XXX: use empty string?

RawTextAdaptor.prototype.getWorkspaceList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.workspaces = [{ title: "N/A" }];
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() { callback(context, context.userParams); }, 0);
	}
	return true;
};

RawTextAdaptor.prototype.getTiddlerList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	if(context.callback) {
		context.status = true;
		var filename = trimURI(context.host).split("/").pop();
		context.tiddlers = [RawTextAdaptor.createTiddler(filename)];
		window.setTimeout(function() { callback(context, context.userParams); }, 0);
	}
	return true;
};

RawTextAdaptor.prototype.getTiddler = function(title, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	if(!context.tiddler) {
		context.tiddler = RawTextAdaptor.createTiddler(title);
	}
	context.tiddler.fields["server.type"] = RawTextAdaptor.serverType;
	context.tiddler.fields["server.host"] = AdaptorBase.minHostName(context.host);
	var req = httpReq("GET", context.host, RawTextAdaptor.getTiddlerCallback, context);
	return typeof req == "string" ? req : true;
};

RawTextAdaptor.getTiddlerCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		context.tiddler.text = responseText;
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

// create tiddler from filename
RawTextAdaptor.createTiddler = function(filename) {
	var tiddler = new Tiddler(filename);
	var pos = filename.lastIndexOf(".");
	if(pos != -1) { // strip file extension
		tiddler.title = title.substr(0, pos); //# N.B.: altering title is acceptable since it's not used as URI component
		if(title.substr(pos) == ".js") { // treat as plugin
			tiddler.tags = ["systemConfig"];
		}
	}
	context.created = new Date();
	context.modified = context.created;
	context.modifier = RawTextAdaptor.defaultModifier;
	return tiddler;
};

config.adaptors[RawTextAdaptor.serverType] = RawTextAdaptor;

// strip fragments and parameters from URI
function trimURI(uri) {
	return uri.split("#")[0].split("?")[0];
}
//}}}
