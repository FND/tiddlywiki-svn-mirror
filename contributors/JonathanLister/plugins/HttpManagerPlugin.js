/***
|''Name:''|HttpManagerPlugin|
|''Description:''||
|''Author''|JonathanLister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/HttpManagerPlugin.js |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|

! Usage

! Idea
don't send XMLHttpRequests straight away, queue them up
there are two slots we can fill from the queue
when a response comes back as finished, we free up its slot
when a request is added to the queue, if there is a slot free we send it through that slot; if there is no slot free, keep it in the queue
when a slot becomes free, pull another request from the queue

***/

//{{{
if(!version.extensions.HttpManagerPlugin) {
version.extensions.HttpManagerPlugin = {installed:true};

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

var HttpManager = {
	queue: new FeedListManager(),
	stats: new FeedListManager(),
	slots: [
		"empty",
		"empty"
	]
};

HttpManager.addRequest = function(type,url,callback,params,headers,data,contentType,username,password,allowCache) {
	var args = {
		type:type,
		url:url,
		callback:callback,
		params:params,
		headers:headers,
		data:data,
		contentType:contentType,
		username:username,
		password:password,
		allowCache:allowCache
	};
	this.queue.add(url,url,'rss',args); // 'rss' hard-coded to comply with FeedListManager
	this.stats.add(url,url,'rss');
	this.proceedIfClear();
};

HttpManager.proceedIfClear = function() {
	var i = this.getNextEmptySlot();
	if(i!==false) {
		this.makeReq(i);
	}
};

HttpManager.getNextEmptySlot = function() {
	var i = this.slots.indexOf('empty');
	return (i!==-1) ? i : false;
};

HttpManager.setFullSlot = function(slot) {
	if(this.slots[slot]!=='empty') { // this should never happen
		displayMessage('error: slot that is empty should be full: '+slot);
	}
	this.slots[slot] = "full";
};

HttpManager.clearNextFullSlot = function() {
	var i = this.slots.indexOf('full');
	if(i===-1) { // this should never happen
		displayMessage('error: no empty slots on response callback');
	}
	this.slots[i] = "empty";
};

HttpManager.makeReq = function(slot) {
	var req = this.queue.nextUriObj();
	if(!req) {
		return;
	}
	var args = req.params;
	var type = args.type;
	var url = args.url;
	var orig_callback = args.callback;
	var params = args.params;
	var headers = args.headers;
	var data = args.data;
	var contentType = args.contentType;
	var username = args.username;
	var password = args.password;
	var allowCache = args.allowCache;
	var that = this;
	var callback = function(status,userParams,responseText,url,xhr) {
		that.clearNextFullSlot();
		orig_callback.call(this,status,userParams,responseText,url,xhr);
		that.proceedIfClear();
	};
	// 'move' the request from the queue to an empty slot
	this.queue.remove(url);
	this.setFullSlot(slot);
	this.stats.logCall(url);
	__httpReq(type,url,callback,params,headers,data,contentType,username,password,allowCache);
};

HttpManager.showStats = function() {
	this.stats.stats();
};

var __httpReq = window.httpReq;
window.httpReq = function(type,url,callback,params,headers,data,contentType,username,password,allowCache) {
	HttpManager.addRequest(type,url,callback,params,headers,data,contentType,username,password,allowCache);
	HttpManager.showStats();
};

} //# end of 'install only once'
//}}}