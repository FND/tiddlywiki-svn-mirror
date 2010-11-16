(function(module, $) {

var _getAdaptor;
var esync = config.macros.esync;

var putTiddler = function(tiddler, context, userParams, callback) {
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
		_getAdaptor = Tiddler.prototype.getAdaptor;
		Tiddler.prototype.getAdaptor = function() {
			return { putTiddler: putTiddler };
		};
	},
	teardown: function() {
		Tiddler.prototype.getAdaptor = _getAdaptor;
	}
});

test("push: merge response data", function() {
	var localTiddler, updatedTiddler;

	localTiddler = new Tiddler("Foo");

	esync.push(localTiddler, function(tiddler, status, msg) {
		updatedTiddler = tiddler;
	});

	strictEqual(updatedTiddler.fields["server.page.revision"], "19");
});

})(QUnit.module, jQuery);
