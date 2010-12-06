(function(module, $) {

var _store, _getAdaptor;
var esync = config.macros.esync;

var putTiddler = function(tiddler, context, userParams, callback) {
	context.status = true;
	context.title = tiddler.title;
	context.tiddlerData = {
		fields: {
			"server.page.revision": "19"
		}
	};
	callback(context, userParams);
};

var deleteTiddler = function(tiddler, context, userParams, callback) {
	context.status = true;
	callback(context, userParams);
};

module("push tasks", {
	setup: function() {
		_store = store;
		store = new TiddlyWiki();

		_getAdaptor = Tiddler.prototype.getAdaptor;
		Tiddler.prototype.getAdaptor = function() {
			return { putTiddler: putTiddler, deleteTiddler: deleteTiddler };
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

test("push: deletion", function() {
	var localTiddler, updatedTiddler;

	localTiddler = new Tiddler("Foo");
	localTiddler.fields.deleted = "true";
	localTiddler = store.saveTiddler(localTiddler);

	esync.push(localTiddler, function(tiddler, status, msg) {
		updatedTiddler = tiddler;
	});
	strictEqual(updatedTiddler, localTiddler);
	strictEqual(store.getTiddler("Foo"), null);
});

test("push: put vs. move vs. delete", function() {
	var tiddler, funcName;

	var putTiddler = function() {
		funcName = "putTiddler";
	};
	var deleteTiddler = function() {
		funcName = "deleteTiddler";
	};
	var moveTiddler = function() {
		funcName = "moveTiddler";
	};
	Tiddler.prototype.getAdaptor = function() {
		return {
			putTiddler: putTiddler,
			deleteTiddler: deleteTiddler,
			moveTiddler: moveTiddler
		};
	};

	tiddler = new Tiddler("Foo");
	esync.push(tiddler, $.noop);

	strictEqual(funcName, "putTiddler");

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.title"] = "Bar";
	esync.push(tiddler, $.noop);

	strictEqual(funcName, "moveTiddler");

	tiddler = new Tiddler("Bar");
	tiddler.fields["server.title"] = "Bar";
	esync.push(tiddler, $.noop);

	strictEqual(funcName, "putTiddler");

	tiddler = new Tiddler("Baz");
	tiddler.fields.deleted = "true";
	esync.push(tiddler, $.noop);

	strictEqual(funcName, "deleteTiddler");
});

test("push: changecount retention", function() {
	var localTiddler, updatedTiddler, beforePut;

	// hijack putTiddler to simulate store modification between request and response
	var putTiddlerWrapper = function(tiddler, context, userParams, callback) {
		beforePut(tiddler);
		putTiddler.apply(this, arguments);
	};
	Tiddler.prototype.getAdaptor = function() {
		return { putTiddler: putTiddlerWrapper };
	};

	beforePut = $.noop;
	localTiddler = new Tiddler("Foo");
	localTiddler.fields.changecount = "5";
	localTiddler = store.saveTiddler(localTiddler);

	esync.push(localTiddler, function(tiddler, status, msg) {
		updatedTiddler = tiddler;
	});
	strictEqual(updatedTiddler.fields.changecount, undefined);

	beforePut = function(tiddler) {
		tiddler = store.getTiddler(tiddler.title);
		tiddler.fields.changecount = "7";
	};
	localTiddler = new Tiddler("Bar");
	localTiddler.fields.changecount = "3";
	localTiddler = store.saveTiddler(localTiddler);

	esync.push(localTiddler, function(tiddler, status, msg) {
		updatedTiddler = tiddler;
	});
	strictEqual(updatedTiddler.fields.changecount, "4");
});

test("push: local conflicts", function() {
	var tiddler, responseStatus, beforePut;

	// hijack putTiddler to simulate store modification between request and response
	var putTiddlerWrapper = function(tiddler, context, userParams, callback) {
		beforePut(tiddler);
		putTiddler.apply(this, arguments);
	};
	Tiddler.prototype.getAdaptor = function() {
		return { putTiddler: putTiddlerWrapper };
	};

	beforePut = function(tiddler) {
		tiddler = store.getTiddler(tiddler.title);
		tiddler.fields._syncID = "...";
	};
	tiddler = new Tiddler("Foo");
	tiddler = store.saveTiddler(tiddler);

	esync.push(tiddler, function(tiddler, status, msg) {
		responseStatus = status;
	});
	strictEqual(responseStatus[0], "remoteSuccess");
	strictEqual(responseStatus[1], "localError");

	beforePut = function(tiddler) {
		tiddler = store.getTiddler(tiddler.title);
		delete tiddler.fields._syncID;
	};
	tiddler = new Tiddler("Bar");
	tiddler = store.saveTiddler(tiddler);

	esync.push(tiddler, function(tiddler, status, msg) {
		responseStatus = status;
	});
	strictEqual(responseStatus[0], "remoteSuccess");
	strictEqual(responseStatus[1], "localError");

	beforePut = function(tiddler) {
		store.deleteTiddler(tiddler.title);
	};
	tiddler = new Tiddler("Baz");
	tiddler = store.saveTiddler(tiddler);

	esync.push(tiddler, function(tiddler, status, msg) {
		responseStatus = status;
	});
	strictEqual(responseStatus[0], "remoteSuccess");
	strictEqual(responseStatus[1], "localError");
});

test("push: remote status", function() {
	var tiddler, responseStatus, httpStatus;

	tiddler = new Tiddler("Foo");
	tiddler = store.saveTiddler(tiddler);

	esync.push(tiddler, function(tiddler, status, msg) {
		responseStatus = status;
	});
	strictEqual(responseStatus[0], "remoteSuccess");
	strictEqual(responseStatus[1], "localSuccess");

	var putTiddler = function(tiddler, context, userParams, callback) {
		context.title = tiddler.title;
		context.status = false;
		context.httpStatus = httpStatus;
		callback(context, userParams);
	};
	Tiddler.prototype.getAdaptor = function() {
		return { putTiddler: putTiddler };
	};

	var cases = {
		400: "remoteError",
		401: "remoteDenied",
		403: "remoteDenied",
		404: "remoteMissing",
		409: "remoteConflict",
		412: "remoteConflict",
		500: "remoteError"
	};
	$.each(cases, function(code, message) {
		httpStatus = parseInt(code, 10);
		esync.push(tiddler, function(tiddler, status, msg) {
			responseStatus = status;
		});
		strictEqual(responseStatus[0], message);
		strictEqual(responseStatus[1], "localSuccess");
	});
});

})(QUnit.module, jQuery);
