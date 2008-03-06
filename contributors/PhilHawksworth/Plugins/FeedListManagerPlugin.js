/***
|''Name:''|FeedListManagerPlugin|
|''Description:''|Manage a list of uris to be called in a round-robin stlye|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/FeedListManagerPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Mar 03, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
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
FeedListManager.prototype.add = function(uri) {
	var exists = this.registered(uri);
	if(exists != null)
		return;
	var uriObj = {'uri':uri, 'callCount':0, 'lastCall':null};
	this.uris.pushUnique(uriObj);
};


// Remove a uri from the list of those currently managed.
FeedListManager.prototype.remove = function(uri) {
	var pos = this.registered(uri);
	if(pos != null)
		this.uris.splice(pos,1);
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
	if(u)
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
	now = now.convertToYYYYMMDDHHMM();
	this.lastIncrement = now;
	return uri;
};


// Output usgae stats for the list of uris currently managed. (as wikitext)
FeedListManager.prototype.stats = function(uri) {
	if(uri)
		var uris = this.uris[uri];
	else
		var uris = this.uris;
	var stats = null;
	for(var u=0; u<uris.length; u++) {
		FeedListManager.log(uris[u].uri +", called "+ uris[u].callCount + " times, last called at " + uris[u].lastCall);
	}
};


// Purge the list of uris currently managed.
FeedListManager.prototype.purge = function() {
	this.uris = [];
};

} //# end of 'install only once'
//}}}