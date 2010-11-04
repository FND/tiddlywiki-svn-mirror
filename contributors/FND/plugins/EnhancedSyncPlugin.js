/***
|''CoreVersion''|2.6.2|
!TODO
* encapsulate fields access (server.{host,workspace}; cf. getServerType)?
!Wizard
<div class="wizard">
	<h1></h1>
	<div class="wizardBody">
		<h2></h2>
		<div class="wizardStep"></div>
	</div>
	<div class="wizardFooter"></div>
</div>
!Table
<table>
	<thead>
		<th><input type="checkbox" /></th>
		<th>Tiddler</th>
		<th>Type</th>
		<th>Host</th>
		<th>Workspace</th>
		<th>Status</th>
	</thead>
	<tbody>
	<tbody>
</table>
!Row
<tr>
	<td><input type="checkbox" /></td>
	<td><a class="tiddlyLink" /> (<a href="%0">%1</a>)</td>
	<td>%2</td>
	<td><a href="%3">%4</a></td>
	<td>%5</td>
	<td class="%6">%7</td>
</tr>
!Code
***/
//{{{
(function($) {

var templates = { // TODO: proper (supplant-style) templating
	wizard: store.getTiddlerText(tiddler.title + "##Wizard"),
	table: store.getTiddlerText(tiddler.title + "##Table"),
	row: store.getTiddlerText(tiddler.title + "##Row")
};

var doc = $(document);

var macro = config.macros.esync = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var candidates = this.getCandidates(); // XXX: hides non-sync'able tiddlers, thus suppressing potential issues!?
		this.display(candidates, place);
	},

	display: function(tiddlers, place) { // XXX: should use sync tasks
		var btn = config.macros.sync.listViewTemplate.buttons[0];
		btn = createTiddlyButton(null, btn.name, btn.caption, this.onStart);
		var container = $(templates.wizard).appendTo(place). // required for styling compatibility
			find("h1").text(config.macros.sync.wizardTitle).end().
			find("h2").text(config.macros.sync.step1Title).end().
			find(".wizardFooter").append(btn).end().
			find(".wizardStep");
		tiddlers.sort(function(a, b) {
			a = "%0::%1::%2".format(a.fields["server.host"],
				a.fields["server.workspace"], a.title);
			b = "%0::%1::%2".format(b.fields["server.host"],
				b.fields["server.workspace"], b.title);
			return a < b ? -1 : (a == b ? 0 : +1);
		});
		var table = $(templates.table);
		for(var i = 0; i < tiddlers.length; i++) {
			var tiddler = tiddlers[i];
			var adaptor = tiddler.getAdaptor();
			var host = tiddler.fields["server.host"];
			var serverTitle = tiddler.fields["server.title"] || tiddler.title;
			var uri = adaptor.generateTiddlerInfo(tiddler).uri;
			var status = getSyncStatus(tiddler);
			status = config.macros.sync.syncStatusList[status]; // XXX: sync dependency
			var row = templates.row.format(uri, serverTitle,
				tiddler.getServerType(), adaptor.fullHostName(host), host,
				tiddler.fields["server.workspace"], status.className, status.text); // TODO: linkify workspace
			var link = createTiddlyLink(null, tiddler.title, true, null, null, tiddler);
			$(row).
				find(".tiddlyLink").replaceWith(link).end(). // XXX: hacky?
				appendTo(table);
		}

		var cbs = table.find("input[type=checkbox]");
		var globalcb = cbs.first();
		cbs = cbs.slice(1);
		globalcb.change(function(ev) { // TODO: use live?
			var checked = $(this).attr("checked");
			if(checked) {
				cbs.attr("checked", "checked");
			} else {
				cbs.removeAttr("checked");
			}
		});
		cbs.change(function(ev) { // TODO: use live?
			var checked = $(this).attr("checked");
			if(!checked) {
				globalcb.removeAttr("checked");
			}
		});

		table.appendTo(container);
		console.log(table);
	},
	onStart: function(ev) {
		// TODO: dispatch processTasks for selection
	},

	// start the sync process
	processTasks: function(tasks, callback) { // TODO: should trigger queue to avoid overlapping sync batches
		var pending = 0;
		doc.bind("sync", function(ev, data) {
			pending--;
			if(pending == 0) {
				callback(taskList);
			}
		});
		for(var i = 0; i < tasks.length; i++) {
			var task = tasks[i];
			pending++;
			switch(task.type) {
				case "push":
					this.push(task.tiddler);
					break;
				case "pull":
					this.pull(task.tiddler);
					break;
				case "conflict":
					doc.trigger("sync", { status: "conflict", tiddler: tiddler });
					break;
			}
		}
	},

	// generate a list of sync tasks
	// tiddlers argument is optional
	// callback is passed list of sync tasks with members type and tiddler
	// task.type is push, pull or conflict, push encapsulating all operations
	//   where local changes are to be sent to the server (excluding conflicts)
	gatherTasks: function(tiddlers, pushOnly, callback) { // XXX: bad API?
		if(pushOnly) {
			tiddlers = tiddlers || this.getLocalChanges();
			var tasks = $.map(tiddlers, function(tiddler, i) {
				return { type: "push", tiddler: tiddler };
			});
			callback(tasks);
		} else {
			tiddlers = tiddlers || this.getCandidates();
			var index = {};
			// construct dictionary of tiddlers per workspace per host per server type
			for(var i = 0; i < tiddlers.length; i++) {
				var tiddler = tiddlers[i];
				var type = tiddler.getServerType();
				var host = tiddler.fields["server.host"];
				var workspace = tiddler.fields["server.workspace"];
				index[type] = index[type] || {};
				index[type][host] = index[type][host] || {};
				index[type][host][workspace] = index[type][host][workspace] || [];
				index[type][host][workspace].push(tiddler);
			}
			this.getRemoteChanges(index, callback);
		}
	},

	// determine remote changes
	// index is a dictionary of tiddlers per workspace per host per server type
	// callback is passed a list of sync tasks
	getRemoteChanges: function(index, callback) { // XXX: misnamed (also takes into account local changes)
		var taskList = []; // XXX: rename
		var pending = 0;
		var observer = function(tasks) { // TODO: rename?
			pending--;
			taskList = taskList.concat(tasks);
			if(pending == 0) {
				callback(taskList);
			}
		};
		// determine remote changes for each workspace
		for(var type in index) {
			for(var host in index[type]) {
				$.each(index[type][host], function(i, workspace) { // XXX: dangerous (cf. JSLint)
					var tiddlers = index[type][host][workspace];
					var adaptor = tiddlers[0].getAdaptor();
					var context = {
						host: host,
						workspace: workspace
					};
					var _callback = function(context, userParams) {
						if(context.status) {
							var tasks = macro.generateTasks(tiddlers, context.tiddlers);
							observer(tasks);
						} else {
							// TODO: error handling
						}
					};
					pending++;
					var req = adaptor.getTiddlerList(context, null, _callback);
					// TODO: error handling (req might fail synchronously)
				});
			}
		}
	},
	// determine sync'able tiddlers with local changes
	// tiddlers argument is optional
	getLocalChanges: function(tiddlers) {
		tiddlers = tiddlers || this.getCandidates();
		return $.map(tiddlers, function(tiddler, i) {
			return tiddler.isTouched() ? tiddler : null;
		});
	},
	// determine sync'able tiddlers
	// tiddlers argument defaults to local store
	getCandidates: function(tiddlers) {
		tiddlers = tiddlers || store.getTiddlers(); // XXX: getTiddlers inefficient
		return $.map(tiddlers, function(tiddler, i) {
			return isSyncable(tiddler) ? tiddler : null;
		});
	},

	// generate sync tasks by comparing lists of tiddlers
	generateTasks: function(locals, remotes) {
		var cue = "server.page.revision"; // TODO: configurable by adaptor?
		var tasks = [];
		var i;
		for(i = 0; i < locals.length; i++) {
			var local = locals[i];
			var pos = remotes.findByField("title", local.title);
			if(pos) { // tiddler present both locally and remotely
				var remote = remotes.splice(pos, 1)[0];
				if(remote.fields[cue] != local.fields[cue]) {
					tasks.push({
						type: local.isTouched() ? "conflict" : "pull",
						tiddler: local
					});
				}
			} else { // local tiddler unknown remotely
				tasks.push({ type: "push", tiddler: local });
			}
		}
		for(i = 0; i < remotes.length; i++) { // tiddlers unknown locally
			tasks.push({ type: "pull", tiddler: remotes[i] });
		}
		return tasks;
	},

	// send an individual tiddler to the server
	// XXX: return contract?
	push: function(tiddler) {
		var env = env(tiddler);
		tiddler = setSyncID(tiddler, env);
		// create/update or move tiddler -- TODO: deletion support
		var serverTitle = tiddler.fields["server.title"];
		if(!serverTitle) {
			tiddler.fields["server.title"] = tiddler.title;
		} else if(tiddler.title != serverTitle) {
			return env.adaptor.moveTiddler({ title: serverTitle }, // XXX: moveTiddler signature is bad; should use tiddler objects
				{ title: tiddler.title }, env.context, env.cache,
				this.pushCallback);
		}
		return env.adaptor.putTiddler(tiddler, env.context, env.cache,
			this.pushCallback);
	},
	// expects context members title, httpStatus and statusText (if applicable),
	// plus optionally a tiddler-like tiddlerData object -- TODO: elaborate
	// triggers a "sync" event on document, providing status, message and tiddler -- TODO: elaborate
	pushCallback: function(context, userParams) {
		var tiddler = getSyncTiddler(context.title, userParams.syncID);
		var status, msg;
		if(context.status) {
			status = ["remoteSuccess"];
			if(tiddler) {
				delete tiddler.fields._syncID;
				resetChangeCount(tiddler, userParams.changecount);
				$.extend(true, tiddler, context.tiddlerData);
				tiddler = store.saveTiddler(tiddler);
			}
		} else {
			status = [determineStatus(context.httpStatus)];
			msg = context.statusText;
		}
		status.push(tiddler ? "localSuccess" : "localError");

		doc.trigger("sync", { status: status, message: msg, tiddler: tiddler });
	},
	// retrieve an individual tiddler from the server
	// XXX: return contract?
	pull: function(tiddler) {
		var env = env(tiddler);
		tiddler = setSyncID(tiddler, env);
		// TODO: support server.page.id for locally diverging titles?
		return env.adaptor.getTiddler(tiddler.title, env.context, env.chache,
			this.pullCallback);
	},
	pullCallback: function(context, userParams) {
		var tiddler = getSyncTiddler(context.title, userParams.syncID);
		var status, msg;
		if(context.status) {
			status = ["remoteSuccess"];
			if(!tiddler || tiddler.fields.changecount == userParams.changecount) {
				tiddler = store.saveTiddler(tiddler).clearChangeCount();
				status.push("localSuccess");
			} else {
				status.push("localConflict");
				msg = "tiddler modified locally during retrieval"; // XXX: phrasing, i18n
			}
		} else { // XXX: no local status!?
			status = [determineStatus(context.httpStatus)];
			msg = context.statusText;
		}
		doc.trigger("sync", { status: status, message: msg, tiddler: tiddler });
	}
};

