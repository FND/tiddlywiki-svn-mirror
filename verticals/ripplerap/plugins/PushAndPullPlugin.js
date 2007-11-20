/********************
 * PushAndPullPlugin *
 ********************/

/***
|''Name''|PushAndPullPlugin|
|''Author''|JayFresh|
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]]|
|''Version''|1|
|''~CoreVersion''|2.2.5|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/PushAndPullPlugin.js|
|''Description''|provides an abstraction for moving a Collection of tiddlers up to the a server as an RSS feed and retrieving another set of RSS feeds|
|''Syntax''|see below|
|''Status''|@@experimental@@|
|''Contributors''||
|''Contact''|jon at osmosoft dot com|
|''Comments''|please post to http://groups.google.com/TiddlyWikiDev|
|''Dependencies''|RSSAdaptorPlugin,CollectionPlugin,DAVPlugin|
|''Browser''||
|''ReleaseDate''||
|''Icon''||
|''Screenshot''||
|''Tags''||
|''CodeRepository''|see Source above|
! Example use
var p = new PushAndPull();
p.setFeeds(feedArray);
p.setAdminFeed(url1);
p.setPostBox(dir);
p.getFeeds();
p.putFeeds();

! Background

The PushAndPullPlugin was designed as part of the "RippleRap" project to make it easy to push and pull RSS feeds to and from a server in a bandwidth-efficient way, which was important as RippleRap was going to be run in a conference setting, where bandwidth is limited. Three RSS feeds are downloaded every time getFeeds() is run - the AdminFeed (we used this to publish Agenda and other updates), the feed for the ongoing session and another feed for a session chosen using a round-robin.

! Re-use guidelines

The PushAndPullPlugin can be installed into any TiddlyWiki to provide an easy way of getting multiple RSS feeds, and generating and pushing an RSS feed onto a WebDAV-enabled server. A PushAndPull object expects a source Collection of tiddlers to look for objects to push from.

***/
//{{{
/*************
 * PushAndPull *
 **************/
function PushAndPull() {
	this.feeds = [];
	this.pushTag = "note";
	this.messages = {
		noAdminFeed:"no Admin Feed set",
		noFeed:"no feeds to pull",
		HTTP:"error with http request: ",
		openHost:"error opening feed: ",
		noContent:"nothing to import from ",
		noImport:"nothing imported from ",
		noTiddler:"error storing tiddler: ",
		"default":"error in PushAndPull"
	};
	this.roundRobinSession = 0;
	this.chooseFeeds = function() {
		// chooseFeeds selects the feeds to poll for updates
		// the adminFeed is always checked if it exists
		// the current session(s) feed(s) is/are checked if the currentSession macro is installed
		// one other session feed is chosen using a round-robin method
		// this.feeds is the array of feed URL's to poll
		var feedsToPoll = [];
		// always pick the admin feed
		if (this.adminFeed) {
			feedsToPoll.push(this.adminFeed);
		} else {
			/* 20/11/07 - TEMP measure to avoid having to set adminFeed */
			// this.handleFailure("noAdminFeed");
		}
		/* 20/11/07 - TEMP arrangement as we're only putting one feed in the feed list */
		if (this.feeds.length > 0) {
			feedsToPoll = feedsToPoll.concat(this.feeds);
		}
		/* DEBUG: breaks the import if the current session feed isn't there
		if (config.macros.currentSession) {
			// get an array of current sessions titles
			var currentSessions = config.macros.currentSession.find();
			this.feeds.concat(currentSessions);
		} */
		// var allSessions = store.getTaggedTiddlers("session");
		// DEBUG: breaks the import if the session feed isn't there
		// this.feeds.push(allSessions[this.roundRobinSession].getFeedURL());
		return feedsToPoll;
	};
	this.getFeed = function(feed) {
		if (feed) {
			var adaptor = new RSSAdaptor();
			var context = {};
			context.host = feed;
			context.adaptor = adaptor;
			// Q: What's the filter going to be?
			// Suggestion: [tag[session]]
			// NB: 19/11/07 putting that filter in broke the import!
			context.filter = "";
			var ret = adaptor.openHost(context.host,context,null,PushAndPull.openHostCallback);
			if(typeof ret == "string") {
				this.handleFailure("HTTP",ret);
			}
		} else {
			this.handleFailure("noFeed");
		}
	};
	this.setFeeds = function(feedArray) {
		if (feedArray) {
			this.feeds = feedArray;
		}
	};
	this.pushFeed = function() {
		// build RSS item out of all your notes tiddlers
		var rssString = generateRss(this.pushTag);
		var url = this.postBox + "index.xml";
		// WebDAV PUT of rssString to this.postBox
		var params = {
			callback:function(status,params,responseText,url,xhr){
				if(!status){
					// PUT failed, deal with it here
					// leave item in queue and take no action?
				} else {
					// PUT is successful, take item out of queue
					displayMessage("successfully PUT");
					Collection.clear();
				}
			}
		};
		DAV.putAndMove(url,params,rssString);
	};
	this.handleFailure = function(error,text) {
		displayMessage(this.messages[error] + text);
	};
}

