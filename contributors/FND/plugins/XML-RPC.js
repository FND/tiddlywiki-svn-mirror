// XML-RPC class
xmlrpc = {
	generateMethodCall: function(methodName, params) {
		var msg = "<methodCall>"
			+ "<methodName>" + methodName + "</methodName>"
			+ "<params>";
		if(params) {
			for(var i = 0; i < params.length; i++) {
				msg += this.generateParamNode(params[i]);
			}
		}
		msg += "</params></methodCall>";
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
			console.log("error"); // DEBUG
			return false;
		}
	}
};

var URLs = {
	anon: "http://trac.tiddlywiki.org/xmlrpc",
	auth: "http://trac.tiddlywiki.org/login/xmlrpc"
};

var props = { // DEBUG: rename?
	method: "ticket.query",
	params: [
		{
			type: "int",
			value: "lorem"
		}, {
			type: "str",
			value: "ipsum"
		}
	]
};

xhr = { // DEBUG: review
	url: URLs.auth,
	data: xmlrpc.generateMethodCall(props.method, props.params),
	contentType: "text/xml", // DEBUG: correct?
	username: null,
	password: null,
	callback: xmlrpc.parseResponse,
	params: null,
	headers: null,
	allowCache: true
};

doHttp("POST", xhr.url, xhr.data, xhr.contentType, xhr.username, xhr.password, // DEBUG: use URLs.auth on failure
	xhr.callback, xhr.params, xhr.headers, xhr.allowCache);