/*global story, jQuery, document, module, test, same */
(function ($) {
	function createWikifyTestElement(text) {
		var place = document.createElement("div");
		//place.style.display = "none";
		$(place).appendTo('body');
		wikify(text, place);
		return place;
	}

	function testExternalLink(a, url, text) {
		equals(a.attr("href"), url, "href");
		equals(a.text(), text, "text");
		equals(a.attr("refresh"), undefined, "refresh");
		equals(a.attr("tiddlylink"), undefined, "tiddlyLink");
		ok(a.hasClass("externalLink"), "has class 'externalLink'");
		equals(a.attr("title"), "External link to " + url, "title");
	}

	function testTiddlyLink(a, text, tiddler) {
		equals(a.attr("href"), "javascript:;", "href");
		equals(a.text(), text, "text");
		equals(a.attr("refresh"), "link");
		equals(a.attr("tiddlylink"), tiddler, "tiddlylink attribute");
		ok(a.hasClass("tiddlyLink"), "has class 'tiddlyLink'");
	}

	function testTiddlySpaceLink(a, url, text) {
		testExternalLink(a, url, text);
		ok(a.hasClass("tiddlySpaceLink"), "has class 'tiddlySpaceLink'");
	}

    jQuery(document).ready(function () {
        module("TiddlySpaceLinkPlugin");

		test('Wikifier: missing tiddlerLink should be a missing tiddlyLink', function() {
			var place = createWikifyTestElement("[[This Tiddler Does Not Exist]]");
			var a = $(place).find('a');
			equals($(a).attr("href"), "javascript:;");
			equals($(a).attr("title"), "The tiddler 'This Tiddler Does Not Exist' doesn't yet exist");
			equals($(a).attr("class"), "tiddlyLink tiddlyLinkNonExisting");
			equals($(a).attr("refresh"), "link");
			equals($(a).attr("tiddlyLink"), "This Tiddler Does Not Exist");
			equals($(a).text(), "This Tiddler Does Not Exist");
		});

		test('Wikifier: missing WikiWord should be a missing tiddlyLink', function() {
			var place = createWikifyTestElement("MissingWikiWord");
			var a = $(place).find('a');
			equals(a.attr("href"), "javascript:;");
			equals(a.attr("refresh"), "link");
			equals(a.attr("class"), "tiddlyLink tiddlyLinkNonExisting");
			equals(a.attr("title"), "The tiddler 'MissingWikiWord' doesn't yet exist");
			equals(a.attr("tiddlyLink"), "MissingWikiWord");
			equals(a.text(), "MissingWikiWord");
		});

		test('Wikifier: an Email address should be ignored', function() {
			var place = createWikifyTestElement("foo@example.com");
			equals($(place).find('a').length, 0);
			equals($(place).text(), "foo@example.com");
		});

		test('Wikifier: a dotted Email address should be ignored', function() {
			place = createWikifyTestElement("foo.bar@example.com");
			equals($(place).find('a').length, 0);
			equals($(place).text(), "foo.bar@example.com");
		});

		test('Wikifier: a spacename followed by a full stop', function() {
			place = createWikifyTestElement("@example.");
			equals($(place).text(), "example.");
			testTiddlySpaceLink($(place).find('a'), "http://example.tiddlyspace.com", "example");
		});

		test('Wikifier: url should be an external link', function() {
			var url = "http://example.com/foo/bar/baz.html";
			var place = createWikifyTestElement(url);
			testExternalLink($(place).find('a'), url, url);
		});

		test('Wikifier: ~@spacename should be escaped text', function() {
			var place = createWikifyTestElement("~@space-name");
			equals($(place).text(), "@space-name");
			equals($(place).find('a').length, 0);
		});

		test('Wikifier: ~@SpaceName should be escaped text', function() {
			var place = createWikifyTestElement("~@SpaceName");
			equals($(place).text(), "@SpaceName");
			equals($(place).find('a').length, 0);
		});

		test('Wikifier: @space-name should be a spaceLink', function() {
			var place = createWikifyTestElement("@space-name");
			equals($(place).text(), "space-name");
			testTiddlySpaceLink($(place).find('a'), "http://space-name.tiddlyspace.com", "space-name");
		});

		test('Wikifier: @spacename. should be a spaceLink followed by a full stop', function() {
			place = createWikifyTestElement("@spacename.");
			equals($(place).text(), "spacename.");
			testTiddlySpaceLink($(place).find('a'), "http://spacename.tiddlyspace.com", "spacename");
		});

		test('Wikifier: @space-name. should be a spaceLink followed by a full stop', function() {
			place = createWikifyTestElement("@space-name.");
			equals($(place).text(), "space-name.");
			testTiddlySpaceLink($(place).find('a'), "http://space-name.tiddlyspace.com", "space-name");
		});

		test('Wikifier: @space-name. foo bar baz should be a spaceLink followed by a full stop and text', function() {
			place = createWikifyTestElement("@space-name. foo bar baz");
			equals($(place).text(), "space-name. foo bar baz");
			testTiddlySpaceLink($(place).find('a'), "http://space-name.tiddlyspace.com", "space-name");
		});

		test('Wikifier: @SpaceName should be a spaceLink', function() {
			var place = createWikifyTestElement("@SpaceName");
			equals($(place).text(), "SpaceName");
			testTiddlySpaceLink($(place).find('a'), "http://spacename.tiddlyspace.com", "SpaceName");
		});

		test('Wikifier: @Space-Name99 should be a spaceLink', function() {
			var place = createWikifyTestElement("@Space-Name99");
			testTiddlySpaceLink($(place).find('a'), "http://space-name99.tiddlyspace.com", "Space-Name99");
		});

		test('Wikifier: Tiddler@spacename should be a spaceLink to the tiddler', function() {
			var place = createWikifyTestElement("Tiddler@spacename");
			equals($(place).text(), "Tiddler");
			testTiddlySpaceLink($(place).find('a:first'), "http://spacename.tiddlyspace.com#Tiddler", "Tiddler");
		});

		test('Wikifier: ~Tiddler@spacename should be escaped text', function() {
			var place = createWikifyTestElement("~Tiddler@spacename");
			equals($(place).text(), "Tiddler@spacename");
			equals($(place).find('a').length, 0);
		});

		test('Wikifier: [[Tiddler]]@spacename should be a spaceLink to the tiddler', function() {
			var place = createWikifyTestElement("[[Tiddler]]@spacename");
			equals($(place).text(), "Tiddler");
			testTiddlySpaceLink($(place).find('a'), "http://spacename.tiddlyspace.com#Tiddler", "Tiddler");
		});

		test('Wikifier: [[TiddlerTitle]]@SpaceName should be a spaceLink to the tiddler', function() {
			var place = createWikifyTestElement("[[TiddlerTitle]]@SpaceName");
			equals($(place).text(), "TiddlerTitle");
			var link = $(place).find('a');
			testTiddlySpaceLink(link, "http://spacename.tiddlyspace.com#TiddlerTitle", "TiddlerTitle");
			equals($(link).attr("tiddlyspace"), "SpaceName");
			equals($(link).attr("tiddler"), "TiddlerTitle");
		});

		test('Wikifier: [[Tiddler Name]]@Space-Name99 should be a spaceLink to the tiddler', function() {
			var place = createWikifyTestElement("[[Tiddler Name]]@Space-Name99");
			equals($(place).text(), "Tiddler Name");
			testTiddlySpaceLink($(place).find('a'), "http://space-name99.tiddlyspace.com#%5B%5BTiddler%20Name%5D%5D", "Tiddler Name");
		});

		test('Wikifier: [[Alias for tiddler|Tiddler Name]]@Space-Name99 should be a spaceLink', function() {
			var place = createWikifyTestElement("[[Alias for tiddler|Tiddler Name]]@Space-Name99");
			equals($(place).text(), "Alias for tiddler");
			testTiddlySpaceLink($(place).find('a'), "http://space-name99.tiddlyspace.com#%5B%5BTiddler%20Name%5D%5D", "Alias for tiddler");
		});

		test('Wikifier: [[Tiddler Name]] some text should be a spaceLink to the tiddler', function() {
			var place = createWikifyTestElement("[[Tiddler Name]] some text");
			equals($(place).text(), "Tiddler Name some text");
			var a = $(place).find('a');
			equals(a.attr("href"), "javascript:;");
			equals(a.attr("refresh"), "link");
			equals(a.attr("class"), "tiddlyLink tiddlyLinkNonExisting");
			equals(a.attr("title"), "The tiddler 'Tiddler Name' doesn't yet exist");
			equals(a.attr("tiddlyLink"), "Tiddler Name");
			equals(a.text(), "Tiddler Name");
		});

		test('Wikifier: [[Tiddler Name]] some text @space should be a tiddlLink and a spaceLink', function() {
			var place = createWikifyTestElement("[[Tiddler Name]] some text @space");
			equals($(place).text(), "Tiddler Name some text space");
			var a = $(place).find('a:first');
			equals(a.attr("href"), "javascript:;");
			equals(a.attr("refresh"), "link");
			equals(a.attr("class"), "tiddlyLink tiddlyLinkNonExisting");
			equals(a.attr("title"), "The tiddler 'Tiddler Name' doesn't yet exist");
			equals(a.attr("tiddlyLink"), "Tiddler Name");
			equals(a.text(), "Tiddler Name");

			testTiddlySpaceLink($(place).find('a:eq(1)'), "http://space.tiddlyspace.com", "space");
		});

		test('Wikifier: [[TiddlySpace]] [[Tiddler Name]] some text', function() {
			var place = createWikifyTestElement("[[TiddlySpace]] [[Tiddler Name]] some text @space");
			equals($(place).text(), "TiddlySpace Tiddler Name some text space");
		});

		test('Wikifier: [[Tiddler Name]] some text [[Small Trusted Group]]@space', function() {
			var place = createWikifyTestElement("[[Tiddler Name]] some text [[Small Trusted Group]]@space");
			equals($(place).text(), "Tiddler Name some text Small Trusted Group");
		});

		test('Wikifier: foo@bar.com should be text', function() {
			var place = createWikifyTestElement("foo@bar.com");
			equals($(place).text(), "foo@bar.com");
			equals($(place).find('a').length, 0);
		});

		test('Wikifier: foo@FooBar.com should be text', function() {
			var place = createWikifyTestElement("foo@FooBar.com");
			equals($(place).text(), "foo@FooBar.com");
			equals($(place).find('a').length, 0);
		});

		test('Wikifier: [[@tiddlylink]] should be a tiddlyLink', function() {
			var place = createWikifyTestElement("[[@tiddlylink]]");
			equals($(place).text(), "@tiddlylink");
			testTiddlyLink($(place).find('a'), "@tiddlylink", "@tiddlylink");
		});

		test('Wikifier: [[another tiddler|@tiddlylink]] should be a tiddlyLink', function() {
			var place = createWikifyTestElement("[[another tiddler|@tiddlylink]]");
			equals($(place).text(), "another tiddler");
			testTiddlyLink($(place).find('a'), "another tiddler", "@tiddlylink");
		});

		test('Wikifier: [[@another tiddler|@tiddlylink]] should be a tiddlyLink', function() {
			var place = createWikifyTestElement("[[@another tiddler|@tiddlylink]]");
			equals($(place).text(), "@another tiddler");
			testTiddlyLink($(place).find('a'), "@another tiddler", "@tiddlylink");
		});

		test('Wikifier: @spacename should be a spaceLink', function() {
			var place = createWikifyTestElement("@spacename");
			equals($(place).text(), "spacename");
			testTiddlySpaceLink($(place).find('a'), "http://spacename.tiddlyspace.com", "spacename");
		});

		test('Wikifier: --@spacename-- should be a spaceLink inside a strikethrough', function() {
			place = createWikifyTestElement("--@spacename--");
			equals($(place).text(), "spacename");
			var html = $(place).html();
			equals(html.substr(0,8), "<strike>", "inside strikethrough");
			equals(html.substr(html.length-9,9), "</strike>", "inside strikethrough");
			testTiddlySpaceLink($(place).find('a'), "http://spacename.tiddlyspace.com", "spacename");
		});

	});


    jQuery(document).ready(function () {
        module("TiddlySpaceLinkPluginInSpace", {
			setup: function () {
				config.extensions.tiddlyspace = {
					currentSpace: { 
						name: "currentspace"
					}
				};
			},
			teardown: function () {
				config.extensions.tiddlyspace = undefined;
			}
		});

		test('Wikifier: @spacename should be a spaceLink', function() {
			var place = createWikifyTestElement("@spacename");
			equals($(place).text(), "spacename");
			testTiddlySpaceLink($(place).find('a'), "http://spacename.tiddlyspace.com", "spacename");
		});

		test('Wikifier: @currentspace should be a tiddlyLink', function() {
			var place = createWikifyTestElement("@currentspace");
			equals($(place).text(), "currentspace");
			testTiddlyLink($(place).find('a'), "currentspace", "currentspace");
		});

		test('Wikifier: [[@currentspace]] should be a tiddlyLink', function() {
			var place = createWikifyTestElement("[[@currentspace]]");
			equals($(place).text(), "@currentspace");
			testTiddlyLink($(place).find('a'), "@currentspace", "@currentspace");
		});

		test('Wikifier: [[Tiddler]]@spacename should be a spaceLink', function() {
			var place = createWikifyTestElement("[[Tiddler]]@spacename");
			equals($(place).text(), "Tiddler");
			testTiddlySpaceLink($(place).find('a'), "http://spacename.tiddlyspace.com#Tiddler", "Tiddler");
		});

		test('Wikifier: [[TiddlySpaceLinkPlugin]]@anotherspace should be a spaceLink', function() {
			var place = createWikifyTestElement("[[TiddlySpaceLinkPlugin]]@anotherspace");
			equals($(place).text(), "TiddlySpaceLinkPlugin");
			testTiddlySpaceLink($(place).find('a'), "http://anotherspace.tiddlyspace.com#TiddlySpaceLinkPlugin", "TiddlySpaceLinkPlugin");
		});

		test('Wikifier: [[TiddlySpaceLinkPlugin]]@currentspace should be a tiddlyLink', function() {
			var place = createWikifyTestElement("[[TiddlySpaceLinkPlugin]]@currentspace");
			equals($(place).text(), "TiddlySpaceLinkPlugin");
			testTiddlyLink($(place).find('a'), "TiddlySpaceLinkPlugin", "TiddlySpaceLinkPlugin");
		});

		test('Wikifier: [[Tiddler]]@currentspace should be a tiddlyLink', function() {
			var place = createWikifyTestElement("[[Tiddler]]@currentspace");
			equals($(place).text(), "Tiddler");
			testTiddlyLink($(place).find('a'), "Tiddler", "Tiddler");
		});

		test('Wikifier: [[@@currentspace]] should be a tiddlyLink', function() {
			var place = createWikifyTestElement("[[@@currentspace]]");
			equals($(place).text(), "currentspace");
			testTiddlyLink($(place).find('a'), "currentspace", "currentspace");
		});

		test('Wikifier: [[@@anotherspace]] should be a spaceLink "@anotherspace"', function() {
			var place = createWikifyTestElement("[[@@anotherspace]]");
			equals($(place).text(), "anotherspace");
			testTiddlySpaceLink($(place).find('a'), "http://anotherspace.tiddlyspace.com", "anotherspace");
		});

		test('Wikifier: [[@anotherspace|@@anotherspace]] should be a spaceLink "@anotherspace"', function() {
			var place = createWikifyTestElement("[[@anotherspace|@@anotherspace]]");
			equals($(place).text(), "@anotherspace");
			testTiddlySpaceLink($(place).find('a'), "http://anotherspace.tiddlyspace.com", "@anotherspace");
		});

		test('Wikifier: "text text [[TiddlySpaceLinkPlugin]]@anotherspace text text" should be a spaceLink', function() {
			var place = createWikifyTestElement("text text [[TiddlySpaceLinkPlugin]]@anotherspace text text");
			equals($(place).text(), "text text TiddlySpaceLinkPlugin text text");
			testTiddlySpaceLink($(place).find('a'), "http://anotherspace.tiddlyspace.com#TiddlySpaceLinkPlugin", "TiddlySpaceLinkPlugin");
		});

		test('Wikifier: [[Small Trusted Group]]@glossary should be a spaceLink', function() {
			var place = createWikifyTestElement("[[Small Trusted Group]]@glossary");
			equals($(place).text(), "Small Trusted Group");
			testTiddlySpaceLink($(place).find('a'), "http://glossary.tiddlyspace.com#%5B%5BSmall%20Trusted%20Group%5D%5D", "Small Trusted Group");
		});

		// TiddlySpace issue#350
		test('Wikifier: "[[tiddler]]@space followed by [[@@anotherspace]]', function() {
			var place = createWikifyTestElement("[[tiddler]]@space followed by [[@@anotherspace]]");
			equals($(place).text(), "tiddler followed by anotherspace");
			var links = $(place).find('a');
			equals(links.length, 2, "two links");
			testTiddlySpaceLink($(links[0]), "http://space.tiddlyspace.com#tiddler", "tiddler");
			testTiddlySpaceLink($(links[1]), "http://anotherspace.tiddlyspace.com", "anotherspace");
		});

		test('Wikifier: "a mixture of links', function() {
			var place = createWikifyTestElement("@space-name TiddlyLink [[Tiddly Link]] [[@space]] [[Small Trusted Group]]@glossary [[@@anotherspace]] @space");
			var links = $(place).find('a');
			equals(links.length, 7, "three links");
			testTiddlySpaceLink($(links[0]), "http://space-name.tiddlyspace.com", "space-name");
			testTiddlyLink($(links[1]), "TiddlyLink", "TiddlyLink");
			testTiddlyLink($(links[2]), "Tiddly Link", "Tiddly Link");
			testTiddlyLink($(links[3]), "@space", "@space");
			testTiddlySpaceLink($(links[4]), "http://glossary.tiddlyspace.com#%5B%5BSmall%20Trusted%20Group%5D%5D", "Small Trusted Group");
			testTiddlySpaceLink($(links[5]), "http://anotherspace.tiddlyspace.com", "anotherspace");
			testTiddlySpaceLink($(links[6]), "http://space.tiddlyspace.com", "space");
		});

		test('Wikifier: "missingLinks', function() {
			var tiddler = store.getTiddler("ExampleLinks");
			ok(tiddler, "ExampleLinks tiddler exists");
			same(tiddler.getLinks(), ["TiddlySpaceLinkPlugin", "@tiddler", "xx@yy", "missing tiddler" ], "ExampleLinks tiddler links");
			same(store.getMissingLinks(), ["@tiddler", "TiddlyWiki", "missing tiddler", "xx@yy"], "ExampleLinks tiddler does not generate missing links");
		});
	});

})(jQuery);
