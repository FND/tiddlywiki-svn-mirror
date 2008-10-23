/***
|''Name''|TwitterAdaptorPlugin|
|''Author''|FND|
|''Contributors''|[[Simon McManus|http://simonmcmanus.com]], MartinBudden|
|''Version''|0.2|
!To Do
* individual tiddlers are still truncated - i.e. getTiddlerCallback is obsolete!?
* workspace serves as user input
* link back to respective tweet
* recurse through pages
* process tweet properties in_reply_to_status_id, source, favorited
* store user info in a tiddler
* documentation
!Code
***/
//{{{
function TwitterAdaptor() {}

TwitterAdaptor.prototype = new AdaptorBase();
TwitterAdaptor.mimeType = "application/json";
TwitterAdaptor.serverType = "twitter";
TwitterAdaptor.serverLabel = "Twitter";
TwitterAdaptor.defaultTags = ["tweets"];

TwitterAdaptor.prototype.getWorkspaceList = function(context, userParams, callback) { // TODO: workspace == user
	context = this.setContext(context, userParams, callback);
	context.workspaces = [{ title: "TiddlyWiki" }]; // DEBUG: for testing purposes only
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
	context.adaptor.context = context; // XXX: ugly workaround; see getTiddler
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

TwitterAdaptor.prototype.getTiddler = function(title, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.title = title;
	// do not re-request non-truncated tweets
	var tiddlers = userParams.getValue("adaptor").context.tiddlers; // XXX: ugly workaround; redundant when framework is fixed (see below)
	for(var i = 0; i < tiddlers.length; i++) {
		if(tiddlers[i].title == title) {
			context.tiddler = tiddlers[i];
		}
	}
	if(context.tiddler && !context.tiddler.fields.truncated) { // XXX: requires adaptor framework to pass context.tiddler!?
		context.status = true;
		window.setTimeout(function() { callback(context, context.userParams); }, 0);
		return true;
	}
	// request individual tiddler
	context.tiddler = new Tiddler(title);
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
		context.tiddler = TwitterAdaptor.parseTweet(tweet);
		var fields = {
			"server.type": TwitterAdaptor.serverType,
			"server.host": AdaptorBase.minHostName(context.host)
		};
		context.tiddler.fields = merge(context.tiddler.fields, fields);
		console.log(context.tiddler.text, tweet, responseText);
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
	tiddler.text = tweet.text;
	tiddler.tags = TwitterAdaptor.defaultTags;
	tiddler.fields = {
		avatar: tweet.user.profile_image_url,
		truncated: tweet.truncated
	};
	return tiddler;
};

// convert timestamp ("mmm 0DD 0hh:0mm:0ss +0000 YYYY") to Date instance
TwitterAdaptor.convertTimestamp = function(str) {
	var components = str.match(/(\w+) (\d+) (\d+):(\d+):(\d+) \+\d+ (\d+)/);
	return new Date(components[6], this.convertShortMonth(components[1]),
		components[2], components[3], components[4], components[5]);
};

// convert short-month string (mmm) to month number (zero-based)
TwitterAdaptor.convertShortMonth = function(text) {
    for(var i = 0; i < config.messages.dates.shortMonths.length; i++) { // XXX: inefficient!?
        if(text == config.messages.dates.shortMonths[i]) {
            return i;
        }
    }
};

config.adaptors[TwitterAdaptor.serverType] = TwitterAdaptor;