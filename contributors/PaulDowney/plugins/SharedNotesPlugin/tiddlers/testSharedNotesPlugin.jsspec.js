// <![CDATA[

function __main() {
        store = new TiddlyWiki();
        loadShadowTiddlers();
        formatter = new Formatter(config.formatters);
        store.loadFromDiv("storeArea","store",true);
        loadPlugins();
}

function __clearSharedNotesPlugin() {
	version.extensions.SharedNotesPlugin = undefined;
	__xml = undefined;
	__text = undefined;
}

describe('SharedNotes: Initialisation', {

        before_each : function() {
		__clearSharedNotesPlugin();
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
	'discovered notes tag is "discovered_notes" by default' : function() {
		value_of(config.macros.SharedNotes.tag.discovered).should_be("discovered_notes");
	}, 
	'private notes tag is "private" by default' : function() {
		value_of(config.macros.SharedNotes.tag.private).should_be("private");
	}, 
	'not busy by default' : function() {
		value_of(config.macros.SharedNotes.busy).should_be(false);
	}
});

describe('SharedNotes: putNotes with no tiddlers', {
        before_each : function() {
		__clearSharedNotesPlugin();
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
	}
});


// ]]>
