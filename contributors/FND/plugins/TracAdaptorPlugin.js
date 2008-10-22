/***
|''Name''|TracAdaptorPlugin|
|''Description''|Trac adaptor|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#TracAdaptorPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''|XMLRPCPlugin|
!Revision History
!!v0.1 (2008-10-22)
* initial release
!To Do
* move parsing into XML-RPC library
!Code
***/
//{{{
/* adaptor */

function TracAdaptor() {} // XXX: should be in config.extensions namespace!?
TracAdaptor.prototype = new AdaptorBase(); // XXX: why .prototype?

TracAdaptor.mimeType = "text/xml"; // XXX: unused?
TracAdaptor.serverType = "trac";
TracAdaptor.serverLabel = "Trac";
TracAdaptor.serverParsingErrorMessage = "Error parsing result from server"; // XXX: unused?
TracAdaptor.errorInFunctionMessage = "Error in function TiddlyWebAdaptor.%0"; // XXX: unused?

TracAdaptor.prototype.getWorkspaceList = function(context, userParams, callback) { // XXX: not applicable
	context = this.setContext(context, userParams, callback);
	context.workspaces = [{ name: "tickets", title: "tickets" }]; // XXX: dummy workspace
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() { callback(context, context.userParams); }, 0);
	}
	return true;
};

TracAdaptor.prototype.getTiddlerList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var method = "ticket.query";
	var params = [{ // XXX: to be passed in via context!?
		type: "str",
		value: "owner=FND" // XXX: hardcoded!
	}];
	var req = config.extensions.XMLRPC.request(context.host, "ticket.query",
		params, null, null, null, context, TracAdaptor.getTiddlerListCallback);
	return typeof req == "string" ? req : true;
};

TracAdaptor.getTiddlerListCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	context.tiddlers = [];
	if(status) {
		var tickets = config.extensions.TracAdaptor.parseTicketList(xhr.responseXML);
		for(var i = 0; i < tickets.length; i++) {
			context.tiddlers.push(new Tiddler(tickets[i]));
		}
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

TracAdaptor.prototype.getTiddler = function(title, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	if(title) {
		context.title = title;
	}
	if(!context.tiddler) {
		context.tiddler = new Tiddler(title);
	}
	context.tiddler.fields["server.type"] = TracAdaptor.serverType;
	context.tiddler.fields["server.host"] = AdaptorBase.minHostName(context.host);
	var params = [{
		type: "int",
		value: title
	}];
	var req = config.extensions.XMLRPC.request(context.host, "ticket.get",
		params, null, null, null, context, TracAdaptor.getTiddlerCallback);
	return typeof req == "string" ? req : true;
};

TracAdaptor.getTiddlerCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		var tiddler = config.extensions.TracAdaptor.parseTicket(xhr.responseXML);
		tiddler.fields = merge(tiddler.fields, context.tiddler.fields);
		store.saveTiddler(tiddler.title, tiddler.title, tiddler.text,
			tiddler.modifier, tiddler.modified, tiddler.tags,
			tiddler.fields, false, tiddler.created);
		context.tiddler = tiddler;
	}
	console.log("gTC", arguments); // XXX: context.userParam is weird!?
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

config.adaptors[TracAdaptor.serverType] = TracAdaptor;

/* utility functions */

if(!version.extensions.TracAdaptor) {
version.extensions.TracAdaptor = { installed: true };

if(!config.extensions) { config.extensions = {}; }

config.extensions.TracAdaptor = {
	parseTicketList: function(xml) {
		var ticketNodes = xml.getElementsByTagName("int");
		var tickets = [];
		for(var i = 0; i < ticketNodes.length; i++) {
			var value = ticketNodes[i].textContent || ticketNodes[i].text; // XXX: use .childNodes[0].nodeValue?
			tickets.push(parseInt(value, 10));
		}
		return tickets;
	},

	parseTicket: function(xml) {
		var tiddler = new Tiddler();
		var getValue = config.extensions.XMLRPC.getNodeValue; // shortcut
		// basic fields
		var fields = xml.getElementsByTagName("int");
		tiddler.fields.ticketid = getValue(fields[0], "int");
		tiddler.title = tiddler.fields.ticketid.toString();
		var value = getValue(fields[1], "int");
		tiddler.created = new Date(value * 1000); // convert UNIX timestamp
		value = getValue(fields[2], "int");
		tiddler.modified = new Date(value * 1000); // convert UNIX timestamp
		// attributes -- TODO: comments!? => ticket.changeLog?
		fields = xml.getElementsByTagName("member");
		for(var i = 0; i < fields.length; i++) {
			var name = getValue(fields[i].getElementsByTagName("name")[0]);
			value = getValue(fields[i].getElementsByTagName("string")[0]); // XXX: always string?
			switch(name) {
				case "summary":
					var summary = value;
					break;
				case "reporter":
					tiddler.modifier = value;
					break;
				case "description":
					tiddler.text = value; // TODO: needs markup conversion
					break;
				default:
					tiddler.fields[name] = value;
					break;
			}
		}
		tiddler.text = "|''Summary''|" + summary + "|\n" + tiddler.text;
		return tiddler;
	}
};

} //# end of "install only once"
//}}}
