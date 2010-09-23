/*global story, jQuery, document, module, test, same */
(function ($) {
	function createWikifyTestElement(text) {
		var place = document.createElement("div");
		//place.style.display = "none";
		$(place).appendTo('body');
		wikify(text, place);
		return place;
	}

	function testExternalLink(a, url, text){
		equals(a.attr("href"), url, "href");
		equals(a.text(), text, "text");
		equals(a.attr("refresh"), undefined, "refresh");
		equals(a.attr("tiddlylink"), undefined, "tiddlyLink");
		ok(a.hasClass("externalLink"), "has class 'externalLink'");
		equals(a.attr("title"), "External link to " + url, "title");
	}

	function testTiddlyLink(a, tiddler, text){
		equals(a.attr("href"), "javascript:;", "href");
		equals(a.text(), text, "text");
		equals(a.attr("refresh"), "link");
		equals(a.attr("tiddlylink"), tiddler, "tiddlylink attribute");
		ok(a.hasClass("tiddlyLink"), "has class 'tiddlyLink'");
	}

	function testTiddlySpaceLink(a, url, text){
		testExternalLink(a, url, text);
		ok(a.hasClass("tiddlySpaceLink"), "has class 'tiddlySpaceLink'");
	}

    jQuery(document).ready(function () {
        module("TiddlySpaceLinkPlugin");

		test('Wikifier: missing tiddlerLink', function() {
			var place = createWikifyTestElement("[[This Tiddler Does Not Exist]]");
			var a = $(place).find('a');
			equals($(a).attr("href"), "javascript:;");
			equals($(a).attr("title"), "The tiddler 'This Tiddler Does Not Exist' doesn't yet exist");
			equals($(a).attr("class"), "tiddlyLink tiddlyLinkNonExisting");
			equals($(a).attr("refresh"), "link");
			equals($(a).attr("tiddlyLink"), "This Tiddler Does Not Exist");
			equals($(a).text(), "This Tiddler Does Not Exist");
		});

		test('Wikifier: missing WikiWord', function() {
			var place = createWikifyTestElement("MissingWikiWord");
			var a = $(place).find('a');
			equals(a.attr("href"), "javascript:;");
			equals(a.attr("refresh"), "link");
			equals(a.attr("class"), "tiddlyLink tiddlyLinkNonExisting");
			equals(a.attr("title"), "The tiddler 'MissingWikiWord' doesn't yet exist");
			equals(a.attr("tiddlyLink"), "MissingWikiWord");
			equals(a.text(), "MissingWikiWord");
		});

		/*
		 *  will live with this, for now ..
		 *
		test('Wikifier: test short Email address', function() {
			var place = createWikifyTestElement("foo@example.com");
			equals($(place).find('a').length, 0);
			equals($(place).text(), "foo@example.com");
		});

		test('Wikifier: test dotted Email address', function() {
			place = createWikifyTestElement("foo.bar@example.com");
			equals($(place).find('a').length, 0);
			equals($(place).text(), "foo.bar@example.com");
		});
		*/

		test('Wikifier: automatic link', function() {
			var url = "http://example.com/foo/bar/baz.html";
			var place = createWikifyTestElement(url);
			testExternalLink($(place).find('a'), url, url);
		});

		test('Wikifier: ~@spacename', function() {
			var place = createWikifyTestElement("~@space-name");
			equals($(place).text(), "@space-name");
			equals($(place).find('a').length, 0);
		});

		test('Wikifier: ~@SpaceName', function() {
			var place = createWikifyTestElement("~@SpaceName");
			equals($(place).text(), "@SpaceName");
			equals($(place).find('a').length, 0);
		});

		test('Wikifier: @spacename', function() {
			var place = createWikifyTestElement("@space-name");
			equals($(place).text(), "space-name");
			testTiddlySpaceLink($(place).find('a'), "http://space-name.tiddlyspace.com", "space-name");
			$(place).find('a');
		});

		test('Wikifier: @SpaceName', function() {
			var place = createWikifyTestElement("@SpaceName");
			equals($(place).text(), "SpaceName");
			testTiddlySpaceLink($(place).find('a'), "http://spacename.tiddlyspace.com", "SpaceName");
		});

		test('Wikifier: @Space-Name99', function() {
			var place = createWikifyTestElement("@Space-Name99");
			testTiddlySpaceLink($(place).find('a'), "http://space-name99.tiddlyspace.com", "Space-Name99");
		});

		test('Wikifier: Tiddler@spacename', function() {
			var place = createWikifyTestElement("Tiddler@spacename");
			equals($(place).text(), "Tiddler");
			testTiddlySpaceLink($(place).find('a:first'), "http://spacename.tiddlyspace.com#Tiddler", "Tiddler");
		});

		test('Wikifier: ~Tiddler@spacename', function() {
			var place = createWikifyTestElement("~Tiddler@spacename");
			equals($(place).text(), "Tiddler@spacename");
			equals($(place).find('a').length, 0);
		});

		test('Wikifier: [[Tiddler]]@spacename', function() {
			var place = createWikifyTestElement("[[Tiddler]]@spacename");
			equals($(place).text(), "Tiddler");
			testTiddlySpaceLink($(place).find('a'), "http://spacename.tiddlyspace.com#Tiddler", "Tiddler");
		});

		test('Wikifier: [[TiddlerTitle]]@SpaceName', function() {
			var place = createWikifyTestElement("[[TiddlerTitle]]@SpaceName");
			equals($(place).text(), "TiddlerTitle");
			var link = $(place).find('a');
			testTiddlySpaceLink(link, "http://spacename.tiddlyspace.com#TiddlerTitle", "TiddlerTitle");
			equals($(link).attr("tiddlyspace"), "SpaceName");
			equals($(link).attr("tiddler"), "TiddlerTitle");
		});

		test('Wikifier: [[Tiddler Name]]@Space-Name99', function() {
			var place = createWikifyTestElement("[[Tiddler Name]]@Space-Name99");
			equals($(place).text(), "Tiddler Name");
			testTiddlySpaceLink($(place).find('a'), "http://space-name99.tiddlyspace.com#%5B%5BTiddler%20Name%5D%5D", "Tiddler Name");
		});

		test('Wikifier: [[Alias for tiddler|Tiddler Name]]@Space-Name99', function() {
			var place = createWikifyTestElement("[[Alias for tiddler|Tiddler Name]]@Space-Name99");
			equals($(place).text(), "Alias for tiddler");
			testTiddlySpaceLink($(place).find('a'), "http://space-name99.tiddlyspace.com#%5B%5BTiddler%20Name%5D%5D", "Alias for tiddler");
		});

		test('Wikifier: [[Tiddler Name]] some text', function() {
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

		test('Wikifier: [[Tiddler Name]] some text @space', function() {
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

		test('Wikifier: foo@bar.com', function() {
			var place = createWikifyTestElement("foo@bar.com");
			equals($(place).text(), "foo@bar.com");
			equals($(place).find('a').length, 0);
		});

		test('Wikifier: foo@FooBar.com', function() {
			var place = createWikifyTestElement("foo@FooBar.com");
			equals($(place).text(), "foo@FooBar.com");
			equals($(place).find('a').length, 0);
		});

		test('Wikifier: [[@tiddlylinkedspace]]', function() {
			var place = createWikifyTestElement("[[@tiddlylinkedspace]]");
			equals($(place).text(), "@tiddlylinkedspace");
			testTiddlySpaceLink($(place).find('a'), "http://tiddlylinkedspace.tiddlyspace.com", "@tiddlylinkedspace");
		});

		test('Wikifier: [[another space|@linkedspace]]', function() {
			var place = createWikifyTestElement("[[another space|@linkedspace]]");
			equals($(place).text(), "another space");
			testTiddlySpaceLink($(place).find('a'), "http://linkedspace.tiddlyspace.com", "another space");
		});

		test('Wikifier: [[@another space|@linkedspace]]', function() {
			var place = createWikifyTestElement("[[@another space|@linkedspace]]");
			equals($(place).text(), "@another space");
			testTiddlySpaceLink($(place).find('a'), "http://linkedspace.tiddlyspace.com", "@another space");
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

		test('Wikifier: @spacename', function() {
			var place = createWikifyTestElement("@spacename");
			equals($(place).text(), "spacename");
			testTiddlySpaceLink($(place).find('a'), "http://spacename.tiddlyspace.com", "spacename");
		});

		test('Wikifier: @currentspace', function() {
			var place = createWikifyTestElement("@currentspace");
			equals($(place).text(), "currentspace");
			testTiddlyLink($(place).find('a'), "currentspace", "currentspace");
		});

		test('Wikifier: [[Tiddler]]@spacename', function() {
			var place = createWikifyTestElement("[[Tiddler]]@spacename");
			equals($(place).text(), "Tiddler");
			testTiddlySpaceLink($(place).find('a'), "http://spacename.tiddlyspace.com#Tiddler", "Tiddler");
		});

		test('Wikifier: [[TiddlySpaceLinkPlugin]]@currentspace', function() {
			var place = createWikifyTestElement("[[TiddlySpaceLinkPlugin]]@currentspace");
			equals($(place).text(), "TiddlySpaceLinkPlugin");
			testTiddlyLink($(place).find('a'), "TiddlySpaceLinkPlugin", "TiddlySpaceLinkPlugin");
		});

		test('Wikifier: [[Tiddler]]@currentspace', function() {
			var place = createWikifyTestElement("[[Tiddler]]@currentspace");
			equals($(place).text(), "Tiddler");
			testTiddlyLink($(place).find('a'), "Tiddler", "Tiddler");
		});

	});

})(jQuery);
