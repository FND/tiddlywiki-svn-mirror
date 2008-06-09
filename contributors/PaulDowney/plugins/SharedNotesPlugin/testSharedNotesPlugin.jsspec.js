// <![CDATA[

function __main() {
	version.extensions.SharedNotesPlugin = undefined;
        store = new TiddlyWiki();
        loadShadowTiddlers();
        store.loadFromDiv("storeArea","store",true);
        loadPlugins();
}

describe('SharedNotes: Initialisation', {

        before_each : function() {
		__main();
        },
	'is installed' : function() {
		value_of(version.extensions.SharedNotesPlugin.installed).should_be(true);
	},
	'is defined' : function() {
		value_of(typeof config.macros.SharedNotes).should_be("object");
	},
	'txtSharedNotesUserName is "YourName" by default' : function() {
		value_of(config.options.txtSharedNotesUserName).should_be("YourName");
	},
	'chkSharedNotesPutEnabled is true by default' : function() {
		value_of(config.options.chkSharedNotesPutEnabled).should_be(true);
	},
	'chkSharedNotesGetEnabled is true by default' : function() {
		value_of(config.options.chkSharedNotesGetEnabled).should_be(true);
	},
	'note tag is "notes" by default' : function() {
		value_of(config.macros.SharedNotes.tag.note).should_be("notes");
	}, 
	'not busy by default' : function() {
		value_of(config.macros.SharedNotes.busy).should_be(false);
	}
});

describe('SharedNotes: putNotes with no tiddlers', {
        before_each : function() {
		__main();
		tests_mock.save('config.options.chkSharedNotesEnabled');
		tests_mock.save('config.options.txtSharedUserName');
		tests_mock.save('config.macros.SharedNotes.busy');
		tests_mock.before('config.macros.SharedNotes.putNotesCall', function(){return true});
        },
        after_each : function() {
		tests_mock.after('config.macros.SharedNotes.putNotesCall');
		tests_mock.restore();
        },
	'success calls putNotesCall' : function() {
		config.options.txtSharedNotesUserName = "MyName";
		config.macros.SharedNotes.busy = false;
		var s = config.macros.SharedNotes.putNotes();
		o = tests_mock.after('config.macros.SharedNotes.putNotesCall');
		value_of(o.called).should_be(1);
	},
	'success sets the busy lock' : function() {
		config.options.txtSharedNotesUserName = "MyName";
		config.macros.SharedNotes.busy = false;
		config.macros.SharedNotes.putNotes();
		value_of(config.macros.SharedNotes.busy).should_be(true);
	},
	'should do nothing when chkSharedNotesPutEnabled is false' : function() {
		config.options.txtSharedNotesUserName = "MyName";
		config.macros.SharedNotes.busy = false;
		config.macros.SharedNotes.putNotes();
		var o = tests_mock.after('config.macros.SharedNotes.putNotesCall');
		value_of(o.called).should_be(1);
		value_of(config.macros.SharedNotes.busy).should_be(true);
	},
	'should hit missing username by default' : function() {
		config.macros.SharedNotes.putNotes();
		var o = tests_mock.after('config.macros.SharedNotes.putNotesCall');
		value_of(o.called).should_be(0);
		value_of(config.macros.SharedNotes.busy).should_be(false);
	},

});

// ]]>
