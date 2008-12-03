/***
|''Name:''|BaseThemePlugin|
|''Description:''|Asserts a list of base themes ahead of the switched theme|
|''Author:''|Paul Downey|
|''~CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/BaseThemePlugin/ |
|''Version:''|0.1|
|''Status:''|Under development|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|

!!Description
Asserts one or more "Base Themes" ahead of the current theme allowing a base theme to provide default templates.

!!Usage
Define a filter in [[BaseThemes]] tiddler, a list of theme tiddlers to be applied by switchTheme before the final theme.

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.BaseThemePlugin) {
version.extensions.BaseThemePlugin = {installed:true};

config.macros.baseTheme = {
	switchTheme: Story.prototype.switchTheme
};

Story.prototype.switchTheme = function(theme)
{
	var that = config.macros.baseTheme;
	var themes = store.filterTiddlers(store.getTiddlerText("BaseThemes"));
	for(var i=0;i<themes.length;i++){
		if(themes[i].title!=theme){
			that.switchTheme(themes[i].title);
		}
	}
	that.switchTheme(theme);
};
} //# end of 'install only once'
//}}}
