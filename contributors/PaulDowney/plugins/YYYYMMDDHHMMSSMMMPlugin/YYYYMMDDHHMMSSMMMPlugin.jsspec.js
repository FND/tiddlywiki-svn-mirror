// <![CDATA[

function __main() {
	store = new TiddlyWiki();
	loadShadowTiddlers();
	store.loadFromDiv("storeArea","store",true);
	loadPlugins();
}

describe('Date.convertFromYYYYMMDDHHMMSSMMM', {
        before_each : function() {
		__main();
        },
	'should parse define a function' : function() {
		value_of(typeof Date.convertFromYYYYMMDDHHMMSSMMM).should_be("function");
	},
	'should return an object' : function() {
		value_of(typeof Date.convertFromYYYYMMDDHHMMSSMMM("20070228")).should_be("object");
	},
	'should parse null value should be invalid' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM()).should_be("Invalid Date");
	},
	'should parse year only should be invalid' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("2006")).should_be("Invalid Date");
	},
	'should parse year, short month only should be invalid' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("20061")).should_be("Invalid Date");
	},
	'should parse year,month only should be invalid' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("200601")).should_be("Invalid Date");
	},
	'should parse date only' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("20070228")).should_be(new Date(Date.UTC(2007,1,28)));
	},
	'should parse 1969 date only' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("19691103")).should_be(new Date(Date.UTC(1969,10,3)));
	},
	'should parse year,month, short day' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("2006011")).should_be(new Date(Date.UTC(2006,0,1)));
	},
	'should parse year,month,day short hour' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("199912079")).should_be(new Date(Date.UTC(1999,11,7,9)));
	},
	'should parse year,month,day,hour' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("1999121712")).should_be(new Date(Date.UTC(1999,11,17,12)));
	},
	'should parse year,month,day,hour short mins' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("199912598")).should_be(new Date(Date.UTC(1999,11,59,8)));
	},
	'should parse year,month,day,hour,mins' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("199912150257")).should_be(new Date(Date.UTC(1999,11,15,2,57)));
	},
	'should parse year,month,day,hour,mins,short secs' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("1999121512579")).should_be(new Date(Date.UTC(1999,11,15,12,57,9)));
	},
	'should parse year,month,day,hour,mins,secs' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("19991215125719")).should_be(new Date(Date.UTC(1999,11,15,12,57,19)));
	},
	'should parse year,month,day,hour,mins,secs,short milliseconds' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("199912151257198")).should_be(new Date(Date.UTC(1999,11,15,12,57,19,8)));
	},
	'should parse year,month,day,hour,mins,secs,medium milliseconds' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("1999121512571978")).should_be(new Date(Date.UTC(1999,11,15,12,57,19,78)));
	},
	'should parse year,month,day,hour,mins,secs,long milliseconds' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("19991215125719678")).should_be(new Date(Date.UTC(1999,11,15,12,57,19,678)));
	},
	'should parse ignoring punctuation' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("1999-12-15.12:57:19.678")).should_be(new Date(Date.UTC(1999,11,15,12,57,19,678)));
	},
	'should parse ignoring whitespace' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("  1999/12/15   12:57:19  678    ")).should_be(new Date(Date.UTC(1999,11,15,12,57,19,678)));
	},
	'should parse ignoring trailing text' : function() {
		value_of(Date.convertFromYYYYMMDDHHMMSSMMM("  1999/12/15   12:57:19  678  GMT (BST)  ")).should_be(new Date(Date.UTC(1999,11,15,12,57,19,678)));
	},
	'should roundtrip current date from Date.convertToYYYYMMDDHHMMSSMMM' : function() {
		var d1 = new Date(Date.UTC(1987,09,29,21,43,57,678));
		var s1 = d1.convertToYYYYMMDDHHMMSSMMM();
		var d2 = Date.convertFromYYYYMMDDHHMMSSMMM(s1);
		var s2 = d2.convertToYYYYMMDDHHMMSSMMM();
		value_of(s2).should_be(s1);
		value_of(d1).should_be(d2);
	}
});

describe('Date.convertFromYYYYMMDDHHMM', {
	'should parse year,month,day,hour,mins and ignore secs,milliseconds' : function() {
	},
	'should parse ignoring whitespace, punctuation and trailing text' : function() {
		value_of(Date.convertFromYYYYMMDDHHMM("  1999/12/15   12:57:19  678  GMT (BST)  ")).should_be(new Date(Date.UTC(1999,11,15,12,57,0,0)));
	}
});

// ]]>
