//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.TCGetterPlugin) {
version.extensions.TCGetterPlugin = {installed:true};

config.optionsDesc.txtTCInterval = "~TiddlyChatter polling interval (in seconds)";

function TCGetter() {
	this.defaultInterval = 3000;
	this.requestPending = false;
	this.listTiddler = "TiddlyChatterFeeds";
	this.feedtype = "tiddlyweb";
	this.host = "http://peermore.com:8001";
	this.feeds = {};
	this.debug = true; // change to false to turn off debugging
}

// logging function, for debug
TCGetter.log = function(x)
{
	if(!this.debug) {
		return;
	}
	if(window.console)
		console.log(x);
	else
		displayMessage(x);
};

TCGetter.prototype.init = function() {
	this.feeds = new FeedListManager();
	var list = store.calcAllSlices(this.listTiddler);
	for(var i in list) {
		this.feeds.add(list[i],null,'rss'); // can't use tiddlyweb as feedtype because of bug in FeedListManager
	}
	displayMessage("polling in "+this.getInterval());
	this.makeRequest();
}

TCGetter.prototype.getInterval = function()
{
	var t = config.options.txtTCInterval ? parseInt(config.options.txtTCInterval)*1000 : this.defaultInterval;
	if(isNaN(t))
		t = this.defaultInterval;
	return t;
};

// If no sync requests are outstanding then queue a sync request on a timer.
TCGetter.prototype.makeRequest = function()
{
	if(this.requestPending) {
		TCGetter.log("get request is pending");
		return;
	}
	var me = this;
	window.setTimeout(function() {me.doGetTiddlerList.call(me);},this.getInterval());
};

TCGetter.prototype.doGetTiddlerList = function()
{
	uri = this.feeds.next();
	uri += "/tiddlers";
	displayMessage("doing get with "+uri);
	
	var context = {
		getter:this,
		host:this.host,
		callback:TCGetter.doGetTiddlerListCallback
	};
	TiddlyWebAdaptor.doHttpGET(uri,
        TiddlyWebBagTiddlers.getTiddlersCallback,
        context,
        {'accept':'application/json'}
    );
};

TCGetter.doGetTiddlerListCallback = function(context) {
	var tiddlers = context.tiddlers;
	if(tiddlers) {
		TCGetter.getTiddlers(context);
	}
};

TCGetter.getTiddlers = function(context) {
	// here, we are saving new parent content and saving as notes anything which is tagged with "notes"
	var titles = context.titles;
	var tiddlers = context.tiddlers;
	if(titles && tiddlers) {
		var title = "";
		var t = new Tiddler();
		for(var i=0;i<titles.length;i++) {
			title = titles[i];
			var uri = context.uri + "/" + title;
			context.uri = uri;
			if(i==titles.length-1) {
				context.lastTiddler = true;
			}
			context.callback = TCGetter.getTiddlers.callback;
			TiddlyWebAdaptor.doHttpGET(uri,
				TiddlyWebBagTiddlers.getTiddlerCallback,
				context,
				{'accept':'application/json'}
			);
		}
	}
};

TCGetter.getTiddlers.callback = function(context) {
	var t = context.tiddler;
	if(!store.tiddlerExists(t.title)) {
		if(t) {
			var fields = {
				'server.bag':t.bag,
				'server.host':context.host,
				'server.type':"tiddlyweb",
				'server.workspace':""
			};
			var modified = Date.convertFromYYYYMMDDHHMM(t.modified);
			var created = Date.convertFromYYYYMMDDHHMM(t.created);
			store.saveTiddler(t.title,t.title,t.text,t.modifier,modified,t.tags,fields,false,created);
			displayMessage("saved "+t.title);
		}
	}
	if(context.lastTiddler) {
		var tc = context.getter;
		tc.makeRequest();
	}
}

tc = new TCGetter();
tc.init();

} //# end of 'install only once'
//}}}