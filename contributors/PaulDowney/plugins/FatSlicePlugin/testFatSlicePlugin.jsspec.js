// <![CDATA[

function __main() {
	store = new TiddlyWiki();
	loadShadowTiddlers();
	store.loadFromDiv("storeArea","store",true);
	loadPlugins();
}

describe('Slice: calcFatSlices()', {
	before_each: function() {
		__main();
	},

	'simplest FatSlice table': function() {
		var title = "tiddler";
		store.saveTiddler(title, title, "||col|\n" + "|row|val|");
		value_of(store.calcFatSlices(title)).should_be({row:{col:'val'}});
	},
	'one row, two columns FatSlice table': function() {
		var title = "tiddler";
		store.saveTiddler(title, title, "||col1|col2|\n" + "|row|val1|val2|");
		value_of(store.calcFatSlices(title)).should_be({row:{col1:'val1',col2:'val2'}});
	},
	'one row, two columns with content FatSlice table': function() {
		var title = "tiddler";
		store.saveTiddler(title, title, "blah, blah\n" + "||col1|col2|\n" + "|row|val1|val2|\n" + "ya yak yak");
		value_of(store.calcFatSlices(title)).should_be({row:{col1:'val1',col2:'val2'}});
	}

});



/*
var d = calcFatSlices('data');
d = {
	'phil' : {
		'nickname': 'PhilHawksworth',
		'email': 'phil@osmosoft.com',
		'phone': '+44 123456789'
	},
	'paul' : {
		'nickname': 'psd',
		'email': 'psd@osmosoft.com',
		'phone': '+44 987654321'
	}
};
*/

// ]]>
