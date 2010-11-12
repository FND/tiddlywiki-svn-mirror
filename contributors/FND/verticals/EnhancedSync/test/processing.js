(function(module, $) {

var _push, _pull;
var esync = config.macros.esync;

var callbackData;

module("task processing", {
	setup: function() {
		_push = esync.push;
		_pull = esync.pull;
		esync.push = esync.pull = function(tiddler, callback) {
			callback(tiddler, ["remoteSuccess", "localSuccess"]);
		};
	},
	teardown: function() {
		esync.push = _push;
		esync.pull = _pull;
	}
});

test("processTasks", function() {
	var tasks = [
		{ type: "push", tiddler: new Tiddler("Foo") },
		{ type: "pull", tiddler: new Tiddler("Bar") },
		{ type: "conflict", tiddler: new Tiddler("Baz") }
	];

	var counter = 0;
	esync.processTasks(tasks, function(successes, errors) {
		counter++;
		callbackData = { successes: successes, errors: errors };
	});
	strictEqual(counter, 1);
	strictEqual(callbackData.successes.length, 2);
	strictEqual(callbackData.successes[0].tiddler.title, "Foo");
	strictEqual(callbackData.successes[1].tiddler.title, "Bar");
	strictEqual(callbackData.errors.length, 1);
	strictEqual(callbackData.errors[0].tiddler.title, "Baz");
});

})(QUnit.module, jQuery);
