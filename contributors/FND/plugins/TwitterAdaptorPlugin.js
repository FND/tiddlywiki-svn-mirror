/***
|''Name''|TwitterAdaptorPlugin|
|''Description''|adaptor for retrieving data from Twitter|
|''Author''|FND|
|''Contributors''|[[Simon McManus|http://simonmcmanus.com]], MartinBudden|
|''Version''|0.3.1|
|''Status''|@@beta@@|
|''Source''|http://devpad.tiddlyspot.com/#TwitterAdaptorPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''CoreVersion''|2.5|
!Revision History
!!v0.2 (2008-10-23)
* initial release
!!v0.3 (2008-11-03)
* major refactoring
!To Do
* don't use config.options; pass in settings via context
* parsing of replies, DMs etc.
* document custom/optional context attributes (page, userID)
!Code
***/
//{{{
function TwitterAdaptor() {}

TwitterAdaptor.prototype = new AdaptorBase();
TwitterAdaptor.mimeType = "application/json";
TwitterAdaptor.serverType = "twitter";
TwitterAdaptor.serverLabel = "Twitter";
TwitterAdaptor.tweetTags = ["tweets"];
TwitterAdaptor.userTags = ["users"];

TwitterAdaptor.prototype.getWorkspaceList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.workspaces = [
		{ title: "public" },
		{ title: "with_friends" }, // TODO: rename?
		{ title: "replies" },
		{ title: "direct_messages_in" },
		{ title: "direct_messages_out" },
		{ title: "friends" },
		{ title: "followers" },
		{ title: "users" },
		{ title: config.options.txtUserName } // user timeline
	];
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() { callback(context, context.userParams); }, 0);
	}
	return true;
};

TwitterAdaptor.prototype.getTiddlerList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var page = context.page || 0;
	var authorizationRequired = true;
	switch(context.workspace) {
		case "public":
			var uriTemplate = "%0/statuses/public_timeline.json";
			var uri = uriTemplate.format([context.host]);
			authorizationRequired = false;
			break;
		case "with_friends":
			uriTemplate = "%0/statuses/friends_timeline.json?page=%1";
			uri = uriTemplate.format([context.host, page]);
			break;
		case "replies": // TODO: require special parsing
			uriTemplate = "%0/statuses/replies.json?page=%1";
			uri = uriTemplate.format([context.host, page]);
			break;
		case "direct_messages_in":
			uriTemplate = "%0/direct_messages.json?page=%1";
			uri = uriTemplate.format([context.host, page]);
			break;
		case "direct_messages_out":
			uriTemplate = "%0/direct_messages/sent.json?page=%1";
			uri = uriTemplate.format([context.host, page]);
			break;
		case "friends":
			if(context.userID) {
				uriTemplate = "%0/statuses/friends/%1.json?page=%2";
				uri = uriTemplate.format([context.host, context.userID, page]);
				authorizationRequired = false;
			} else {
				uriTemplate = "%0/statuses/friends.json?page=%2";
				uri = uriTemplate.format([context.host, page]);
			}
			break;
		case "followers":
			uriTemplate = "%0/statuses/followers.json?page=%1";
			uri = uriTemplate.format([context.host, page]);
			break;
		case "users":
			uriTemplate = "%0/users/show/%1.format";
			uri = uriTemplate.format([context.host, context.userID]);
			authorizationRequired = false;
			break;
		default: // user timeline
			uriTemplate = "%0/statuses/user_timeline/%1.json?page=%2";
			uri = uriTemplate.format([context.host, context.workspace, page]);
			authorizationRequired = false;
			break;
	}
	var username, password;
	var req = httpReq("GET", uri, TwitterAdaptor.getTiddlerListCallback,
		context, null, null, { "accept": TwitterAdaptor.mimeType },
		username, password);
	return typeof req == "string" ? req : true;
};

TwitterAdaptor.getTiddlerListCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		context.tiddlers = [];
		var users = {};
		eval("var tweets = " + responseText); // evaluate JSON response
		for(var i = 0; i < tweets.length; i++) {
			var tiddler = TwitterAdaptor.parseTweet(tweets[i]);
			context.tiddlers.push(tiddler);
			if(config.options.chkTwitterFetchUsers) { // store user info
				var user = tweets[i].user;
				user.updated = TwitterAdaptor.convertTimestamp(tweets[i].created_at);
				if(!(users[user.id] && user.updated > users[user.id].modified)) {
					users[user.id] = TwitterAdaptor.parseUser(user);
					users[user.id].fields = {
						"server.type": TwitterAdaptor.serverType,
						"server.host": AdaptorBase.minHostName(context.host),
						"server.workspace": "users"
					};
				}
			}
		}
		for(user in users) { // XXX: should be for each, but JSLint doesn't recognize that
			context.tiddlers.push(users[user]);
		}
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

TwitterAdaptor.prototype.getTiddler = function(title, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.title = title;
	var fields = {
		"server.type": TwitterAdaptor.serverType,
		"server.host": AdaptorBase.minHostName(context.host),
		"server.workspace": context.workspace
	};
	// reuse previously-requested tiddlers
	if(context.tiddler) {
		context.tiddler.fields = merge(context.tiddler.fields, fields, true);
	}
	// do not re-request non-truncated tweets
	if(context.tiddler && (context.tiddler.fields.truncated === false || context.tiddler.fields["server.workspace"] == "users")) {
		context.status = true;
		window.setTimeout(function() { callback(context, context.userParams); }, 0);
		return true;
	}
	// request individual tweet
	if(!context.tiddler || context.tiddler.fields.truncated === undefined) { // truncated flag as indicator of actual tweet
		context.tiddler = new Tiddler(title);
		context.tiddler.modifier = context.workspace;
		context.tiddler.fields = fields;
	}
	var uriTemplate = "%0/statuses/show/%1.json";
	var uri = uriTemplate.format([context.host, context.tiddler.title]);
	var req = httpReq("GET", uri, TwitterAdaptor.getTiddlerCallback,
		context, null, null, { "accept": TwitterAdaptor.mimeType });
	return typeof req == "string" ? req : true;
};

