/*global story, jQuery, document, module, test, same */
(function ($) {
    jQuery(document).ready(function () {
        module("ExtensibleFilterPlugin");

		/*
		 *	[[tiddler]]
		 */
		test("filterTiddlers: should be one tiddlers named foo", function () {
			var tiddlers = store.filterTiddlers("[[foo]]");
			strictEqual(tiddlers.length, 1, 'one tiddlers');
			strictEqual(tiddlers[0].title, "foo");
		});

		/*
		 *	[[tiddler]][[tiddler]]
		 */
		test("filterTiddlers: should be two tiddlers named foo", function () {
			var tiddlers = store.filterTiddlers("[[foo]][[foo]]");
			strictEqual(tiddlers.length, 2, 'two tiddlers');
			strictEqual(tiddlers[0].title, "foo");
			strictEqual(tiddlers[1].title, "foo");
		});

		/*
		 *	[tag[value]]
		 */
		test("filterTiddlers: should be three tiddlers tagged testTag", function () {
			var tiddlers = store.filterTiddlers("[tag[testTag]]");
			strictEqual(tiddlers.length, 3, 'three tiddlers');
			strictEqual(tiddlers[0].title, "testTiddler1");
			strictEqual(tiddlers[1].title, "testTiddler2");
			strictEqual(tiddlers[2].title, "testTiddler3");
		});

		test("filterTiddlers: should be one tiddlers tagged oneTag", function () {
			var tiddlers = store.filterTiddlers("[tag[oneTag]]");
			strictEqual(tiddlers.length, 1, 'one tiddlers');
			strictEqual(tiddlers[0].title, "testTiddler1");
		});

		/*
		 *	combined tags
		 */
		test("filterTiddlers: should be three tiddlers tagged testTag and twoTag", function () {
			var tiddlers = store.filterTiddlers("[tag[testTag]][tag[twoTag]]");
			strictEqual(tiddlers.length, 3, 'three tiddlers');
			strictEqual(tiddlers[0].title, "testTiddler1");
			strictEqual(tiddlers[1].title, "testTiddler2");
			strictEqual(tiddlers[2].title, "testTiddler3");
		});

		/*
		 *	[limit[n]]
		 */
		test("filterTiddlers: should be one tiddlers tagged testTag limited with 1", function () {
			var tiddlers = store.filterTiddlers("[tag[testTag]][limit[1]]");
			strictEqual(tiddlers.length, 1, 'one tiddlers');
			strictEqual(tiddlers[0].title, "testTiddler1");
		});

		test("filterTiddlers: should be two tiddlers tagged testTag limited with 2", function () {
			var tiddlers = store.filterTiddlers("[tag[testTag]][limit[2]]");
			strictEqual(tiddlers.length, 2, 'two tiddlers');
			strictEqual(tiddlers[0].title, "testTiddler1");
			strictEqual(tiddlers[1].title, "testTiddler2");
		});

		test("filterTiddlers: should be three tiddlers tagged testTag limited with 3", function () {
			var tiddlers = store.filterTiddlers("[tag[testTag]][limit[3]]");
			strictEqual(tiddlers.length, 3, 'three tiddlers');
			strictEqual(tiddlers[0].title, "testTiddler1");
			strictEqual(tiddlers[1].title, "testTiddler2");
			strictEqual(tiddlers[2].title, "testTiddler3");
		});

		test("filterTiddlers: should be three tiddlers tagged testTag limited with 50", function () {
			var tiddlers = store.filterTiddlers("[tag[testTag]][limit[50]]");
			strictEqual(tiddlers.length, 3, 'three tiddlers');
			strictEqual(tiddlers[0].title, "testTiddler1");
			strictEqual(tiddlers[1].title, "testTiddler2");
			strictEqual(tiddlers[2].title, "testTiddler3");
		});

		/*
		 *	[field[value]]
		 */
		test("filterTiddlers: filter on fieldvalue 'two'", function () {
			var tiddlers = store.filterTiddlers("[fieldvalue[two]]");
			strictEqual(tiddlers.length, 1, 'one tiddlers');
			strictEqual(tiddlers[0].title, "testTiddler2");
		});

		test("filterTiddlers: filter on fieldvalue 'three'", function () {
			var tiddlers = store.filterTiddlers("[fieldvalue[three]]");
			strictEqual(tiddlers.length, 1, 'one tiddlers');
			strictEqual(tiddlers[0].title, "testTiddler3");
		});

	});
})(jQuery);
