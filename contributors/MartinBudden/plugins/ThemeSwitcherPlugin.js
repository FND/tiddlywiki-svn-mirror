/***
|''Name:''|ThemeSwitcherPlugin|
|''Description:''|Theme Switcher|
|''Author:''|Martin Budden|
|''Source:''|http://www.martinswiki.com/#ThemeSwitcherPlugin |
|''~CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/ThemeSwitcherPlugin.js |
|''Version:''|0.0.4|
|''Status:''|Not for release - still under development|
|''Date:''|Oct 31, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ThemeSwitcherPlugin) {
version.extensions.ThemeSwitcherPlugin = {installed:true};

config.macros.selectTheme = {};
config.macros.selectTheme.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var label = "select theme";
	var prompt = "select the current theme";
	var btn = createTiddlyButton(place,label,prompt,this.onClick);
	btn.setAttribute("place",place);
};

config.macros.selectTheme.onClick = function(ev)
{
	var e = ev ? ev : window.event;
	var popup = Popup.create(this);
	var tiddlers = store.getTaggedTiddlers("systemTheme");
	for(var i=0; i<tiddlers.length; i++) {
		var title = tiddlers[i].title;
		var name = store.getTiddlerSlice(title,"Name");
		var label = name ? name : title;
		var desc = store.getTiddlerSlice(title,"Description");
		var prompt = desc ? desc : label;
		var li = createTiddlyElement(popup,"li");
		var btn = createTiddlyButton(li,label,prompt,config.macros.selectTheme.onClickTheme);
		btn.setAttribute("theme",title);
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
};


config.macros.selectTheme.onClickTheme = function(ev)
{
	story.switchTheme(this.getAttribute("theme"));
};

} //# end of 'install only once'
//}}}
