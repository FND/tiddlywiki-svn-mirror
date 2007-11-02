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
	var label = 'select theme';
	var prompt = 'select the current theme';
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
	config.macros.selectTheme.switchTheme(this.getAttribute("theme"));
};

config.macros.selectTheme.switchTheme = function(theme)
{
	isTiddler = function(title) {
		var s = title ? title.indexOf(config.textPrimitives.sectionSeparator) : -1;
		if(s!=-1)
			title = title.substr(0,s);
		return store.tiddlerExists(title) || store.isShadowTiddler(title);
	};

	getSlice = function(theme,slice) {
		var r = store.getTiddlerSlice(theme,slice);
		if(r && r.indexOf(config.textPrimitives.sectionSeparator)==0)
			r = theme + r;
		return isTiddler(r) ? r : slice;
	};

	store.namedNotifications.length = 0;
	for(var i=0; i<config.notifyTiddlers.length; i++) {
		var name = config.notifyTiddlers[i].name;
		var notify = config.notifyTiddlers[i].notify;
		switch(name) {
		case "PageTemplate":
			config.refreshers.pageTemplate = getSlice(theme,name);
			store.namedNotifications.push({name: config.refreshers.pageTemplate, notify: notify});
			break;
		case "StyleSheet":
			var styleElement = document.getElementById(config.refreshers.styleSheet);
			if (styleElement)
				styleElement.parentNode.removeChild(styleElement);
			config.refreshers.styleSheet = getSlice(theme,name);
			store.namedNotifications.push({name: config.refreshers.styleSheet, notify: notify});
			break;
		case "ColorPalette":
			store.namedNotifications.push({name: getSlice(theme,name), notify: notify});
			break;
		default:
			store.namedNotifications.push({name: name, notify: notify});
			break;
		}
	}
	config.tiddlerTemplates[DEFAULT_VIEW_TEMPLATE] = getSlice(theme,"ViewTemplate");
	config.tiddlerTemplates[DEFAULT_EDIT_TEMPLATE] = getSlice(theme,"EditTemplate");
	refreshAll();
	story.refreshAllTiddlers();
};

Story.prototype.refreshAllTiddlers = function()
{
	var place = document.getElementById(this.container);
	var e = place.firstChild;
	if(!e)
		return;
	this.refreshTiddler(e.getAttribute("tiddler"),null,true);
	while((e = e.nextSibling) != null)
		this.refreshTiddler(e.getAttribute("tiddler"),null,true);
};

} //# end of 'install only once'
//}}}
