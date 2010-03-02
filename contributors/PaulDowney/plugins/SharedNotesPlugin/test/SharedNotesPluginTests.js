/*global story, jQuery, document, module, test, same, config */

jQuery(document).ready(function () {
    module("SharedNotesPlugin");

    test("Initialization", function () {

		same(version.extensions.SharedNotesPlugin.installed, true, 'is installed');

		same(typeof config.macros.SharedNotes, "object", 'is defined');

		same(config.options.txtSharedNotesUserName, "YourName", 
            'txtSharedNotesUserName is "YourName" by default');

		same(config.options.chkSharedNotesPutEnabled, true,
            'chkSharedNotesPutEnabled is true by default');

		same(config.options.chkSharedNotesGetEnabled, true,
            'chkSharedNotesGetEnabled is true by default');

		same(config.macros.SharedNotes.tag.note, "notes",
            'note tag is "notes" by default');

		same(config.macros.SharedNotes.tag.discovered, "discovered_notes",
            'discovered notes tag is "discovered_notes" by default');

		same(config.macros.SharedNotes.tag.privated, "private",
            'private notes tag is "private" by default');

        same(config.macros.SharedNotes.busy, false,
            'not busy by default');
    });

/*
     NEEDS MOCKS!

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
*/

});
