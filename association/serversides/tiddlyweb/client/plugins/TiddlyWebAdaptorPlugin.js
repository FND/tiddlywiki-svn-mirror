/***
|''Name''|TiddlyWebAdaptorPlugin|
|''Description''|adaptor for interacting with TiddlyWeb|
|''Author:''|Chris Dent (cdent (at) peermore (dot) com)|
|''Contributors''|FND, MartinBudden|
|''Version''|0.1.0|
|''Status''|@@beta@@|
|''Source''|http://svn.tiddlywiki.org/association/serversides/tiddlyweb/client/plugins/TiddlyWebAdaptorPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/association/serversides/tiddlyweb/client/plugins/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.4.1|
!Revision History
!!v0.1 (2008-11-10)
* refactoring of previous experimental efforts
!To Do
* externalize JSON library
* document custom/optional context attributes (e.g. bag, filters, query, revision)
!Code
***/
//{{{
if(!version.extensions.TiddlyWebAdaptorPlugin) { //# ensure that the plugin is only installed once
version.extensions.TiddlyWebAdaptorPlugin = { installed: true };

if(!config.extensions) { config.extensions = {}; }

config.extensions.TiddlyWebAdaptor = function() {};
config.extensions.TiddlyWebAdaptor.prototype = new AdaptorBase();
config.extensions.TiddlyWebAdaptor.mimeType = "application/json";
config.extensions.TiddlyWebAdaptor.serverType = "tiddlyweb";
config.extensions.TiddlyWebAdaptor.serverLabel = "TiddlyWeb";
config.extensions.TiddlyWebAdaptor.parsingErrorMessage = "Error parsing result from server";
config.extensions.TiddlyWebAdaptor.locationIDErrorMessage = "no bag or recipe specified for tiddler"; // TODO: rename

// perform a login -- XXX: experimental; currently limited to cookie_form
TiddlyWebAdaptor.prototype.login = function(context, userParams, callback) {
    context = this.setContext(context, userParams, callback);
    var uriTemplate = "%0/challenge/cookie_form";
    var uri = uriTemplate.format([context.host]);
    var payload = "user=" + encodeURIComponent(context.username) +
		"&password=" + encodeURIComponent(context.password);
    var req = httpReq("POST", uri, callback, context, {}, payload);
    return typeof req == "string" ? req : true;
};

// retrieve a list of workspaces
config.extensions.TiddlyWebAdaptor.prototype.getWorkspaceList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var uriTemplate = "%0/recipes"; // XXX: bags?
	var uri = uriTemplate.format([context.host]);
	var req = httpReq("GET", uri, config.extensions.TiddlyWebAdaptor.getWorkspaceListCallback,
		context, { accept: config.extensions.TiddlyWebAdaptor.mimeType });
	return typeof req == "string" ? req : true;
};

config.extensions.TiddlyWebAdaptor.getWorkspaceListCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		try {
			eval("var workspaces = " + responseText);
		} catch(ex) {
			context.status = false; // XXX: correct?
			context.statusText = exceptionText(ex, config.extensions.TiddlyWebAdaptor.parsingErrorMessage);
			if(context.callback) {
				context.callback(context, context.userParams);
			}
			return;
		}
		context.workspaces = workspaces.map(function(itm) { return { title: itm }; });
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

// retrieve a list of tiddlers
config.extensions.TiddlyWebAdaptor.prototype.getTiddlerList = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var uriTemplate = "%0/%1/%2/tiddlers%3";
	var params = context.filters ? "?filter=" + context.filters : "";
	if(context.bag) {
		var uri = uriTemplate.format([context.host, "bags", context.bag, params]);
	} else {
		uri = uriTemplate.format([context.host, "recipes", context.workspace, params]);
	}
	var req = httpReq("GET", uri, config.extensions.TiddlyWebAdaptor.getTiddlerListCallback,
		context, { accept: config.extensions.TiddlyWebAdaptor.mimeType });
	return typeof req == "string" ? req : true;
};

