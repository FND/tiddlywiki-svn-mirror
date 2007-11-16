/******************
 * TLWTestingMacro *
 ******************/

/***
|''Name''|RippleRapTestingMacro|
|''Author''|JayFresh|
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]]|
|''Version''|1|
|''~CoreVersion''|2.2.5|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddleleweb/plugins/RippleRapTestingMacro.js|
|''Description''|Test functions for RippleRap|
|''Syntax''|<<TWLTesting>>|
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
***/
//{{{
config.macros.RippleRapTesting = {};

config.macros.RippleRapTesting.handler = function(place) {
	var p = new PushAndPull();
	var postBox = "http://localhost/"+encodeURIComponent(config.options.txtUserName)+"/";
	p.setPostBox(postBox);
	// testing p.putFeeds()
	wikify("testing p.putFeeds()\n",place);
	var item = Collection.getNext();
	if (!item) {
		wikify("nothing in the queue! do some editing and re-open this tiddler",place);
		return false;
	}
	wikify("item to push: " + item.title + "\n",place);
	var rssString = item.saveToRss();
	wikify("rss string to push: " + rssString + "\n",place);
	var params = {
		callback:function(status,params,responseText,url,xhr){
			if(!status){
				// PUT failed, deal with it here
				// leave item in queue and take no action?
				displayMessage("directory might not exist on the server at: " + url);
			}
			else {
				// PUT is successful, take item out of queue
				Collection.pop(params.tiddler);
				var next = Collection.getNext();
				displayMessage("success putting item: " + params.tiddler.title);
				displayMessage("next item in queue after popping this: " + (next ? next.title : "nothing!") + "\n");
			}
		},
		tiddler:item
	};
	var url = postBox + encodeURIComponent(item.title) + ".xml";
	wikify("going to put to: " + url + "\n",place);
	DAV.putAndMove(url,params,rssString);
};
//}}}