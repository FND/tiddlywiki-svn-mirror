//{{{

//# Perform an http request
//#   type - GET/POST/PUT/DELETE
//#   url - the source url
//#   data - optional data for POST and PUT
//#   contentType - optionalContent type for the data (defaults to application/x-www-form-urlencoded)
//#   username - optional username for basic authentication
//#   password - optional password for basic authentication
//#   callback - function to call when there's a response
//#   params - parameter object that gets passed to the callback for storing it's state
//#   headers - optional hashmap of additional headers
//#	  allowCache - if set to true, doesn't add nocache string to end of url
//# Return value is the underlying XMLHttpRequest object, or a string if there was an error
//# Callback function is called like this:
//#   callback(status,params,responseText,xhr)
//#     status - true if OK, false if error
//#     params - the parameter object provided to loadRemoteFile()
//#     responseText - the text of the file
//#     url - requested URL
//#     xhr - the underlying XMLHttpRequest object
function doHttp(type,url,data,contentType,username,password,callback,params,headers,allowCache)
{
        if ((document.location.toString().substr(0,4) == "http") && (url.substr(0,4) == "http"))
           url = store.getTiddlerText("SiteProxy", "/proxy/") + url;
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
		if(!allowCache)
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
	} catch(ex) {
		return exceptionText(ex);
	}
	return x;
}

//}}}