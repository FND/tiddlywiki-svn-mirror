/***
|''Name''|RawTextAdaptorPlugin|
|''Description''|adaptor for importing plain-text files (e.g. from Subversion) as tiddlers|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#RawTextAdaptorPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Revision History
!!v0.1 (2008-10-28)
* initial release
!To Do
* strip file extension in title
* properly normalize URIs (cf. trimURI)
!Code
***/
//{{{
function RawTextAdaptor() {}

RawTextAdaptor.prototype = new AdaptorBase();
RawTextAdaptor.serverType = "rawtext";
RawTextAdaptor.serverLabel = "Raw Text";

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
		context.tiddlers = [new Tiddler(filename)];
		window.setTimeout(function() { callback(context, context.userParams); }, 0);
	}
	return true;
};

RawTextAdaptor.prototype.getTiddler = function(title, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.title = title; // XXX: unused?
	if(!context.tiddler) {
		context.tiddler = new Tiddler(title);
	}
	context.created = new Date(); // XXX: ??
	context.modified = context.created;
	context.modified = ""; // XXX: ??
	context.tiddler.fields["server.type"] = RawTextAdaptor.serverType;
	context.tiddler.fields["server.host"] = AdaptorBase.minHostName(context.host);
	if(title.substring(title.length - 3) == ".js") {
		context.tiddler.tags = ["systemConfig"];
	}
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

config.adaptors[RawTextAdaptor.serverType] = RawTextAdaptor;

// strip fragments and parameters from URI
function trimURI(uri) {
	return uri.split("#")[0].split("?")[0];
}
//}}}