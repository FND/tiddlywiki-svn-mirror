/***
|''Name:''|ThemeSwitcherPlugin|
|''Description:''|Theme Switcher|
|''Author:''|Martin Budden|
|''Source:''|http://www.martinswiki.com/#ThemeSwitcherPlugin |
|''~CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/ThemeSwitcherPlugin.js |
|''Version:''|0.0.10|
|''Status:''|Not for release - still under development|
|''Date:''|Oct 31, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|

!!Description
This plugin defines a theme selector button that allows you to select a theme from a list of tiddlers tagged with "systemTheme".

!!Usage
Include
{{{<<changeOption>>}}}
in any tiddler to create a select theme button.

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ThemeSwitcherPlugin) {
version.extensions.ThemeSwitcherPlugin = {installed:true};

config.macros.changeOption = {
	label: "UI method",
	prompt: "Select the UI Method"
};

config.macros.changeOption.handler = function(place)
{
	createTiddlyButton(place,this.label,this.prompt,this.onClick);
};

config.macros.changeOption.onClick = function(ev)
{
	var e = ev ? ev : window.event;
	var popup = Popup.create(this);
	var tiddlers = store.getTaggedTiddlers('systemTheme');
	
		var className = null;
		var btn = createTiddlyButton(createTiddlyElement(popup,'li',null,className),"window", "window", config.macros.changeOption.onClickTheme);
		btn.setAttribute('openType',"popup");
		var btn = createTiddlyButton(createTiddlyElement(popup,'li',null,className),"inline", "inline", config.macros.changeOption.onClickTheme);
		btn.setAttribute('openType',"inline");
		var btn = createTiddlyButton(createTiddlyElement(popup,'li',null,className),"traditional","Traditional", config.macros.changeOption.onClickTheme);
		btn.setAttribute('openType',"traditional");

	Popup.show();
	return stopEvent(e);
};

config.macros.changeOption.onClickTheme = function(ev)
{
	config.options.txtOpenType = this.getAttribute('openType');
	//log(config.options.txtOpenType);
	return true;
};
} //# end of 'install only once'
//}}}
