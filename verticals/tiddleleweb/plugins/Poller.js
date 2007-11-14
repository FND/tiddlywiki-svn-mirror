/*********
 * Poller *
 *********/
function Poller() {
	this.feeds = [];
	this.messages = {
		noAdminFeed:"no Admin Feed set",
		noFeed:"no feed in poller",
		HTTP:"error with http request: ",
		openHost:"error opening feed: ",
		noContent:"nothing to import from ",
		noImport:"nothing imported from ",
		noTiddler:"error storing tiddler: ",
		"default":"error in poller"
	};
	this.chooseFeeds = function() {
		// empty list
		this.feeds = [];
		// always pick the admin feed
		if (this.adminFeed) {
			this.feeds.push(this.adminFeed);
		} else {
			this.handleFailure("noAdminFeed");
		}
		// pick the feed for the active session
		if (config.macros.currentSession) {
			// get an array of current sessions titles
			var sessions = [];
			sessions.push(config.macros.currentSession.find());
			for (var i=0;i<sessions.length;i++) {
				// TO-DO: get the feed url from the session title, assuming we use feeds per session
				// this.feeds.push(xxx);
			}
		}
	};
	this.getFeed = function(feed) {
		if (feed) {
			var adaptor = new RSSAdaptor();
			var context = {};
			context.host = feed;
			context.adaptor = adaptor;
			// Q: What's the filter going to be?
			context.filter = "";
			var ret = adaptor.openHost(context.host,context,null,Poller.openHostCallback);
			if(typeof ret == "string") {
				this.handleFailure("HTTP",ret);
			}
		} else {
			this.handleFailure("noFeed");
		}
	};
	this.pushFeed = function(feed) {
		// WebDAV PUT
		// if PUT is successful 
	};
	this.handleFailure = function(error,text) {
		displayMessage(this.messages[error] + text);
	};
}

Poller.openHostCallback = function(context,userParams) {
	if (context.status !== true) {
		this.handleFailure("openHost",context.statusText);
	}
	context.adaptor.getTiddlerList(context,userParams,Poller.getTiddlerListCallback,context.filter);
};

/* START: methods supporting this.getFeed */
Poller.getTiddlerListCallback = function(context,userParams) {
	if(context.status) {
		var tiddlers = context.tiddlers;
		if (tiddlers.length === 0) {
			handleFailure("noContent",context.adaptor.host);
		} else {
			var sortField = 'modified';
			tiddlers.sort(function(a,b) {return a[sortField] < b[sortField] ? +1 : (a[sortField] == b[sortField] ? 0 : -1);});
			var length = tiddlers.length;
			if(userParams && userParams.maxCount && length > userParams.maxCount) {
				length = userParams.maxCount;
			}
			// displayMessage(config.messages.workspaceTiddlers.format([tiddlers.length,length]));
			var import_count = 0;
			for(var i=0; i<length; i++) {
				tiddler = tiddlers[i];
				var local_tiddler = store.fetchTiddler(tiddler.title);
				// if the tiddler exists locally, don't overwrite unless the text is different
				if(!local_tiddler || local_tiddler.text != tiddler.text) {
					context.adaptor.getTiddler(tiddler.title,null,null,Poller.getTiddlerCallback);
					import_count++;
				}
			}
			if (import_count === 0) {
				handleFailure("noImport",context.adaptor.host);
			}
		}
	}
};

Poller.getTiddlerCallback = function(context,userParams) {
	// displayMessage("getting " + context.tiddler.title);
	if(context.status) {
		var tiddler = context.tiddler;
		// add in an extended field to save unread state - NB: this might not be needed
		tiddler.fields.unread = "true";
		// uncomment line below to store tiddler
		// store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		displayMessage(tiddler.title + " imported successfully");
		story.refreshTiddler(tiddler.title,1,true);
	} else {
		handleFailure("noTiddler",context.statusText);
	}
	// Q: is this necessary? is there a less "heavy-handed" approach to refreshing? is it needed?
	// story.refreshAllTiddlers();
};
/* END: methods supporting this.getFeed */

Poller.prototype.setAdminFeed = function(feed) {
	this.adminFeed = feed;
};

Poller.prototype.putFeeds = function() {
	// check Queue for any feeds that need posting and try to post the first one
	var item = Queue.getNextItem();
	if (item) {
		this.pushFeed(item);
	}
};

Poller.prototype.getFeeds = function() {
	this.chooseFeeds();
	for (var i=0;i<this.feeds.length;i++) {
		this.getFeed(this.feeds[i]);
	}
};

/********
 * Timer *
 *********/
function Timer() {
	this.pollOption = "chkDoPolling";
	this.messages = {
		noAction:"no timer action set",
		"default":"error in timer"
	};
	this.handleFailure = function(error,text) {
		displayMessage(this.messages[error] + text);
	};
}

Timer.prototype.set = function(ms) {
	if (!this.ms) {
		this.ms = ms;
	}
	if (this.callback) {
		window.setTimeout(this.callback,ms);
	} else {
		this.handleFailure("noAction");
	}
};

Timer.prototype.setAction = function(action,recur) {
	if (!recur) {
		this.callback = action;
	} else {
		var that = this;
		this.callback = function() {
			if(config.options[that.pollOption]) {
				action();
			}
			that.set.call(that,that.ms);
		}
	}
};

/*************
 * Test macro *
 **************/
config.macros.testPoll = {};

config.macros.testPoll.handler = function() {
	var t = new Timer();
	var p = new Poller();
	// TO-DO: figure out a sensible	way to gather feeds
	// p.setFeeds(feedArray);
	p.setAdminFeed(config.options.txtPollAdminFeed);
	t.setAction(function() {
		clearMessage();
		displayMessage("polling");
		p.getFeeds();
		p.putFeeds();
	},true);
	t.set(10000);

};