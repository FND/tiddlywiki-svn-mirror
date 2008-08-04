/***
|''Name:''|ExtendableHttpReqPlugin|
|''Description:''|Adds hooks for customizing the behaviour of httpReq|
|''Author''|JonathanLister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/ExtendableHttpReqPlugin.js |
|''Version:''|0.4|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|

***/

//{{{
if(!version.extensions.ExtendableHttpReqPlugin) {
version.extensions.ExtendableHttpReqPlugin = {installed:true};

window.Http = {};

window.httpReq = function(type,url,callback,params,headers,data,contentType,username,password,allowCache) {
	//# Get an xhr object
	var x = null;
	try {
		x = new XMLHttpRequest(); //# Modern
	} catch(ex) {
		try {
			x = new ActiveXObject("Msxml2.XMLHTTP"); //# IE 6
		} catch(ex2) {
		}
	}
	if(!x)
		return "Can't create XMLHttpRequest object";
	//# Install callback
	x.onreadystatechange = function() {
		try {
			var status = x.status;
		} catch(ex) {
			status = false;
		}
		if(x.readyState == 4 && callback && (status !== undefined)) {
			if([0, 200, 201, 204, 207].contains(status))
				callback(true,params,x.responseText,url,x);
			else
				callback(false,params,null,url,x);
			x.onreadystatechange = function(){};
			x = null;
		}
	};
	var ext = window.httpReq.extensions;
	if(ext) {
		for(var n in ext) {
			x[n] = eval(ext[n].toString());
		}
	}
	//# Send request
	if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
		window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	try {
		if(!allowCache)
			url = url + (url.indexOf("?") < 0 ? "?" : "&") + "nocache=" + Math.random();
		x.open(type,url,true,username,password);
		if(data)
			x.setRequestHeader("Content-Type", contentType || "application/x-www-form-urlencoded");
		if(x.overrideMimeType)
			x.setRequestHeader("Connection", "close");
		if(headers) {
			for(n in headers)
				x.setRequestHeader(n,headers[n]);
		}
		x.setRequestHeader("X-Requested-With", "TiddlyWiki " + formatVersion());
		x.send(data);
	} catch(ex) {
		return exceptionText(ex);
	}
	return x;
};

Http.extend = function(obj,extensions) {
	var ext = obj.extensions;
	if(!ext) {
		ext = obj.extensions = {};
	}
	for(var i in extensions) {
		ext[i] = extensions[i];
	}
};

Http.register = function(obj,func) {
	for(var i in obj) {
		func[i] = obj[i];
	}
};

Http.intercept = function(obj,method,preFunc) {
	if(!obj) {
		obj = window;
	}
	var old = obj[method];
	var orig = eval(old.toString());
	var tempObj = function() {
		preFunc.apply(this,arguments);
	};
	Http.register(old,tempObj);
	obj[method] = tempObj;
	return orig;
};

} //# end of 'install only once'
//}}}