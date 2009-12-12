/***
|''Name:''|ThemeButtonPlugin|
|''Description:''|Macro to provide a button to switch to a named theme |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ThemeButtonPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ThemeButtonPlugin/ |
|''Version:''|0.2|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Macro to provide a theme switch button, used as follows:

&lt;&lt;themeButton DarkTheme "Dark Theme" "switch to the Darker Theme"&gt;&gt;

<<themeButton DarkTheme "Dark Theme" "switch to the Dark Theme">>

&lt;&lt;themeButton DefaultTheme "Default Theme" "switch to the Default TiddlyWiki Theme"&gt;&gt;

<<themeButton DefaultTheme "Default Theme" "switch to the Default TiddlyWiki Theme">>

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
/*global config story createTiddlyButton createTiddlyElement */
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
                jQuery('.themeButton[theme="'+theme+'"]').addClass('selected');
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
