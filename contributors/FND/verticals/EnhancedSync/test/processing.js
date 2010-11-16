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
		callbackData = null;
	},
	teardown: function() {
		esync.push = _push;
		esync.pull = _pull;
	}
});

test("dispatchTasks", function() {
	var tasks = [
		{ type: "push", tiddler: new Tiddler("Foo") },
		{ type: "pull", tiddler: new Tiddler("Bar") },
		{ type: "conflict", tiddler: new Tiddler("Baz") }
	];

	var counter = 0;
	esync.dispatchTasks(tasks, function(successes, errors) {
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

test("dispatchTasks: push before pull", function() {
	var tasks = [
		{ type: "pull", tiddler: new Tiddler("Foo") },
		{ type: "push", tiddler: new Tiddler("Bar") },
		{ type: "pull", tiddler: new Tiddler("Baz") },
		{ type: "push", tiddler: new Tiddler("Qux") }
	];

	esync.dispatchTasks(tasks, function(successes, errors) {
		callbackData = { successes: successes, errors: errors };
	});
	strictEqual(callbackData.successes.length, 4);
	strictEqual(callbackData.successes[0].tiddler.title, "Bar");
	strictEqual(callbackData.successes[1].tiddler.title, "Qux");
	strictEqual(callbackData.successes[2].tiddler.title, "Foo");
	strictEqual(callbackData.successes[3].tiddler.title, "Baz");
});

})(QUnit.module, jQuery);
