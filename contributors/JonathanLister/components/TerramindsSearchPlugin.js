/***
|''Name:''|TerramindsSearchPlugin|
|''Description:''|Plugin to search Terraminds|
|''Author''|Jon Lister|
|''CodeRepository:''|n/a |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

!Pseudo-code:
{{{
Terraminds.Search:
every 15 mins
	GET "http://terraminds.com/twitter/json?query="+query+"&last_id="+index
	set lastTweetIndex to the ID of the most recent tweet

Terraminds.SearchCallback:
for each tweet
	if tweet matches / [lL]:([^$])+/
		save tiddler with title of tweet_id and text of tweet
}}}

***/

//{{{
if(!version.extensions.TerramindsSearchPlugin) {
version.extensions.TerramindsSearchPlugin = {installed:true};

function Terraminds() {}

Terraminds.lastIndex = 0;

Terraminds.Search = function(query,index) {
	if(!index)
		index = Terraminds.lastIndex;
	if(query) {
		clearMessage();
		query = encodeURIComponent(query);
		loadRemoteFile("http://terraminds.com/twitter/json?query="+query+"&last_id="+index,Terraminds.SearchCallback);
	}
};

Terraminds.SearchCallback = function(status,context,responseText,url,xhr) {
	if(!status) {
	 	displayMessage("error in search: " + xhr.statusText);
	} else {
		var tweets = eval(responseText);
		console.log(tweets);
		var l_regexp = / [lL]:([^$])+/;
		for(var i=0; i<tweets.length; i++) {
			var tweet = tweets[i];
			var match = l_regexp.exec(tweet.text);
			if(match) {
				var text = tweet.text.slice(0,match.index);
				var loc = tweet.text.slice(match.index+match.length);
				var body = "tweet: "+text+"\nfrom: "+loc+"\nby: ''"+tweet.user.screen_name+"''\nat: "+tweet.created_at;
				store.saveTiddler(tweet.id.toString(),tweet.id.toString(),body);
				displayMessage("match!: "+tweet.text);
			} else
				displayMessage("no match: "+tweet.text);
		}
	}
	// index = lastIndex;
};

} //# end of 'install only once'
//}}}