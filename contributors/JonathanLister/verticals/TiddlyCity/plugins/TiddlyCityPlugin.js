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
	var l_regexp = / [lL]:([^$]+)/;
	for(var i=0; i<tweets.length; i++) {
		var tweet = tweets[i];
		var match = l_regexp.exec(tweet.text);
		if(match) {
			displayMessage("match!: "+tweet.text);
			var location = match[1];
			var context = {};
			var l = new GoogleLocalSearch(location,context);
			context.title = tweet.id.toString();
			context.text = tweet.text.slice(0,match.index);
			context.modifier = tweet.user.screen_name;
			context.modified = new Date(tweet.created_at);
			context.tags = ["tweet"];
			context.body = "tweet: "+context.text+"\nfrom: "+location+"\nby: ''"+context.modifier+"''\nat: "+context.modified;
			l.get(TiddlyCity.LocationToTiddler);
		} else {
			displayMessage("no match: "+tweet.text);
		}
	}
};

TiddlyCity.saveTiddlerFromContext = function(context) {
	store.saveTiddler(context.title,context.title,context.body,context.modifier,context.modified,context.tags,context.fields);
};

TiddlyCity.LocationToTiddler = function(locations,context) {
	// just use the first result in the array assuming that it's the best match
	var location = locations[0];
	context.fields = {};
	context.fields.streetAddress = location.streetAddress;
	context.fields.city = location.city;
	context.fields.country = location.country;
	context.fields.lat = location.lat;
	context.fields.lng = location.lng;
	console.log(context);
	TiddlyCity.saveTiddlerFromContext(context);
};

} //# end of 'install only once'
//}}}