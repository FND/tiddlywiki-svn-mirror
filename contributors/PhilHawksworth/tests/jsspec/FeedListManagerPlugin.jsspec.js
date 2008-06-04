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
	'A new FeedListManager should include an busy property of false': function() {
		var flm = new FeedListManager();
		value_of(flm.busy == false).should_be_true();
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

describe('FeedListManagerPlugin : querying', {

	before_each: function(){
		flm = new FeedListManager();
		flm.add("http://www.uri1.com", 'sample uri 1', "rss");
		flm.add("http://www.uri2.com", 'sample uri 2', "rss");
		flm.add("http://www.uri3.com", 'sample uri 3', "rss");
	},

	'getUriObjByName() returns null if the named item is not found' : function() {
		var uri = flm.getUriObjByName('dudd name');
		value_of(uri).should_be_null();
	},

	'getUriObjByName() returns the correct uri object from the list' : function() {
		var u = flm.getUriObjByName('sample uri 2');
		value_of(u.uri).should_be("http://www.uri2.com");
	},

	'Prioritise(name) does nothing if if the named item is not found  ' : function() {
		var u = flm.prioritise('dudd name');
		var firstItemName = flm.uris[0].name;
		value_of(firstItemName).should_be('sample uri 1');
	},

	'Prioritise(name) send the named uri object to the start of the list  ' : function() {
		var u = flm.prioritise('sample uri 2');
		var firstItemName = flm.uris[0].name;
		value_of(firstItemName).should_be('sample uri 2');
	}


});


// ]]>
