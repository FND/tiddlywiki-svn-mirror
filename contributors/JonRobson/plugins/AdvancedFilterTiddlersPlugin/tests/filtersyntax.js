jQuery(document).ready(function() {	
  module("ADVANCED FILTER TIDDLERS: Load test data");
	test("startup", function(){
	  var tiddlers = [
    {title:"test_tiddler_a",tags:["cafe","wow"],fields:{"test":"y","bag":"foo","geo.location":"london","rating":"4.3"}},    {title:"test_tiddler_b",tags:["restaurant","good","awesome"],fields:{"test":"y","bag":"foodata","geo.location":"rome","rating":"4.2"}},
    {title:"test_tiddler_c",tags:["restaurant","good","wow"],fields:{"test":"y","bag":"foo","geo.location":"paris","rating":"1.2"}},
    {title:"test_tiddler_d",tags:["hotel","cafe"],fields:{"test":"y","bag":"foo","geo.location":"london","rating":"1.0"}},
    {title:"test_tiddler_e",tags:["hotel","good"],fields:{"test":"y","bag":"bar","geo.location":"london","rating":"1.3"}}
    ];

    config.extensions.testUtils.addTiddlers(tiddlers);
	})
	module("ADVANCED FILTER TIDDLERS: Plumbing");
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
    same(tiddlers.length,5,"only 5 tiddlers were created on startup");

    tiddlers = store.getValueTiddlers("geo.location","!london",store.getValueTiddlers("test","y"));
	  actual = tiddlers.length;
	  expected = 2;
	  same(actual, expected, "testing negation on custom field");
	    
    tiddlers = store.getValueTiddlers("tags","!wow",store.getValueTiddlers("test","y"));
	  actual = tiddlers.length;
	  expected = 3;
	  same(actual, expected, "testing negation on tags");
  
	});
	
	module("ADVANCED FILTER TIDDLERS: Macro Syntax");
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
    
    tiddlers = store.filterTiddlers("  [tag[hotel]]   \n\n   [sort(float)[rating]]   ");
		actual = tiddlers.length;
    expected = 2;
		same(actual, expected, "whitespace should be fine between arguments");
    
	});
	
});