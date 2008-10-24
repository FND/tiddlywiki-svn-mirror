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
	adaptor: new TwitterAdaptor(),

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		createTiddlyButton(place, this.btnLabel, this.btnTooltip,
			function() { config.macros.TiddlyTweets.launcher(params); });
	},

	launcher: function(params) { // TODO: rename
		var context = {
			host: config.macros.TiddlyTweets.host,
			workspace: params[0] || prompt(config.macros.TiddlyTweets.usernamePrompt)
		};
		var pages = params[1] || 1;
		for(var i = 0; i < pages; i++) {
			context.page = i;
			var status = config.macros.TiddlyTweets.adaptor.getTiddlerList(context,
				null, config.macros.TiddlyTweets.processor);
			if(status) {
				displayMessage("retrieving tweets from page " + context.page); // TODO: i18n
			} else {
				displayMessage("error retrieving tweets from page " + context.page); // TODO: i18n
			}
		}
	},

	processor: function(context, userParams) { // TODO: rename
		for(var i = 0; i < context.tiddlers.length; i++) {
			context.tiddler = context.tiddlers[i];
			config.macros.TiddlyTweets.adaptor.getTiddler(null,
				context, null, config.macros.TiddlyTweets.saver);
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