var getSyncStatus = function(tiddler) { // XXX: unused!?
	if(!tiddler.isTouched()) {
		return "none";
	} else if(tiddler.fields["server.title"] &&
			tiddler.title != tiddler.fields["server.title"]) {
		return "renamedLocally"; // XXX: currently unsupported by TiddlyWiki
	} else if(tiddler.fields.deleted === "true" &&
			tiddler.fields.changecount == "1") {
		return "deletedLocally"; // XXX: currently unsupported by TiddlyWiki
	} else {
	// TODO: take into account moved (between workspaces, even hosts?), changed remotely
		return "changedLocally";
	}
};

var isSyncable = function(tiddler) { // TODO: elevate to Tiddler method?
	var type = tiddler.getServerType();
	var host = tiddler.fields["server.host"]; // XXX: might be empty string (falsey)!?
	return type && host && !tiddler.doNotSave();
};

// set sync ID on tiddler and in environment
var setSyncID = function(tiddler, env) {
	tiddler.fields._syncID = uid();
	tiddler = store.saveTiddler(tiddler);
	tiddler.fields.changecount = env.cache.changecount; // reset changecount due to saveTiddler
	env.cache.syncID = tiddler.fields._syncID;
	return tiddler;
};

// retrieve tiddler from store based on sync ID
// returns null if no matching tiddler was found
var getSyncTiddler = function(title, id) {
	var tiddler = store.getTiddler(title);
	if(!tiddler || tiddler.fields._syncID != id) {
		tiddler = null;
		store.forEachTiddler(function(title, tid) { // XXX: inefficient; cf. http://trac.tiddlywiki.org/ticket/1272
			if(tid.fields._syncID == id) {
				tiddler = tid;
			}
		});
	}
	return tiddler;
};

