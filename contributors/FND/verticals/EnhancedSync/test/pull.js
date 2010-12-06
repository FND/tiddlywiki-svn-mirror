(function(module, $) {

var _store, _getAdaptor;
var esync = config.macros.esync;

var getTiddler = function(title, context, userParams, callback) {
	context.status = true;
	context.title = title;
	context.tiddler = new Tiddler(title);
	context.tiddler.tags = ["bar", "baz"];
	context.tiddler.fields = {
		"server.page.revision": "17",
		foo: "lipsum"
	};
	callback(context, userParams);
};

module("pull tasks", {
	setup: function() {
		_store = store;
		store = new TiddlyWiki();

		_getAdaptor = Tiddler.prototype.getAdaptor;
		Tiddler.prototype.getAdaptor = function() {
			return { getTiddler: getTiddler };
		};
	},
	teardown: function() {
		store = _store;
		Tiddler.prototype.getAdaptor = _getAdaptor;
	}
});

test("pull: store data", function() {
	var localTiddler, remoteTiddler, responseStatus;

	var tiddler = new Tiddler("Foo");

	localTiddler = store.getTiddler(tiddler.title);
	strictEqual(localTiddler, null);

	esync.pull(tiddler, function(tiddler, status, msg) {
		responseStatus = status;
		remoteTiddler = tiddler;
		localTiddler = store.getTiddler("Foo");
	});
	strictEqual(responseStatus[0], "remoteSuccess");
	strictEqual(responseStatus[1], "localSuccess");
	strictEqual(localTiddler, remoteTiddler);
	strictEqual(localTiddler.title, "Foo");
	strictEqual(localTiddler.tags[0], "bar");
	strictEqual(localTiddler.tags[1], "baz");
	strictEqual(localTiddler.fields.foo, "lipsum");
	strictEqual(localTiddler.fields["server.page.revision"], "17");
});

test("pull: local conflicts", function() {
	var tiddler, responseStatus, beforePull;

	// hijack getTiddler to simulate store modification between request and response
	var getTiddlerWrapper = function(title, context, userParams, callback) {
		beforePull(title);
		getTiddler.apply(this, arguments);
	};
	Tiddler.prototype.getAdaptor = function() {
		return { getTiddler: getTiddlerWrapper };
	};

	beforePull = function(title) {
		tiddler = store.getTiddler(title);
		tiddler.fields._syncID = "...";
	};
	tiddler = new Tiddler("Foo");
	tiddler = store.saveTiddler(tiddler);

	esync.pull(tiddler, function(tiddler, status, msg) {
		responseStatus = status;
	});
	strictEqual(responseStatus[0], "remoteSuccess");
	strictEqual(responseStatus[1], "localConflict");

	beforePull = function(title) {
		tiddler = store.getTiddler(title);
		delete tiddler.fields._syncID;
	};
	tiddler = new Tiddler("Bar");
	tiddler = store.saveTiddler(tiddler);

	esync.pull(tiddler, function(tiddler, status, msg) {
		responseStatus = status;
	});
	strictEqual(responseStatus[0], "remoteSuccess");
	strictEqual(responseStatus[1], "localConflict");

	beforePull = function(title) {
		store.deleteTiddler(title);
	};
	tiddler = new Tiddler("Baz");
	tiddler = store.saveTiddler(tiddler);

	esync.pull(tiddler, function(tiddler, status, msg) {
		responseStatus = status;
	});
	strictEqual(responseStatus[0], "remoteSuccess");
	strictEqual(responseStatus[1], "localSuccess");
});

})(QUnit.module, jQuery);
