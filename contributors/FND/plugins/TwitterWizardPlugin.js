/***
|''Name''|TwitterWizardPlugin|
|''Description''|interface for retrieving tweets and user data from Twitter|
|''Author''|FND, JonathanLister|
|''Version''|0.2|
|''Status''|@@experimental@@|
|''Requires''|TwitterAdaptorPlugin|
|''Source''|http://devpad.tiddlyspot.com/#TwitterArchivePlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
!Usage
{{{
<<TiddlyTweets [workspace] [pages]>>
}}}
{{{
<<TwitterWizard>>
}}}
!Revision History
!!v0.2 (2009-03-04)
!!v0.1 (2008-11-14)
* initial release
!To Do
* documentation
* abort conditions: empty response or tweet already archived
* report when retrieval has been completed
* disable wiki markup for tweets
!Code
***/
//{{{
if(!version.extensions.TwitterWizardPlugin) { //# ensure that the plugin is only installed once
version.extensions.TwitterWizardPlugin = { installed: true };

if(!config.adaptors.twitter) {
	throw "Missing dependency: TwitterAdaptor";
}

config.macros.TiddlyTweets = {
	btnLabel: "TiddlyTweets",
	btnTooltip: "retrieve tweets",
	usernamePrompt: "enter Twitter username",

	host: "http://www.twitter.com",
	requestDelay: 1000, // delay between page requests
	adaptor: new config.adaptors.twitter(),

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		this.pageCount = 0; // XXX: means there can only be a single instance!!
		createTiddlyButton(place, this.btnLabel, this.btnTooltip,
			function() { config.macros.TiddlyTweets.dispatcher(params); });
	},

	dispatcher: function(params) { // TODO: rename
		var self = config.macros.TiddlyTweets;
		var maxPages = params[1] || 1;
		self.maxPages = maxPages;
		var count = params[2];
		if(self.pageCount <= maxPages) {
			var username = params[0] || prompt(self.usernamePrompt);
			setTimeout(function() { self.dispatcher(params); },
				self.requestDelay);
			self.launcher(username, self.pageCount, count);
			self.pageCount++;
		} else {
			self.pageCount = 1;
		}
	},

	launcher: function(username, page, count) { // TODO: rename
		var self = config.macros.TiddlyTweets;
		var context = {
			host: self.host,
			workspace: "user_timeline",
			userID: username,
			page: page,
			count: count
		};
		var status = self.adaptor.getTiddlerList(context, null, self.processor);
		if(status !== true) {
			displayMessage("error retrieving page " + context.page); // TODO: i18n
		}
	},

	processor: function(context, userParams) { // TODO: rename
		var self = config.macros.TiddlyTweets;
		self.doneRequestCount++;
		self.totalReturnedTiddlers += context.tweets;
		if(self.doneRequestCount === self.maxPages) {
			displayMessage('all the page requests have returned and been processed!');
			if(self.totalReturnedTiddlers!==self.tweetCount) {
				var difference = self.tweetCount - self.totalReturnedTiddlers;
				displayMessage('total tweets doesn\'t match predicted number, there are '+difference+' missing tweets');
			} else {
				displayMessage('all expected tweets returned');
			}
		}
		for(var i = 0; i < context.tweets; i++) {
			context.tiddler = context.tiddlers[i];
			self.adaptor.getTiddler(context.tiddler.title, context, null, self.saver);
		}
	},

	saver: function(context, userParams) { // TODO: rename
		var self = config.macros.TiddlyTweets;
		var tiddler = context.tiddler;
		store.saveTiddler(tiddler.title, tiddler.title, tiddler.text,
			tiddler.modifier, tiddler.modified, tiddler.tags,
			tiddler.fields, false, tiddler.created);
		self.savedTweets++;
		self.progressBar.style.width = (self.savedTweets / self.tweetCount)*100 +'%';
		if(self.savedTweets === self.tweetCount) {
			displayMessage('saved all tweets! finished!');
		}
	},

	// this function could probably move out to the TwitterBackWizard macro
	// then TiddlyTweets macro should have some instantiation with params like pageCount and launchCount
	handleWizard: function(w) {
		var self = config.macros.TiddlyTweets;
		self.pageCount = 1;
		self.doneRequestCount = 0;
		self.totalReturnedTiddlers = 0;
		self.savedTweets = 0;
		self.tweetCount = w.tweetCount;
		var params = [
			w.username,
			w.maxPages,
			200
		];
		w.addStep("Downloading...","<span class='progress'></span>");
		var stepElem = w.bodyElem.getElementsByTagName('div')[1];
		stepElem.style.padding = 0;
		stepElem.style.paddingBottom = "2em";
		w.setButtons([{
			caption: "Save To RSS",
			tooltip: "Save to RSS",
			onClick: function() {
				TiddlyTemplating.templateAndPublish('tweets.xml','RssTemplate');
				return false;
			}
		},
		{
			caption: "Go back",
			tooltip: "Go back to start",
			onClick: function() {
				var w = new Wizard(this);
				var place = w.clear();
				config.macros.TwitterBackupWizard.restart(w);
				return false;
			}
		}]);
		self.progressBar = w.bodyElem.getElementsByTagName('span')[0];
		self.dispatcher(params);
	}
};

