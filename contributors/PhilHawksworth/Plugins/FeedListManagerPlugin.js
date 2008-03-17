/***
|''Name:''|FeedListManagerPlugin|
|''Description:''|Manage a list of uris to be called in a round-robin stlye|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/FeedListManagerPlugin.js |
|''Version:''|0.1|
|''Date:''|Mar 03, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|


''Usage examples:''

Create a new feed list manager.
{{{
var feeds = new FeedListManager();
}}}

Add a uri to an existing feed list manager.
{{{
feeds.add(uri);
}}}

Remove a uri from an existing feed list manager.
{{{
feeds.remove(uri);
}}}

Get a uri from an given position in an existing feed list manager.
{{{
uri = feeds.get(i);
}}}

Get the next uri in the queue of an existing feed list manager.
{{{
uri = feeds.next();
}}}

Discover the number of registered uris in an existing feed list manager.
{{{
i = feeds.count();
}}}

Discover if a given uri is registered in an existing feed list manager, and at what position.
{{{
i = feeds.registered(uri);
}}}

Repopulate the uri list in an existing feed list manager.
{{{
feeds.refresh();
}}}

Clear out the list of registered uris.
{{{
feeds.purge();
}}}

Output some usage stats about the registered usage stats
{{{
feeds.stats([uri]);
}}}


***/

//{{{
if(!version.extensions.FeedListManagerPlugin) {
version.extensions.FeedListManagerPlugin = {installed:true};
		
function FeedListManager(){
	this.uris = [];
	this.currentPosition = 0;
	this.lastIncrement = null;
	this.updating = false;
};


// logging function, for debug
FeedListManager.log = function(x)
{
	if(window.console)
		console.log(x);
	else
		displayMessage(x);
};


// Add a uri to the list of those managed (no dupes).
// uri : the uri,
// type : uri | opml
FeedListManager.prototype.add = function(uri, type) {
	var exists = this.registered(uri);
	if(exists != null)
		return;
	var uriObj = {'uri':uri, 'type':type, 'callCount':0, 'lastCall':null};
	this.uris.push(uriObj);
};


// Remove a uri from the list of those currently managed.
FeedListManager.prototype.remove = function(uri) {
	var pos = this.registered(uri);
	if(pos != null)
		this.uris.splice(pos,1);
};


// Add a uri to the list of those managed (no dupes).
FeedListManager.prototype.populate = function() {
	
	//flag that the update is happening.
	this.updating = true;
	
	//get and call the opml links.
	var opmllinks = [];
	for(var u=0; u<this.uris.length; u++) {
		if(this.uris[u].type == 'opml') {
			//opmllinks.push(this.uris[u]);
			var params = {};
			params.platform = platform;
			params.tiddlerTitle = tiddlerTitle;
			doHttp("POST",this.uris[u].uri,null,null,null,null,this.examineopml);
		}	
	}
	
	//flag that the update is complete.

};


//examine an opml file to gather the feed links within.
FeedListManager.prototype.examineopml = function(status,params,responseText,url,xhr) {
			
	if(xhr.status != 200)
		return;
	
	FeedListManager.log(responseText);
	
	//add each uri found.
	//flag that the update is complete.
};


// Return the number of uris currently managed.
FeedListManager.prototype.count = function() {
	return this.uris.length;
};


// Determine if this uri is currently managed.
// returns its postion in the array if found, or null if not.
FeedListManager.prototype.registered = function(uri) {
	for(var u=0; u<this.uris.length; u++) {
		if(this.uris[u].uri == uri)
			return u;
	}
	return null;
};


// Get the uri at a given postion in the list of those managed.
FeedListManager.prototype.get = function(i) {
	var u = this.uris[i];
	var uri = null;
	if(u != null)
		uri = u.uri;
	return uri;
};


// Get the next uri from the list of those managed.
FeedListManager.prototype.next = function() {
	var uri = this.get(this.currentPosition);
	this.currentPosition++;
	if(this.currentPosition >= this.uris.length)
		this.currentPosition = 0;
	var now = new Date();
	now = now.convertToYYYYMMDDHHMMSSMMM();
	this.lastIncrement = now;
	if(uri.type != 'uri')
		this.next();
	else
		return uri;
};


// Make a note of a call to a given yri
FeedListManager.prototype.logCall = function(uri) {
	var p = this.registered(uri);
	if(p == null)
		return;
	var u = this.uris[p];
	var now = new Date();
	now = now.convertToYYYYMMDDHHMMSSMMM();
	this.lastIncrement = now;
	u.lastCall = now;
	u.callCount++;
};


// Output usgae stats for the list of uris currently managed. (as wikitext)
FeedListManager.prototype.stats = function(uri) {
	if(uri) {
		var p = this.registered(uri);
		if(p == null)
			return;
		var uris = [this.uris[p]];
	}
	else
		var uris = this.uris;
	var stats = null;
	for(var u=0; u<uris.length; u++) {
		/*
			TODO Make the stats output to a tiddler rather than to the console.
		*/
		FeedListManager.log(uris[u].uri +", called "+ uris[u].callCount + " times, last called at " + uris[u].lastCall);
	}
};


// Purge the list of uris currently managed.
FeedListManager.prototype.purge = function() {
	this.uris = [];
	this.currentPosition = 0;
};


} //# end of 'install only once'
//}}}