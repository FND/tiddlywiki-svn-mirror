// <![CDATA[

describe('TiddlerDisplayGroupsPlugin : Initialising', {

	before_each: function(){
		test_group = new TiddlerDisplayGroup();
	},

	'creating a new instance yields an object.' : function() {
		value_of(typeof test_group).should_be('object');
	},

	'creating a new instance yields an object which contains a bunches object.' : function() {
		value_of(typeof test_group.bunches).should_be('object');
	},
	
	'creating a new instance yields an object which has createBunch method.' : function() {
		value_of(typeof test_group.createBunch).should_be('function');
	}
	

});


describe('TiddlerDisplayGroupsPlugin : TiddlerDisplayGroups', {

	before_each: function(){
		test_group = new TiddlerDisplayGroup();
	},

	'given a string, setGroupField() will set that string as the groupField property for this group.' : function() {
		test_group.setGroupField('foo');
		value_of(test_group.groupField).should_be('foo');
	},

	'getGroupField() will return this group\'s group field as a string.' : function() {
		test_group.groupField = 'foo';
		var groupField = test_group.getGroupField('foo');
	}

});


describe('TiddlerDisplayGroupsPlugin : Bunches', {

	before_each: function(){
		store = new TiddlyWiki();
		store.loadFromDiv("storeArea","store",true);
		test_group = new TiddlerDisplayGroup();
	},
	
	'given an id string, createBunch() creates a new bunch object.' : function() {
		var b = test_group.createBunch('foo');
		value_of(typeof b).should_be('object');
	},	
	
	'a new bunch object will have the specified id property.' : function() {
		var b = test_group.createBunch('foo');
		value_of(b.id).should_be('foo');
	},
	
	'a new bunch object will have an empty tiddler array.' : function() {
		var b = test_group.createBunch('foo');
		value_of(b.tiddlers.length).should_be(0);
	},
	
	'getBunches() returns an array containing this group\'s bunches' : function() {
		test_group.createBunch('foo');
		test_group.createBunch('bar');
		var bunches = test_group.getBunches();
		value_of(typeof bunches).should_be('object');
	},
	
	'findBunch() returns null if an approprate bundle doesn\'t exist' : function() {
		var bunch = test_group.findBunch('foo');
		value_of(bunch).should_be_null();
	},
	
	'findBunch() returns a bunch object if an approprate bundle is found' : function() {
		var b = test_group.createBunch('foo');
		var bunch = test_group.findBunch('foo');
		value_of(typeof bunch).should_be('object');
	},
	
	'given a tiddler title and a field to collect by, fileTiddler() will create a new bunch if a suitable bunch doesn\'t yet exist.' : function() {
		var targetBunch = 'test_session_1';
		var collection_field = 'rr_session_id';
		var tiddlerTitle = 'session1';
		test_group.fileTiddler(tiddlerTitle, collection_field);
		var bunches = test_group.getBunches();
		value_of(bunches.length).should_be(1);
	},
	
	'given a tiddler title and a field to collect by, fileTiddler() will add a tiddler to the appropriate existing bunch.' : function() {
		var targetBunch = 'test_session_1';
		var collection_field = 'rr_session_id';
		var tiddlerTitle1 = 'session1';
		var tiddlerTitle2 = 'session1 notes from user A';
		test_group.fileTiddler(tiddlerTitle1, collection_field);
		test_group.fileTiddler(tiddlerTitle2, collection_field);
		var bunch = test_group.findBunch(targetBunch);
		value_of(bunch.tiddlers.length).should_be(2);
	}
	
});


describe('TiddlerDisplayGroupsPlugin : Patterns', {

	before_each: function(){
		store = new TiddlyWiki();
		store.loadFromDiv("storeArea","store",true);
		
		test_group = new TiddlerDisplayGroup();
		
		test_pattern = [
			{label:'header', tag:'session', count:1, require:null, openAt:null},
			{label:'mynote', tag:'note', count:1, require:'header', openAt:null},
			{label:'notes', tag:'contributed_note', count:0, require:'header', openAt:'bottom'}
		];
		
		test_group.setPattern(test_pattern);
		test_group.setGroupField('rr_session_id');
		
		__displayedTiddlers = [];
		
		store.displayTiddler = function(t) {
			__displayedTiddlers.push(t);
		};
	},
	
	'given a pattern array, setPattern() assigns the pattern to the TiddlerDisplayGroup object\'s pattern property ' : function() {
		value_of(test_group.pattern).should_not_be_null();
	},
	
	'given a tiddler title templateSectionDetails() returns an object containing the appropriate display properties.' : function() {
		var tiddlerTitle = 'session1';
		var details = test_group.templateSectionDetails(tiddlerTitle);
		value_of(typeof details).should_be('object');
	},
	
	'given a title of a tiddler which is not bunched, templateSectionDetails() returns null.' : function() {
		var tiddlerTitle = 'unbunched tiddler';
		var details = test_group.templateSectionDetails(tiddlerTitle);
		value_of(details).should_be_null();
	},
	
	'given a title of a tiddler, displayDependentTiddlers() displays any dependent tiddlers' : function() {
		var tiddlerTitle = 'session1 notes from user A';
		test_group.displayDependentTiddlers(tiddlerTitle);
		value_of(__displayedTiddlers).should_include('session1');
	},
	
	'given a title of a tiddler with no dependencies, displayDependentTiddlers() displays no additional tiddlers.' : function() {
		var tiddlerTitle = 'session1';
		test_group.displayDependentTiddlers(tiddlerTitle);
		value_of(__displayedTiddlers).should_be_empty();
	},
	
	
	'given the title of a tiddler which is not bunched, getTiddlerDisplayPosition() should return null. ' : function() {
		var tiddlerTitle = 'unbunched tiddler';
		var after = test_group.getTiddlerDisplayPosition(tiddlerTitle);
		value_of(after).should_be_null();
	},
	
	'given the title of a tiddler in a bunch, getTiddlerDisplayPosition() returns the tiddler to display directly after ' : function() {
		var tiddlerTitle = 'session1 notes from user A';
		var after = test_group.getTiddlerDisplayPosition(tiddlerTitle);
		value_of(typeof after).should_be('object');
	}

});


// ]]>
