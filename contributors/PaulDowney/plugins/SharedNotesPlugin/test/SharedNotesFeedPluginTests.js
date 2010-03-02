/*global story, jQuery, document, module, test, same */

jQuery(document).ready(function () {
    module("SharedNotesFeedPlugin");

    /*
     *  XML parsing 
     *  -- should idealy be a separate plugin, but only needed by the tests ..
     */
    var parseXML = function(text) {
        var doc;
        if(window.ActiveXObject) {
            doc = new ActiveXObject("Microsoft.XMLDOM");
            doc.async = "false";
            doc.loadXML(text);
        } else {
            var parser = new DOMParser();
            doc = parser.parseFromString(text,"text/xml");
        }
        if(!doc) {
            return null;
        }

        doc.xpath = function(expression, type) {
            var t;

            if(type == "string") { t = XPathResult.STRING_TYPE; }
            if(type == "number") { t = XPathResult.NUMBER_TYPE; }
            if(type == "boolean") { t = XPathResult.BOOLEAN_TYPE; }
            if(type == "singlenode") { t = XPathResult.SINGLENODE_TYPE; }

            var res = this.evaluate(expression, this, null, t, null);

            if(type == "string") { return res.stringValue; }
            if(type == "number") { return res.numberValue; }
            if(type == "boolean") { return res.booleanValue; }
            if(type == "singleNode") { return this.singleNodeValue; }
            return null;
        };

        return doc;
    };

    var isoDatePattern = /^[A-Z][a-z]+, [0-9]{1,2} [A-Z][A-z]+ [0-9]{4} [0-9]{2}:[0-9]{2}:[0-9]{2} (UTC|GMT)$/;

    test("Initialization", function () {

		same(version.extensions.SharedNotesFeedPlugin.installed, true, 'is installed');

		same(typeof config.macros.SharedNotesFeed, "object", 'is defined');
    });

    test('serialize XML', function () {

        var text = config.macros.SharedNotesFeed.serialize([], {});

        same(typeof text, 'string', 'produces a string value');

		// <?xml version='1.0'?>
		// <?xml version="1.0" ?>
		// <?xml version="1.0" encoding='utf-8' ?>
        ok(text.match(/^<\?xml\s+version=(["'])1.0\1\s*(encoding=(["'])utf-8\2)?\s*\?>/),
            'should start with an XML 1.0 declaration');
    });

    test('serialize channel', function () {

        var text = config.macros.SharedNotesFeed.serialize([], {});
        var xml = parseXML(text);

        same(xml.documentElement.nodeName, "rss",
            'document node should be "rss"');

        same(xml.documentElement.getAttribute("version"), "2.0",
            'rss version should be "2.0"');

		same(xml.xpath("count(/rss/channel)", "number"), 1, 
            'document should have a single channel element');

		same(xml.xpath("/rss/channel/title", "string"), 'TiddlyWiki',
            'channel title should be the TiddlyWiki title');

		same(xml.xpath("/rss/channel/description", "string"), 'SharedNotesPlugin',
            'channel description should be the TiddlyWiki subtitle');

		ok(xml.xpath("/rss/channel/pubDate", "string").match(isoDatePattern),
            'channel pubDate should be an RFC 822 format date');

		ok(xml.xpath("/rss/channel/lastBuildDate", "string").match(isoDatePattern),
            'channel lastBuildDate should be an RFC 822 format date');

		ok(xml.xpath("/rss/channel/generator", "string").match(/^TiddlyWiki.*\(Notes\)$/),
            'channel generator');

		same(xml.xpath("count(/rss/channel/item)", "number"), 0,
            'channel for empty tiddler list should have no items');
    });

    test('serialize channel optional values', function () {

        same(xml.documentElement.nodeName, "rss", 'null options value');

		var title = 'A Different Title';
		store.createTiddler('SiteTitle').set(null,title);
		parseSharedNotes([],{});
		same(xml.xpath("/rss/channel/title", "string"), title,
        'channel title asserted');

        'channel title contains quotes');
		var title = 'Escape\'s "escaping"';
		store.createTiddler('SiteTitle').set(null,title);
		parseSharedNotes([],{});
		same(xml.xpath("/rss/channel/title", "string"), title,
        'channel SubTitle asserted');
		var subtitle = 'A Different SubTitle';
		store.createTiddler('SiteSubtitle').set(null,subtitle);
		parseSharedNotes([],{});
		same(xml.xpath("/rss/channel/description", "string"), subtitle,
        'channel link for a empty URI defaults to the SiteUrl');
		var uri = store.getTiddlerText('SiteUrl');
		parseSharedNotes([],{});
		same(xml.xpath("/rss/channel/link", "string"), uri,

        'channel link is options.uri');
		var uri = "http://example.com";
		parseSharedNotes([],{uri:uri});
		same(xml.xpath("/rss/channel/link", "string"), uri,

        'channel link containing ampersands');
		var uri = "http://example.com?foo=bar&snark=snork";
		parseSharedNotes([],{uri:uri});
		same(xml.xpath("/rss/channel/link", "string"), uri,
	}
});

test('SharedNotesFeed: serialize channel single tiddler', function () {
        before_each);
		clearSharedNotesFeedPlugin();
		main();
		title = 'notes from psd';
		note = 'blah blah blah and thrice blah';
		user = 'AssertedUser';
		tiddlers = [];
		var t = new Tiddler(title);
		t.text = note;
		t.modifier = user;
		tiddlers.push(t);
		parseSharedNotes(tiddlers,{});
        'document should have a single item element');
		same(xml.xpath("count(/rss/channel/item)", "number"), 1,
        'item title should match tiddler title');
		same(xml.xpath("/rss/channel/item[1]/title", "string"), title,
        'item description should match plain tiddler text');
		same(xml.xpath("/rss/channel/item[1]/description", "string"), note,
        'item author should match tiddler modifier by default');
		same(xml.xpath("/rss/channel/item[1]/author", "string"), user,
        'item author should match options.modifier when provided');
		parseSharedNotes(tiddlers,{modifier:'New Order'});
		same(xml.xpath("/rss/channel/item[1]/author", "string"), 'New Order',
        'item wikitext should match plain wikitext');
		//TBD: resolve namespaces in XPath
		//same(xml.xpath("/rss/channel/item[1]/wikitext", "string"), note,
        'item without tags should have no categories');
		same(xml.xpath("count(/rss/channel/item[1]/category)", "number"), 0,
        'item pubDate should be an RFC 822 format date');
		same(xml.xpath("/rss/channel/item[1]/pubDate", "string")).should_match(isoDatePattern,
	}
});

    test('SharedNotesFeed: serialize channel tiddler categories', function () {
        before_each);
		clearSharedNotesFeedPlugin();
		main();
		title = 'notes from psd';
		note = 'blah blah blah and thrice blah';
		user = 'AssertedUser';
		tiddlers = [];
		var t = new Tiddler(title);
		t.text = note;
		t.modifier = user;
		tiddlers.push(t);
        'single tag should appear as single category');
		tiddlers[0].set(null,null,null,null,"tag1");
		parseSharedNotes(tiddlers,{});
		same(xml.xpath("/rss/channel/item[1]/category", "string"), "tag1",
	},
        'two tags should appear as category list');
		tiddlers[0].set(null,null,null,null,"tag1 tag2");
		parseSharedNotes(tiddlers,{});
		same(xml.xpath("/rss/channel/item[1]/category[1]", "string"), "tag1",
		same(xml.xpath("/rss/channel/item[1]/category[2]", "string"), "tag2",
	},
        'tags with spaces should appear as category list');
		tiddlers[0].set(null,null,null,null,"[[tag one]] [[tag two]]");
		parseSharedNotes(tiddlers,{});
		same(xml.xpath("/rss/channel/item[1]/category[1]", "string"), "tag one",
		same(xml.xpath("/rss/channel/item[1]/category[2]", "string"), "tag two",
	},
        'two tags on two items');
		var t = new Tiddler(title);
		t.text = note;
		t.modifier = user;
		tiddlers.push(t);
		tiddlers[0].set(null,null,null,null,"tag1 tag2");
		tiddlers[1].set(null,null,null,null,"tag3 tag4");
		parseSharedNotes(tiddlers,{});
		same(xml.xpath("/rss/channel/item[1]/category[1]", "string"), "tag1",
		same(xml.xpath("/rss/channel/item[1]/category[2]", "string"), "tag2",
		same(xml.xpath("/rss/channel/item[2]/category[1]", "string"), "tag3",
		same(xml.xpath("/rss/channel/item[2]/category[2]", "string"), "tag4",
	console.log(text);
	}
});

*/
    test('serialize channel tiddler fields as categories', function () {
		var title = 'notes from psd';
		var note = 'blah blah blah and thrice blah';
		var user = 'AssertedUser';
		var tiddlers = [];

		var t = new Tiddler(title);
		t.text = note;
		t.modifier = user;
		t.fields['rr_session_id'] = "123456:7890";
		tiddlers.push(t);
		tiddlers[0].set(null,null,null,null,"tag1");

        var text = config.macros.SharedNotesFeed.serialize(tiddlers, {});
        var xml = parseXML(text);

		same(xml.xpath("/rss/channel/item[1]/category[1]", "string"), "123456:7890",
            'session_id field should be first category');

		same(xml.xpath("/rss/channel/item[1]/category[2]", "string"), "tag1",
            'tag1 field should be a category');

        text = config.macros.SharedNotesFeed.serialize(tiddlers, {session_prefix:'some:prefix='});
        xml = parseXML(text);

		same(xml.xpath("/rss/channel/item[1]/category[1]", "string"), "some:prefix=123456:7890",
            'session_id field should be first category and have session_prefix');
    });

});
