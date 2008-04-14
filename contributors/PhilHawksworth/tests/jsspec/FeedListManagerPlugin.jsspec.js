// <![CDATA[
describe('New FeedListManager creation', {
	'Creating a new FeedListManager should yield an object' : function() {
		var flm = new FeedListManager();
		var t = typeof flm;
		value_of(t).should_be('object');
	},
	'A new FeedListManager should include uris': function() {
		var flm = new FeedListManager();
		value_of(flm).should_include("uris");
	},
	'A new FeedListManager should include a currentPosition of 0': function() {
		var flm = new FeedListManager();
		value_of(flm.currentPosition == 0).should_be_true();
	},
	'A new FeedListManager should include a lastIncrement of null': function() {
		var flm = new FeedListManager();
		value_of(flm.lastIncrement == null).should_be_true();
	},
	'A new FeedListManager should include an updating property of false': function() {
		var flm = new FeedListManager();
		value_of(flm.updating == false).should_be_true();
	},
	'A new FeedListManager should include an empty requests array': function() {
		var flm = new FeedListManager();
		value_of(flm.requests).should_be_empty();
	},
	'A new FeedListManager should have a count function' : function() {
		var flm = new FeedListManager();
		var t = typeof flm.count;
		value_of(t).should_be('function');
	},
	'A new FeedListManager should have a uri count of 0': function() {
		var flm = new FeedListManager();
		var c = flm.count();
		value_of(c).should_be(0);
	}
	
});


describe('Information about a FeedListManager', {
	'Count provides the number of URIs managed': function() {
		var flm = new FeedListManager();
		flm.add("http://www.uri.com", 'sample uri', "rss");
		var l1 = flm.count();
		value_of(l1).should_be(1);
	}
});


describe('Manipulating a FeedListManager', {
	'Adding a URI to a feedlist should increase its count by 1': function() {
		var flm = new FeedListManager();
		var l1 = flm.count();
		flm.add("http://www.uri.com", 'sample uri', "rss");
		var l2 = flm.count();
		value_of(l2-l1).should_be(1);
	},
	'Removing a URI from a feedlist should decrease its count by 1': function() {
		var flm = new FeedListManager();
		flm.add("http://www.uri.com", 'sample uri', "rss");
		var l1 = flm.count();
		flm.remove("http://www.uri.com");
		var l2 = flm.count();
		value_of(l1-l2).should_be(1);
	},
	'purge() empties a FeedListManager': function() {
		var flm = new FeedListManager();
		flm.add("http://www.uri.com", 'sample uri', "rss");
		flm.purge();
		var l = flm.count();
		value_of(l).should_be(0);
	}
});


// ]]>
