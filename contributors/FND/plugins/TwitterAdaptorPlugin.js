/***
|''Name''|TwitterAdaptorPlugin|
|''Description''|adaptor for retrieving data from Twitter|
|''Author''|FND|
|''Contributors''|[[Simon McManus|http://simonmcmanus.com]], MartinBudden|
|''Version''|0.3.0|
|''Status''|@@beta@@|
|''Source''|http://devpad.tiddlyspot.com/#TwitterAdaptorPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''CoreVersion''|2.5|
!Revision History
!!v0.2 (2008-10-23)
* initial release
!To Do
* store user info in a tiddler
* support for timelines (user, public, replies) - to be implemented as "magic" workspaces?
!Code
***/
//{{{
function TwitterAdaptor() {}

TwitterAdaptor.prototype = new AdaptorBase();
TwitterAdaptor.mimeType = "application/json";
TwitterAdaptor.serverType = "twitter";
TwitterAdaptor.serverLabel = "Twitter";
TwitterAdaptor.defaultTags = ["tweets"];

TwitterAdaptor.prototype.getWorkspaceList = function(context, userParams, callback) { // TODO: workspace == user/home/replies/DMs
	context = this.setContext(context, userParams, callback);
	context.workspaces = [];
	if(context.callback) {
		context.status = true;
		window.setTimeout(function() { callback(context, context.userParams); }, 0);
	}
	return true;
};

TwitterAdaptor.prototype.getTiddlerList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var uriTemplate = "%0/statuses/user_timeline/%1.json?page=%2";
	var page = context.page || 0;
	var uri = uriTemplate.format([context.host, context.workspace, page]);
	var req = httpReq("GET", uri, TwitterAdaptor.getTiddlerListCallback,
		context, null, null, { "accept": TwitterAdaptor.mimeType });
	return typeof req == "string" ? req : true;
};

TwitterAdaptor.getTiddlerListCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		context.tiddlers = []; // XXX: outside of status check?
		eval("var tweets = " + responseText); // evaluate JSON response
		for(var i = 0; i < tweets.length; i++) {
			var tiddler = TwitterAdaptor.parseTweet(tweets[i]);
			context.tiddlers.push(tiddler);
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
		"server.host": AdaptorBase.minHostName(context.host)
	};
	// reuse previously-requested tiddlers
	if(context.tiddler) {
		context.tiddler.fields = merge(context.tiddler.fields, fields);
	}
	// do not re-request non-truncated tweets
	if(context.tiddler && context.tiddler.fields.truncated === false) {
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
		tiddler.fields = merge(context.tiddler.fields, tiddler.fields);
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
	tiddler.modifier = tweet.user.screen_name;
	tiddler.tags = TwitterAdaptor.defaultTags;
	tiddler.fields = {
		source: tweet.source, // XXX: rename?
		truncated: tweet.truncated,
		favorited: tweet.favorited,
		context: tweet.in_reply_to_status_id, // XXX: rename?
		username: tweet.user.name,
		usernick: tweet.user.screen_name // TODO: rename
	};
	tiddler.text = decodeHTMLEntities(tweet.text);
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
