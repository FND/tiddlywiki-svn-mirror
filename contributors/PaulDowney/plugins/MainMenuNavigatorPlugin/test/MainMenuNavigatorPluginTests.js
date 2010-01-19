/*global story, jQuery, document, module, test, same */

jQuery(document).ready(function () {
    module("MainMenuNavigatorPlugin");

    test("parse", function () {
        same(config.extensions.navigation.parse(""), [], "empty list");
        same(config.extensions.navigation.parse("[[one]]"), ["one"], "single item");
        same(config.extensions.navigation.parse("[[one]][[two]]"), ["one","two"], "two items");
        same(config.extensions.navigation.parse("   [[one]] \n  [[two]]   "), ["one","two"], "whitespace");
        same(config.extensions.navigation.parse("\n   [[one]] \n  [[two]] \n\n\n [[three]]\n  "), ["one","two","three"], "three items with whitespace");
        same(config.extensions.navigation.parse("\n *  [[one]] \n  [[two]] \n\n\n [[three]]\n  "), ["one","two","three"], "three items with whitespace and asterisks");
        same(config.extensions.navigation.parse("\n*[[one]]\n*[[two]]\n*[[three]]\n"), ["one","two","three"], "three items with whitespace and asterisks");
    });

    test("load", function () {
        config.extensions.navigation.load();
        same(config.extensions.navigation.list, ["TiddlerOne", "MainMenuNavigatorPlugin", "TiddlerTwo", "TiddlerThree"], "loaded MainMenu");
    });

    test("move", function () {
        same(config.extensions.navigation.relative(0), "MainMenuNavigatorPlugin", "initial current tiddler");
    });

});
