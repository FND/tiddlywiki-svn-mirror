(function(module, $) {

var _store, _getAdaptor;
var esync = config.macros.esync;

var putTiddler = function(tiddler, context, userParams, callback) {
	context.title = tiddler.title;
	context.status = true;
	context.tiddlerData = {
		fields: {
			"server.page.revision": "19"
		}
	};
	callback(context, userParams);
};

module("push tasks", {
	setup: function() {
		_store = store;
		store = new TiddlyWiki();

		_getAdaptor = Tiddler.prototype.getAdaptor;
		Tiddler.prototype.getAdaptor = function() {
			return { putTiddler: putTiddler };
		};
	},
	teardown: function() {
		store = _store;
		Tiddler.prototype.getAdaptor = _getAdaptor;
	}
});

test("push: merge response data", function() {
	var localTiddler, updatedTiddler;

	localTiddler = new Tiddler("Foo");
	localTiddler.fields = {
		foo: "lorem ipsum",
		"server.page.revision": "18"
	};
	localTiddler = store.saveTiddler(localTiddler);

	esync.push(localTiddler, function(tiddler, status, msg) {
		updatedTiddler = tiddler;
	});
	strictEqual(updatedTiddler.fields["server.page.revision"], "19");
	strictEqual(updatedTiddler.fields.foo, "lorem ipsum");
});

test("push: put vs. move", function() {
	var tiddler, funcName;

	var putTiddler = function() {
		funcName = "putTiddler";
	};
	var moveTiddler = function() {
		funcName = "moveTiddler";
	};
	Tiddler.prototype.getAdaptor = function() {
		return { putTiddler: putTiddler, moveTiddler: moveTiddler };
	};

	tiddler = new Tiddler("Foo");
	esync.push(tiddler, function() {});

	strictEqual(funcName, "putTiddler");

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.title"] = "Bar";
	esync.push(tiddler, function() {});

	strictEqual(funcName, "moveTiddler");

	tiddler = new Tiddler("Bar");
	tiddler.fields["server.title"] = "Bar";
	esync.push(tiddler, function() {});

	strictEqual(funcName, "putTiddler");
});

test("push: local conflicts", function() {
	var tiddler, responseStatus;

	// hijack putTiddler to simulate store modification between request and response
	var putTiddlerWrapper = function(tiddler, context, userParams, callback) {
		store.removeTiddler(tiddler.title);
		putTiddler.apply(this, arguments);
	};
	Tiddler.prototype.getAdaptor = function() {
		return { putTiddler: putTiddlerWrapper };
	};

	tiddler = new Tiddler("Foo");
	tiddler = store.saveTiddler(tiddler);

	esync.push(tiddler, function(tiddler, status, msg) {
		responseStatus = status;
	});
	strictEqual(responseStatus[0], "remoteSuccess");
	strictEqual(responseStatus[1], "localError");
});

})(QUnit.module, jQuery);
