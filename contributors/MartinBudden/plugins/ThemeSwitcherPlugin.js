/***
|''Name:''|ThemeSwitcherPlugin|
|''Description:''|Theme Switcher|
|''Author:''|Martin Budden|
|''Source:''|http://www.martinswiki.com/#ThemeSwitcherPlugin |
|''~CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/ThemeSwitcherPlugin.js |
|''Version:''|0.0.7|
|''Status:''|Not for release - still under development|
|''Date:''|Oct 31, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|

!!Description
This plugin defines a theme selector button that allows you to select a theme from a list of tiddlers tagged with "systemTheme".

!!Usage
Include
{{{<<selectTheme>>}}}
in any tiddler to create a select theme button.

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ThemeSwitcherPlugin) {
version.extensions.ThemeSwitcherPlugin = {installed:true};

config.macros.selectTheme = {
	label: "select theme",
	prompt: "Select the current theme"
};

config.macros.selectTheme.handler = function(place)
{
	createTiddlyButton(place,this.label,this.prompt,this.onClick);
};

config.macros.selectTheme.onClick = function(ev)
{
	var e = ev ? ev : window.event;
	var popup = Popup.create(this);
	var tiddlers = store.getTaggedTiddlers('systemTheme');
	for(var i=0; i<tiddlers.length; i++) {
		var t = tiddlers[i].title;
		var name = store.getTiddlerSlice(t,'Name');
		var desc = store.getTiddlerSlice(t,'Description');
		var btn = createTiddlyButton(createTiddlyElement(popup,'li'),name ? name : title,desc ? desc : label,config.macros.selectTheme.onClickTheme);
		btn.setAttribute('theme',t);
	}
	Popup.show();
	return stopEvent(e);
};

config.macros.selectTheme.onClickTheme = function(ev)
{
	story.switchTheme(this.getAttribute('theme'));
	return false;
};
} //# end of 'install only once'
//}}}
