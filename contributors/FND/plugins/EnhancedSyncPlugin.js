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
				tiddler.getServerType(), host, host,
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
	},
	onStart: function(ev) {
		// TODO: dispatchTasks for selection
	},

	// execute sync tasks
	// callback is passed two lists, one for successes and another for errors -- TODO: elaborate (individual objects' members)
	dispatchTasks: function(tasks, callback) {
		// TODO: split into two, with a separate function for handling individual tasks
		// TODO: use queue to avoid overlapping sync batches
		var reqCount = tasks.length;
		var successes = [], errors = [];
		var observer = function(tiddler, status, message) {
			reqCount--;
			var item = { tiddler: tiddler, status: status, message: message }; // TODO: rename
			if(status[0] == "remoteSuccess" && status[1] == "localSuccess") {
				successes.push(item);
			} else {
				errors.push(item);
			}
			if(reqCount == 0) {
				callback(successes, errors);
			}
		};

		// prioritize push tasks to reduce risk of conflicts
		tasks.sort(function(a, b) {
			return a.type == b.type ? 0 : (a.type == "push" ? -1 : 1);
		});

		for(var i = 0; i < tasks.length; i++) { // XXX: needs throttling!?
			var task = tasks[i];
			switch(task.type) {
				case "push":
					this.push(task.tiddler, observer);
					break;
				case "pull":
					this.pull(task.tiddler, observer);
					break;
				case "conflict":
					observer(task.tiddler, ["conflict"], null);
					break;
			}
		}
	},

	// generate a list of sync tasks
	// tiddlers is a list of sync'able or locally changed tiddlers
	// callback is passed list of sync tasks with members type and tiddler
	// task.type is "push", "pull" or "conflict"; push encapsulating all
	//   operations where local changes are to be sent to the server
	gatherTasks: function(tiddlers, pushOnly, callback) { // XXX: bad API!? -- TODO: rename
		// TODO: automatically determine tiddlers (via getCandidates / getLocalChanges)? cf. diagram
		if(pushOnly) {
			var tasks = $.map(tiddlers, function(tiddler, i) {
				return { type: "push", tiddler: tiddler };
			});
			callback(tasks);
		} else {
			var origins = {};
			// construct dictionary of tiddlers per workspace per host per server type -- XXX: move into getRemoteChanges?
			for(var i = 0; i < tiddlers.length; i++) {
				var tiddler = tiddlers[i];
				var type = tiddler.getServerType();
				var host = tiddler.fields["server.host"];
				var workspace = tiddler.fields["server.workspace"] || "";
				origins[type] = origins[type] || {};
				origins[type][host] = origins[type][host] || {};
				origins[type][host][workspace] = origins[type][host][workspace] || [];
				origins[type][host][workspace].push(tiddler);
			}
			this.getRemoteChanges(origins, callback);
		}
	},

	// determine remote changes
	// origins is a dictionary of tiddlers per workspace per host per server type
	// callback is passed a list of sync tasks
	getRemoteChanges: function(origins, callback) { // XXX: misnamed (also takes into account local changes via determineChanges)
		var _tasks = [];
		var reqCount = 0;
		var resCount = 0;
		var observer = function(tasks) { // TODO: rename?
			_tasks = _tasks.concat(tasks);
			resCount++;
			if(resCount == reqCount) {
				callback(_tasks);
			}
		};
		// determine remote changes for each known origin
		var reqData = [];
		$.each(origins, function(type, hosts) {
			$.each(hosts, function(host, workspaces) {
				$.each(workspaces, function(workspace, tiddlers) {
					var adaptor = tiddlers[0].getAdaptor();
					var context = {
						host: host,
						workspace: workspace
					};
					reqData.push([adaptor, context, tiddlers]);
				});
			});
		});
		reqCount = reqData.length;
		var _callback = function(context, userParams) {
			if(context.status) {
				var tasks = macro.generateTasks(userParams.tiddlers,
					context.tiddlers);
				observer(tasks);
			} else {
				// TODO: error handling
			}
		};
		for(var i = 0; i < reqCount; i++) { // XXX: needs throttling!?
			var adaptor = reqData[i][0];
			var context = reqData[i][1];
			var tiddlers = reqData[i][2];
			var req = adaptor.getTiddlerList(context, { tiddlers: tiddlers },
				_callback);
			// TODO: error handling (req might fail synchronously)
		}
	},
	// determine tiddlers with local changes
	// tiddlers argument is optional, defaulting to sync'able tiddlers
	getLocalChanges: function(tiddlers) {
		tiddlers = tiddlers || this.getCandidates();
		return $.map(tiddlers, function(tiddler, i) {
			return tiddler.isTouched() ? tiddler : null;
		});
	},
	// determine sync'able tiddlers
	// tiddlers argument is optional, defaulting to items in local store
	getCandidates: function(tiddlers) {
		tiddlers = tiddlers || store.getTiddlers(); // XXX: getTiddlers inefficient
		return $.map(tiddlers, function(tiddler, i) {
			return isSyncable(tiddler) ? tiddler : null;
		});
	},

	// generate sync tasks by comparing lists of tiddlers
	// returns a list of tasks of type "push", "pull" or "conflict"
	generateTasks: function(locals, remotes) {
		var cue = "server.page.revision"; // TODO: configurable by adaptor?
		var tasks = [];
		var i;
		remotes = remotes.slice(0); // clone to avoid side-effects
		for(i = 0; i < locals.length; i++) {
			var local = locals[i];
			var pos = remotes.findByField("title", local.title);
			if(pos !== null) { // tiddler present both locally and remotely
				var remote = remotes.splice(pos, 1)[0];
				if(remote.fields[cue] != local.fields[cue]) { // tiddler modified remotely
					tasks.push({
						type: local.isTouched() ? "conflict" : "pull",
						tiddler: local
					});
				} else if(local.isTouched()) { // tiddler modified locally only
					tasks.push({ type: "push", tiddler: local });
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
	// callback is passed tiddler, status and message -- TODO: elaborate
	// XXX: return contract?
	push: function(tiddler, callback) {
		var env = environ(tiddler);
		env.cache.callback = callback; // XXX: cache reuse hacky?
		tiddler = setSyncID(tiddler, env);
		// dispatch create/update or move request -- TODO: deletion support
		var serverTitle = tiddler.fields["server.title"];
		if(!serverTitle) {
			tiddler.fields["server.title"] = tiddler.title;
		} else if(tiddler.title != serverTitle) { // XXX: moveTiddler not universally supported
			return env.adaptor.moveTiddler({ title: serverTitle }, // XXX: moveTiddler signature is bad; should use tiddler objects
				{ title: tiddler.title }, env.context, env.cache,
				this.pushCallback);
		}
		var method = isDeleted(tiddler) ? "deleteTiddler" : "putTiddler";
		return env.adaptor[method](tiddler, env.context, env.cache,
			this.pushCallback);
	},
	// expects context members title, status, httpStatus and statusText (if
	// applicable), plus optionally a tiddler-like tiddlerData object -- TODO: elaborate
	pushCallback: function(context, userParams) {
		var tiddler = getSyncTiddler(context.title, userParams.syncID);
		var status, msg;
		if(context.status) {
			status = ["remoteSuccess"];
			if(tiddler) {
				if(isDeleted(tiddler)) {
					store.deleteTiddler(tiddler.title);
					store.notify(tiddler.title, true);
				} else {
					delete tiddler.fields._syncID;
					resetChangeCount(tiddler, userParams.changecount);
					$.extend(true, tiddler, context.tiddlerData);
					tiddler = store.saveTiddler(tiddler);
				}
			}
		} else {
			status = [determineError(context.httpStatus)];
			msg = context.statusText;
		}
		status.push(tiddler ? "localSuccess" : "localError");
		userParams.callback(tiddler, status, msg);
	},
	// retrieve an individual tiddler from the server
	// callback is passed tiddler, status and message -- TODO: elaborate
	// XXX: return contract?
	pull: function(tiddler, callback) {
		var env = environ(tiddler);
		env.cache.callback = callback; // XXX: cache reuse hacky?
		tiddler = setSyncID(tiddler, env);
		// TODO: support server.page.id for locally diverging titles?
		return env.adaptor.getTiddler(tiddler.title, env.context, env.cache,
			this.pullCallback);
	},
	// expects context members tiddler, status, httpStatus and statusText (if applicable)
	pullCallback: function(context, userParams) {
		var tiddler = getSyncTiddler(context.tiddler.title, userParams.syncID);
		var status, msg;
		if(context.status) {
			status = ["remoteSuccess"];
			// ensure that sync tiddler has not been replaced locally
			var mismatch = tiddler === null &&
				store.tiddlerExists(context.tiddler.title);
			if(!mismatch && (!tiddler ||
					tiddler.fields.changecount == userParams.changecount)) {
				tiddler = store.saveTiddler(context.tiddler);
				tiddler.clearChangeCount();
				status.push("localSuccess");
			} else {
				status.push("localConflict");
				msg = "tiddler modified locally during retrieval"; // XXX: phrasing, i18n
			}
		} else { // XXX: no local status!?
			status = [determineError(context.httpStatus)];
			msg = context.statusText;
		}
		userParams.callback(tiddler, status, msg);
	}
};

var getSyncStatus = function(tiddler) { // XXX: unused!?
	if(!tiddler.isTouched()) {
		return "none";
	} else if(tiddler.fields["server.title"] &&
			tiddler.title != tiddler.fields["server.title"]) {
		return "renamedLocally"; // XXX: currently unsupported by TiddlyWiki
	} else if(isDeleted(tiddler) && tiddler.fields.changecount == "1") {
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

var isDeleted = function(tiddler) { // TODO: expose (e.g. as Tiddler method)?
	return tiddler.fields.deleted == "true";
};

// set sync ID on store tiddler and in environment
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
	if(tiddler.fields.changecount == cached) {
		tiddler.clearChangeCount();
	} else if(tiddler.fields.changecount > 0) { // local changes occurred during sync progress
		tiddler.fields.changecount = (tiddler.fields.changecount - cached). // XXX: hacky (use parseInt)?
			toString();
	}
};

var environ = function(tiddler) {
	var context = {
		host: tiddler.fields["server.host"],
		workspace: tiddler.fields["server.workspace"],
		tiddler: tiddler
	};
	var cache = {
		changecount: tiddler.fields.changecount
	};
	return { adaptor: tiddler.getAdaptor(), context: context, cache: cache };
};

// determine remote error message based on HTTP response
var determineError = function(httpStatus) {
	switch(httpStatus) {
		case 401:
		case 403:
			status = "remoteDenied"; // XXX: grammatical inconsistency (not a noun)
			break;
		case 404:
			status = "remoteMissing"; // XXX: grammatical inconsistency (not a noun)
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
