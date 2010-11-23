(function($) {

var init = function() {
	tiddler = new Tiddler("__init__");
	store = new TiddlyWiki();
};

config = {
	macros: {}
};

// XXX: temporary mock; to be deprecated and replaced
jQuery.encoding = {
	digests: {
		hexSha1Str: function(token) {
			return token;
		}
	}
};

Tiddler = function(title) {
	this.title = title;
	this.tags = [];
	this.fields = {};
};
$.extend(Tiddler.prototype, {
	getServerType: function() {
		return this.fields["server.type"];
	},
	clearChangeCount: function() {
		delete this.fields.changecount;
	},
	isTouched: function() {
		var changecount = this.fields.changecount || 0;
		return changecount > 0;
	},
	doNotSave: function() {
		return this.fields.doNotSave;
	}
});

TiddlyWiki = function() {
	this._tiddlers = {};
	this.deleteTiddler = function(title) {
		delete this._tiddlers[title];
	};
};
$.extend(TiddlyWiki.prototype, {
	forEachTiddler: function(fn) {
		for(var title in this._tiddlers) {
			fn.call(this, title, this._tiddlers[title]);
		}
	},
	getTiddlerText: $.noop,
	getTiddler: function(title) {
		return this._tiddlers[title] || null;
	},
	saveTiddler: function(tiddler) {
		this._tiddlers[tiddler.title] = tiddler;
		return tiddler;
	},
	removeTiddler: function(title) {
		this.deleteTiddler(title);
	},
	getTiddlers: function() {
		var tiddlers = [];
		$.each(this._tiddlers, function(title, tiddler) {
			tiddlers.push(tiddler);
		});
		return tiddlers;
	},
	tiddlerExists: function(title) {
		return this.getTiddler(title) !== null;
	},
	notify: $.noop
});

Array.prototype.findByField = function(name, value) {
	for(var i = 0; i < this.length; i++) {
		if(this[i][name] === value) {
			return i;
		}
	}
	return null;
};

init();

})(jQuery);