Tiddler.prototype.getFeedURL = function() {
	// work out the feed URL from the feed tiddler
	// TO-DO: refine this when server-side is done
	return this.title + ".xml";
};

// this feed is always polled
PushAndPull.prototype.setAdminFeed = function(feed) {
	this.adminFeed = feed;
};

// this is a directory for putting update files
// this is assuming the directory already exists
PushAndPull.prototype.setPostBox = function(dir) {
	this.postBox = dir;
};

/* START: methods supporting this.getFeed */
PushAndPull.openHostCallback = function(context,userParams) {
	if (context.status !== true) {
		this.handleFailure("openHost",context.statusText);
	}
	context.adaptor.getTiddlerList(context,userParams,PushAndPull.getTiddlerListCallback,context.filter);
};

PushAndPull.getTiddlerListCallback = function(context,userParams) {
	if(context.status) {
		var tiddlers = context.tiddlers;
		if (tiddlers.length === 0) {
			this.handleFailure("noContent",context.adaptor.host);
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
					context.adaptor.getTiddler(tiddler.title,null,null,PushAndPull.getTiddlerCallback);
					import_count++;
				}
			}
			if (import_count === 0) {
				this.handleFailure("noImport",context.adaptor.host);
			}
		}
	}
};

PushAndPull.getTiddlerCallback = function(context,userParams) {
	// displayMessage("getting " + context.tiddler.title);
	if(context.status) {
		var tiddler = context.tiddler;
		// add in an extended field to save unread state - NB: this might not be needed
		tiddler.fields.unread = "true";
		// here's where we decide what to do with the tiddlers
		// store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		displayMessage(tiddler.title + " imported successfully");
		story.refreshTiddler(tiddler.title,1,true);
	} else {
		this.handleFailure("noTiddler",context.statusText);
	}
	// Q: is this necessary? is there a less "heavy-handed" approach to refreshing? is it needed?
	// story.refreshAllTiddlers();
};
/* END: methods supporting this.getFeed */

PushAndPull.prototype.putFeeds = function() {
	// check queue for any feeds that need posting and try to post the RSS feed if they do
	var items = Collection.getAll();
	if (items) {
		this.pushFeed();
	}
};

PushAndPull.prototype.getFeeds = function() {
	var feedsToPoll = this.chooseFeeds();
	for (var i=0;i<feedsToPoll.length;i++) {
		this.getFeed(feedsToPoll[i]);
	}
};

/*************************
 * Overriding generateRSS *
 * to filter by tag       *
 ************************/
function generateRss(filterTag)
{
	var s = [];
	var d = new Date();
	var u = store.getTiddlerText("SiteUrl");
	// Assemble the header
	s.push("<" + "?xml version=\"1.0\"?" + ">");
	s.push("<rss version=\"2.0\">");
	s.push("<channel>");
	s.push("<title" + ">" + wikifyPlain("SiteTitle").htmlEncode() + "</title" + ">");
	if(u)
		s.push("<link>" + u.htmlEncode() + "</link>");
	s.push("<description>" + wikifyPlain("SiteSubtitle").htmlEncode() + "</description>");
	s.push("<language>en-us</language>");
	s.push("<copyright>Copyright " + d.getFullYear() + " " + config.options.txtUserName.htmlEncode() + "</copyright>");
	s.push("<pubDate>" + d.toGMTString() + "</pubDate>");
	s.push("<lastBuildDate>" + d.toGMTString() + "</lastBuildDate>");
	s.push("<docs>http://blogs.law.harvard.edu/tech/rss</docs>");
	s.push("<generator>TiddlyWiki " + version.major + "." + version.minor + "." + version.revision + "</generator>");
	// The body
	var tiddlers = store.getTiddlers("modified","excludeLists");
	var n = config.numRssItems > tiddlers.length ? 0 : tiddlers.length-config.numRssItems;
	for (var t=tiddlers.length-1; t>=n; t--) {
		if (!filterTag || tiddlers[t].isTagged(filterTag)) {
			s.push(tiddlers[t].saveToRss(u));
		}
	}
	// And footer
	s.push("</channel>");
	s.push("</rss>");
	// Save it all
	return s.join("\n");
}

/*************
 * Test macro *
 **************/
/* config.macros.testPoll = {};

config.macros.testPoll.handler = function() {
	var t = new Timer();
	var p = new PushAndPull();
	// TO-DO: figure out a sensible	way to gather feeds
	// p.setFeeds(feedArray);
	p.setAdminFeed(config.options.txtPollAdminFeed);
	p.setPostBox("http://localhost/"+config.options.txtUserName+"/");
	t.setAction(function() {
		clearMessage();
		displayMessage("polling");
		p.getFeeds();
		p.putFeeds();
	},true);
	t.set(10000);
}; */
//}}}