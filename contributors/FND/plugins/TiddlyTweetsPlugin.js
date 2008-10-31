/***
|''Name''|TiddlyTweetsPlugin|
|''Description''|automatically retrieve tweets from Twitter|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Requires''|TracAdaptorPlugin|
|''Source''|http://devpad.tiddlyspot.com/#TwitterArchivePlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Usage
{{{
<<TiddlyTweets [username] [pages]>>
}}}
!Revision History
!!v0.1 (2008-10-24)
* initial release
!To Do
* abort conditions: empty response or tweet already archived
* report when retrieval has been completed
* disable wiki markup for tweets
!Code
***/
//{{{
if(!version.extensions.TwitterArchivePlugin) {
version.extensions.TwitterArchivePlugin = { installed: true };

config.macros.TiddlyTweets = {
	btnLabel: "TiddlyTweets",
	btnTooltip: "retrieve tweets",
	usernamePrompt: "enter Twitter username",

	host: "http://www.twitter.com", // XXX: use HTTPS?
	requestDelay: 1000, // delay between page requests
	adaptor: new TwitterAdaptor(),

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		this.pageCount = 0; // XXX: means there can only be a single instance!!
		createTiddlyButton(place, this.btnLabel, this.btnTooltip,
			function() { config.macros.TiddlyTweets.dispatcher(params); });
	},

	dispatcher: function(params) { // TODO: rename
		var self = config.macros.TiddlyTweets;
		var maxPages = params[1] || 1;
		if(self.pageCount < maxPages) {
			var username = params[0] || prompt(self.usernamePrompt);
			self.launcher(username, self.pageCount);
			setTimeout(function() { self.dispatcher(params); },
				self.requestDelay);
			self.pageCount++;
		} else {
			self.pageCount = 0;
		}
	},

	launcher: function(username, page) { // TODO: rename
		var self = config.macros.TiddlyTweets;
		var context = {
			host: self.host,
			workspace: username,
			page: page
		};
		var status = self.adaptor.getTiddlerList(context, null, self.processor);
		if(status) {
			displayMessage("retrieving tweets from page " + context.page); // TODO: i18n
		} else {
			displayMessage("error retrieving tweets from page " + context.page); // TODO: i18n
		}
	},

	processor: function(context, userParams) { // TODO: rename
		var self = config.macros.TiddlyTweets;
		for(var i = 0; i < context.tiddlers.length; i++) {
			context.tiddler = context.tiddlers[i];
			self.adaptor.getTiddler(null, context, null, self.saver);
		}
	},

	saver: function(context, userParams) { // TODO: rename
		var tiddler = context.tiddler;
		store.saveTiddler(tiddler.title, tiddler.title, tiddler.text,
			tiddler.modifier, tiddler.modified, tiddler.tags,
			tiddler.fields, false, tiddler.created);
	}
};

} //# end of "install only once"
//}}}
