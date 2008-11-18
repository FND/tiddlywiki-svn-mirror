/***
|''Name''|TwitterWizardPlugin|
|''Description''|interface for retrieving tweets and user data from Twitter|
|''Author''|FND|
|''Version''|0.1.1|
|''Status''|@@experimental@@|
|''Requires''|TwitterAdaptorPlugin|
|''Source''|http://devpad.tiddlyspot.com/#TwitterArchivePlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Usage
{{{
<<TwitterWizard>>
}}}
!Revision History
!!v0.1 (2008-11-14)
* initial release
!To Do
* abort conditions: empty response or tweet already archived
* report when retrieval has been completed
* disable wiki markup for tweets
!Code
***/
//{{{
if(!version.extensions.TwitterWizardPlugin) { //# ensure that the plugin is only installed once
version.extensions.TwitterWizardPlugin = { installed: true };

if(!config.extensions.TwitterAdaptor) {
	throw "Missing dependency: TwitterAdaptor";
}

config.macros.TiddlyTweets = {
	btnLabel: "TiddlyTweets",
	btnTooltip: "retrieve tweets",
	usernamePrompt: "enter Twitter username",

	host: "http://www.twitter.com",
	requestDelay: 1000, // delay between page requests
	adaptor: new config.extensions.TwitterAdaptor(),

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

// Twitter archiving wizard -- XXX: experimental, incomplete -- To Do: i18n
config.macros.TwitterWizard = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler, errorMsg) {
		var w = new Wizard();
		w.createWizard(place, "Twitter Wizard");
		w.addStep("Twitter username", "<input name='username'>");
		w.setButtons([{
			caption: "Import",
			tooltip: "click to import",
			onClick: function() { config.macros.twitter.step1(w); }
		}]);
	},

	step1: function(w) {
		var step1Html = "<input name='my_tweets' type='checkbox' /><label>My Tweets</label><br />" +
			"<input name='contacts' type='checkbox' /><label>My Contacts</label><br />" +
			"<input name='contacts_tweets' type='checkbox' /><label>My Contacts Tweets</label><br />";
		w.addStep("account :" + w.formElem.twitter_id.value, step1Html);
		w.setButtons([{
			caption: "Import 2",
			tooltip: "click to import",
			onClick: function() { config.macros.twitter.step2(w); }
		}]);
	},

	step2: function(w) {
		w.addStep("enter password for " + w.formElem.twitter_id.value,
			"<input name='twitter_password' type='password'/>");
		w.setButtons([{
			caption: "Import",
			tooltip: "click to import",
			onClick: function() { config.macros.twitter.step3(w); }
		}]);
	},

	step3: function(w) {
		var html = w.formElem.twitter_id.value + "<br />" +
			w.formElem.my_tweets + "<br />" +
			w.formElem.twitter_password.value + "<br />";
		w.addStep("All Done", html);
	}
};

} //# end of "install only once"
//}}}
