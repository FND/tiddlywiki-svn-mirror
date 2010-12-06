(function(module, $) {

var _store, _getAdaptor, requestData;
var esync = config.macros.esync;

var getTiddler = function(title, context, userParams, callback) {
	requestData = { title: title };
	context.status = true;
	context.title = title;
	callback(context, userParams);
};

module("diverging titles", {
	setup: function() {
		_store = store;
		store = new TiddlyWiki();

		_getAdaptor = Tiddler.prototype.getAdaptor;
		Tiddler.prototype.getAdaptor = function() {
			return { getTiddler: getTiddler };
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

})(QUnit.module, jQuery);
