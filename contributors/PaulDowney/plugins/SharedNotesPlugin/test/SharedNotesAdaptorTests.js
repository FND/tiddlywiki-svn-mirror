/*global story, jQuery, document, module, test, same, SharedNotesAdaptor, __context, config, FileAdaptor */

jQuery(document).ready(function () {
    module("SharedNotesAdaptor");

    test("Initialization", function () {

        same(version.extensions.SharedNotesAdaptorPlugin.installed, true,
            'Adaptor is present');

		same(SharedNotesAdaptor.serverType, 'sharednotes',
            'Adaptor serverType is present and correct');

		same(SharedNotesAdaptor.serverParsingErrorMessage, "Error parsing result from server",
            'Adaptor serverParsingErrorMessage is present and correct');

		same(SharedNotesAdaptor.errorInFunctionMessage, "Error in function SharedNotesAdaptor.%0",
            'Adaptor errorInFunctionMessage is present and correct');

		same(typeof SharedNotesAdaptor, "function",
            'Adaptor constructor is present');

		same(config.adaptors['sharednotes'], SharedNotesAdaptor,
            'Adaptor is installed as an adaptor');

		same(config.defaultAdaptor, FileAdaptor.serverType,
            'FileAdaptor remains as the defaultAdaptor');
    });

    test("false status", function () {

        __context = {};

		SharedNotesAdaptor.loadTiddlyWikiCallback(false,__context,'',
            "http://example.com/conference",
             {statusText:"something is technically wrong"});

		same(__context.status, false,
            'false status should set context status to false');

		same(__context.statusText, "Error getting notes file",
            'false status should set context statusText from HTTP response header');
    });

    test("empty document", function () {
		var tiddlers = SharedNotesAdaptor.parse('');

		same(tiddlers.length, 0,
            'empty agenda should set context status to false');
    });

    test("parsing a simple document", function () {

		var tiddlers = SharedNotesAdaptor.parse('<?xml version="1.0"?>' +
		'<rss version="2.0" xmlns:tw="http://www.tiddlywiki.com/">' +
		'<channel>' +
		'<title>My TiddlyWiki</title>' +
		'<description>a reusable non-linear personal web notebook</description>' +
		'<pubDate>Sun, 15 Jun 2008 20:49:24 GMT</pubDate>' +
		'<lastBuildDate>Sun, 15 Jun 2008 20:49:24 GMT</lastBuildDate>'  +
		'<link>http://www.tiddlywiki.com/</link>' +
		'<generator>TiddlyWiki 2.4.0 (Notes)</generator>' +
		'<item>' +
		' <title>notes from psd</title>' +
		' <author>Bart Simpson</author>' +
		' <description>stuff and nonsence in HTML</description>' +
		' <tw:wikitext>stuff and nonsence in wikitext</tw:wikitext>'  +
		' <category>tag1</category>' +
		' <category>tag2</category>'  +
		' <pubDate>Sun, 15 Jun 2008 20:49:24 GMT</pubDate>' +
		'</item>' +
		'</channel>' +
		'</rss>');

		same(tiddlers.length, 1, 'should result in a tiddler');

		same(tiddlers[0].title, 'notes from psd',
            'first tiddler should have the title "notes from psd"');

		same(tiddlers[0].text, 'stuff and nonsence in wikitext',
            'first tiddler should have the content from wikitext');

		same(tiddlers[0].modifier, 'Bart Simpson',
            'first tiddler modifier should be taken from the author');

		same(tiddlers[0].created.toUTCString(), "Sun, 15 Jun 2008 20:49:24 GMT",
            'first tiddler created should be the pubDate');

		same(tiddlers[0].modified.toUTCString(), "Sun, 15 Jun 2008 20:49:24 GMT",
            'first tiddler modified should be the pubDate');
	});
});
