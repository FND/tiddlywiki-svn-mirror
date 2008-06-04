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
	'should result in tiddlers' : function() {
		value_of(__tiddlers.length).should_be(4);
	},

	/*
	 *  track
	 */
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

	/*
	 *  session
	 */
	'second tiddler should have the title set from the session id': function() {
		value_of(__tiddlers[1].title).should_be('session-99');
	},
	'session tiddler should have the field "rr_session_id" set to the session id': function() {
		value_of(__tiddlers[1].fields.rr_session_id).should_be('session-99');
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
	},

	/*
	 *  speaker
	 */
	'third tiddler should have the title set from the first speaker': function() {
		value_of(__tiddlers[2].title).should_be('May Bore');
	},
	'speaker should have the content set to the SpeakerSession macro': function() {
		value_of(__tiddlers[2].text).should_be('');
	},

	'third tiddler should have the title set from the first speaker': function() {
		value_of(__tiddlers[3].title).should_be('John Doe');
	},

});

describe('ConfabbAgendaAdaptorPlugin parsing les blogs', {

        before_each : function() {
		__doc = '<?xml version="1.0" encoding="UTF-8"?>'
+'<conference>'
+'  <title>Les Blogs 2 Sessions</title>'
+'  <link>http://staging.confabb.com/conferences/16574-les-blogs-2/sessions</link>'
+'  <description>Sessions for Les Blogs 2</description>'
+'  <session id="16574-672">'
+'    <title>Naked Conversations</title>'
+'    <link>http://staging.confabb.com/conferences/16574-les-blogs-2/sessions/672/details</link>'
+'    <description>A discussion about blogs and "naked conversations" and how blogs are overtaking the mainstream media as influencers.</description>'
+'    <starttime>20051205094508</starttime>'
+'    <endtime>20051205103008</endtime>'
+'    <day>1</day>'
+'    <track>Corporate World</track>'
+'    <location></location>'
+'    <guid>http://staging.confabb.com/conferences/16574-les-blogs-2/sessions/672/details</guid>'
+'    <speaker>'
+'      <title>Robert Scoble</title>'
+'    </speaker>'
+'    <speaker>'
+'      <title>Shel Israel</title>'
+'    </speaker>'
+'  </session>'
+'  <session id="16574-318">'
+'    <title>Investing 2.0 : The Good, The Bad and The Ugly</title>'
+'    <link>http://staging.confabb.com/conferences/16574-les-blogs-2/sessions/318/details</link>'
+'    <description>Social Media and more broadly, Web 2.0, have seen a flurry of activity over the past 18 months: startups creation, VC financing, mergers and acquisitions, established players jumping in the fray,... This panel, made up of key witnesses of the Web 2.0 phenomena, will take a retrospective, and sarcastic, look at key trends in this "frothy" market, and where it might go from there.'
+''
+'    * David Hornik, August Capital, USA'
+'    * Tristan Nitot, Mozilla Europe, France'
+'    * Jeff Clavier, Softtech VC, USA</description>'
+'    <starttime>20051205160044</starttime>'
+'    <endtime>20051205170044</endtime>'
+'    <day>1</day>'
+'    <track></track>'
+'    <location></location>'
+'    <guid>http://staging.confabb.com/conferences/16574-les-blogs-2/sessions/318/details</guid>'
+'    <speaker>'
+'      <title>David Hornik</title>'
+'    </speaker>'
+'    <speaker>'
+'      <title>Tristan Nitot</title>'
+'    </speaker>'
+'    <speaker>'
+'      <title>Jeff Clavier</title>'
+'    </speaker>'
+'  </session>'
+'  <session id="16574-489">'
+'    <title>Tracking/Listening to the Online World</title>'
+'    <link>http://staging.confabb.com/conferences/16574-les-blogs-2/sessions/489/details</link>'
+'    <description>No one can afford to be blind and deaf in this new online world. Our panelists will discuss the current state of the art for tracking what is happening in the blogosphere, giving tips and advice on how to keep up with the rapid changes in technology. '
+''
+'Moderated by Guillaume du Gardier '
+'* Mark Rogers, CEO, Market Sentinel, UK '
+'* Salim Ismail, CEO, PubSub, USA '
+'* David Sifry, CEO, Technorati, USA '
+'* Yann Motte, VP Product Management, Yahoo! Europe, U.K. '
+'* Mark Fletcher, Founder, Bloglines, USA</description>'
+'    <starttime>20051206144522</starttime>'
+'    <endtime>20051206154522</endtime>'
+'    <day>2</day>'
+'    <track></track>'
+'    <location></location>'
+'    <guid>http://staging.confabb.com/conferences/16574-les-blogs-2/sessions/489/details</guid>'
+'    <speaker user-id="7">'
+'      <title> Salim Ismail</title>'
+'      <link>http://staging.confabb.com/users/profile/salim</link>'
+'    </speaker>'
+'    <speaker>'
+'      <title>Mark Rogers</title>'
+'    </speaker>'
+'    <speaker>'
+'      <title>David Sifry</title>'
+'    </speaker>'
+'    <speaker>'
+'      <title>Yann Motte</title>'
+'    </speaker>'
+'    <speaker>'
+'      <title>Mark Fletcher</title>'
+'    </speaker>'
+'  </session>'
+'  <vcard user-id="7">'
+'    <fn>Salim Ismail</fn>'
+'    <profile>http://staging.confabb.com/users/profile/salim</profile>'
+'    <url>http://confabb.com</url>'
+'    <bio>Salim Ismail is a successful angel investor and entrepreneur, and is a frequent speaker on internet technologies, private equity, entrepreneurship and Salim blogs at www.salimismail.com.'
+''
+'Salim currently runs the Yahoo! Brickhouse, Yahoo\'s internal \'ideas factory\' and its answer to the tiny, nimble shops that have nipped at its heels in recent years.'
+'</bio>'
+'    <photo>/user/photo/7/SI_head_shot.JPG</photo>'
+'    <job-title>Chairman</job-title>'
+'    <employer>Confabb</employer>'
+'    <blog>http://salimismail.com</blog>'
+'  </vcard>'
+'</conference>'
	},

	'should result in tiddlers' : function() {
		value_of(__tiddlers.length).should_be(4);
	},

});


// ]]>

