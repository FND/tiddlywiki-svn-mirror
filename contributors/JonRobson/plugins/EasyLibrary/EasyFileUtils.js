
var EasyFileUtils= {
	saveFile: function(fileUrl,content)
	{
		return jQuery.file.save({fileUrl:fileUrl,content:content});
	}
	
	,convertUriToUTF8:function(uri,charSet)
	{
		if(window.netscape == undefined || charSet == undefined || charSet == "")
			return uri;
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
		} catch(ex) {
			return uri;
		}
		return converter.convertURISpecToUTF8(uri,charSet);
	}
	
	,getLocalPath:function(origPath)
	{
		var originalPath = EasyFileUtils.convertUriToUTF8(origPath,"UTF-8");
		
		// Remove any location or query part of the URL
		var argPos = originalPath.indexOf("?");
		if(argPos != -1)
			originalPath = originalPath.substr(0,argPos);
		var hashPos = originalPath.indexOf("#");
		if(hashPos != -1)
			originalPath = originalPath.substr(0,hashPos);
		// Convert file://localhost/ to file:///
		if(originalPath.indexOf("file://localhost/") == 0)
			originalPath = "file://" + originalPath.substr(16);
		// Convert to a native file format
		var localPath;

		if(originalPath.charAt(9) == ":") // pc local file
			localPath = unescape(originalPath.substr(8)).replace(new RegExp("/","g"),"\\");
		else if(originalPath.indexOf("file://///") == 0) // FireFox pc network file
			localPath = "\\\\" + unescape(originalPath.substr(10)).replace(new RegExp("/","g"),"\\");
		else if(originalPath.indexOf("file:///") == 0) // mac/unix local file
			localPath = unescape(originalPath.substr(7));
		else if(originalPath.indexOf("file:/") == 0) // mac/unix local file
			localPath = unescape(originalPath.substr(5));
		else if(originalPath.indexOf("http") == 0){ //jon hack for online

			var end =originalPath.lastIndexOf("/");
			localPath = unescape(originalPath.substr(0,end+1));
		}
		else // pc network file
			localPath = "\\\\" + unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\\");
		return localPath;
	}

	,loadRemoteFile: function(url,callback,params,headers,data,contentType,username,password,allowCache)
	{
		//callback parameters: status,params,responseText,url,xhr
		return this._httpReq("GET",url,callback,params,headers,data,contentType,username,password,allowCache);
	}
	/*currently doesnt work with jpg files - ok formats:gifs pngs*/
	,saveImageLocally: function(sourceurl,dest,dothiswhensavedlocally,dothiswhenloadedfromweb) {
		
		var localPath = EasyFileUtils.getLocalPath(document.location.toString());
	
		var savePath;
		if((p = localPath.lastIndexOf("/")) != -1) {
			savePath = localPath.substr(0,p) + "/" + dest;
		} else {
			if((p = localPath.lastIndexOf("\\")) != -1) {
				savePath = localPath.substr(0,p) + "\\" + dest;
			} else {
				savePath = localPath + "." + dest;
			}
		}
		
		var onloadfromweb = function(status,params,responseText,url,xhr){
			try{
				if(dothiswhenloadedfromweb){
					dothiswhenloadedfromweb(url);
				}
				if(location.protocol != "http:")EasyFileUtils.saveFile(savePath,responseText);
			}
			catch(e){
				console.log("error saving locally.."+ e);
			}

		};
		
		var onloadlocally = function(responseText,url,xhr){		
		
				if(dothiswhensavedlocally){
					dothiswhensavedlocally(dest);
				}
			
		};
		

		try{
			var r = jQuery.get(dest,null,onloadlocally);
			if(r.status == 404) throw "404 error";
		
		}
		catch(e){//couldnt load probably doesn't exist!
			EasyFileUtils.loadRemoteFile(sourceurl,onloadfromweb,null,null,null,null,null,null,true);		
		}

		
		
	}
	,_httpReq: function (type,url,callback,params,headers,data,contentType,username,password,allowCache)
	{
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
				else{
					callback(false,params,null,url,x);
			
				}
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
			else{
				url = url + (url.indexOf("?") < 0 ? "?" : "&");
			}
			x.open(type,url,true,username,password);
			if(data)
				x.setRequestHeader("Content-Type", contentType || "application/x-www-form-urlencoded");
			if(x.overrideMimeType)
				x.setRequestHeader("Connection", "close");
			if(headers) {
				for(var n in headers)
					x.setRequestHeader(n,headers[n]);
			}
		//	x.setRequestHeader("X-Requested-With", "TiddlyWiki " + formatVersion());
		x.overrideMimeType('text/plain; charset=x-user-defined');
			x.send(data);
		} catch(ex) {
			//console.log(ex);
			throw ex;
		}
		return x;
	},
	

	_getXML:function(str) {
		if(!str)
			return null;
		var errorMsg;
		try {
			var doc = new ActiveXObject("Microsoft.XMLDOM");
			doc.async="false";
			doc.loadXML(str);
		}
		catch(e) {
			try {
				var parser=  new DOMParser();
				var doc = parser.parseFromString(str,"text/xml");
			}
			catch(e) {
				return e.message;
			}
		}

		return doc;	
	}

	,getChildNodeValue: function(ofThisNode){
		var value= "";
		if(ofThisNode.childNodes){
			
			for(var k=0; k < ofThisNode.childNodes.length; k++){
			
				if(ofThisNode.childNodes[k].nodeValue){
					value += ofThisNode.childNodes[k].nodeValue;
				}
			}
		}
		return value;
	}
};