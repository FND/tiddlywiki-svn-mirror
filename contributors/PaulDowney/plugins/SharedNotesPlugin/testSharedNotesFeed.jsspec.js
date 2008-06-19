// <![CDATA[

var __isoDatePattern = /^[A-Z][a-z]+, [0-9]{1,2} [A-Z][A-z]+ [0-9]{4} [0-9]{2}:[0-9]{2}:[0-9]{2} (UTC|GMT)$/;

function __main() {
        store = new TiddlyWiki();
        loadShadowTiddlers();
        formatter = new Formatter(config.formatters);
        store.loadFromDiv("storeArea","store",true);
        loadPlugins();
}

function __clearSharedNotesFeedPlugin() {
	version.extensions.SharedNotesFeedPlugin = undefined;
	__xml = undefined;
	__text = undefined;
}

function __parseSharedNotes(tiddlers,options) {
	__text = config.macros.SharedNotesFeed.serialize(tiddlers,options);
	__xml = tests_xml.parse(__text);
}

describe('SharedNotesFeed: Initialisation', {

        before_each : function() {
		__clearSharedNotesFeedPlugin();
		__main();
        },
	'is installed' : function() {
		value_of(version.extensions.SharedNotesFeedPlugin.installed).should_be(true);
	},
	'is defined' : function() {
		value_of(typeof config.macros.SharedNotesFeed).should_be("object");
	}
});

