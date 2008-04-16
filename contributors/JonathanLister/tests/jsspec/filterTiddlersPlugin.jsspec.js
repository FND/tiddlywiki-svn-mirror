// <![CDATA[
describe('filterTiddlers', {

	before_each: function(){
		store = new TiddlyWiki();
		loadShadowTiddlers();
		store.loadFromDiv("storeArea","store",true);
	},

	'it should return one tiddler when the filter string is a tiddler title (single-word)': function() {
		var tiddlers = store.filterTiddlers("1WordTitle");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["1WordTitle"];
		value_of(actual).should_be(expected);
	},
	
	'it should return one tiddler when the filter string is a tiddler title (multi-word)': function() {
		var tiddlers = store.filterTiddlers("[[MultiWord Title]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["MultiWord Title"];
		value_of(actual).should_be(expected);
	},
	
	'it should return all the tiddlers with a given tag when the filter string is of the form "[tag[singletag]]"" (single-word tag)': function() {
		var tiddlers = store.filterTiddlers("[tag[singletag]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["1WordTag1","1WordTag1WordTitle","1WordTagMultiWord Title"];
		value_of(actual).should_be(expected);
	},
	
	'it should return all the tiddlers with a given tag when the filter string is of the form "[tag[multi tag]]"" (multi-word tag)': function() {
		var tiddlers = store.filterTiddlers("[tag[multi tag]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["MultiWordTag1","MultiWordTag1WordTitle","MultiWordTagMultiWord Title"];
		value_of(actual).should_be(expected);
	},
	
	'it should not duplicate results e.g. specified (single-word) tiddler title and specified (single-word) tag': function() {
		var tiddlers = store.filterTiddlers("1WordTag1WordTitle [tag[singletag]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["1WordTag1WordTitle","1WordTag1","1WordTagMultiWord Title"];
		value_of(actual).should_be(expected);
	},
	
	'it should not duplicate results e.g. specified tiddler (single-word) title and specified (multi-word) tag': function() {
		var tiddlers = store.filterTiddlers("MultiWordTag1WordTitle [tag[multi tag]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["MultiWordTag1WordTitle","MultiWordTag1","MultiWordTagMultiWord Title"];
		value_of(actual).should_be(expected);
	},
	
	'it should not duplicate results e.g. specified tiddler (multi-word) title and specified (single-word) tag': function() {
		var tiddlers = store.filterTiddlers("[[1WordTagMultiWord Title]] [tag[singletag]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["1WordTagMultiWord Title","1WordTag1","1WordTag1WordTitle"];
		value_of(actual).should_be(expected);
	},
	
	'it should not duplicate results e.g. specified tiddler (multi-word) title and specified (multi-word) tag': function() {
		var tiddlers = store.filterTiddlers("[[MultiWordTagMultiWord Title]] [tag[multi tag]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["MultiWordTagMultiWord Title","MultiWordTag1","MultiWordTag1WordTitle"];
		value_of(actual).should_be(expected);
	},
	
	'it should return tiddlers tagged with more than one specified tag when the filter string is of the form "[tag[singletag]tag[singletagtwo]]"': function() {
		var tiddlers = store.filterTiddlers("[tag[singletag]tag[singletagtwo]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["1WordTag1","1WordTag1WordTitle","1WordTagMultiWord Title","1WordTag2"];
		value_of(actual).should_be(expected);
	},
	
	'it should return tiddlers tagged with more than one specified tag (single-word only) when the filter string is of the form "[tag[multi tag]tag[multi tag two]]"': function() {
		var tiddlers = store.filterTiddlers("[tag[multi tag]tag[multi tag two]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["MultiWordTag1","MultiWordTag1WordTitle","MultiWordTagMultiWord Title","MultiWordTag2"];
		value_of(actual).should_be(expected);
	},
	
	'it should return tiddlers tagged with more than one specified tag (single-word and multi-word mixed) when the filter string is of the form "[tag[singletag]tag[multi tag]]"': function() {
		var tiddlers = store.filterTiddlers("[tag[singletag]tag[multi tag]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["1WordTag1","1WordTag1WordTitle","1WordTagMultiWord Title","MultiWordTag1","MultiWordTag1WordTitle","MultiWordTagMultiWord Title"];
		value_of(actual).should_be(expected);
	},
	
	'it should support global sort of the results e.g. when the filter string is of the form "[tag[singletag]] [sort[modified]]"': function() {
		var tiddlers = store.filterTiddlers("[tag[singletag]] [sort[modified]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["1WordTag1WordTitle","1WordTag1","1WordTagMultiWord Title"];
		value_of(actual).should_be(expected);
	},
	
	'it should support sort of each intermediate piece of the results e.g. when the filter string is of the form "[tag[singletag]sort[modified]] [tag[multi tag]]"': function() {
		var tiddlers = store.filterTiddlers("[tag[singletag]sort[modified]] [tag[multi tag]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["1WordTag1WordTitle","1WordTag1","1WordTagMultiWord Title","MultiWordTag1","MultiWordTag1WordTitle","MultiWordTagMultiWord Title"];
		value_of(actual).should_be(expected);
	},
	
	'it should support limiting the number of results returned e.g. when the filter string is of the form "[tag[singletag]sort[modified]] MultiWordTag2 [limit[2]]"': function() {
		var tiddlers = store.filterTiddlers("[tag[singletag]sort[modified]] MultiWordTag2 [limit[2]]");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["1WordTag1WordTitle","1WordTag1"];
		value_of(actual).should_be(expected);
	},
	
	'it should support limiting intermediate stages of collecting results e.g. when the filter string is of the form "[tag[singletag]sort[modified]limit[2]] MultiWordTag2"': function() {
		var tiddlers = store.filterTiddlers("[tag[singletag]sort[modified]limit[2]] MultiWordTag2");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = ["1WordTag1WordTitle","1WordTag1","MultiWordTag2"];
		value_of(actual).should_be(expected);
	},
	
	'it should support a "return all tiddlers" by using a filter string of "*"': function() {
		var tiddlers = store.filterTiddlers("*");
		var actual = [];
		for(var i=0;i<tiddlers.length;i++) {
			actual.push(tiddlers[i].title);
		}
		var expected = [];
		store.forEachTiddler(function(title,tiddler){
			expected.push(title);
		});
		value_of(actual).should_be(expected);
	},
});
// ]]>