config.extensions.TiddlyWebAdaptor.getTiddlerListCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		context.tiddlers = [];
		try {
			eval("var tiddlers = " + responseText); //# N.B.: not actual tiddler instances
		} catch(ex) {
			context.status = false; // XXX: correct?
			context.statusText = exceptionText(ex, config.extensions.TiddlyWebAdaptor.parsingErrorMessage);
			if(context.callback) {
				context.callback(context, context.userParams);
			}
			return;
		}
		for(var i = 0; i < tiddlers.length; i++) {
			var t = tiddlers[i];
			var tiddler = new Tiddler(t.title);
			tiddler.assign(t.title, null, t.modifier, t.modified, t.tags, t.created, t.fields);
			tiddler.fields["server.bag"] = t.bag;
			tiddler.fields["server.page.revision"] = t.revision;
			if(t.recipe) {
				tiddler.fields["server.workspace"] = t.recipe;
			}
			context.tiddlers.push(tiddler);
		}
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

// perform global search
config.extensions.TiddlyWebAdaptor.prototype.getSearchResults = function(context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var uriTemplate = "%0/search?q=%1%2";
	var filterString = context.filters ? ";filter=" + context.filters : "";
	var uri = uriTemplate.format([context.host, context.query, filterString]);
	var req = httpReq("GET", uri, config.extensions.TiddlyWebAdaptor.getSearchResultsCallback,
		context, { accept: config.extensions.TiddlyWebAdaptor.mimeType });
	return typeof req == "string" ? req : true;
};

config.extensions.TiddlyWebAdaptor.getSearchResultsCallback = function(status, context, responseText, uri, xhr) {
	config.extensions.TiddlyWebAdaptor.getTiddlerListCallback(status, context, responseText, uri, xhr); // XXX: use apply?
};

// retrieve a particular tiddler's revisions
config.extensions.TiddlyWebAdaptor.prototype.getTiddlerRevisionList = function(title, limit, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	var uriTemplate = "%0/%1/%2/tiddlers/%3/revisions";
	if(context.bag) {
		var uri = uriTemplate.format([context.host, "bags", context.bag, title]);
	} else {
		uri = uriTemplate.format([context.host, "recipes", context.workspace, title]);
	}
	var req = httpReq("GET", uri, config.extensions.TiddlyWebAdaptor.getTiddlerRevisionListCallback,
		context, { accept: config.extensions.TiddlyWebAdaptor.mimeType });
	return typeof req == "string" ? req : true;
};

config.extensions.TiddlyWebAdaptor.getTiddlerRevisionListCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		context.tiddlers = [];
		try {
			eval("var tiddlers = " + responseText); //# N.B.: not actual tiddler instances
		} catch(ex) {
			context.status = false; // XXX: correct?
			context.statusText = exceptionText(ex, config.extensions.TiddlyWebAdaptor.parsingErrorMessage);
			if(context.callback) {
				context.callback(context, context.userParams);
			}
			return;
		}
		for(var i = 0; i < tiddlers.length; i++) {
			var t = tiddlers[i];
			var tiddler = new Tiddler(t.title);
			tiddler.assign(t.title, null, t.modifier, Date.convertFromYYYYMMDDHHMM(t.modified),
				t.tags, Date.convertFromYYYYMMDDHHMM(t.created), t.fields);
			tiddler.fields["server.page.revision"] = t.revision;
			tiddler.fields["server.bag"] = t.bag;
			if(t.workspace) {
				tiddler.fields["server.workspace"] = t.workspace;
			}
			context.tiddlers.push(tiddler);
		}
		var sortField = "server.page.revision";
		context.tiddlers.sort(function(a, b) {
			return a.fields[sortField] < b.fields[sortField] ? 1 :
				(a.fields[sortField] == b.fields[sortField] ? 0 : -1);
		 });
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

// retrieve an individual tiddler revision -- XXX: breaks with standard arguments list -- XXX: convenience function; simply use getTiddler?
config.extensions.TiddlyWebAdaptor.prototype.getTiddlerRevision = function(title, revision, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.revision = revision;
	return this.getTiddler(title, context, userParams, callback);
};

