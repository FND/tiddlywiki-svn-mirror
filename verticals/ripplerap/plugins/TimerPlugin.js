/*************
 * TimerPlugin *
 **************/

/***
|''Name''|TimerPlugin|
|''Author''|JayFresh|
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]]|
|''Version''|1|
|''~CoreVersion''|2.2.5|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddleleweb/plugins/TimerPlugin.js|
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