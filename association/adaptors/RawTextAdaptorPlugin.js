/***
|''Name''|RawTextAdaptorPlugin|
|''Description''|adaptor for importing plain-text files (e.g. from Subversion) as tiddlers|
|''Author''|FND|
|''Version''|0.2.2|
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
if(!version.extensions.RawTextAdaptor) { //# ensure that the plugin is only installed once
version.extensions.RawTextAdaptor = { installed: true };

config.adaptors.rawtext = function() {};

(function(adaptor) { //# set up alias

adaptor.prototype = new AdaptorBase();
adaptor.serverType = "rawtext";
adaptor.serverLabel = "Raw Text";
adaptor.defaultModifier = "..."; // XXX: use empty string?

adaptor.prototype.getWorkspaceList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.workspaces = [{ title: "N/A" }];
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() { callback(context, context.userParams); }, 0);
	}
	return true;
};

adaptor.prototype.getTiddlerList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	if(context.callback) {
		context.status = true;
		var filename = adaptor.trimURI(context.host).split("/").pop();
		context.tiddlers = [adaptor.createTiddler(filename)];
		window.setTimeout(function() { callback(context, context.userParams); }, 0);
	}
	return true;
};

adaptor.prototype.getTiddler = function(title, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	if(!context.tiddler) {
		context.tiddler = adaptor.createTiddler(title);
	}
	context.tiddler.fields["server.type"] = adaptor.serverType;
	context.tiddler.fields["server.host"] = AdaptorBase.minHostName(context.host);
	var req = httpReq("GET", context.host, adaptor.getTiddlerCallback, context);
	return typeof req == "string" ? req : true;
};

adaptor.getTiddlerCallback = function(status, context, responseText, uri, xhr) {
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
adaptor.createTiddler = function(filename) {
	var tiddler = new Tiddler(filename);
	var pos = filename.lastIndexOf(".");
	if(pos != -1) { // strip file extension
		tiddler.title = filename.substr(0, pos); //# N.B.: altering title is acceptable since it's not used as URI component
		if(filename.substr(pos) == ".js") { // treat as plugin
			tiddler.tags = ["systemConfig"];
		}
	}
	tiddler.created = new Date();
	tiddler.modified = tiddler.created;
	tiddler.modifier = adaptor.defaultModifier;
	return tiddler;
};

// strip fragments and parameters from URI
adaptor.trimURI = function(uri) {
	return uri.split("#")[0].split("?")[0];
}

})(config.adaptors.rawtext); //# end of alias

} //# end of "install only once"
//}}}
