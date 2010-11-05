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

test("getCandidates", function() {
	var candidates, tiddler;

	candidates = esync.getCandidates();
	strictEqual(candidates.length, 0);

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.type"] = "foo";
	tiddler.fields["server.host"] = "http://example.org";
	store.saveTiddler(tiddler);

	tiddler = new Tiddler("Bar");
	store.saveTiddler(tiddler);

	tiddler = new Tiddler("Baz");
	tiddler.fields["server.type"] = "foo";
	tiddler.fields["server.host"] = "http://example.org";
	store.saveTiddler(tiddler);

	candidates = esync.getCandidates();
	strictEqual(candidates.length, 2);

	candidates = esync.getCandidates([tiddler]);
	strictEqual(candidates.length, 1);
});

})(QUnit.module, jQuery);
