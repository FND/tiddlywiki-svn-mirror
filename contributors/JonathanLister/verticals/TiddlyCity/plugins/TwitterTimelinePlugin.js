/***
|''Name:''|TwitterTimelinePlugin|
|''Description:''|Pulls 20 most recent updates from your Twitter timeline|
|''Author''|JonathanLister|
|''CodeRepository:''|n/a |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

!Pseudo-code:
{{{
Twitter.Search:
every 15 mins
	GET "http://terraminds.com/twitter/json?query="+query+"&last_id="+index
	set lastTweetIndex to the ID of the most recent tweet

Twitter.SearchCallback:
for each tweet
	if tweet matches / [lL]:([^$])+/
		save tiddler with title of tweet_id and text of tweet
}}}

***/

//{{{
if(!version.extensions.TwitterTimelinePlugin) {
version.extensions.TwitterTimelinePlugin = {installed:true};

var TwitterTimeline = function() {
	this.uri = 'http://twitter.com/statuses/user_timeline/%0.json?since_id=%1';
	this.lastIndex = 0;
};

TwitterTimeline.prototype.getUpdates = function(user,callback) {
	if(!user) {
		return false;
	}
	var index = this.lastIndex;
	var uri = this.uri.format([user,index]);
	loadRemoteFile(uri,this.getUpdatesCallback,callback);
	return true;
};

TwitterTimeline.prototype.getUpdatesCallback = function(status,callback,responseText,url,xhr) {
	console.log(responseText);
	console.log(xhr);
	if(!status) {
	 	displayMessage("error in getUpdates: " + xhr.statusText);
	} else {
		var tweets = eval(responseText);
		this.lastIndex = tweets[0].id;
		callback(tweets);
	}
};

} //# end of 'install only once'
//}}}