describe('SharedNotesFeed: serialize XML', {

        before_each : function() {
		__clearSharedNotesFeedPlugin();
		__main();
		__parseSharedNotes([],{});
        },
        'produces a string value' : function() { 
                value_of(typeof __text).should_be('string');
        },
        'should start with an XML 1.0 declaration' : function() { 
		// <?xml version='1.0'?>
		// <?xml version="1.0" ?>
		// <?xml version="1.0" encoding='utf-8' ?>
                value_of(__text).should_match(/^<\?xml\s+version=(["'])1.0\1\s*(encoding=(["'])utf-8\2)?\s*\?>/);
        },
        'should be well-formed XML' : function() { 
                var __xml = tests_xml.parse(__text);
                value_of(typeof __xml).should_match('object');
	}
});

describe('SharedNotesFeed: serialize channel', {

        before_each : function() {
		__clearSharedNotesFeedPlugin();
		__main();
		__parseSharedNotes([],{});
        },
        'document node should be "rss"' : function() { 
                value_of(__xml.documentElement.nodeName).should_be("rss");
        },
        'rss version should be "2.0"' : function() { 
                value_of(__xml.documentElement.getAttribute("version")).should_be("2.0");
        },
        'document should have a single channel element' : function() { 
		value_of(__xml.xpath("count(/rss/channel)", "number")).should_be(1);
        },
        'channel title should be the default TiddlyWiki title' : function() { 
		value_of(__xml.xpath("/rss/channel/title", "string")).should_be('My TiddlyWiki');
        },
        'channel description should be the default TiddlyWiki subtitle' : function() { 
		value_of(__xml.xpath("/rss/channel/description", "string")).should_be('a reusable non-linear personal web notebook');
        },
        'channel pubDate should be an RFC 822 format date' : function() { 
		value_of(__xml.xpath("/rss/channel/pubDate", "string")).should_match(__isoDatePattern);
	},
        'channel lastBuildDate should be an RFC 822 format date' : function() { 
		value_of(__xml.xpath("/rss/channel/lastBuildDate", "string")).should_match(__isoDatePattern);
	},
        'channel generator' : function() { 
		value_of(__xml.xpath("/rss/channel/generator", "string")).should_match(/^TiddlyWiki.*\(Notes\)$/);
	},
        'channel for empty tiddler list should have no items' : function() { 
		value_of(__xml.xpath("count(/rss/channel/item)", "number")).should_be(0);
        }
});

describe('SharedNotesFeed: serialize channel optional values', {

        before_each : function() {
		__clearSharedNotesFeedPlugin();
		__main();
        },
        'null options value' : function() { 
		__parseSharedNotes([],{});
                value_of(__xml.documentElement.nodeName).should_be("rss");
        },
        'channel title asserted' : function() { 
		var title = 'A Different Title';
		store.createTiddler('SiteTitle').set(null,title);
		__parseSharedNotes([],{});
		value_of(__xml.xpath("/rss/channel/title", "string")).should_be(title);
        },
        'channel title contains quotes' : function() { 
		var title = 'Escape\'s "escaping"';
		store.createTiddler('SiteTitle').set(null,title);
		__parseSharedNotes([],{});
		value_of(__xml.xpath("/rss/channel/title", "string")).should_be(title);
        },
        'channel SubTitle asserted' : function() { 
		var subtitle = 'A Different SubTitle';
		store.createTiddler('SiteSubtitle').set(null,subtitle);
		__parseSharedNotes([],{});
		value_of(__xml.xpath("/rss/channel/description", "string")).should_be(subtitle);
        },
        'channel link for a empty URI defaults to the SiteUrl' : function() { 
		var uri = store.getTiddlerText('SiteUrl');
		__parseSharedNotes([],{});
		value_of(__xml.xpath("/rss/channel/link", "string")).should_be(uri);
	},
        'channel link is options.uri' : function() { 
		var uri = "http://example.com";
		__parseSharedNotes([],{uri:uri});
		value_of(__xml.xpath("/rss/channel/link", "string")).should_be(uri);
	},
        'channel link containing ampersands' : function() { 
		var uri = "http://example.com?foo=bar&snark=snork";
		__parseSharedNotes([],{uri:uri});
		value_of(__xml.xpath("/rss/channel/link", "string")).should_be(uri);
	}
});

describe('SharedNotesFeed: serialize channel single tiddler', {
        before_each : function() {
		__clearSharedNotesFeedPlugin();
		__main();
		__title = 'notes from psd';
		__note = 'blah blah blah and thrice blah';
		__user = 'AssertedUser';
		__tiddlers = [];
		var t = new Tiddler(__title);
		t.text = __note;
		t.modifier = __user;
		__tiddlers.push(t);
		__parseSharedNotes(__tiddlers,{});
        },
        'document should have a single item element' : function() { 
		value_of(__xml.xpath("count(/rss/channel/item)", "number")).should_be(1);
        },
        'item title should match tiddler title' : function() { 
		value_of(__xml.xpath("/rss/channel/item[1]/title", "string")).should_be(__title);
        },
        'item description should match plain tiddler text' : function() { 
		value_of(__xml.xpath("/rss/channel/item[1]/description", "string")).should_be(__note);
        },
        'item author should match tiddler modifier by default' : function() { 
		value_of(__xml.xpath("/rss/channel/item[1]/author", "string")).should_be(__user);
        },
        'item author should match options.modifier when provided' : function() { 
		__parseSharedNotes(__tiddlers,{modifier:'New Order'});
		value_of(__xml.xpath("/rss/channel/item[1]/author", "string")).should_be('New Order');
        },
        'item wikitext should match plain wikitext' : function() { 
		//TBD: resolve namespaces in XPath
		//value_of(__xml.xpath("/rss/channel/item[1]/wikitext", "string")).should_be(__note);
        },
        'item without tags should have no categories' : function() { 
		value_of(__xml.xpath("count(/rss/channel/item[1]/category)", "number")).should_be(0);
        },
        'item pubDate should be an RFC 822 format date' : function() { 
		value_of(__xml.xpath("/rss/channel/item[1]/pubDate", "string")).should_match(__isoDatePattern);
	}
});

describe('SharedNotesFeed: serialize channel tiddler categories', {
        before_each : function() {
		__clearSharedNotesFeedPlugin();
		__main();
		__title = 'notes from psd';
		__note = 'blah blah blah and thrice blah';
		__user = 'AssertedUser';
		__tiddlers = [];
		var t = new Tiddler(__title);
		t.text = __note;
		t.modifier = __user;
		__tiddlers.push(t);
        },
        'single tag should appear as single category' : function() { 
		__tiddlers[0].set(null,null,null,null,"tag1");
		__parseSharedNotes(__tiddlers,{});
		value_of(__xml.xpath("/rss/channel/item[1]/category", "string")).should_be("tag1");
	},
        'two tags should appear as category list' : function() { 
		__tiddlers[0].set(null,null,null,null,"tag1 tag2");
		__parseSharedNotes(__tiddlers,{});
		value_of(__xml.xpath("/rss/channel/item[1]/category[1]", "string")).should_be("tag1");
		value_of(__xml.xpath("/rss/channel/item[1]/category[2]", "string")).should_be("tag2");
	},
        'tags with spaces should appear as category list' : function() { 
		__tiddlers[0].set(null,null,null,null,"[[tag one]] [[tag two]]");
		__parseSharedNotes(__tiddlers,{});
		value_of(__xml.xpath("/rss/channel/item[1]/category[1]", "string")).should_be("tag one");
		value_of(__xml.xpath("/rss/channel/item[1]/category[2]", "string")).should_be("tag two");
	},
        'two tags on two items' : function() { 
		var t = new Tiddler(__title);
		t.text = __note;
		t.modifier = __user;
		__tiddlers.push(t);
		__tiddlers[0].set(null,null,null,null,"tag1 tag2");
		__tiddlers[1].set(null,null,null,null,"tag3 tag4");
		__parseSharedNotes(__tiddlers,{});
		value_of(__xml.xpath("/rss/channel/item[1]/category[1]", "string")).should_be("tag1");
		value_of(__xml.xpath("/rss/channel/item[1]/category[2]", "string")).should_be("tag2");
		value_of(__xml.xpath("/rss/channel/item[2]/category[1]", "string")).should_be("tag3");
		value_of(__xml.xpath("/rss/channel/item[2]/category[2]", "string")).should_be("tag4");
	console.log(__text);
	}
});

describe('SharedNotesFeed: serialize channel tiddler fields as categories', {
        before_each : function() {
		__clearSharedNotesFeedPlugin();
		__main();
		__title = 'notes from psd';
		__note = 'blah blah blah and thrice blah';
		__user = 'AssertedUser';
		__tiddlers = [];
		var t = new Tiddler(__title);
		t.text = __note;
		t.modifier = __user;
		t.fields['rr_session_id'] = "123456:7890";
		__tiddlers.push(t);
		__tiddlers[0].set(null,null,null,null,"tag1");
        },
        'session_id field should be first category' : function() { 
		__parseSharedNotes(__tiddlers,{});
		value_of(__xml.xpath("/rss/channel/item[1]/category[1]", "string")).should_be("123456:7890");
	},
        'tag1 field should be a category' : function() { 
		__parseSharedNotes(__tiddlers,{});
		value_of(__xml.xpath("/rss/channel/item[1]/category[2]", "string")).should_be("tag1");
	},
        'session_id field should be first category and have session_prefix' : function() { 
		__parseSharedNotes(__tiddlers,{session_prefix:'some:prefix='});
		value_of(__xml.xpath("/rss/channel/item[1]/category[1]", "string")).should_be("some:prefix=123456:7890");
	},
});

// ]]>
