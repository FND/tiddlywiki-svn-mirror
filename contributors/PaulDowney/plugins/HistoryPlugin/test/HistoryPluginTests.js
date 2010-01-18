/*global story, jQuery, document, module, test, same, config */

jQuery(document).ready(function () {
    module("HistoryPlugin");

    test("default tiddlers", function () {
        same(config.extensions.history.list, ["HistoryPlugin"], "initialized to contain DefaultTiddlers");
    });

    test("clear list", function () {
        config.extensions.history.list = [ 'a', 'b' ];
        same(config.extensions.history.clear(), false, "clear");
        same(config.extensions.history.list, [], "clear empties list");
        same(config.extensions.history.visited, {}, "clear empties visited");
        same(config.extensions.history.current, undefined, "current tiddler is unknown");
    });

    test("empty list", function () {
        same(config.extensions.history.clear(), false, "clear");
        same(config.extensions.history.position(), undefined, "position");
        same(config.extensions.history.title(), undefined, "title");
        same(config.extensions.history.toString(), "", "empty list");
    });

    test("going forward", function () {
        same(config.extensions.history.clear(), false, "clear");

        same(config.extensions.history.add('one'), 0, "add one");
        same(config.extensions.history.position(), 0, "position");
        same(config.extensions.history.title(), "one", "title");
        same(config.extensions.history.toString(), "[[one]]", "single item");

        same(config.extensions.history.add('two'), 1, "add two");
        same(config.extensions.history.position(), 1, "position");
        same(config.extensions.history.title(), "two", "title");
        same(config.extensions.history.toString(), "[[one]][[two]]", "toString");

        same(config.extensions.history.add('three'), 2, "add three");
        same(config.extensions.history.position(), 2, "position");
        same(config.extensions.history.title(), "three", "title");
        same(config.extensions.history.toString(), "[[one]][[two]][[three]]", "toString");
    });

    test("parse", function () {
        same(config.extensions.history.parse(""), [], "empty list");
        same(config.extensions.history.parse("[[one]]"), ["one"], "single item");
        same(config.extensions.history.parse("[[one]][[two]]"), ["one","two"], "two items");
        same(config.extensions.history.parse("   [[one]] \n  [[two]]   "), ["one","two"], "whitespace");
        same(config.extensions.history.parse("\n   [[one]] \n  [[two]] \n\n\n [[three]]\n  "), ["one","two","three"], "three items with whitespace");
    });

    test("visited", function () {
        same(config.extensions.history.clear(), false, "clear");
        same(config.extensions.history.visited['one'], undefined);
        same(config.extensions.history.add('one'), 0, "add one");
        same(config.extensions.history.visited['one'], 0);
        same(config.extensions.history.add('two'), 1, "add two");
        same(config.extensions.history.visited['one'], 0);
        same(config.extensions.history.visited['two'], 1);
        same(config.extensions.history.visited['three'], undefined);
        same(config.extensions.history.add('three'), 2, "add three");
        same(config.extensions.history.visited['three'], 2);
        same(config.extensions.history.add('one'), 3, "add one");
        same(config.extensions.history.visited['one'], 3);
    });
});
