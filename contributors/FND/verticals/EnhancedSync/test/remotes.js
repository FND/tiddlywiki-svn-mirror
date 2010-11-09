(function(module, $) {

var _getAdaptor;
var esync = config.macros.esync;

module("remote changes", {
	setup: function() {
		_getAdaptor = Tiddler.prototype.getAdaptor;
		Tiddler.prototype.getAdaptor = function() {
			return {
				getTiddlerList: function(context, userParams, callback) {
					context.status = true;
					context.tiddlers = [];
					callback(context, userParams);
				}
			};
		};
	},
	teardown: function() {
		Tiddler.prototype.getAdaptor = _getAdaptor;
	}
});

test("getRemoteChanges: origins", function() {
	var tiddler, tasks;

	var origins = {
		"tiddlyweb": {
			"example.org": {
				"default": []
			},
			"example.com": {
				"north": [],
				"south": []
			}
		},
		"cctiddly": {
			"example.com": {
				"default": []
			}
		}
	};

	tiddler = new Tiddler("Foo");
	tiddler.fields.changecount = "1";
	origins["tiddlyweb"]["example.org"]["default"].push(tiddler);

	tiddler = new Tiddler("Bar");
	tiddler.fields.changecount = "2";
	origins["tiddlyweb"]["example.com"]["north"].push(tiddler);

	tiddler = new Tiddler("Baz");
	tiddler.fields.changecount = "3";
	origins["tiddlyweb"]["example.com"]["south"].push(tiddler);

	tiddler = new Tiddler("Qux");
	tiddler.fields.changecount = "4";
	origins["cctiddly"]["example.com"]["default"].push(tiddler);

	esync.getRemoteChanges(origins, function(taskList) {
		// NB: This function is actually called multiple times since we're not
		//     simulating async delays. The eventual result is correct though.
		tasks = taskList;
	});
	strictEqual(tasks.length, 4);
	strictEqual(tasks[tasks.length - 1].tiddler, tiddler);
});

test("getRemoteChanges: tasks", function() {
	var tiddler, tasks;

	var getTiddlerList = function(context, userParams, callback) {
		context.status = true;
		context.tiddlers = [];
		var tiddler;

		tiddler = new Tiddler("Bar");
		tiddler.fields["server.page.revision"] = "17";
		context.tiddlers.push(tiddler);

		tiddler = new Tiddler("Baz");
		tiddler.fields["server.page.revision"] = "32";
		context.tiddlers.push(tiddler);

		callback(context, userParams);
	};
	Tiddler.prototype.getAdaptor = function() {
		return { getTiddlerList: getTiddlerList };
	};

	var origins = {
		"tiddlyweb": {
			"example.org": {
				"default": []
			}
		}
	};
	var tiddlers = origins["tiddlyweb"]["example.org"]["default"];

	tiddler = new Tiddler("Foo");
	tiddler.fields.changecount = "3";
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Bar");
	tiddler.fields["server.page.revision"] = "13";
	tiddlers.push(tiddler);

	tiddler = new Tiddler("Baz");
	tiddler.fields.changecount = "1";
	tiddler.fields["server.page.revision"] = "24";
	tiddlers.push(tiddler);

	esync.getRemoteChanges(origins, function(taskList) {
		tasks = taskList;
	});
	strictEqual(tasks.length, 3);
	strictEqual(tasks[0].type, "push");
	strictEqual(tasks[1].type, "pull");
	strictEqual(tasks[2].type, "conflict");
});

})(QUnit.module, jQuery);
