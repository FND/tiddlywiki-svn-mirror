// <![CDATA[

function __main() {
		version.extensions = {};
		tests_mock.before('refreshDisplay');
		tests_mock.before('saveTest', function() { tests_mock.before('store.notifyAll'); });
		tests_mock.before('restart');
		tests_mock.before('backstage.init');
		main();
		tests_mock.after('backstage.init');
		tests_mock.after('restart');
		tests_mock.after('saveTest');
		tests_mock.after('store.notifyAll');
		tests_mock.after('refreshDisplay');
}

describe('ConfabbAgendaAdaptorPlugin Adaptor Initialization', {

        before_each : function() {
		__main();
        },

	'Adaptor is present' : function() {
		value_of(version.extensions.ConfabbAgendaAdaptorPlugin.installed).should_be(true);
	},
	'Adaptor serverType is present and correct' : function() {
		value_of(ConfabbAgendaAdaptor.serverType).should_be('confabbagenda');
	},
	'Adaptor serverParsingErrorMessage is present and correct' : function() {
		value_of(ConfabbAgendaAdaptor.serverParsingErrorMessage).should_be("Error parsing result from server");
	},
	'Adaptor errorInFunctionMessage is present and correct' : function() {
		value_of(ConfabbAgendaAdaptor.errorInFunctionMessage).should_be("Error in function ConfabbAgendaAdaptor.%0");
	},
	'Adaptor constructor is present' : function() {
		value_of(typeof ConfabbAgendaAdaptor).should_be("function");
	},
	'Adaptor is installed as an adaptor' : function() {
		value_of(config.adaptors['confabbagenda']).should_be(ConfabbAgendaAdaptor);
	},
	'FileAdaptor remains as the defaultAdaptor' : function() {
		value_of(config.defaultAdaptor).should_be(FileAdaptor.serverType);
	}
	
});

describe('ConfabbAgendaAdaptorPlugin false status', {
        before_each : function() {
		__main();
		__url = "http://example.com/confabb/conference";
		__xhr = {statusText:"something is technically wrong"};
		__context = {};
		__doc = '';
		ConfabbAgendaAdaptor.loadTiddlyWikiCallback(false,__context,__doc,__url,__xhr);
        },
	'false status should set context status to false' : function() {
		value_of(__context.status).should_be(false);
	},
	'false status should set context statusText from HTTP response header' : function() {
		value_of(__context.statusText).should_be("Error reading agenda file");
	}
});

describe('ConfabbAgendaAdaptorPlugin empty document', {
        before_each : function() {
		__tiddlers = ConfabbAgendaAdaptor.parseAgenda('');
        },
	'empty agenda should set context status to false' : function() {
		value_of(__tiddlers.length).should_be(0);
	}
});

describe('ConfabbAgendaAdaptorPlugin parsing a simple document', {

        before_each : function() {
		__doc = '<?xml version="1.0" encoding="UTF-8"?>'
		    +'<conference>'
		    +'    <title>The Conference Title</title>'
		    +'    <link>http://confabb.com/conferences/foo/sessions</link>'
		    +'    <description>The Conference Description</description>'
		    +'    <session id="session-99">'
		    +'      <title>The First Session</title>'
		    +'      <link>http://staging.confabb.com/conferences/16074-web-2-0-conference-2006/sessions/20/details</link>'
		    +'      <description>The First Session Description.</description>'
		    +'      <day>1</day>'
		    +'      <starttime>20061107073019</starttime>'
		    +'      <endtime>20061107083019</endtime>'
		    +'      <track>Workshops / Tutorials</track>'
		    +'      <location>Grand Ballroom</location>'
		    +'      <speaker><title>May Bore</title></speaker>'
		    +'      <speaker><title>John Doe</title></speaker>'
		    +'    </session>'
		    +'</conference>';
		__tiddlers = ConfabbAgendaAdaptor.parseAgenda(__doc);
        },
	'should result in two tiddlers' : function() {
		value_of(__tiddlers.length).should_be(2);
	},

	'first tiddler should have the title "Day1"' : function() {
		value_of(__tiddlers[0].title).should_be('Day1');
	},
	'track tiddler should be tagged "track"' : function() {
		value_of(typeof __tiddlers[0].tags).should_be('object');
		value_of(__tiddlers[0].tags).should_be(['track']);
	},
	// TBD: wonder if this macro shouldn't be moved to the view template?
	'track tiddler content should be "<<AgendaTrackSessions>>"' : function() {
		value_of(__tiddlers[0].text).should_be('<<AgendaTrackSessions>>');
	},
	'track tiddler should have the field rr_session_tag set to the track id': function() {
		value_of(__tiddlers[0].fields.rr_session_tag).should_be('Day1');
	},
	'second tiddler should have the title set from the session id': function() {
		value_of(__tiddlers[1].title).should_be('session-99');
	},
	'session tiddler should have the field rr_session_title set from <title>': function() {
		value_of(__tiddlers[1].fields.rr_session_title).should_be('The First Session');
	},
	'session tiddler should have the field rr_session_starttime set from <starttime>': function() {
		value_of(__tiddlers[1].fields.rr_session_starttime).should_be('20061107073019');
	},
	'session tiddler should have the field rr_session_endtime set from <endtime>': function() {
		value_of(__tiddlers[1].fields.rr_session_endtime).should_be('20061107083019');
	},
	'session tiddler should have the field rr_session_location set from <location>': function() {
		value_of(__tiddlers[1].fields.rr_session_location).should_be('Grand Ballroom');
	},
	'session tiddler should have the field rr_session_link set from <link>': function() {
		value_of(__tiddlers[1].fields.rr_session_link).should_be('http://staging.confabb.com/conferences/16074-web-2-0-conference-2006/sessions/20/details');
	},
	'session tiddler should have the field rr_session_day set from <day>': function() {
		value_of(__tiddlers[1].fields.rr_session_day).should_be('Day1');
	},
	'session tiddler should have the content set from <description>': function() {
		value_of(__tiddlers[1].text).should_be('The First Session Description.');
	},
	'session tiddler should have the field rr_session_speakers set from <speaker> list': function() {
		value_of(__tiddlers[1].fields.rr_session_speakers).should_be('May Bore, John Doe');
	},
	'session tiddler should have the tags "session" and the track tag': function() {
		value_of(__tiddlers[1].tags).should_be(['session','WorkshopsTutorials','GrandBallroom','Day1','MayBore','JohnDoe']);
	}

});


// ]]>