var resetChangeCount = function(tiddler, cached) {
	if(tiddler.fields.changecount == chached) {
		tiddler.clearChangeCount();
	} else if(tiddler.fields.changecount > 0) { // local changes occurred during sync progress
		tiddler.fields.changecount = (tiddler.fields.changecount - cached - 1). // XXX: hacky (use parseInt)?
			toString();
	}
};

var env = function(tiddler) {
	var context = {
		host: tiddler.fields["server.host"], // expanded in adaptor via setContext
		workspace: tiddler.fields["server.workspace"],
		tiddler: tiddler
	};
	var cache = {
		changecount: tiddler.fields.changecount
	};
	return { adaptor: tiddler.getAdaptor(), context: context, cache: cache };
};

// determine remote status message based on HTTP response
var determineStatus = function(httpStatus) {
	switch(context.httpStatus) {
		case 401:
		case 403:
			status = "remoteDenied"; // XXX: grammatical inconsistency
			break;
		case 404:
			status = "remoteMissing";
			break;
		case 409:
		case 412:
			status = "remoteConflict";
			break;
		default:
			status = "remoteError";
			break;
	}
	return status;
};

var uid = function() {
	var token = new Date().toString();
	return $.encoding.digests.hexSha1Str(token); // XXX: function to be deprecated; use http://note19.com/2007/05/27/javascript-guid-generator/
};

})(jQuery);
//}}}
