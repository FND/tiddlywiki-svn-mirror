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

        same(jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DefaultTheme"]').text(), "Switch Theme",
            "has content from macro parameter");

        same(jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DefaultTheme"]').attr('title'), "switch the theme",
            "has title from macro parameter");
    });

    test("DarkThemeButton", function () {
        ok(jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DarkTheme"]:first').hasClass('themeButton'),
            "has themeButton class");

        ok(!jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DarkTheme"]:first').hasClass('selected'),
            "does not have the selected class");

        same(jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DarkTheme"]:first').text(), "Dark Theme",
            "has content from macro parameter");

        same(jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DarkTheme"]:first').attr('title'), "switch the theme",
            "has title from macro parameter");
    });

    test("DarkThemeButtonAgain", function () {
        ok(jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DarkTheme"]:last').hasClass('themeButton'),
            "has themeButton class");

        ok(!jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DarkTheme"]:last').hasClass('selected'),
            "does not have the selected class");

        same(jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DarkTheme"]:last').text(), "Dark Theme (Again)",
            "has content from macro parameter");

        same(jQuery('#tiddlerThemeButtonPlugin .themeButton[theme="DarkTheme"]:last').attr('title'), "switch to the Dark Theme",
            "has title from macro parameter");
    });

});
