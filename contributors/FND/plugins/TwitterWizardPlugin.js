/***
|''Name''|TwitterWizardPlugin|
|''Description''|interface for retrieving tweets and user data from Twitter|
|''Author''|FND|
|''Version''|0.1.5|
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
		var count = params[2];
		if(self.pageCount <= maxPages) {
			var username = params[0] || prompt(self.usernamePrompt);
			self.launcher(username, self.pageCount, count);
			setTimeout(function() { self.dispatcher(params); },
				self.requestDelay);
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
			self.adaptor.getTiddler(context.tiddler.title, context, null, self.saver);
		}
	},

	saver: function(context, userParams) { // TODO: rename
		var tiddler = context.tiddler;
		store.saveTiddler(tiddler.title, tiddler.title, tiddler.text,
			tiddler.modifier, tiddler.modified, tiddler.tags,
			tiddler.fields, false, tiddler.created);
	},

	handleWizard: function(w) {
		var self = config.macros.TiddlyTweets;
		self.pageCount = 1;
		var params = [
			w.username,
			w.maxPages,
			w.count
		];
		self.dispatcher(params);
		w.addStep("Downloading...","");
		w.setButtons([{
			caption: "Save To RSS",
			tooltip: "Save to RSS",
			onClick: function() { TiddlyTemplating.templateAndPublish('tweets.xml','RssTemplate'); }
		}]);
	}
};

// like the more ambitious TwitterWizard below, but only for your tweets
// includes a step to check how many tweets you have and work out maxPages from that
config.macros.TwitterBackupWizard = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler, errorMsg) {
		var self = config.macros.TwitterBackupWizard;
		var w = new Wizard();
		var onClick = function() {
			w.username = w.getValue('username').value;
			self.step2(w);
			return false;
		};
		w.createWizard(place, "Twitter Backup Wizard");
		w.addStep("Twitter username", "<input name='username'>");
		w.formElem.onsubmit = onClick;
		w.setButtons([{
			caption: "Import",
			tooltip: "click to import",
			onClick: onClick
		}]);
	},

	step2: function(w) {
		var self = config.macros.TwitterBackupWizard;
		var step2html = "That's because if you've got more than 3200 we'll have to use a different method";
		w.addStep("Hello " + w.username + ", let's check for how many tweets you have", step2html);
		w.setButtons([{
			caption: "Go",
			tooltip: "Check for how many tweets you have",
			onClick: function() { self.countUpdates(w); }
		}]);
	},

	handleProfilePageToCountUpdates: function(status, context, responseText, uri, xhr) {
		var updateCount = status.statuses_count;
		var w = this.wizard;
		config.macros.TwitterBackupWizard.step3(w, updateCount);
	},

	countUpdates: function(w) {
		w.addStep("Counting tweets...", "<span>Hold your horses!</span>");
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

	step3: function(w, updateCount) {
		var step3html = "This might take a moment (isn't that &#0153; Microsoft?)";
		w.addStep("You've got " + updateCount + " tweets! Let's download them", step3html);
		w.count = 200;
		w.maxPages = Math.ceil(parseInt(updateCount, 10) / w.count);
		w.setButtons([{
			caption: "Go",
			tooltip: "Download " + updateCount + " tweets",
			onClick: function() { config.macros.TiddlyTweets.handleWizard(w); }
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
