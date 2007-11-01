/***
|''Name:''|ThemeSwitcherPlugin|
|''Description:''|My Description|
|''Author:''|My Name|
|''Source:''|http://www.MyWebSite.com/#ExamplePlugin |
|''~CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MyDirectory/plugins/ThemeSwitcherPlugin.js |
|''Version:''|0.0.1|
|''Status:''|Not for release - still under development|
|''Date:''|July 31, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|


***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ThemeSwitcherPlugin) {
version.extensions.ThemeSwitcherPlugin = {installed:true};

config.macros.selecttheme = {};
config.macros.selecttheme.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var label = 'select theme';
	var prompt = 'select the current theme';
	var accessKey = '';
	var btn = createTiddlyButton(place,label,prompt,this.onClick,null,null,accessKey);
	btn.setAttribute("place",place);
};

config.macros.selecttheme.onClick = function(ev)
{
//var text = store.getTiddlerText("TestSingleTiddlerTheme",null,"StyleSheet");
//displayMessage("aa:"+text);
//return;
	var e = ev ? ev : window.event;
	var popup = Popup.create(this);
	var tiddlers = store.getTaggedTiddlers("systemTheme");
	for(var i=0; i<tiddlers.length; i++) {
		var title = tiddlers[i].title;
		var label = title;
		var prompt = 'switch to theme: ' + title;
		var accessKey = '';
		var li = createTiddlyElement(popup,"li");
		var btn = createTiddlyButton(li,label,prompt,config.macros.selecttheme.onClickTheme,null,null,accessKey);
		btn.setAttribute("theme",title);
	}
	Popup.show();
	story.refreshAllTiddlers();// need this to display the  popup
	refreshDisplay();// need this to display the popup on the sidebar
};


config.macros.selecttheme.onClickTheme = function(ev)
{
	var themeName = this.getAttribute("theme");
	config.macros.selecttheme.switchTheme(themeName);
};

config.macros.selecttheme.switchTheme = function(themeName,slice)
{
	getSlice = function(theme,slice)
	{
		var r = store.getTiddlerSlice(theme,slice);
		if(r && r.indexOf('#')==0)
			r = theme + r;
		return r;
	};
	var cp = getSlice(themeName,'ColorPalette');
	var et = getSlice(themeName,'EditTemplate');
	var pt = getSlice(themeName,'PageTemplate');
	var st = getSlice(themeName,'StyleSheet');
	var vt = getSlice(themeName,'ViewTemplate');

	isTiddler = function(title)
	{
		var s = title ? title.indexOf("#") : -1;
		if(s!=-1)
			title = title.substr(0,s);
		return store.tiddlerExists(title) || store.isShadowTiddler(title);
	};

	if(isTiddler(vt))
		config.tiddlerTemplates[DEFAULT_VIEW_TEMPLATE] = vt;
	if(isTiddler(et))
		config.tiddlerTemplates[DEFAULT_EDIT_TEMPLATE] = et;
	store.namedNotifications.length = 0;
	for(var i=0; i<config.notifyTiddlers.length; i++) {
		var name = config.notifyTiddlers[i].name;
		var notify = config.notifyTiddlers[i].notify;
		switch(name) {
		case "PageTemplate":
			config.refreshers.pageTemplate = isTiddler(pt) ? pt : name;
			store.namedNotifications.push({name: config.refreshers.pageTemplate, notify: notify});
			break;
		case "StyleSheet":
			var styleElement = document.getElementById(config.refreshers.styleSheet);
			if (styleElement)
				styleElement.parentNode.removeChild(styleElement);
			config.refreshers.styleSheet = isTiddler(st) ? st : name;
			store.namedNotifications.push({name: config.refreshers.styleSheet, notify: notify});
			break;
		case "ColorPalette":
			store.namedNotifications.push({name: isTiddler(cp) ? cp : name, notify: notify});
			break;
		default:
			store.namedNotifications.push({name: name, notify: notify});
			break;
		}
	}
	config.tiddlerTemplates[DEFAULT_VIEW_TEMPLATE] = isTiddler(vt) ? vt : "ViewTemplate";
	config.tiddlerTemplates[DEFAULT_EDIT_TEMPLATE] = isTiddler(et) ? et : "EditTemplate";
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
