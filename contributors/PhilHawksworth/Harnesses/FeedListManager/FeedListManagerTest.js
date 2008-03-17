/***
|''Name:''|FeedListManagerTest|
|''Description:''|A test harness for the FeedListManagerPLugin|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/Harnesses/FeedListManagerTest.js |
|''Version:''|0.1|
|''Date:''|Mar 03, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|
***/

//{{{
	
var outputTiddler = 'TestOutput';
var flm = null;

function TestHarnessOutput(x) {
	var t = store.getTiddler(outputTiddler);
	t.text += x + '\n';
	if(window.console)
		console.log(x);
};


function feedListManagerTest_init() {
	TestHarnessOutput("~FeedListManager init");
	flm = new FeedListManager();
	TestHarnessOutput(flm);	
};


function feedListManagerTest_addFeed() {
	TestHarnessOutput("adding url...");
	flm.add("http://www.1.com");
	TestHarnessOutput("url count:" + flm.count());
	TestHarnessOutput(flm);
	
	TestHarnessOutput("adding url...");
	flm.add("http://www.2.com");
	TestHarnessOutput("url count:" + flm.count());
	TestHarnessOutput(flm);
	
	TestHarnessOutput("attempting to add a dupe url...");
	flm.add("http://www.1.com");
	TestHarnessOutput("url count:" + flm.count());
	TestHarnessOutput(flm);
};


function feedListManagerTest_removeFeed() {
	TestHarnessOutput("removing url...");
	flm.remove("http://www.2.com");
	TestHarnessOutput(flm);
	TestHarnessOutput("url count:" + flm.count());
	
	TestHarnessOutput("removing non existent url...");
	flm.remove("http://www.neverregistered.com");
	TestHarnessOutput(flm);
	TestHarnessOutput("url count:" + flm.count());
};


feedListManagerTest_init();
feedListManagerTest_addFeed();
feedListManagerTest_removeFeed();

//}}}