//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.TCFeedsPlugin) {
version.extensions.TCFeedsPlugin = {installed:true};

config.optionsDesc.txtTCInterval = "~TiddlyChatter polling interval (in seconds)";

function TC() {
	this.defaultInterval = 3000;
	this.requestPending = false;
	this.listTiddler = "TiddlyChatterFeeds";
	this.feedtype = "tiddlyweb";
	this.feeds = {};
	this.debug = true; // change to false to turn off debugging
}

// logging function, for debug
TC.log = function(x)
{
	if(!this.debug) {
		return;
	}
	if(window.console)
		console.log(x);
	else
		displayMessage(x);
};

TC.prototype.init = function() {
	this.feeds = new FeedListManager();
	var list = store.calcAllSlices(this.listTiddler);
	for(var i in list) {
		this.feeds.add(list[i],null,'rss'); // can't use tiddlyweb as feedtype because of bug in FeedListManager
	}
	console.log("polling in "+this.getInterval());
	this.makeRequest();
}

TC.prototype.getInterval = function()
{
	var t = config.options.txtTCInterval ? parseInt(config.options.txtTCInterval)*1000 : this.defaultInterval;
	if(isNaN(t))
		t = this.defaultInterval;
	return t;
};

// If no sync requests are outstanding then queue a sync request on a timer.
TC.prototype.makeRequest = function()
{
	if(this.requestPending) {
		TC.log("get request is pending");
		return;
	}
	var me = this;
	window.setTimeout(function() {me.doGet.call(me);},this.getInterval());
};

TC.prototype.doGet = function()
{
/*** To do the iterating through the bag, we have to grab a bag, call bagcontents on it, then go through that list, using TiddlyWebAdaptor.getTiddler for each tiddler. Then we'll have the tiddlers in an array and we can save them if they're new parent content, or give them appropriate names if they're notes.
***/

	uri = this.feeds.next();
	console.log(uri);
	displayMessage("would do get with "+uri);
};

tc = new TC();
tc.init();

} //# end of 'install only once'
//}}}