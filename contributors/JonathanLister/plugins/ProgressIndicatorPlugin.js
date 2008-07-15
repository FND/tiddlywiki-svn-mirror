/***
|''Name:''|ProgressIndicatorPlugin|
|''Description:''|Adds a Firefox-only download/upload HTTP progress indicator|
|''Author''|JonathanLister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/ProgressIndicatorPlugin.js |
|''Version:''|0.4|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|

! Usage


***/

//{{{
if(!version.extensions.ProgressIndicatorPlugin) {
version.extensions.ProgressIndicatorPlugin = {installed:true};

window.httpReq = function(type,url,callback,params,headers,data,contentType,username,password,allowCache)
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
	x.updateProgressIndicator = function(position,totalSize,direction) {
		if(!direction) {
			direction = "downloading";
		}
		var percentComplete = 0;
		if(totalSize!==0) {
			percentComplete = Math.floor((position / totalSize)*100);
			percentComplete = percentComplete > 100 ? 100 : percentComplete;
		}
		clearMessage();
		displayMessage(url);
		displayMessage(direction+"... "+percentComplete+"%");
		displayMessage('('+position+' of '+totalSize+' bytes)');
		if(percentComplete=='100') {
			window.setTimeout(function(){
				clearMessage();
			},2000);
		}
	};
	//# Install progress indicator
	x.onprogress = function(e) {
		var local = url.indexOf('file://')!=-1;
		var direction = (type=='GET') ? "downloading" : "uploading";
		var position = e.position;
		var totalSize = e.totalSize;
		if(local) {
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				totalSize = x.channel.contentLength;
			} catch(ex) {
				// do nothing
			}
		}
		x.updateProgressIndicator(position,totalSize,direction);
	};
	//# Install callback
	x.onreadystatechange = function() {
		//# add Safari progress indicator
		if(x.readyState >= 3 && config.browser.isSafari && type=='GET') {
			var totalSize = x.getResponseHeader('Content-Length');
			var responseText = x.responseText;
			var position = responseText ? responseText.length : 0;
			x.updateProgressIndicator(position,totalSize);
		}
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
			for(var n in headers)
				x.setRequestHeader(n,headers[n]);
		}
		x.setRequestHeader("X-Requested-With", "TiddlyWiki " + formatVersion());
		x.send(data);
	} catch(ex) {
		return exceptionText(ex);
	}
	return x;
};


} //# end of 'install only once'
//}}}