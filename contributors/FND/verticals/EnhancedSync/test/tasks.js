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

test("generateTasks", function() {
	var tiddler, tasks;
	var locals = [];
	var remotes = [];

	tasks = esync.generateTasks(locals, remotes);
	strictEqual(tasks.length, 0);

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.page.revision"] = "17";
	locals.push(tiddler);

	tasks = esync.generateTasks(locals, remotes);
	strictEqual(tasks.length, 1, "push new local tiddler");
	strictEqual(tasks[0].type, "push");

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.page.revision"] = "17";
	remotes.push(tiddler);

	tasks = esync.generateTasks(locals, remotes);
	strictEqual(tasks.length, 0, "ignore identical tiddlers");

	tiddler = new Tiddler("Bar");
	tiddler.fields["server.page.revision"] = "3";
	remotes.push(tiddler);

	tasks = esync.generateTasks(locals, remotes);
	strictEqual(tasks.length, 1, "pull new remote tiddler");
	strictEqual(tasks[0].type, "pull");

	tiddler = new Tiddler("Bar");
	tiddler.fields["server.page.revision"] = "2";
	locals.push(tiddler);

	tasks = esync.generateTasks(locals, remotes);
	strictEqual(tasks.length, 1, "pull modified remote tiddler");
	strictEqual(tasks[0].type, "pull");

	tiddler = locals[locals.length - 1];
	tiddler.fields["server.page.revision"] = "3";
	tiddler.fields.changecount = "1";

	tasks = esync.generateTasks(locals, remotes);
	strictEqual(tasks.length, 1, "push modified local tiddler");
	strictEqual(tasks[0].type, "push");

	tiddler = locals[locals.length - 1];
	tiddler.fields["server.page.revision"] = "2";
	tiddler.fields.changecount = "1";

	tasks = esync.generateTasks(locals, remotes);
	strictEqual(tasks.length, 1, "conflict due to modifications both local and remote");
	strictEqual(tasks[0].type, "conflict");
});

})(QUnit.module, jQuery);
