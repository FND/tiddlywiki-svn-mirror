/***
|''Name''|TwitterSearchMacro|
|''Description''|imports tweets from Twitter searches|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/TwitterSearchMacro.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5.0|
!Usage
{{{
<<twitter search terms ... >>
}}}
!Revision History
!!v0.1 (2010-05-19)
* initial release
!Code
***/
//{{{
(function($) {

var macro = config.macros.twitter = {
	tweetTags: ["tweet"],
	serverType: "twitter",
	serverHost: "twitter.com",
	locale: {
		btnLabel: "import tweets",
		btnTooltip: "import tweets for query: %0",
		success: "Successfully retrieved %0 tweets",
		error: "Error retrieving tweets: %0"
	},

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var query = params.join(" ");
		var tooltip = this.locale.btnTooltip.format([query]);
		createTiddlyButton(place, this.locale.btnLabel, tooltip, function(ev) {
			macro.search(query);
		});
	},
	search: function(query) {
		$.ajax({
			url: "http://search.twitter.com/search.json",
			type: "GET",
			dataType: "jsonp",
			data: { q: query },
			success: this.parseSearchResults,
			error: function(xhr, error, exc) {
				displayMessage(macro.locale.error.format([error]));
			}
		});
	},
	parseSearchResults: function(data, status, xhr) {
		store.suspendNotifications();
		$.each(data.results, function(i, item) {
			var t = macro.parseTweet(item);
			store.saveTiddler(t.title, t.title, t.text, t.modifier, t.modified,
				t.tags, t.fields, false, t.created, t.creator);
		});
		store.resumeNotifications();
		store.notifyAll(); // XXX: undesirable?
		displayMessage(macro.locale.success.format([data.results.length])); // XXX: undesirable?
	},
	parseTweet: function(tweet) { // XXX: adapted from TwitterAdaptor
		var tiddler = new Tiddler(tweet.id.toString());
		tiddler.creator = tweet.from_user_id;
		tiddler.created = new Date(tweet.created_at);
		tiddler.modifier = tweet.from_user;
		tiddler.modified = tiddler.created;
		tiddler.tags = this.tweetTags;
		tiddler.fields = {
			"server.type": this.serverType,
			"server.host": this.serverHost,
			source: tweet.source, // TODO: split into app name and URI
			avatar: tweet.profile_image_url,
			context: tweet.to_user_id // XXX: imprecise
			//geo: tweet.geo // XXX: disabled due to mapping complexity
		};
		tiddler.text = this.decodeHTMLEntities(tweet.text);
		return tiddler;
	},
	// converts HTML entities to the respective characters
	decodeHTMLEntities: function(str) { // XXX: copied from TwitterAdaptor
		var el = document.createElement("textarea");
		el.innerHTML = str;
		return el.value;
	}
};

})(jQuery);
//}}}
