// Overrides core doHttp function to allow timeout parameter
var defaultXhrTimeout = 5000;
function doHttp(type,url,data,contentType,username,password,callback,params,headers,timeout)
{
	//# Get an xhr object
	var x = getXMLHttpRequest();
	if(!x)
		return "Can't create XMLHttpRequest object";
	//# Install callback
	x.onreadystatechange = function() {
		try {
			var status = x.status;
		} catch(ex) {
			status = false;
		}
		if (x.readyState == 4)
			clearTimeout(requestTimer);
		if (x.readyState == 4 && callback && (status !== undefined)) {
			if([0, httpStatus.OK, httpStatus.ContentCreated, httpStatus.NoContent, httpStatus.MultiStatus].contains(status))
				callback(true,params,x.responseText,url,x);
			else
				callback(false,params,null,url,x);
			x.onreadystatechange = function(){};
			x = null;
		}
	};
	//# Send request
	if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
		window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	try {
		url = url + (url.indexOf("?") < 0 ? "?" : "&") + "nocache=" + Math.random();
		x.open(type,url,true,username,password);
		if(data)
			x.setRequestHeader("Content-Type", contentType ? contentType : "application/x-www-form-urlencoded");
		if(x.overrideMimeType)
			x.setRequestHeader("Connection", "close");
		if(headers) {
			for(var n in headers)
				x.setRequestHeader(n,headers[n]);
		}
		x.setRequestHeader("X-Requested-With", "TiddlyWiki " + version.major + "." + version.minor + "." + version.revision + (version.beta ? " (beta " + version.beta + ")" : ""));
		x.send(data);
		var requestTimer = setTimeout(function() {
			x.abort();
			// Handle timeout situation, e.g. Retry or inform user.
			return "timeout";
		}, (timeout ? timeout : defaultXhrTimeout));
	} catch(ex) {
		return exceptionText(ex);
	}
	return x;
}
