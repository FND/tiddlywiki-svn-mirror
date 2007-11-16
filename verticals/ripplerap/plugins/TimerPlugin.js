/*************
 * TimerPlugin *
 **************/

/***
|''Name''|TimerPlugin|
|''Author''|JayFresh|
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]]|
|''Version''|1|
|''~CoreVersion''|2.2.5|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/TimerPlugin.js|
|''Description''|Provides a means of setting up a heartbeat function call|
|''Syntax''|see below|
|''Status''|@@experimental@@|
|''Contributors''||
|''Contact''|jon at osmosoft dot com|
|''Comments''|please post to http://groups.google.com/TiddlyWikiDev|
|''Dependencies''||
|''Browser''||
|''ReleaseDate''||
|''Icon''||
|''Screenshot''||
|''Tags''||
|''CodeRepository''|see Source above|
! Example use
var t = new Timer();
t.setAction(function() {
	clearMessage();
	displayMessage("yo");
},true);
t.set(10000);

! Background

The TimerPlugin was created as part of the "RippleRap" project to provide a "heartbeat" for TiddlyWiki, which fires off method calls in the "PushAndPull" object to check RSS feeds for updates and generate and post a RSS feed to a WebDAV-enabled server. This was done to simulate polling and not require the person using RippleRap to manually check for updates or post.

! Re-use guidelines

The TimerPlugin doesn't have any dependencies on other "RippleRap" plugins, as you define the function that is called after every heartbeat when you instantiate a Timer object. You can set as many Timers going as you like and specify a different function for each one. You can also specify whether you want the Timer to work like a heartbeat or just run once.

***/
//{{{
/********
 * Timer *
 *********/
function Timer() {
	this.pollOption = "chkDoPolling";
	this.messages = {
		noAction:"no timer action set",
		"default":"error in timer"
	};
	this.handleFailure = function(error,text) {
		displayMessage(this.messages[error] + text);
	};
}

Timer.prototype.set = function(ms) {
	if (!this.ms) {
		this.ms = ms;
	}
	if (this.callback) {
		window.setTimeout(this.callback,ms);
	} else {
		this.handleFailure("noAction");
	}
};

Timer.prototype.setAction = function(action,recur) {
	if (!recur) {
		this.callback = action;
	} else {
		var that = this;
		this.callback = function() {
			if(config.options[that.pollOption]) {
				action();
			}
			that.set.call(that,that.ms);
		}
	}
};
//}}}