TwitterAdaptor.getTiddlerCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		eval("var tweet = " + responseText); // evaluate JSON response
		var tiddler = TwitterAdaptor.parseTweet(tweet);
		tiddler.fields = merge(context.tiddler.fields, tiddler.fields, true);
		context.tiddler = tiddler;
	}
	if(context.callback) {
		if(context.tiddler.fields.truncated) {
			var subContext = {
				tiddler: context.tiddler
			};
			context.adaptor.getFullTweet(subContext, context.userParams, context.callback);
		} else {
			context.callback(context, context.userParams);
		}
	}
};

// re-request truncated tweet
TwitterAdaptor.prototype.getFullTweet = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var uriTemplate = "%0/%1/status/%2";
	var uri = uriTemplate.format([context.host, context.workspace, context.tiddler.title]);
	var req = httpReq("GET", uri, TwitterAdaptor.getFullTweetCallback, context);
	return typeof req == "string" ? req : true;
};

TwitterAdaptor.getFullTweetCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		context.tiddler.text = TwitterAdaptor.scrapeTweet(responseText);
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

// convert tweet to tiddler object
TwitterAdaptor.parseTweet = function(tweet) {
	var tiddler = new Tiddler(tweet.id.toString());
	tiddler.created = TwitterAdaptor.convertTimestamp(tweet.created_at);
	tiddler.modified = tiddler.created;
	tiddler.modifier = tweet.user.id;
	tiddler.tags = TwitterAdaptor.tweetTags;
	tiddler.fields = {
		source: tweet.source, // TODO: split into appName and appURI
		truncated: tweet.truncated,
		favorited: tweet.favorited,
		context: tweet.in_reply_to_status_id,
		user: tweet.user.id,
		username: tweet.user.name, // XXX: obsolete due to separate user info?
		usernick: tweet.user.screen_name // TODO: rename --  XXX: obsolete due to separate user info?
	};
	tiddler.text = decodeHTMLEntities(tweet.text);
	return tiddler;
};

// convert user to tiddler object
TwitterAdaptor.parseUser = function(user) {
	var tiddler = new Tiddler(user.id.toString());
	tiddler.created = user.updated; // XXX: not quite correct (updated vs. created)
	tiddler.modified = tiddler.created;
	tiddler.modifier = user.id.toString();
	tiddler.tags = TwitterAdaptor.userTags;
	var slice = "|''%0''|%1|\n";
	tiddler.text = slice.format(["ID", user.id]) +
		slice.format(["ScreenName", user.screen_name]) +
		slice.format(["FullName", user.name]) +
		slice.format(["URL", user.url]) +
		slice.format(["Icon", user.profile_image_url]) +
		slice.format(["Bio", user.description]) +
		slice.format(["Location", user.location]) +
		slice.format(["Followers", user.followers_count]) +
		slice.format(["Protected", user.protected]);
	return tiddler;
};

// retrieve untruncated tweet (cf. http://code.google.com/p/twitter-api/issues/detail?id=133)
TwitterAdaptor.scrapeTweet = function(html) {
	// load HTML page
	var ifrm = document.createElement("iframe");
	ifrm.style.display = "none";
	document.body.appendChild(ifrm);
	var doc = ifrm.document;
	if(ifrm.contentDocument) { // NS6
		doc = ifrm.contentDocument;
	} else if(ifrm.contentWindow) { // IE
		doc = ifrm.contentWindow.document;
	}
	doc.open();
	doc.writeln(html);
	doc.close();
	// retrieve status message
	var containers = doc.getElementsByTagName("div");
	for(i = 0; i < containers.length; i++) {
		if(containers[i].className == "desc-inner") {
			var tweet = containers[i].getElementsByTagName("p")[0];
			var text = tweet.text || tweet.textContent; // strip descendants' markup -- XXX: cross-browser compatible?
			break;
		}
	}
	removeNode(ifrm);
	return decodeHTMLEntities(text.trim());
};

// convert timestamp ("mmm 0DD 0hh:0mm:0ss +0000 YYYY") to Date instance
TwitterAdaptor.convertTimestamp = function(str) {
	var components = str.match(/(\w+) (\d+) (\d+):(\d+):(\d+) \+\d+ (\d+)/);
	return new Date(components[6], convertShortMonth(components[1]),
		components[2], components[3], components[4], components[5]);
};

config.adaptors[TwitterAdaptor.serverType] = TwitterAdaptor;

// convert short-month string (mmm) to month number (zero-based)
function convertShortMonth(text) {
	for(var i = 0; i < config.messages.dates.shortMonths.length; i++) { // XXX: inefficient!?
		if(text == config.messages.dates.shortMonths[i]) {
			return i;
		}
	}
}

function decodeHTMLEntities(str) {
	var el = document.createElement("textarea");
	el.innerHTML = str;
	return el.value;
}
//}}}
