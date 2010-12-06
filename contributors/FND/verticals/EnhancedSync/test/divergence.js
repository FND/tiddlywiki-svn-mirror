(function(module, $) {

var _store, _getAdaptor, requestData;
var esync = config.macros.esync;

var getTiddler = function(title, context, userParams, callback) {
	requestData = { title: title };
	context.status = true;
	context.title = title;
	callback(context, userParams);
};

var putTiddler = function(tiddler, context, userParams, callback) {
	requestData = { tiddler: $.extend(true, {}, tiddler) };
	context.status = true;
	context.title = tiddler.title;
	context.tiddlerData = {};
	callback(context, userParams);
};

module("diverging titles", {
	setup: function() {
		_store = store;
		store = new TiddlyWiki();

		_getAdaptor = Tiddler.prototype.getAdaptor;
		Tiddler.prototype.getAdaptor = function() {
			return { getTiddler: getTiddler, putTiddler: putTiddler };
		};

		requestData = null;
	},
	teardown: function() {
		store = _store;
		Tiddler.prototype.getAdaptor = _getAdaptor;
	}
});

test("pull: get", function() {
	var tiddler, responseData;

	tiddler = new Tiddler("Foo [local]");

	esync.pull(tiddler, function(tiddler, status, msg) {
		responseData = tiddler;
	});
	strictEqual(requestData.title, "Foo [local]");
	strictEqual(responseData.title, "Foo [local]");

	tiddler = new Tiddler("Bar [local]");
	tiddler.fields["server.page.id"] = "Bar";

	esync.pull(tiddler, function(tiddler, status, msg) {
		responseData = tiddler;
	});
	strictEqual(requestData.title, "Bar");
	strictEqual(responseData.title, "Bar [local]");
});

test("push: put", function() {
	var localTiddler, updatedTiddler, responseData;

	localTiddler = new Tiddler("Foo [local]");
	localTiddler.fields["server.page.id"] = "Foo";

	esync.push(localTiddler, function(tiddler, status, msg) {
		updatedTiddler = tiddler;
	});
	strictEqual(requestData.tiddler.title, "Foo");
	strictEqual(updatedTiddler.title, "Foo [local]");
});

})(QUnit.module, jQuery);
