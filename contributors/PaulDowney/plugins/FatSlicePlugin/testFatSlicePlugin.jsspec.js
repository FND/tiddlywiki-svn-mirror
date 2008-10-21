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
	},
	'one row, three columns FatSlice table': function() {
		var title = "tiddler";
		store.saveTiddler(title, title, "||col1|col2|col3|\n" + "|row|val1|val2|val3|");
		value_of(store.calcFatSlices(title)).should_be({row:{col1:'val1',col2:'val2',col3:'val3'}});
	},
	'two rows, three columns FatSlice table': function() {
		var title = "tiddler";
		store.saveTiddler(title, title, "||col1|col2|col3|\n" + "|row1|val1|val2|val3|\n" + "|row2|val4|val5|val6|");
		value_of(store.calcFatSlices(title)).should_be({ row1:{col1:'val1',col2:'val2',col3:'val3'}, row2:{col1:'val4',col2:'val5',col3:'val6'} });
	},
	'two rows, three columns, title columns FatSlice table': function() {
		var title = "tiddler";
		store.saveTiddler(title, title, "||!col1|!col2|!col3|\n" + "|row1|val1|val2|val3|\n" + "|row2|val4|val5|val6|");
		value_of(store.calcFatSlices(title)).should_be({ row1:{col1:'val1',col2:'val2',col3:'val3'}, row2:{col1:'val4',col2:'val5',col3:'val6'} });
	},
	'simplest FatSlice table, punctuation in colums': function() {
		var title = "tiddler";
		store.saveTiddler(title, title, "||''!col - umn_one ''|\n" + "|row|val|");
		value_of(store.calcFatSlices(title)).should_be({row:{column_one:'val'}});
	},
});

describe('Slice: getFatSlice()', {
	before_each: function() {
		__main();
	},
	'simplest FatSlice table': function() {
		var title = "tiddler";
		store.saveTiddler(title, title, "||col|\n" + "|row|val|");
		value_of(store.getFatSlice(title,'row','col')).should_be('val');
	},
	'simplest FatSlice table': function() {
		var title = "tiddler";
		store.saveTiddler(title, title, "||col1|col2|col3|\n" + "|row1|val1|val2|val3|\n" + "|row2|val4|val5|val6|");
		value_of(store.getFatSlice(title,'row2','col2')).should_be('val5');
	},

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
