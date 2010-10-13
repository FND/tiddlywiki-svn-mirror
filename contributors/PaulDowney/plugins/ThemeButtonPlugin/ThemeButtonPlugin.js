/***
|''Name:''|ThemeButtonPlugin|
|''Description:''|Macro to provide a button to switch to a named theme |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ThemeButtonPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ThemeButtonPlugin/ |
|''Version:''|0.3|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Macro to provide a theme switch button, used as follows:

<<themeButton DefaultTheme>> {{{<<themeButton DefaultTheme>>}}}

<<themeButton DarkTheme "Dark Theme">> {{{<<themeButton DarkTheme "Dark Theme">>}}}

<<themeButton DarkTheme "Dark Theme (Again)" "switch to the Dark Theme">> {{{<<themeButton DarkTheme "Dark Theme (Again)" "switch to the Dark Theme">>}}}

A class of "selected" is provided for styling the selected button as follows:

!!StyleSheet
{{{
.themeButton.selected { 
    border: 5px solid red;
}
}}}

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config story createTiddlyButton createTiddlyElement addClass */
if (!version.extensions.ThemeButtonPlugin) {
    version.extensions.ThemeButtonPlugin = {installed: true};

    config.macros.themeButton = {
        label: "Switch Theme",
        prompt: "switch the theme"
    };

    config.macros.themeButton.handler = function (place, macroName, params) {
        var theme = params[0];
        var btn = createTiddlyButton(place, params[1] || this.label, params[2] || this.prompt, 
            function (ev) {
                story.switchTheme(theme);
                jQuery('.themeButton').removeClass('selected');
				theme = config.options.txtTheme;
                jQuery('.themeButton[theme="' + theme + '"]').addClass('selected');
                return false;
            });
        btn.setAttribute('theme', theme);
        addClass(btn, 'themeButton', theme);
        if (theme === config.options.txtTheme) {
            addClass(btn, 'selected');
        }
    };
}

//}}}
