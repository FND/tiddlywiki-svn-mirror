/***
|''Name:''|ToggleThemePlugin|
|''Description:''|Switches between two themes|
|''Author:''|Jonathan Lister (jnthnlstr (at) googlemail (dot) com)|
|''~CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/verticals/FNDTiddlyTweets/plugins/ToggleThemePlugin.js |
|''Version:''|0.1|
|''Date:''|Mar 4, 2009|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.4|

!!Description
This plugin defines a theme selector button that allows you to select a theme from a list of tiddlers tagged with "systemTheme".

!!Usage
Include
{{{<<selectTheme>>}}}
in any tiddler to create a select theme button.

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ToggleThemePlugin) {
version.extensions.ToggleThemePlugin = {installed:true};

config.macros.toggleTheme = {

	label: "switch theme",
	prompt: "Switch the theme from %0 to %1",

	getNewTheme: function(theme1,theme2) {
		var currentTheme = config.options.txtTheme;
		var newTheme = currentTheme === theme1 ? theme2 : theme1;
		return newTheme;
	},
	
	handler: function(place,macroName,params,wikfier,paramString,tiddler) {
		var theme1 = params[0];
		var theme2 = params[1];
		if(!(theme1 && theme2)) {
			throw "Error in toggleTheme: please provide two themes as parameters";
		}
		var newTheme  = this.getNewTheme(theme1,theme2);
		var plugin = this;
		var onClick = function() {
			var newTheme = plugin.getNewTheme(theme1,theme2);
			// switchTheme triggers this handler before changing config.options.txtTheme
			config.options.txtTheme = newTheme;
			story.switchTheme(newTheme);
		};
		var btn = createTiddlyButton(place,this.label,this.prompt.format([config.options.txtTheme,newTheme]),onClick);
	}
};

} //# end of 'install only once'
//}}}