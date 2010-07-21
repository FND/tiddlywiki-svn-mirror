/*global story, jQuery, document, module, test, same */
(function ($) {
    jQuery(document).ready(function () {
        module("TiddlySpaceLinkPlugin");

		test('Wikifier: wikifyStatic()', function() {
			wikifier_input_strings = {
				bold:"''bold''",
				italic:"//italic//",
				underline:"__underline__",
				superscript:"^^superscript^^",
				subscript:"~~subscript~~",
				strikeout:"--strikeout--",
				code:"{{{code}}}",
			};

			wikifier_output_strings = {
				bold:"<strong>bold</strong>",
				italic:"<em>italic</em>",
				underline:"<u>underline</u>",
				superscript:"<sup>superscript</sup>",
				subscript:"<sub>subscript</sub>",
				strikeout:"<strike>strikeout</strike>",
				code:"<code>code</code>",
			};

			formatter = new Formatter(config.formatters);
			var actual = "";
			var expected = "";
			for (var i in wikifier_input_strings) {
				actual = wikifyStatic(wikifier_input_strings[i]).toLowerCase();
				expected = wikifier_output_strings[i];
				equals(actual,expected,'testing input strings for Formatter.characterFormat'+wikifier_input_strings[i]);
			}

			formatter = new Formatter(config.formatters);
			expected = '<table class="twtable"><tbody><tr class="evenrow"><td>a</td><td>b</td></tr><tr class="oddrow"><td>c</td><td>d</td></tr></tbody></table>';
			actual = wikifyStatic("|a|b|\n|c|d|").toLowerCase();
			equals(actual,expected,'testing table formatting');
		});

			/*
			WikiWord
			~EscapedWikiWord
			[[Wiki Word With Spaces]] 
			[[display text|WikiWord]]
			[[display text|URL]]
			[img[title text|URL]]

				missingTiddlyLink:"[[ThisTiddlerDoesNotExist]]"
				missingTiddlyLink:"<a href=\"javascript:;\" title=\"The tiddler 'ThisTiddlerDoesNotExist' doesn't yet exist\" class=\"tiddlyLink tiddlyLinkNonExisting\" refresh=\"link\" tiddlylink=\"ThisTiddlerDoesNotExist\">ThisTiddlerDoesNotExist</a>"

			*/

		test('Wikifier: missing tiddlerLink', function() {
		
			var place = document.createElement("div");
			place.style.display = "none";
			$(place).appendTo('body');

			wikify("[[This Tiddler Does Not Exist]]", place);
			var a = $(place).find('a');
			equals($(a).attr("href"), "javascript:;");
			equals($(a).attr("title"), "The tiddler 'This Tiddler Does Not Exist' doesn't yet exist");
			equals($(a).attr("class"), "tiddlyLink tiddlyLinkNonExisting");
			equals($(a).attr("refresh"), "link");
			equals($(a).attr("tiddlyLink"), "This Tiddler Does Not Exist");
			equals($(a).text(), "This Tiddler Does Not Exist");
		});

		test('Wikifier: missing WikiWord', function() {
		
			var place = document.createElement("div");
			place.style.display = "none";
			$(place).appendTo('body');

			wikify("MissingWikiWord", place);
			var a = $(place).find('a');
			equals(a.attr("href"), "javascript:;");
			equals(a.attr("refresh"), "link");
			equals(a.attr("class"), "tiddlyLink tiddlyLinkNonExisting");
			equals(a.attr("title"), "The tiddler 'MissingWikiWord' doesn't yet exist");
			equals(a.attr("tiddlyLink"), "MissingWikiWord");
			equals(a.text(), "MissingWikiWord");
		});

		test('Wikifier: automatic link', function() {
		
			var place = document.createElement("div");
			place.style.display = "none";
			$(place).appendTo('body');

			var url = "http://example.com/foo/bar/baz.html";

			wikify(url, place);
			var a = $(place).find('a');
			equals(a.attr("href"), url);
			equals(a.attr("refresh"), undefined);
			equals(a.attr("tiddlyLink"), undefined);
			equals(a.attr("class"), "externalLink");
			equals(a.attr("title"), "External link to " + url);
			equals(a.text(), url);
		});


		test('Wikifier: @spacename', function() {
		
			var place = document.createElement("div");
			place.style.display = "none";
			$(place).appendTo('body');

			wikify("@space", place);
			var a = $(place).find('a');
			equals(a.attr("href"), "javascript:;");
			equals(a.attr("refresh"), "link");
			equals(a.attr("class"), "tiddlyLink tiddlyLinkNonExisting");
			equals(a.attr("title"), "The tiddler 'MissingWikiWord' doesn't yet exist");
			equals(a.attr("tiddlyLink"), "MissingWikiWord");
			equals(a.text(), "MissingWikiWord");
		});

    });
})(jQuery);
