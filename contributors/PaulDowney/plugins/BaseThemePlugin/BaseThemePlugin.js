/***
|''Name:''|BaseThemePlugin|
|''Description:''|Asserts a Base Theme Ahead of|
|''Author:''|Paul Downey|
|''~CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/BaseThemePlugin/ |
|''Version:''|0.1|
|''Status:''|Under development|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|

!!Description
This plugin asserts one or more "Base Themes" ahead of the current theme, allowing subclassing of themes.

!!Usage
In settings.js:
{{{
config.macros.baseTheme.themes.push("myBaseTheme");
}}}

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.BaseThemePlugin) {
version.extensions.BaseThemePlugin = {installed:true};

config.macros.baseTheme = {
	themes: [],
	switchTheme: Story.prototype.switchTheme
};

Story.prototype.switchTheme = function(theme)
{
	var that = config.macros.baseTheme;
	for(var i=0;i<that.themes.length;i++){
		that.switchTheme(that.themes[i]);
	}
	that.switchTheme(theme);
};
} //# end of 'install only once'
//}}}
