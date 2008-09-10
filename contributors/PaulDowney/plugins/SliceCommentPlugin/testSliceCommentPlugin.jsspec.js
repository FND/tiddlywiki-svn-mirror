// <![CDATA[

function __main() {
	store = new TiddlyWiki();
	loadShadowTiddlers();
	store.loadFromDiv("storeArea","store",true);
	loadPlugins();
}

describe('SliceComment: calcAllSlices()', {
	before_each: function() {
		__main();
	},

	'should return a single slice (table notation) with end of line comment': function() {
		var title = "tiddler";
		var text = "|foo|bar|-- end of line comment--";
		store.saveTiddler(title, title, text);
		var actual = store.calcAllSlices(title);
		var expected = { foo: "bar" };
		value_of(actual).should_be(expected);
	},
	'should return a single slice (table notation) with start of line comment': function() {
		var title = "tiddler";
		var text = "-- start of line comment --|foo|bar|";
		store.saveTiddler(title, title, text);
		var actual = store.calcAllSlices(title);
		var expected = { foo: "bar" };
		value_of(actual).should_be(expected);
	},
	'should return a single slice (table notation) with start and end of line comments': function() {
		var title = "tiddler";
		var text = "-- start of line comment --|foo|bar|-- end of line comment--";
		store.saveTiddler(title, title, text);
		var actual = store.calcAllSlices(title);
		var expected = { foo: "bar" };
		value_of(actual).should_be(expected);
	},
	'should return slices (table notation) with end of line comment in middle of table': function() {
		var title = "tiddler";
		var text = "|foo|bar|-- comment in middle --\n"
			+ "|lorem|ipsum|";
		store.saveTiddler(title, title, text);
		var actual = store.calcAllSlices(title);
		var expected = { foo: "bar", lorem: "ipsum" };
		value_of(actual).should_be(expected);
	},
	'should return slices (table notation) with commented out table row': function() {
		var title = "tiddler";
		var text = "|foo|bar|\n"
			+ "--|middle|row|--\n"
			+ "|lorem|ipsum|";
		store.saveTiddler(title, title, text);
		var actual = store.calcAllSlices(title);
		var expected = { foo: "bar", lorem: "ipsum" };
		value_of(actual).should_be(expected);
	},
	'should return slices (table notation) with commented out multiple table rows': function() {
		var title = "tiddler";
		var text = "|foo|bar|\n"
			+ "--|middle|row|\n"
			+ "|another|row|\n"
			+ "|yetanother|row|--\n"
			+ "|lorem|ipsum|";
		store.saveTiddler(title, title, text);
		var actual = store.calcAllSlices(title);
		var expected = { foo: "bar", lorem: "ipsum" };
		value_of(actual).should_be(expected);
	}
});

describe('SliceComment: getTiddlerSlice()', {
	before_each: function() {
		__main();
	},

	'should return a single slice (table notation) with end of line comment': function() {
		var title = "tiddler";
		var text = "|foo|bar|-- end of line comment--";
		store.saveTiddler(title, title, text);
		var actual = store.getTiddlerSlice(title, "foo");
		var expected = "bar";
		value_of(actual).should_be(expected);
	},
	'should return a single slice (table notation) with start of line comment': function() {
		var title = "tiddler";
		var text = "-- start of line comment --|foo|bar|";
		store.saveTiddler(title, title, text);
		var actual = store.getTiddlerSlice(title, "foo");
		var expected = "bar";
		value_of(actual).should_be(expected);
	},
	'should return slices (table notation) with commented out multiple table rows': function() {
		var title = "tiddler";
		var text = "|foo|bar|\n"
			+ "--|middle|row|\n"
			+ "|another|row|\n"
			+ "|yetanother|row|--\n"
			+ "|lorem|ipsum|";
		store.saveTiddler(title, title, text);
		value_of(store.getTiddlerSlice(title, "foo")).should_be("bar");
		value_of(store.getTiddlerSlice(title, "lorem")).should_be("ipsum");
	}
});

// ]]>
