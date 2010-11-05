(function(module, $) {

var esync = config.macros.esync;

var callbackData;
var callback = function() {
	callbackData = arguments;
};

module("sync tasks", {
	setup: function() {
		callbackData = null;
	},
	teardown: function() {
	}
});

test("gatherTasks: push only", function() {
	var tiddler, tasks;
	var tiddlers = [];

	tiddler = new Tiddler("Foo");
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Bar");
	tiddlers.push(tiddler);

	esync.gatherTasks(tiddlers, true, callback);
	tasks = callbackData[0];
	strictEqual(tasks.length, 2);
	strictEqual(tasks[0].type, "push");
	strictEqual(tasks[0].tiddler, tiddlers[0]);
});

})(QUnit.module, jQuery);
