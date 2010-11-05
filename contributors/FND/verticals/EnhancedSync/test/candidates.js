(function(module, $) {

var _store;
var esync = config.macros.esync;

module("sync'able tiddlers", {
	setup: function() {
		_store = store;
		store = new TiddlyWiki();
	},
	teardown: function() {
		store = _store;
	}
});

test("getLocalChanges", function() {
	var localChanges, tiddler;
	var tiddlers = [];

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.type"] = "foo";
	tiddler.fields["server.host"] = "http://example.org";
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Bar");
	tiddler.fields.changecount = "2";
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Baz");
	tiddler.fields["server.type"] = "foo";
	tiddler.fields["server.host"] = "http://example.org";
	tiddler.fields.changecount = "1";
	tiddlers.push(tiddler);

	localChanges = esync.getLocalChanges(tiddlers);
	strictEqual(localChanges.length, 2); // includes non-sync'able tiddler

	localChanges = esync.getLocalChanges();
	strictEqual(localChanges.length, 0);

	for(var i = 0; i < tiddlers.length; i++) {
		store.saveTiddler(tiddlers[i]);
	}

	localChanges = esync.getLocalChanges();
	strictEqual(localChanges.length, 1); // ignores non-sync'able tiddler
});

test("getCandidates", function() {
	var candidates, tiddler;
	var tiddlers = [];

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.type"] = "foo";
	tiddler.fields["server.host"] = "http://example.org";
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Bar");
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Baz");
	tiddler.fields["server.type"] = "baz";
	tiddler.fields["server.host"] = "http://example.com";
	tiddlers.push(tiddler);

	candidates = esync.getCandidates(tiddlers);
	strictEqual(candidates.length, 2);

	candidates = esync.getCandidates();
	strictEqual(candidates.length, 0);

	for(var i = 0; i < tiddlers.length; i++) {
		store.saveTiddler(tiddlers[i]);
	}

	candidates = esync.getCandidates();
	strictEqual(candidates.length, 2);
});

test("isSyncable", function() { // XXX: indirect due to private method
	var candidates, tiddler;

	candidates = esync.getCandidates([]);
	strictEqual(candidates.length, 0);

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.type"] = "foo";
	tiddler.fields["server.host"] = "http://example.org";

	candidates = esync.getCandidates([tiddler]);
	strictEqual(candidates.length, 1);

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.host"] = "http://example.org";

	candidates = esync.getCandidates([tiddler]);
	strictEqual(candidates.length, 0);

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.type"] = "foo";

	candidates = esync.getCandidates([tiddler]);
	strictEqual(candidates.length, 0);

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.type"] = "foo";
	tiddler.fields["server.host"] = "http://example.org";
	tiddler.fields.doNotSave = true;

	candidates = esync.getCandidates([tiddler]);
	strictEqual(candidates.length, 0);
});

})(QUnit.module, jQuery);
