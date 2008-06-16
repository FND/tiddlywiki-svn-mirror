// <![CDATA[

function __mainSharedNotesAdaptor() {
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

describe('SharedNotesAdaptorPlugin Adaptor Initialization', {

        before_each : function() {
		__mainSharedNotesAdaptor();
        },

	'Adaptor is present' : function() {
		value_of(version.extensions.SharedNotesAdaptorPlugin.installed).should_be(true);
	},
	'Adaptor serverType is present and correct' : function() {
		value_of(SharedNotesAdaptor.serverType).should_be('sharednotes');
	},
	'Adaptor serverParsingErrorMessage is present and correct' : function() {
		value_of(SharedNotesAdaptor.serverParsingErrorMessage).should_be("Error parsing result from server");
	},
	'Adaptor errorInFunctionMessage is present and correct' : function() {
		value_of(SharedNotesAdaptor.errorInFunctionMessage).should_be("Error in function SharedNotesAdaptor.%0");
	},
	'Adaptor constructor is present' : function() {
		value_of(typeof SharedNotesAdaptor).should_be("function");
	},
	'Adaptor is installed as an adaptor' : function() {
		value_of(config.adaptors['sharednotes']).should_be(SharedNotesAdaptor);
	},
	'FileAdaptor remains as the defaultAdaptor' : function() {
		value_of(config.defaultAdaptor).should_be(FileAdaptor.serverType);
	}
	
});

describe('SharedNotesAdaptorPlugin false status', {
        before_each : function() {
		__mainSharedNotesAdaptor();
		__url = "http://example.com/conference";
		__xhr = {statusText:"something is technically wrong"};
		__context = {};
		__doc = '';
		SharedNotesAdaptor.loadTiddlyWikiCallback(false,__context,__doc,__url,__xhr);
        },
	'false status should set context status to false' : function() {
		value_of(__context.status).should_be(false);
	},
	'false status should set context statusText from HTTP response header' : function() {
		value_of(__context.statusText).should_be("Error getting notes file");
	}
});

describe('SharedNotesAdaptorPlugin empty document', {
        before_each : function() {
		__tiddlers = SharedNotesAdaptor.parse('');
        },
	'empty agenda should set context status to false' : function() {
		value_of(__tiddlers.length).should_be(0);
	}
});

describe('SharedNotesAdaptorPlugin parsing a simple document', {

        before_each : function() {
		__text = '<?xml version="1.0"?>'
		+ '<rss version="2.0" xmlns:tw="http://www.tiddlywiki.com/">'
		+ '<channel>'
		+ '<title>My TiddlyWiki</title>'
		+ '<description>a reusable non-linear personal web notebook</description>'
		+ '<pubDate>Sun, 15 Jun 2008 20:49:24 GMT</pubDate>'
		+ '<lastBuildDate>Sun, 15 Jun 2008 20:49:24 GMT</lastBuildDate>' 
		+ '<link>http://www.tiddlywiki.com/</link>'
		+ '<generator>TiddlyWiki 2.4.0 (Notes)</generator>'
		+ '<item>'
		+ ' <title>notes from psd</title>'
		+ ' <author>Bart Simpson</author>'
		+ ' <description>stuff and nonsence in HTML</description>'
		+ ' <tw:wikitext>stuff and nonsence in wikitext</tw:wikitext>' 
		+ ' <category>tag1</category>'
		+ ' <category>tag2</category>' 
		+ ' <pubDate>Sun, 15 Jun 2008 20:49:24 GMT</pubDate>'
		+ '</item>'
		+ '</channel>'
		+ '</rss>';
		__tiddlers = SharedNotesAdaptor.parse(__text);
        },
	after_each : function() {
		__tiddlers = undefined;
	},
	'should result in tiddlers' : function() {
		value_of(__tiddlers.length).should_be(1);
	},
	'first tiddler should have the title "notes from psd"' : function() {
		value_of(__tiddlers[0].title).should_be('notes from psd');
	},
	'first tiddler should have the content from wikitext' : function() {
		value_of(__tiddlers[0].text).should_be('stuff and nonsence in wikitext');
	},
	'first tiddler modifier should be taken from the author' : function() {
		value_of(__tiddlers[0].modifier).should_be('Bart Simpson');
	},
	'first tiddler created should be the pubDate' : function() {
		value_of(__tiddlers[0].created.toUTCString()).should_be("Sun, 15 Jun 2008 20:49:24 GMT");
	},
	'first tiddler modified should be the pubDate' : function() {
		value_of(__tiddlers[0].modified.toUTCString()).should_be("Sun, 15 Jun 2008 20:49:24 GMT");
	},
});

// ]]>