// like the more ambitious TwitterWizard below, but only for your tweets
// includes a step to check how many tweets you have and work out maxPages from that
config.macros.TwitterBackupWizard = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler, errorMsg) {
		var w = new Wizard();
		w.createWizard(place, "Twitter Backup Wizard");
		this.restart(w);
	},
	
	restart: function(w) {
		var self = config.macros.TwitterBackupWizard;
		var onClick = function() {
			w.username = w.getValue('username').value;
			self.step2(w);
			return false;
		};
		w.addStep("Type in your Twitter username and hit the button", "<input name='username'>");
		w.formElem.onsubmit = onClick;
		w.setButtons([{
			caption: "Let's go",
			tooltip: "First thing, click to count your tweets",
			onClick: onClick
		}]);
	},

	handleProfilePageToCountUpdates: function(status, context, responseText, uri, xhr) {
		var tweetCount = status.statuses_count;
		var w = this.wizard;
		config.macros.TwitterBackupWizard.step3(w, tweetCount);
	},

	step2: function(w) {
		w.addStep("Hello " + w.username + ", counting your tweets...", "<span>Hold your horses!</span>");
		w.setButtons([]);
		var self = config.macros.TwitterBackupWizard;
		var host = "http://www.twitter.com";
		var url = host + "/users/show/" + w.username + ".json";
		var context = {
			wizard: w
		};
		//var req = httpReq("GET", url, self.handleProfilePageToCountUpdates, context);
		var req = jQuery.ajax({
			url: url,
			dataType: 'jsonp',
			success: self.handleProfilePageToCountUpdates,
			error: self.errorFunc,
			errorMessage: "Problem getting to Twitter",
			wizard: w
		});
	},

	step3: function(w, tweetCount) {
		var step3html = "This might take a moment (isn't that &#0153; Microsoft?)";
		w.addStep(w.username+", you've got " + tweetCount + " tweets! Let's download them", step3html);
		w.tweetCount = tweetCount;
		w.maxPages = Math.ceil(parseInt(tweetCount, 10) / 200);
		w.setButtons([{
			caption: "Download tweets",
			tooltip: "Download " + tweetCount + " tweets",
			onClick: function() { config.macros.TiddlyTweets.handleWizard(w); }
		},
		{
			caption: "Go back",
			tooltip: "Oops! Wrong username, take me back",
			onClick: function() {
				var w = new Wizard(this);
				var place = w.clear();
				config.macros.TwitterBackupWizard.restart(w);
				return false;
			}
		}]);
	},

	errorFunc: function(XMLHttpRequest, textStatus, errorThrown) {
		var message = this.message;
		var w = this.w;
		w.addStep("There has been a wee problem...", "<span>"+message+". Status: "+textStatus+"</span>");
	}
};

// Twitter archiving wizard -- XXX: experimental, incomplete -- TODO: i18n
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
			onClick: function() { config.macros.TwitterWizard.step3(w); }
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
