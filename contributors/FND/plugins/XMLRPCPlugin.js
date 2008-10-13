/***
|''Name''|XMLRPCPlugin|
|''Description''|basic XML-RPC library|
|''Author''|FND|
|''Version''|0.2.0|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#XMLRPCPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Revision History
!!v0.1 (2008-07-22)
* initial release
!!v0.2 (2008-10-12)
* major refactoring/rewrite to improve response handling
!To Do
* response parsing
* XML-RPC multi-call to combine multiple calls into a single HTTP request
!Code
***/
//{{{
if(!version.extensions.XMLRPC) {
version.extensions.XMLRPC = { installed: true };

if(!config.extensions) { config.extensions = {}; }

config.extensions.XMLRPC = {

	/**
	 * perform method call
	 * @param {String} host URL of remote host
	 * @param {String} methodName name of remote procedure
	 * @param {Array} params objects with keys "type" and "value"
	 * @param {String} username optional username for authentication
	 * @param {String} password optional password for authentication
	 * @param {Boolean} allowCache allow caching
	 * @param {Function} callback function to handle response
	 */
	request: function(host, method, params, username, password, allowCache, callback) { // TODO: rename?
		var rpc = this.generateMethodCall(method, params);
		var context = {
			callback: callback
		};
		httpReq("POST", host, this.requestCallback, context, null, rpc,
			"text/xml", username, password, allowCache);
	},

	/**
	 * process RPC response
	 * @param {Boolean} status false if request produced an error
	 * @param {Object} context parameter object
	 * @param {String} responseText server response
	 * @param {String} url requested URL
	 * @param {Object} xhr XMLHttpRequest object
	 */
	requestCallback: function(status, context, responseText, url, xhr) {
		var xml = xhr.responseXML;
		if(!status || !xml) {
			throw new Error("error connecting to server"); // XXX: usage incorrect?
		}
		var error = xml.getElementsByTagName("fault");
		if(error.length) {
			error = {
				code: parseInt(error.getElementsByTagName("int")[0], 10),
				message: error.getElementsByTagName("string")[0]
			};
			throw new Error(error); // XXX: usage incorrect?
		}
		context.callback(xml);
	},

	/**
	 * generate method call
	 * @param {String} methodName name of remote procedure
	 * @param {Array} params objects with keys "type" and "value"
	 * @return {String} method call
	 */
	generateMethodCall: function(methodName, params) {
		var msg = "<?xml version='1.0'?><methodCall>" +
			"<methodName>" + methodName + "</methodName><params>";
		for(var i = 0; i < (params ? params.length : 0); i++) {
			msg += this.generateParamNode(params[i]);
		}
		return msg + "</params></methodCall>";
	},

	/**
	 * generate parameter node
	 * @param {Object} param object with keys "type" (data type) and "value"
	 * @return {String} parameter node
	 */
	generateParamNode: function(param) {
		switch(param.type) {
			case "array":
				break; // TODO
			case "base64":
				var value = "<base64>" + param.value + "</base64>";
				break;
			case "bool":
			case "boolean":
				value = "<boolean>" + (param.value ? 1 : 0) + "</boolean>";
				break;
			case "date":
			case "time":
				value = "<dateTime.iso8601>" + param.value + "</dateTime.iso8601>"; // TODO: convert to ISO 8601 format
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
				break; // TODO
			case "nil":
			case "null":
				value = "<nil/>";
				break;
			default:
				break;
		}
		return "<param><value>" + value + "</value></param>"; // XXX: value tag for all types?
	}
};

} //# end of "install only once"
//}}}
