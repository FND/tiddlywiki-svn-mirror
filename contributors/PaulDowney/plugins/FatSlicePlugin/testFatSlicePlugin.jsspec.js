// <![CDATA[

function __main() {
	store = new TiddlyWiki();
	loadShadowTiddlers();
	store.loadFromDiv("storeArea","store",true);
	loadPlugins();
}

describe('Slice: calcAllFatSlices()', {
	before_each: function() {
		__main();
	},

	'should return a 1x2 matrix from a 1x2 table': function() {
		var title = "tiddler";
		var text = "|foo|bar|";
		store.saveTiddler(title, title, text);
		value_of(store.calcAllFatSlices(title)).should_be([[ "foo", "bar" ]]);
	}/*,
	'should return a 1x2 matrix from a simple 1x3 table': function() {
		var title = "tiddler";
		var text = "|foo|bar|baz|";
		store.saveTiddler(title, title, text);
		value_of(store.calcAllFatSlices(title)).should_be([ "foo", "bar" ]);
	}
*/
});

// ]]>