// retrieve an individual tiddler
config.extensions.TiddlyWebAdaptor.prototype.getTiddler = function(title, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.title = title;
	if(context.revision) {
		var uriTemplate = "%0/%1/%2/tiddlers/%3/revisions/%4";
	} else {
		uriTemplate = "%0/%1/%2/tiddlers/%3";
	}
	if(!context.tiddler) {
		context.tiddler = new Tiddler(title);
	}
	context.tiddler.fields["server.type"] = config.extensions.TiddlyWebAdaptor.serverType;
	context.tiddler.fields["server.host"] = AdaptorBase.minHostName(context.host);
	if(context.bag) {
		var uri = uriTemplate.format([context.host, "bags", context.bag, title, context.revision]);
		context.tiddler.fields["server.bag"] = context.bag;
	} else {
		uri = uriTemplate.format([context.host, "recipes", context.workspace, title, context.revision]);
		context.tiddler.fields["server.workspace"] = context.workspace;
	}
	var req = httpReq("GET", uri, config.extensions.TiddlyWebAdaptor.getTiddlerCallback,
		context, { accept: config.extensions.TiddlyWebAdaptor.mimeType });
	return typeof req == "string" ? req : true;
};

config.extensions.TiddlyWebAdaptor.getTiddlerCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(status) {
		try {
			eval("var t = " + responseText); //# N.B.: not an actual tiddler instance
		} catch(ex) {
			context.status = false; // XXX: correct?
			context.statusText = exceptionText(ex, config.extensions.TiddlyWebAdaptor.parsingErrorMessage);
			if(context.callback) {
				context.callback(context, context.userParams);
			}
			return;
		}
		context.tiddler.assign(context.tiddler.title, t.text, t.modifier,
			Date.convertFromYYYYMMDDHHMM(t.modified), t.tags || [],
			Date.convertFromYYYYMMDDHHMM(t.created), context.tiddler.fields); // XXX: merge extended fields!?
		context.tiddler.fields["server.bag"] = t.bag;
		context.tiddler.fields["server.page.revision"] = t.revision;
		if(t.recipe) {
			context.tiddler.fields["server.workspace"] = t.recipe;
		}
	}
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

// store an individual tiddler
config.extensions.TiddlyWebAdaptor.prototype.putTiddler = function(tiddler, context, userParams, callback) {
	context = this.setContext(context, userParams, callback);
	context.title = tiddler.title;
	var uriTemplate = "%0/%1/%2/tiddlers/%3";
	var host = context.host ? context.host : this.fullHostName(tiddler.fields["server.host"]); // TODO: fullHostName should be static method!?
	var bag = tiddler.fields["server.bag"];
	if(bag) {
		var uri = uriTemplate.format([host, "bags", bag, tiddler.title]);
	} else if(context.workspace) {
		uri = uriTemplate.format([host, "recipes", context.workspace, tiddler.title]);
	} else {
		return config.extensions.TiddlyWebAdaptor.locationIDErrorMessage;
	}
	var payload = {
		title: tiddler.title,
		text: tiddler.text,
		modifier: tiddler.modifier,
		tags: tiddler.tags,
		fields: tiddler.fields,
		revision: tiddler["server.page.revision"]
	};
	payload = JSON.stringify(payload);
	var req = httpReq("PUT", uri, config.extensions.TiddlyWebAdaptor.putTiddlerCallback,
		context, {}, payload, config.extensions.TiddlyWebAdaptor.mimeType);
	return typeof req == "string" ? req : true;
};

config.extensions.TiddlyWebAdaptor.putTiddlerCallback = function(status, context, responseText, uri, xhr) {
	context.status = status;
	context.statusText = xhr.statusText;
	context.httpStatus = xhr.status;
	if(context.callback) {
		context.callback(context, context.userParams);
	}
};

config.adaptors[config.extensions.TiddlyWebAdaptor.serverType] = config.extensions.TiddlyWebAdaptor;

