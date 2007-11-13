// Thanks to BidiX for doing much of the groundwork in this area

config.macros.testWebDAV = {
	messages: {
		noHTTP:"this only works from a http:// url, not https:// or file://",
		noDAV:"the server doesn't support WebDAV",
		badStatus:"XMLHttpRequest failed",
	}
};

config.macros.testWebDAV.handleFailure = function(error,text) {
	displayMessage(this.messages[error] + text);
};

config.macros.testWebDAV.handler = function() {
	if (!config.options.webDAVServer) {
		config.options.webDAVServer = "http://garden.dachary.org";
	}
	if (!config.options.webDAVDefaultFilename) {
		config.options.webDAVDefaultFilename = "index.html";
	}
	var callback = function(status,params,data,url,xhr) {
		url = (url.indexOf("nocache=") < 0 ? url : url.substring(0,url.indexOf("nocache=")-1));
		if (!status) {
			config.macros.testWebDAV.handleFailure("badStatus"," in OPTIONS");
		} else {
			if (!xhr.getResponseHeader("DAV")) {
				config.macros.testWebDAV.handleFailure("noDAV");
			} else {
				// DEBUG info
				var p = [status,params,data,url,xhr];
				console.log(p);
				// End: DEBUG info
				config.macros.testWebDAV.put(url,data);
			}
		}
	};
	var url = config.options.webDAVServer;
	// Check we were loaded from a HTTP or HTTPS URL
	if(url.substr(0,4) != "http") {
		config.macros.testWebDAV.handleFailure("noHTTP");
		return;
	}	
	// is the server WebDAV enabled?
	var r = doHttp("OPTIONS",url,null,null,null,null,callback,null,null);
	if (typeof r == "string") {
		alert(r);
	}
};

config.macros.testWebDAV.put = function(url,filename,data) {
	if (!filename) {
		filename = config.options.webDAVDefaultFilename;
	}
	var callback = function(status,params,responseText,url,xhr) {
		url = (url.indexOf("nocache=") < 0 ? url : url.substring(0,url.indexOf("nocache=")-1));
		if (!status) {
			config.macros.testWebDAV.handleFailure("badStatus"," in PUT");
			console.log(xhr);
			return;
		} else {
			// DEBUG info
			var p = [status,params,responseText,url,xhr];
			console.log(p);
		}
	};
	// if the url ends in "/" add the filename; if it doesn't add "/" first
	if(url.lastIndexOf("/") == url.length-1) {
		url = url + filename;
	} else {
		url = url + "/" + filename;
	}
	config.macros.testWebDAV.http("PUT",url,data,callback);
};

config.macros.testWebDAV.mkdir = function(url,name) {
	// if the url ends in "/" add the filename; if it doesn't add "/" first
	if(url.lastIndexOf("/") == url.length-1) {
		url = url + name;
	} else {
		url = url + "/" + name;
	}
	return config.macros.testWebDAV.http("MKCOL",url + "/" + name);
};

config.macros.testWebDAV.http = function(type,url,data,callback,params) {
	var r = doHttp(type,url,data,null,null,null,callback,params,null);
	if (typeof r == "string")
		alert(r);
	return r;
}