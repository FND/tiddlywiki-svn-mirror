/******************
 * TLWTestingMacro *
 ******************/

/***
|''Name''|RippleRapTestingMacro|
|''Author''|JayFresh|
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]]|
|''Version''|1|
|''~CoreVersion''|2.2.5|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/RippleRapTestingMacro.js|
|''Description''|Test functions for RippleRap|
|''Syntax''|<<TWLTesting>>|
|''Status''|@@experimental@@|
|''Contributors''||
|''Contact''|jon at osmosoft dot com|
|''Comments''|please post to http://groups.google.com/TiddlyWikiDev|
|''Dependencies''|CollectionPlugin,PushAndPullPlugin,DAVPlugin|
|''Browser''||
|''ReleaseDate''||
|''Icon''||
|''Screenshot''||
|''Tags''||
|''CodeRepository''|see Source above|

! Background

The "RippleRap" project is a fairly complex set of interwoven plugins and involves a good deal of asynchronous file transfer. The RippleRapTestingMacro was created as part of that project to allow us to test various end-to-end user journeys automatically after every build. This draws from Agile development principles and their concept of "Unit Tests", which allow a development team to keep track of whether their changes "break the build".

! Re-use guidelines

The RippleRapTestingMacro is dependent on all the elements of the RippleRap project, so re-using this macro in a different TiddlyWiki is only going to validate that those elements work together with a WebDAV server, which is not necessarily useless.

***/
//{{{
config.macros.RippleRapTesting = {};

config.macros.RippleRapTesting.handler = function(place) {
/*	var p = new PushAndPull();
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
*/
	createTiddlyText(place,"running in test mode...");
	var t = new Timer();
	var p = new PushAndPull();
	// TO-DO: figure out a sensible	way to gather feeds
	// p.setFeeds(feedArray);
	// p.setAdminFeed(config.options.txtPollAdminFeed);
	p.setPostBox("http://garden.dachary.org/"+config.options.txtUserName+"/");
	t.setAction(function() {
		clearMessage();
		displayMessage("polling");
		// p.getFeeds();
		p.putFeeds();
	},true);
	t.set(8000);
};
config.macros.RSSTest = {};

config.macros.RSSTest.handler = function(place) {
	createTiddlyButton(place,"Grab feed","grab feed",config.macros.RSSTest.onClick);
};

config.macros.RSSTest.onClick = function() {
	var p = new PushAndPull();
	p.setAdminFeed(config.options.txtPollAdminFeed);
	p.getFeeds();
};
//}}}