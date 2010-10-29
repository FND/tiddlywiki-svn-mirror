/*global story, jQuery, document, module, test, same */
(function ($) {
    jQuery(document).ready(function () {
        module("ExtensibleFilterPlugin");

		test("filterTiddlers: should be three tiddlers tagged testTag", function () {
			var tiddlers = store.filterTiddlers("[tag[testTag]]");
			strictEqual(tiddlers.length, 3, 'three tiddlers');
		});

		test("filterTiddlers: should be one tiddlers tagged oneTag", function () {
			var tiddlers = store.filterTiddlers("[tag[oneTag]]");
			strictEqual(tiddlers.length, 1, 'one tiddlers');
		});

		test("filterTiddlers: should be one tiddlers tagged testTag limited with 1", function () {
			var tiddlers = store.filterTiddlers("[tag[testTag][limit[1]]");
			strictEqual(tiddlers.length, 1, 'one tiddlers');
		});

		test("filterTiddlers: should be two tiddlers tagged testTag limited with 2", function () {
			var tiddlers = store.filterTiddlers("[tag[testTag][limit[2]]");
			strictEqual(tiddlers.length, 2, 'two tiddlers');
		});

		test("filterTiddlers: should be three tiddlers tagged testTag limited with 50", function () {
			var tiddlers = store.filterTiddlers("[tag[testTag][limit[50]]");
			console.log(tiddlers);
			strictEqual(tiddlers.length, 3, 'three tiddlers');
		});

	});
})(jQuery);
