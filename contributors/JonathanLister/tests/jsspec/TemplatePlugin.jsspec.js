// <![CDATA[
	
describe('expandTemplate', {
	
	before_each: function(){
		store = new TiddlyWiki();
		loadShadowTiddlers();
		store.loadFromDiv("storeArea","store",true);
		formatter = new Formatter(config.formatters);
	},

	'it should return input string if no macro calls of the form <!--<<macro>>--> are found': function() {

		var expected = "<html>hello</html>";
		var actual = expandTemplate(expected);
		value_of(actual).should_be(expected);
	},
	
	'it should process macros if macro calls of the form <!--<<macro>>--> are found (not testing indirectly nested expandTemplate calls)': function() {

		var expected = config.options.txtUserName;
		var actual = expandTemplate("<!--<<message config.options.txtUserName>>-->");
		value_of(actual).should_be(expected);
	},
	
	'it should process macros if macro calls of the form <!--<<macro>>--> are found (testing one level deep, indirectly nested expandTemplate calls)': function() {

		var t = new Tiddler("t");
		var t2 = new Tiddler("t2");
		t.text = "<html>hello, this is a test <!--<<templateTiddlers t2>>--></html>";
		t2.text = "<category><!--<<message config.options.txtUserName>>--></category>";
		store.saveTiddler(t.title,t.title,t.text);
		store.saveTiddler(t2.title,t2.title,t2.text);
		
		var expected = "<html>hello, this is a test <category>"+config.options.txtUserName+"</category></html>";
		var actual = expandTemplate('t');
		value_of(actual).should_be(expected);
	},
	
	'it should process macros if macro calls of the form <!--<<macro>>--> are found (testing two levels deep, indirectly nested expandTemplate calls)': function() {

		var t = new Tiddler("t");
		var t2 = new Tiddler("t2");
		var t3 = new Tiddler("t3");
		t.text = "<html>hello, this is a test <!--<<templateTiddlers t2>>--></html>";
		t2.text = "second level <!--<<templateTiddlers t3>>--> yeah!";
		t3.text = "<category><!--<<message config.options.txtUserName>>--></category>";
		store.saveTiddler(t.title,t.title,t.text);
		store.saveTiddler(t2.title,t2.title,t2.text);
		store.saveTiddler(t3.title,t3.title,t3.text);
		
		var expected = "<html>hello, this is a test second level <category>"+config.options.txtUserName+"</category> yeah!</html>";
		var actual = expandTemplate('t');
		value_of(actual).should_be(expected);
	},
	
	'it should preserve whitespace: spaces, carriage returns and tabs (no nested expandTemplate calls)': function() {

		var expected = "first   \t\t\t\n\n\nsecond";
		var actual = expandTemplate(expected);
		value_of(actual).should_be(expected);
	},
	
	'it should preserve whitespace: spaces, carriage returns and tabs (single-level, nested expandTemplate calls)': function() {

		var t = new Tiddler("t");
		var t2 = new Tiddler("t2");
		t.text = "<html>hello, this is \t\t\t\n\n\na test <!--<<templateTiddlers t2>>--></html>";
		t2.text = "\t\t\n<category><!--<<message config.options.txtUserName>>--></category>\n\n\t";
		store.saveTiddler(t.title,t.title,t.text);
		store.saveTiddler(t2.title,t2.title,t2.text);

		var expected = "<html>hello, this is \t\t\t\n\n\na test \t\t\n<category>"+config.options.txtUserName+"</category>\n\n\t</html>";
		var actual = expandTemplate('t');
		console.log(expected);
		console.log(actual);
		value_of(actual).should_be(expected);
	},
	
		'it should preserve whitespace: spaces, carriage returns and tabs (two-level, nested expandTemplate calls)': function() {

		var t = new Tiddler("t");
		var t2 = new Tiddler("t2");
		var t3 = new Tiddler("t3");
		t.text = "<html>hello, this is \t\t\t\n\n\na test <!--<<templateTiddlers t2>>--></html>";
		t2.text = "second level\n\n\t \n<!--<<templateTiddlers t3>>-->\n\n yeah!";
		t3.text = "\t\t\n<category>\n<!--<<message config.options.txtUserName>>-->\n</category>\n";
		store.saveTiddler(t.title,t.title,t.text);
		store.saveTiddler(t2.title,t2.title,t2.text);
		store.saveTiddler(t3.title,t3.title,t3.text);

		var expected = "<html>hello, this is \t\t\t\n\n\na test second level\n\n\t \n\t\t\n<category>\n"+config.options.txtUserName+"\n</category>\n\n\n yeah!</html>";
		var actual = expandTemplate('t');
		console.log(expected);
		console.log(actual);
		value_of(actual).should_be(expected);
	}
	
});

// ]]>