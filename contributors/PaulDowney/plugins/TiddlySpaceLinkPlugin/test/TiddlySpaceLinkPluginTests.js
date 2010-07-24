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

		function testExternalLink(place, text, url, a_text){
			equals($(place).text(), text);
			var a = $(place).find('a');
			equals(a.attr("href"), url);
			equals(a.text(), a_text);
			equals(a.attr("refresh"), undefined);
			equals(a.attr("tiddlyLink"), undefined);
			equals(a.attr("class"), "externalLink");
			equals(a.attr("title"), "External link to " + url);
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

		test('Wikifier: automatic link', function() {
			var url = "http://example.com/foo/bar/baz.html";
			var place = createWikifyTestElement(url);
			testExternalLink(place, url, url, url);
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
			testExternalLink(place, "@space-name", "http://space-name.tiddlyspace.com", "space-name");
		});

		test('Wikifier: @SpaceName', function() {
			var place = createWikifyTestElement("@SpaceName");
			testExternalLink(place, "@SpaceName", "http://spacename.tiddlyspace.com", "SpaceName");
		});

		test('Wikifier: @Space-Name99', function() {
			var place = createWikifyTestElement("@Space-Name99");
			testExternalLink(place, "@Space-Name99", "http://space-name99.tiddlyspace.com", "Space-Name99");
		});

		test('Wikifier: @[Tiddler]spacename', function() {
			var place = createWikifyTestElement("@[Tiddler]spacename");
			testExternalLink(place, "@[Tiddler]spacename", "http://spacename.tiddlyspace.com#Tiddler", "[Tiddler]spacename");
		});

		test('Wikifier: @[Tiddler Name]Space-Name99', function() {
			var place = createWikifyTestElement("@[Tiddler Name]Space-Name99");
			testExternalLink(place, "@[Tiddler Name]Space-Name99", "http://space-name99.tiddlyspace.com#%5B%5BTiddler%20Name%5D%5D", "[Tiddler Name]Space-Name99");
		});


    });
})(jQuery);
