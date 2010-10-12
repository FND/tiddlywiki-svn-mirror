jQuery(document).ready(function() {	
	module("ADVANCED FILTER TIDDLERS: Load test data", {
		setup: function() {
			var tiddlers = [
			{title:"test_tiddler_a",tags:["cafe","wow"],fields:{"test":"y","bag":"foo","geo.location":"london","rating":"4.3"}},		
			{title:"test_tiddler_b",tags:["restaurant","good","awesome"],fields:{"test":"y","bag":"foodata","geo.location":"rome","rating":"4.2"}},
			{title:"test_tiddler_c",tags:["restaurant","good","wow"],fields:{"test":"y","bag":"foo","geo.location":"paris","rating":"1.27"}},
			{title:"test_tiddler_d",tags:["hotel","cafe"],fields:{"test":"y","bag":"foo","geo.location":"london","rating":"1.0"}},
			{title:"test_tiddler_e",tags:["hotel","good"],fields:{"test":"y","bag":"bar","geo.location":"london","rating":"1.34"}},
			{title:"test_tiddler_f",tags:[],fields:{"test":"y","bag":"barx","rating":"1.345"}}
			];
			config.extensions.testUtils.addTiddlers(tiddlers);
		},
		teardown: function() {
			var tiddlers = ["test_tiddler_a", "test_tiddler_b", "test_tiddler_c", "test_tiddler_d", "test_tiddler_e", "test_tiddler_f"];
			for(var i = 0; i < tiddlers.length; i++) {
				store.removeTiddler(tiddlers[i]);
			}
		}
	});
	
	test("story.getValueTiddlers", function() {	
		var expected,actual,tiddlers;
		tiddlers = store.getValueTiddlers("bag","foo");
		actual = tiddlers.length;
		expected = 3;
		same(actual, expected, "problemo in getValueTiddlers on fields");

		tiddlers = store.getValueTiddlers("tag","wow");
		actual = tiddlers.length;
		expected = 2;
		same(actual, expected, "when field is tag it is provides wrong answer");

		tiddlers = store.getValueTiddlers("tags","wow");
		actual = tiddlers.length;
		expected = 2;
		same(actual, expected, "when field is tags not tag (plural) breaks");

		tiddlers = store.getValueTiddlers("test","y");
		same(tiddlers.length,6,"only 6 tiddlers were created on startup");

		tiddlers = store.getValueTiddlers("geo.location","!london",store.getValueTiddlers("test","y"));
		actual = tiddlers.length;
		expected = 2;
		same(actual, expected, "testing negation on custom field");

		tiddlers = store.getValueTiddlers("tags","!wow",store.getValueTiddlers("test","y"));
		actual = tiddlers.length;
		expected = 4;
		same(actual, expected, "testing negation on tags");

		tiddlers = store.getValueTiddlers("geo.location","*");
		actual = tiddlers.length;
		expected = 5;
		same(actual, expected, "testing the special * value");
	});

	test("Correct syntax", function() {
		var actual, expected,tiddlers;
		tiddlers = store.filterTiddlers("[geo.location[london]]");
		actual = tiddlers.length;
		expected = 3;
		same(actual, expected, "only 3 tiddlers have the field geo.location with value london");
		
		tiddlers = store.filterTiddlers("[geo.location[london]tag[hotel]tag[cafe]]");
		actual = tiddlers.length;
		expected = 1;
		same(actual, expected, "and test failed only one tiddler matches the criteria");
		
		tiddlers = store.filterTiddlers("[bag[foo]][sort(float)[rating]]");
		actual = tiddlers.length;
		expected = 3;
		same(actual, expected, "only 3 tiddlers should match this query [bag[foo]]");
		
		actual = tiddlers[2].title;
		expected= "test_tiddler_a";
		same(actual, expected, "the sort should treat the rating value as a floating point number and the default sort is ascending");
		
		tiddlers = store.filterTiddlers("[tag[wow]][tag[good]tag[awesome]]");
		actual = tiddlers.length
		expected= 3;
		same(actual, expected, "two tiddlers are tagged wow and only one is tagged both good and awesome");
		
		
	});

	test("Bad syntax", function() {
		var actual, expected,tiddlers;
		tiddlers = store.filterTiddlers("[geo.location[london]]");
		actual = tiddlers.length;
		expected = 3;
		same(actual, expected, "only 3 tiddlers have the field geo.location with value london");
		
		tiddlers = store.filterTiddlers("	[tag[hotel]]	 \n\n	 [sort(float)[rating]]	 ");
		actual = tiddlers.length;
		expected = 2;
		same(actual, expected, "whitespace should be fine between arguments");
		
	});
	
	test("Sorting as a float", function() {
		var actual, expected,tiddlers;		
		tiddlers = store.filterTiddlers("[test[y]][sort(float)[+rating]]");
		actual = tiddlers.length;
		expected = 6;
		same(actual, expected, "6 have the field test y");
		/*4.3,4.2,1.27,1.0,1.34,1.345
		as float-> 1.0,1.27,1.34,1.345,4.2,4.3
		as int -> 4,4,1,1,1,1
		*/ 
		same(tiddlers[0].title,"test_tiddler_d");
		same(tiddlers[2].title,"test_tiddler_e");
		same(tiddlers[3].title,"test_tiddler_f");

		tiddlers = store.filterTiddlers("[test[y]][sort(int)[-rating]]");

		same(tiddlers[0].title,"test_tiddler_a");
		same(tiddlers[1].title,"test_tiddler_b");
	});
});