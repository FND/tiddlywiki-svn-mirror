(function(module, $) {

var _getRemoteChanges;
var esync = config.macros.esync;

var callbackData, originData;
var callback = function() {
	callbackData = arguments;
};

module("sync tasks", {
	setup: function() {
		_getRemoteChanges = esync.getRemoteChanges;
		esync.getRemoteChanges = function(origins, callback) {
			originData = origins;
		};
		callbackData = null;
	},
	teardown: function() {
		esync.getRemoteChanges = _getRemoteChanges;
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

test("gatherTasks: origins", function() {
	var tiddler;
	var tiddlers = [];

	tiddler = new Tiddler("Foo");
	tiddler.fields["server.type"] = "tiddlyweb";
	tiddler.fields["server.host"] = "http://example.org";
	tiddler.fields["server.workspace"] = "default";
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Bar");
	tiddler.fields["server.type"] = "tiddlyweb";
	tiddler.fields["server.host"] = "http://example.com";
	tiddler.fields["server.workspace"] = "default";
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Baz");
	tiddler.fields["server.type"] = "tiddlyweb";
	tiddler.fields["server.host"] = "http://example.org/wiki/";
	tiddler.fields["server.workspace"] = "default";
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Alpha");
	tiddler.fields["server.type"] = "cctiddly";
	tiddler.fields["server.host"] = "http://example.org";
	tiddler.fields["server.workspace"] = "north";
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Bravo");
	tiddler.fields["server.type"] = "cctiddly";
	tiddler.fields["server.host"] = "http://example.org";
	tiddler.fields["server.workspace"] = "north";
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Charlie");
	tiddler.fields["server.type"] = "cctiddly";
	tiddler.fields["server.host"] = "http://example.org";
	tiddler.fields["server.workspace"] = "south";
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Delta");
	tiddler.fields["server.type"] = "mediawiki";
	tiddler.fields["server.host"] = "http://example.org";
	tiddler.fields["server.workspace"] = "default";
	tiddlers.push(tiddler);

	esync.gatherTasks(tiddlers, false, callback);
	strictEqual(originData["tiddlyweb"]["http://example.org"]["default"][0].title, "Foo");
	strictEqual(originData["tiddlyweb"]["http://example.com"]["default"][0].title, "Bar");
	strictEqual(originData["tiddlyweb"]["http://example.org/wiki/"]["default"][0].title, "Baz");
	strictEqual(originData["cctiddly"]["http://example.org"]["north"][0].title, "Alpha");
	strictEqual(originData["cctiddly"]["http://example.org"]["north"][1].title, "Bravo");
	strictEqual(originData["cctiddly"]["http://example.org"]["south"][0].title, "Charlie");
	strictEqual(originData["mediawiki"]["http://example.org"]["default"][0].title, "Delta");
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
