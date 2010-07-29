/*global story, jQuery, document, module, test, same */
(function ($) {
    jQuery(document).ready(function () {
        module("TiddlySpaceLinkPlugin");

		function createWikifyTestElement(text) {
			var place = document.createElement("div");
			//place.style.display = "none";
			$(place).appendTo('body');
			wikify(text, place);
			return place;
		}

		function testExternalLink(a, url, text){
			equals(a.attr("href"), url);
			equals(a.text(), text);
			equals(a.attr("refresh"), undefined);
			equals(a.attr("tiddlyLink"), undefined);
			ok(a.hasClass("externalLink"), "has class 'externalLink'");
			equals(a.attr("title"), "External link to " + url);
		}

		function testTiddlySpaceLink(a, url, text){
			testExternalLink(a, url, text);
			ok(a.hasClass("tiddlySpaceLink"), "has class 'tiddlySpaceLink'");
		}

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
			testTiddlySpaceLink($(place).find('a:first'), "http://spacename.tiddlyspace.com#Tiddler", "Tiddler");
		});

		test('Wikifier: [[TiddlerTitle]]@SpaceName', function() {
			var place = createWikifyTestElement("[[TiddlerTitle]]@SpaceName");
			equals($(place).text(), "TiddlerTitle");
			testTiddlySpaceLink($(place).find('a:first'), "http://spacename.tiddlyspace.com#TiddlerTitle", "TiddlerTitle");
		});

		test('Wikifier: [[Tiddler Name]]@Space-Name99', function() {
			var place = createWikifyTestElement("[[Tiddler Name]]@Space-Name99");
			equals($(place).text(), "Tiddler Name");
			testTiddlySpaceLink($(place).find('a:first'), "http://space-name99.tiddlyspace.com#%5B%5BTiddler%20Name%5D%5D", "Tiddler Name");
		});

    });
})(jQuery);
