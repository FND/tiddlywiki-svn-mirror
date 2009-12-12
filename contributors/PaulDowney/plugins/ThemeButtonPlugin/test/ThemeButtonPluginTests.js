/*global story, jQuery, document, module, test, same */

jQuery(document).ready(function () {
    module("ThemeButtonPlugin");

    test("DefaultThemeButton", function () {

        same(config.options.txtTheme, "DefaultTheme",
            "is current theme");

        ok(jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DefaultTheme"]').hasClass('themeButton'),
            "has themeButton class");

        ok(jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DefaultTheme"]').hasClass('selected'),
            "has selected class");
    });

    test("DarkThemeButton", function () {
        ok(jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DefaultTheme"]').hasClass('themeButton'),
            "has themeButton class");

        ok(!jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DarkTheme"]').hasClass('selected'),
            "does not have the selected class");
    });

});