/***
!JSON Code, used to serialize the data
***/
/*
Copyright (c) 2005 JSON.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
	The global object JSON contains two methods.

	JSON.stringify(value) takes a JavaScript value and produces a JSON text.
	The value must not be cyclical.

	JSON.parse(text) takes a JSON text and produces a JavaScript value. It will
	throw a 'JSONError' exception if there is an error.
*/
var JSON = {
	copyright: '(c)2005 JSON.org',
	license: 'http://www.crockford.com/JSON/license.html',

	/*
	 * Stringify a JavaScript value, producing a JSON text.
	 */
	stringify: function (v) {
	var a = [];

	/*
	 * Emit a string.
	 */
	function e(s) {
		a[a.length] = s;
	}

	/*
	 * Convert a value.
	 */
	function g(x) {
		var c, i, l, v;

		switch (typeof x) {
		case 'object':
		if (x) {
			if (x instanceof Array) {
			e('[');
			l = a.length;
			for (i = 0; i < x.length; i += 1) {
				v = x[i];
				if (typeof v != 'undefined' &&
					typeof v != 'function') {
				if (l < a.length) {
					e(',');
				}
				g(v);
				}
			}
			e(']');
			return;
			} else if (typeof x.toString != 'undefined') {
			e('{');
			l = a.length;
			for (i in x) {
				v = x[i];
				if (x.hasOwnProperty(i) &&
					typeof v != 'undefined' &&
					typeof v != 'function') {
				if (l < a.length) {
					e(',');
				}
				g(i);
				e(':');
				g(v);
				}
			}
			return e('}');
			}
		}
		e('null');
		return;
		case 'number':
		e(isFinite(x) ? +x : 'null');
		return;
		case 'string':
		l = x.length;
		e('"');
		for (i = 0; i < l; i += 1) {
			c = x.charAt(i);
			if (c >= ' ') {
			if (c == '\\' || c == '"') {
				e('\\');
			}
			e(c);
			} else {
			switch (c) {
				case '\b':
				e('\\b');
				break;
				case '\f':
				e('\\f');
				break;
				case '\n':
				e('\\n');
				break;
				case '\r':
				e('\\r');
				break;
				case '\t':
				e('\\t');
				break;
				default:
				c = c.charCodeAt();
				e('\\u00' + Math.floor(c / 16).toString(16) +
					(c % 16).toString(16));
			}
			}
		}
		e('"');
		return;
		case 'boolean':
		e(String(x));
		return;
		default:
		e('null');
		return;
		}
	}
	g(v);
	return a.join('');
	},

	/*
	 * Parse a JSON text, producing a JavaScript value.
	 */
	parse: function (text) {
	var p = /^\s*(([,:{}\[\]])|"(\\.|[^\x00-\x1f"\\])*"|-?\d+(\.\d*)?([eE][+-]?\d+)?|true|false|null)\s*/,
		token,
		operator;

	function error(m, t) {
		throw {
		name: 'JSONError',
		message: m,
		text: t || operator || token
		};
	}

	function next(b) {
		if (b && b != operator) {
		error("Expected '" + b + "'");
		}
		if (text) {
		var t = p.exec(text);
		if (t) {
			if (t[2]) {
			token = null;
			operator = t[2];
			} else {
			operator = null;
			try {
				token = eval(t[1]);
			} catch (e) {
				error("Bad token", t[1]);
			}
			}
			text = text.substring(t[0].length);
		} else {
			error("Unrecognized token", text);
		}
		} else {
		token = operator = undefined;
		}
	}

	function val() {
		var k, o;
		switch (operator) {
		case '{':
		next('{');
		o = {};
		if (operator != '}') {
			for (;;) {
			if (operator || typeof token != 'string') {
				error("Missing key");
			}
			k = token;
			next();
			next(':');
			o[k] = val();
			if (operator != ',') {
				break;
			}
			next(',');
			}
		}
		next('}');
		return o;
		case '[':
		next('[');
		o = [];
		if (operator != ']') {
			for (;;) {
			o.push(val());
			if (operator != ',') {
				break;
			}
			next(',');
			}
		}
		next(']');
		return o;
		default:
		if (operator !== null) {
			error("Missing value");
		}
		k = token;
		next();
		return k;
		}
	}
	next();
	return val();
	}
};

} //# end of "install only once"
//}}}
