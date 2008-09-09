/***
|''Name:''|HttpManagerPlugin|
|''Description:''|Buffers HTTP requests, allowing user feedback and exception handling|
|''Author''|JonathanLister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/HttpManagerPlugin.js |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|

! Usage
...

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

var HttpManager = {
	queue: new FeedListManager(),
	stats: new FeedListManager(),
	slots: [
		"empty",
		"empty"
	],
	count:0
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
		//console.log('cleared to proceed! queue size: ',this.queue.count());
		displayMessage('cleared to proceed! queue size: '+this.queue.count());
		this.makeReq(i);
	} else {
		//console.log('not clear to proceed! queue size: ',this.queue.count());
		displayMessage('not clear to proceed! queue size: '+this.queue.count());
	}
};

HttpManager.getNextEmptySlot = function() {
	var i = this.slots.indexOf('empty');
	return (i!==-1) ? i : false;
};

HttpManager.setFullSlot = function(slot) {
	if(this.slots[slot]!=='empty') { // this should never happen, unless maybe things have got out of order...
		//console.log('error: slot that is empty should be full: '+slot);
		displayMessage('error: slot that is empty should be full: '+slot);
	}
	this.slots[slot] = "full";
};

HttpManager.clearNextFullSlot = function() {
	var i = this.slots.indexOf('full');
	if(i===-1) { // this should never happen, unless maybe things have got out of order...
		//console.log('error: no empty slots on response callback');
		displayMessage('error: no empty slots on response callback');
	}
	this.slots[i] = "empty";
};

HttpManager.makeReq = function(slot) {
	try {
		var req = this.queue.nextUriObj();
		if(!req) {
			//console.log('nothing on the queue!',this.queue);
			displayMessage('nothing on the queue!');
			return;
		} else {
			//console.log('queue position: ',this.queue.currentPosition);
			displayMessage('queue position: '+this.queue.currentPosition);
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
			that.stats.logResponse(url,xhr);
			orig_callback.call(this,status,userParams,responseText,url,xhr);
			//console.log('proceeding with the next attempt, queue size: ',that.queue.count());
			displayMessage('proceeding with the next attempt, queue size: '+that.queue.count());
			that.proceedIfClear();
		};
		// 'move' the request from the queue to an empty slot
		this.queue.remove(url);
		this.setFullSlot(slot);
		this.stats.logCall(url);
		this.count++;
		//console.log('making request number in makeReq: ',this.count);
		displayMessage('making request number: '+this.count);
		this.origHttp(type,url,callback,params,headers,data,contentType,username,password,allowCache);
	} catch (ex) {
		//console.log('exception in makeReq: ',ex);
		displayMessage('exception in makeReq: ',ex);
	}
};

HttpManager.showStats = function() {
	//this.stats.stats();
	//console.log(this.stats);
	//displayMessage(this.stats);
};

HttpManager.setHttpReq = function(func) {
	this.origHttp = func;
};

HttpManager.setHttpReq(Http.intercept(window,'httpReq',function(type,url,callback,params,headers,data,contentType,username,password,allowCache) {
	HttpManager.addRequest(type,url,callback,params,headers,data,contentType,username,password,allowCache);
	HttpManager.showStats();
}));

FeedListManager.prototype.logResponse = function(uri,xhr) {
	var p = this.registered(uri);
	if(p == null) {
		return;
	}
	var u = this.uris[p];
	var now = new Date();
	now = now.convertToYYYYMMDDHHMMSSMMM();
	u.lastResponse = now;
	if(u.responseCount) { // done like this until responseCount made a part of FeedListManager
		u.responseCount++;
	} else {
		u.responseCount = 1;
	}
	if(xhr.responseText) {
		if(u.bytesDownloaded) {
			u.bytesDownloaded += xhr.responseText.length;
		} else {
			u.bytesDownloaded = xhr.responseText.length;
		}
	}
};

} //# end of 'install only once'
//}}}