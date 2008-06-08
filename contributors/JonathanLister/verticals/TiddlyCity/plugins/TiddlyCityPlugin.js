/***
|''Name:''|TiddlyCityPlugin|
|''Description:''|Code to run TiddlyCity|
|''Author''|JonathanLister|
|''CodeRepository:''|n/a |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

***/

//{{{
if(!version.extensions.TiddlyCityPlugin) {
version.extensions.TiddlyCityPlugin = {installed:true};

var TiddlyCity = function() {};

TiddlyCity.TweetToTiddler = function(tweets) {
	var l_regexp = / [lL]:([^$])+/;
	for(var i=0; i<tweets.length; i++) {
		var tweet = tweets[i];
		var match = l_regexp.exec(tweet.text);
		if(match) {
			var text = tweet.text.slice(0,match.index);
			var location = tweet.text.slice(match.index+match.length);
			var modifier = tweet.user.screen_name;
			var modified = new Date(tweet.created_at);
			var tags = ["tweet"];
			var body = "tweet: "+text+"\nfrom: "+location+"\nby: ''"+modifier+"''\nat: "+modified;
			store.saveTiddler(tweet.id.toString(),tweet.id.toString(),body,modifier,modified,tags);
			displayMessage("match!: "+tweet.text);
		} else
			displayMessage("no match: "+tweet.text);
	}
};

TiddlyCity.LocationToTiddler = function(locations) {
	console.log('in LocationToTiddler');
	console.log(locations);		
};

} //# end of 'install only once'
//}}}