/***
|''Name''|XMLRPCPlugin|
|''Description''|XML-RPC library and macro|
|''Author''|FND|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#XMLRPCPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
!Usage
{{{
<<XMLRPC URL methodName [username] [password]>>
}}}
!!Examples
<<XMLRPC "http://trac.tiddlywiki.org/login/xmlrpc" "system.listMethods()">>
!Revision History
!!v0.1 (2008-08-22)
* initial release
!To Do
* documentation
* XML-RPC multi-call to combine multiple calls into a single HTTP request
* code documentation
!Code
***/
//{{{
if(!version.extensions.XMLRPCPlugin) {
version.extensions.XMLRPCPlugin = { installed: true };

xmlrpc = {
	request: function(url, callback, methodCall, username, password, allowCache) { // DEBUG: rename?
		doHttp("POST", url, methodCall, "text/xml", username, password, callback, null, null, allowCache); // DEBUG: no custom params or headers?
	},
	parseResponse: function(status, params, responseText, xhr) {
		if(status && responseText.indexOf("<fault>") == -1) { // DEBUG: use proper XML parsing?
			console.log(status, params, xhr); // DEBUG
			console.log(responseText); // DEBUG
			var match = responseText.match(/<value>(.*)<\/value>/i); // DEBUG: use proper XML parsing?
			if(match && match.length > 0) {
				return match[0];
			}
		} else {
			console.log("error", arguments); // DEBUG
			return false;
		}
	},
	/**
	 * generate method call
	 * @param {String} methodName name of remote procedure
	 * @param {Array} params objects with keys "type" and "value"
	 */
	generateMethodCall: function(methodName, params) {
		var msg = "<?xml version='1.0'?><methodCall>"
			+ "<methodName>" + methodName + "</methodName>"
			+ "<params>";
		if(params) {
			for(var i = 0; i < params.length; i++) {
				msg += this.generateParamNode(params[i]);
			}
		}
		return msg + "</params></methodCall>";
	},
	generateParamNode: function(param) {
		switch(param.type) {
			case "array":
				break; // DEBUG: to be implemented
			case "base64":
				var value = "<base64>" + param.value + "</base64>";
				break;
			case "bool":
			case "boolean":
				value = "<boolean>" + (param.value ? 1 : 0) + "</boolean>";
				break;
			case "date":
			case "time":
				value = "<dateTime.iso8601>" + param.value + "</dateTime.iso8601>"; // DEBUG: convert to ISO 8601 format
				break;
			case "double":
			case "float":
				value = "<double>" + param.value + "</double>";
				break;
			case "int":
			case "integer":
				value = "<int>" + param.value + "</int>";
				break;
			case "str":
			case "string":
				value = "<string>" + param.value + "</string>";
				break;
			case "struct":
				break; // DEBUG: to be implemented
			case "nil":
			case "null":
				value = "<nil/>";
				break;
			default:
				break;
		}
		return "<param><value>" + value + "</value></param>"; // DEBUG: value tag for all types?
	}
};

config.macros.XMLRPC = {
	btnLabel: "XML-RPC",
	btnTooltip: null,
	btnClass: null,
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		createTiddlyButton(place, this.btnLabel,
			this.btnTooltip || params[0] + " - " + params[1],
			this.onclick, this.btnClass, null, null, {
				url: params[0],
				method: params[1],
				username: params[2] || "",
				password: params[3] || "" // DEBUG: use of plain-text parameter for password is insecure
			});
	},
	onclick: function() {
		var url = this.getAttribute("url");
		var method = this.getAttribute("method");
		var username = this.getAttribute("username") || null;
		var password = this.getAttribute("password") || null;
		var methodCall = xmlrpc.generateMethodCall(method);
		console.log(url, username, password, methodCall); // DEBUG
		xmlrpc.request(url, xmlrpc.parseResponse, null, methodCall, username, password);
	}
};

} //# end of "install only once"
//}}}
