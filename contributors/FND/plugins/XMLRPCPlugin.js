/***
|''Name''|XMLRPCPlugin|
|''Description''|basic XML-RPC library|
|''Author''|FND|
|''Version''|0.2.1|
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
	 * @param {Object} context parameters being passed to the callback
	 * @param {Function} callback response handler
	 * @return {Object, String} XMLHttpRequest object or error string
	 */
	request: function(host, methodName, params, username, password, allowCache, context, callback) { // TODO: rename?
		var rpc = this.generateMethodCall(methodName, params);
		return httpReq("POST", host, callback, context, null, rpc,
			"text/xml", username, password, allowCache);
	},

	/**
	 * check RPC response for errors
	 * @param {Object} xml XML document
	 * @return {Boolean, Object} true or error object (members code and message)
	 */
	responseStatus: function(xml) {
		status = true;
		var error = xml.getElementsByTagName("fault");
		if(error.length) {
			status = {
				code: parseInt(error.getElementsByTagName("int")[0], 10),
				message: error.getElementsByTagName("string")[0]
			};
		}
		return status;
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
			case "array": // TODO
				break;
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
			case "struct": // TODO
				break;
			case "nil":
			case "null":
				value = "<nil/>";
				break;
			default:
				break;
		}
		return "<param><value>" + value + "</value></param>"; // XXX: value tag for all types?
	},

	/**
	 * utility function to retrieve node values (cross-browser compatible)
	 * @param {Object} node XML node
	 * @param {String} type optional type for conversion ("int" or "float")
	 * @return {String, Integer, Float} node value
	 */
	getNodeValue: function(node, type) {
		var value = node.textContent || node.text;
		switch(type) {
			case "int":
				value = parseInt(value, 10);
				break;
			case "float":
				value = parseFloat(value);
				break;
			default:
				break;
		}
		return value;
	},

	parseType: function(dataNode) {
		var typeNode = dataNode.childNodes[0]; // XXX: missing type node means string
		switch(typeNode.name) { // XXX: name property correct?
			case "array": // TODO
				var valueNodes = typeNode.childNodes[0].childNodes;
				var values = [];
				for(var i = 0; i < valueNodes.length; i++) {
					typeNode = valueNodes[i].childNodes[0];
					values.push(parseType(typeNode));
				}
				return values;
			case "base64": // TODO
				break;
			case "boolean":
				var value = typeNode.textContent || typeNode.text;
				return value === true;
			case "dateTime.iso8601": // TODO
				break;
			case "double":
				value = typeNode.textContent || typeNode.text;
				return parseFloat(value);
			case "i4":
			case "int":
				value = typeNode.textContent || typeNode.text;
				return parseInt(value, 10);
			case "string":
				return typeNode.textContent || typeNode.text;
			case "struct": // TODO
				break;
			case "nil":
				return null;
			default:
				break;
		}
	}
};

} //# end of "install only once"
//}}}
