/***
experimental stuff here
aiming to make MonkeyGTD lightning fast...
***/

config.indexedTags = {

	// will be populated with our tag lists
	tagLists: {},

	// will be populated with our tag indexes
	indexes: {},

	tagsToIndex: [
		"Project",
		"Area",
		"Realm"
	],

	saveTiddlerHijack: function(title,newTitle,newBody,modifier,modified,tags,fields) {
		var before = store.getTiddler(title);
		var oldTags = before ? before.tags : null;

		var result = this.saveTiddler_orig_indexedTags(title,newTitle,newBody,modifier,modified,tags,fields);
		var newTags = store.getTiddler(newTitle).tags;

		config.indexedTags.updateTagLists(title,oldTags,newTitle,newTags);
		config.indexedTags.updateIndexes(title,newTitle,newTags);

		return result;
	},

	removeTiddlerHijack: function(title) {
		var before = store.getTiddler(title);
		var oldTags = before ? before.tags : null;

		this.removeTiddler_orig_indexedTags(title);

		config.indexedTags.updateTagLists(title,oldTags);
		config.indexedTags.updateIndexes(title);
	},

	setTiddlerTagHijack: function(title,status,tag) {
		var before = store.getTiddler(title);
		var oldTags = before ? before.tags : null;

		this.setTiddlerTag_orig_indexedTags(title,status,tag);

		var after = store.getTiddler(title);
		var newTags = after ? after.tags : null;

		config.indexedTags.updateTagLists(title,oldTags,title,newTags);
		config.indexedTags.updateIndexes(title,title,newTags);

	},

	updateTagLists: function(title,oldTags,newTitle,newTags) {
		if (oldTags)
			oldTags.each(function(tagName) {
				config.indexedTags.tagLists[tagName].remove(title);
			});
		if (newTags)
			newTags.each(function(tagName) {
				if (!config.indexedTags.tagLists[tagName])
					config.indexedTags.tagLists[tagName] = [];
				config.indexedTags.tagLists[tagName].pushUnique(newTitle);
			});
	},

	updateIndexes: function(title,newTitle,newTags) {
		delete config.indexedTags.indexes[title];
		if (newTags) {
			config.indexedTags.indexes[newTitle] = {};
			config.indexedTags.tagsToIndex.each(function(tagToIndex) {
				config.indexedTags.indexes[newTitle][tagToIndex] = [];
				newTags.each(function(tag) {
					if (config.indexedTags.tagLists[tagToIndex].contains(tag)) {
						config.indexedTags.indexes[newTitle][tagToIndex].pushUnique(tag);
					}
				});
			});
		}
	},

	arrayMethods: {

		map: function(func) {
			var result = [];
			for (var i=0;i<this.length;i++)
				result.push(func(this[i]));
			return result;
		},

		each: function(func) {
			for (var i=0;i<this.length;i++)
				func(this[i]);
		}

	},

	initTagLists: function() {
		store.getTags().map(function(pair) { return pair[0]; }).each(function(t) {
			config.indexedTags.tagLists[t] = store.getTaggedTiddlers(t).map(function(tt) { return tt.title; });
		});
	},

	initIndexes: function() {
		store.forEachTiddler(function(title,tiddler) {
			config.indexedTags.updateIndexes(title,title,tiddler.tags);
		});
	},

	dump: function() {
		alert(this.indexes["Buy petrol for mower"]["Project"]);
		alert(this.indexes["Buy petrol for mower"]["Realm"]);
	},

	init: function() {

		merge(Array.prototype,this.arrayMethods);
		this.initTagLists();
		this.initIndexes();

		TiddlyWiki.prototype.saveTiddler_orig_indexedTags = TiddlyWiki.prototype.saveTiddler;
		TiddlyWiki.prototype.removeTiddler_orig_indexedTags = TiddlyWiki.prototype.removeTiddler;
		TiddlyWiki.prototype.setTiddlerTag_orig_indexedTags = TiddlyWiki.prototype.setTiddlerTag;
		TiddlyWiki.prototype.saveTiddler = this.saveTiddlerHijack;
		TiddlyWiki.prototype.removeTiddler = this.removeTiddlerHijack;
		TiddlyWiki.prototype.setTiddlerTag = this.setTiddlerTagHijack;

	}
}

config.indexedTags.init();

