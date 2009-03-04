/***
|''Name''|TwitterAdaptor|
|''Description''|adaptor for retrieving data from Twitter|
|''Author''|FND|
|''Contributors''|[[Simon McManus|http://simonmcmanus.com]], MartinBudden|
|''Version''|0.3.6|
|''Status''|@@beta@@|
|''Source''|http://devpad.tiddlyspot.com/#TwitterAdaptor|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''CoreVersion''|2.4.2|
!Revision History
!!v0.2 (2008-10-23)
* initial release
!!v0.3 (2008-11-03)
* major refactoring
!To Do
* parsing of replies, DMs etc.
* document custom/optional context attributes (userID, userName, page, suppressUsers)
!Code
***/
//{{{
if(!version.extensions.TiddlyWebAdaptorPlugin) { //# ensure that the plugin is only installed once
version.extensions.TiddlyWebAdaptorPlugin = { installed: true };

config.adaptors.twitter = function() {};

(function(adaptor) { //# set up alias

adaptor.prototype = new AdaptorBase();
adaptor.serverType = "twitter";
adaptor.serverLabel = "Twitter";
adaptor.mimeType = "application/json";
adaptor.tweetTags = ["tweets"];
adaptor.userTags = ["users"];

adaptor.errorFunc = function(XMLHttpRequest, textStatus, errorThrown) {
	var message = this.message;
	displayMessage("There has been a wee problem..."+message+". Status: "+textStatus);
};

adaptor.prototype.getWorkspaceList = function(context, userParams, callback) {
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
		{ title: context.userName } // user timeline
	];
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() { callback(context, context.userParams); }, 0);
	}
	return true;
};

adaptor.prototype.getTiddlerList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var page = context.page || 0;
	var count = context.count || 20;
	switch(context.workspace) {
		case "public":
			var uriTemplate = "%0/statuses/public_timeline.json";
			var uri = uriTemplate.format([context.host]);
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
			break;
		case "user_timeline":
		default: // user timeline
			if (context.userID) {
				uriTemplate = "%0/statuses/user_timeline/%1.json?page=%2&count=%3";
				uri = uriTemplate.format([context.host, context.userID, page, count]);
			} else {
				uriTemplate = "%0/statuses/user_timline.json?page=%1&count=%2";
				uri = uriTemplate.format([context.host, page, count]);
			}
			break;
	}
	/*var req = httpReq("GET", uri, adaptor.getTiddlerListCallback,
		context, null, null, { accept: adaptor.mimeType });*/
	var req = jQuery.ajax({
		url: uri,
		dataType: 'jsonp',
		success: adaptor.getTiddlerListCallback,
		error: adaptor.errorFunc,
		errorMessage: "Problem getting data from Twitter",
		context: context
	});
	return typeof req == "string" ? req : true;
};

