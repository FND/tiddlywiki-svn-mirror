(function($) {

var init = function() {
	tiddler = new Tiddler("__init__");
	store = new TiddlyWiki();
};

config = {
	macros: {}
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
};
$.extend(TiddlyWiki.prototype, {
	getTiddlerText: function() {},
	saveTiddler: function(tiddler) {
		this._tiddlers[tiddler.title] = tiddler;
	},
	getTiddlers: function() {
		var tiddlers = [];
		$.each(this._tiddlers, function(title, tiddler) {
			tiddlers.push(tiddler);
		});
		return tiddlers;
	}
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
