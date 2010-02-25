/*global story, jQuery, document, module, test, same, config */

jQuery(document).ready(function () {
    module("MainMenuUpdatePlugin");

    test("transform", function () {

        same(config.extensions.MainMenuUpdate.transform('', 'foo', 'foo'), '*[[foo]]\n', 'add a value to an empty menu');
        same(config.extensions.MainMenuUpdate.transform('', 'foo', 'bar'), '*[[bar]]\n', 'rename a value in an empty menu');
        same(config.extensions.MainMenuUpdate.transform('*[[bar]]\n', 'bar', 'bar'), '*[[bar]]\n', 'rename a single value');
        same(config.extensions.MainMenuUpdate.transform('*[[bar]]\n', 'foo', 'bar'), '*[[bar]]\n', 'rename a missing value');
        same(config.extensions.MainMenuUpdate.transform('*[[foo]]\n*[[bar]]\n', 'foo', 'bar'), '*[[bar]]\n*[[bar]]\n', 'rename an existing value (duplicates)');
        same(config.extensions.MainMenuUpdate.transform('*[[foo]]\n*[[bar]]\n', 'baz'), '*[[foo]]\n*[[bar]]\n', 'remove non-existant value');
        same(config.extensions.MainMenuUpdate.transform('*[[foo]]\n*[[bar]]\n', 'baz', 'baz'), '*[[foo]]\n*[[bar]]\n*[[baz]]\n', 'add new value');
        same(config.extensions.MainMenuUpdate.transform('*[[foo]]\n*[[bar]]\n*[[baz]]\n', 'foo'), '*[[bar]]\n*[[baz]]\n', 'remove first value');
        same(config.extensions.MainMenuUpdate.transform('*[[foo]]\n*[[bar]]\n*[[baz]]\n', 'bar'), '*[[foo]]\n*[[baz]]\n', 'remove middle value');
        same(config.extensions.MainMenuUpdate.transform('*[[foo]]\n*[[bar]]\n*[[baz]]\n', 'baz'), '*[[foo]]\n*[[bar]]\n', 'remove last value');
        same(config.extensions.MainMenuUpdate.transform('*[[foo bar]]\n*[[bar bar]]\n*[[baz baz]]\n', 'bar bar'), '*[[foo bar]]\n*[[baz baz]]\n', 'remove value containing spaces');
        same(config.extensions.MainMenuUpdate.transform('*[[foo]]\n*[[bar]]', 'baz', 'baz'), '*[[foo]]\n*[[bar]]\n*[[baz]]\n', 'add to list without trailing newline');
    });

});