adaptor.getTiddlerListCallback = function(data, textStatus) {
	var context = this.context;
	var tweets = data;
	context.tiddlers = [];
	var users = {};
	for(var i = 0; i < tweets.length; i++) {
		var tiddler = adaptor.parseTweet(tweets[i]);
		context.tiddlers.push(tiddler);
		if(!context.suppressUsers) { // retain user info
			var user = tweets[i].user;
			user.updated = adaptor.convertTimestamp(tweets[i].created_at);
			if(!(users[user.id] && user.updated > users[user.id].modified)) {
				users[user.id] = adaptor.parseUser(user);
				users[user.id].fields = {
					"server.type": adaptor.serverType,
					"server.host": AdaptorBase.minHostName(context.host),
					"server.workspace": "users"
				};
			}
		}
	}
	for(user in users) { // XXX: should be for each, but JSLint doesn't recognize that
		context.tiddlers.push(users[user]);
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

adaptor.prototype.getTiddler = function(title, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.title = title;
	var fields = {
		"server.type": adaptor.serverType,
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
		var subcontext = merge({}, context);
		window.setTimeout(function() { callback(subcontext, context.userParams); }, 0);
		return true;
	}
	// request individual tweet
	if(!context.tiddler || context.tiddler.fields.truncated === undefined) { // truncated flag as indicator of actual tweet
		context.tiddler = new Tiddler(title);
		context.tiddler.modifier = context.workspace;
		context.tiddler.fields = fields;
	}
	var uriTemplate = "%0/statuses/show/%1.json";
	var uri = uriTemplate.format([context.host, title]);
	/*var req = httpReq("GET", uri, adaptor.getTiddlerCallback,
		context, null, null, { accept: adaptor.mimeType });*/
	var req = jQuery.ajax({
		url: uri,
		dataType: 'jsonp',
		success: adaptor.getTiddlerCallback,
		error: adaptor.errorFunc,
		errorMessage: "Problem getting data from Twitter",
		context: context
	});
	return typeof req == "string" ? req : true;
};

adaptor.getTiddlerCallback = function(data, textStatus) {
	var context = this.context;
	var tweet = data;
	var tiddler = adaptor.parseTweet(tweet);
	tiddler.fields = merge(context.tiddler.fields, tiddler.fields, true);
	context.tiddler = tiddler;
	if(context.callback) {
		if(context.tiddler.fields.truncated) {
			var subContext = merge({},context);
			subContext.tiddler = context.tiddler;
			if(window.location.protocol!=='file') {
				// do pass on truncated tweet to callback even though we can't request full tweet
				context.callback(context, context.userParams);
			} else {
				context.callback(context, context.userParams);
				context.adaptor.getFullTweet(subContext, context.userParams, context.callback);
			}
		} else {
			context.callback(context, context.userParams);
		}
	}
};

// re-request truncated tweet - need to be offline for this
adaptor.prototype.getFullTweet = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var uriTemplate = "%0/%1/status/%2";
	var uri = uriTemplate.format([context.host, context.userID, context.tiddler.title]);
	var req = httpReq("GET", uri, adaptor.getFullTweetCallback, context);
	return typeof req == "string" ? req : true;
};

adaptor.getFullTweetCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		context.tiddler.text = adaptor.scrapeTweet(responseText);
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

// convert tweet to tiddler object
adaptor.parseTweet = function(tweet) {
	var tiddler = new Tiddler(tweet.id.toString());
	tiddler.created = adaptor.convertTimestamp(tweet.created_at);
	tiddler.modified = tiddler.created;
	tiddler.modifier = tweet.user.id.toString();
	tiddler.tags = adaptor.tweetTags;
	tiddler.fields = {
		source: tweet.source, // TODO: split into appName and appURI
		truncated: tweet.truncated,
		favorited: tweet.favorited,
		context: tweet.in_reply_to_status_id,
		user: tweet.user.id,
		username: tweet.user.name, // XXX: obsolete due to separate user info?
		usernick: tweet.user.screen_name // TODO: rename --  XXX: obsolete due to separate user info?
	};
	tiddler.text = adaptor.decodeHTMLEntities(tweet.text);
	return tiddler;
};

// convert user to tiddler object
adaptor.parseUser = function(user) {
	var tiddler = new Tiddler(user.id.toString());
	tiddler.created = user.updated; // XXX: not quite correct (updated vs. created)
	tiddler.modified = tiddler.created;
	tiddler.modifier = user.id.toString();
	tiddler.tags = adaptor.userTags;
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
adaptor.scrapeTweet = function(html) {
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
	var container = doc.getElementById("permalink");
	var spans = container.getElementsByTagName("span");
	for(i = 0; i < spans.length; i++) {
		if(spans[i].className == "entry-content") {
			var tweet = spans[i];
			var text = tweet.text || tweet.textContent; // strip descendants' markup -- XXX: cross-browser compatible?
			break;
		}
	}
	removeNode(ifrm);
	return adaptor.decodeHTMLEntities(text.trim());
};

// convert timestamp ("mmm 0DD 0hh:0mm:0ss +0000 YYYY") to Date instance
adaptor.convertTimestamp = function(str) {
	var c = str.match(/(\w+) (\d+) (\d+):(\d+):(\d+) \+\d+ (\d+)/);
	return new Date(c[6], adaptor.convertShortMonth(c[1]),
		c[2], c[3], c[4], c[5]);
};

// convert short-month string (mmm) to month number (zero-based)
adaptor.convertShortMonth = function(text) {
	for(var i = 0; i < config.messages.dates.shortMonths.length; i++) { // XXX: inefficient!?
		if(text == config.messages.dates.shortMonths[i]) {
			return i;
		}
	}
};

// convert HTML entities to the respective characters
adaptor.decodeHTMLEntities = function(str) {
	var el = document.createElement("textarea");
	el.innerHTML = str;
	return el.value;
};

})(config.adaptors.twitter); //# end of alias

} //# end of "install only once"
//}}}
