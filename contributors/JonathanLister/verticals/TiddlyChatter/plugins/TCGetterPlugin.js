//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.TCGetterPlugin) {
version.extensions.TCGetterPlugin = {installed:true};

config.optionsDesc.txtTCInterval = "~TiddlyChatter polling interval (in seconds)";
config.optionsDesc.chkTCCheckForUpdates = "check for new ~TiddlyChatter content";

function TCGetter() {
	this.defaultInterval = 5;
	this.requestPending = false;
	this.listTiddler = "TiddlyChatterFeeds";
	this.feedtype = "tiddlyweb";
	this.host = "http://peermore.com:8001";
	this.feeds = {};
}

TCGetter.counter = 0;
TCGetter.debug = true; // switch to false to turn off debugging

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
	if(!config.options.txtTCInterval)
		config.options.txtTCInterval = this.defaultInterval;
	if(!config.options.chkTCCheckForUpdates)
		config.options.chkTCCheckForUpdates = false;
	this.feeds = new FeedListManager();
	var list = store.calcAllSlices(this.listTiddler);
	for(var i in list) {
		this.feeds.add(list[i],null,'rss'); // can't use tiddlyweb as feedtype because of bug in FeedListManager
	}
	this.makeRequest();
}

TCGetter.prototype.getInterval = function()
{
	var t = config.options.txtTCInterval ? parseInt(config.options.txtTCInterval)*1000 : this.defaultInterval*1000;
	if(isNaN(t))
		t = this.defaultInterval;
	return t;
};

// If no sync requests are outstanding then queue a sync request on a timer.
TCGetter.prototype.makeRequest = function()
{
	if(config.options.chkTCCheckForUpdates) {
		if(this.requestPending) {
			TCGetter.log("get request is pending");
			return;
		}
		TCGetter.log("polling in "+this.getInterval());
		var me = this;
		window.setTimeout(function() { me.doGetTiddlerList.call(me);},this.getInterval());
	}
};

TCGetter.prototype.doGetTiddlerList = function()
{
	uri = this.feeds.next();
	uri += "/tiddlers";
	
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
			var prevUri = context.uri;
			context.uri += "/" + title;
			context.callback = TCGetter.getTiddlers.callback;
			TiddlyWebAdaptor.doHttpGET(context.uri,
				TiddlyWebBagTiddlers.getTiddlerCallback,
				context,
				{'accept':'application/json'}
			);
			context.uri = prevUri;
		}
	}
};

TCGetter.getTiddlers.callback = function(context) {
	var t = context.tiddler;
	var tiddlers = context.tiddlers;
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
			TCGetter.log("saved "+t.title+" from "+context.uri);
		}
	}

	if(TCGetter.counter==tiddlers.length-1) {
		var tc = context.getter;
		TCGetter.counter=0;
		tc.makeRequest();
	} else {
		TCGetter.counter++;
	}
}

tc = new TCGetter();
tc.init();

} //# end of 'install only once'
//}}}