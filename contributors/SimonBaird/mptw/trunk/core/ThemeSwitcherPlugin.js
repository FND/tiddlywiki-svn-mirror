/***
!NB: Modified substantially by Simon Baird. Added palette switcher. Should probably be separate plugin.

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
	label: {
      		selectTheme:"select theme",
      		selectPalette:"select palette",
	},
	prompt: {
		selectTheme:"Select the current theme",
		selectPalette:"Select the current palette"
	},
	tags: {
		selectTheme:'systemTheme',
		selectPalette:'systemPalette'
	}
};

config.macros.selectTheme.handler = function(place,macroName)
{
	var btn = createTiddlyButton(place,this.label[macroName],this.prompt[macroName],this.onClick);
	// want to handle palettes and themes with same code..
	btn.setAttribute('mode',macroName);
};

config.macros.selectTheme.onClick = function(ev)
{
	var e = ev ? ev : window.event;
	var popup = Popup.create(this);
	var mode = this.getAttribute('mode');
	var tiddlers = store.getTaggedTiddlers(config.macros.selectTheme.tags[mode]);
	// for default
	if (mode == "selectPalette") {
		var btn = createTiddlyButton(createTiddlyElement(popup,'li'),"(default)","default color palette",config.macros.selectTheme.onClickTheme);
		btn.setAttribute('theme',"(default)");
		btn.setAttribute('mode',mode);
	}
	for(var i=0; i<tiddlers.length; i++) {
		var t = tiddlers[i].title;
		var name = store.getTiddlerSlice(t,'Name');
		var desc = store.getTiddlerSlice(t,'Description');
		var btn = createTiddlyButton(createTiddlyElement(popup,'li'),name ? name : title,desc ? desc : config.macros.selectTheme.label['mode'],config.macros.selectTheme.onClickTheme);
		btn.setAttribute('theme',t);
		btn.setAttribute('mode',mode);
	}
	Popup.show();
	return stopEvent(e);
};

config.macros.selectTheme.onClickTheme = function(ev)
{
	var mode = this.getAttribute('mode');
	var theme = this.getAttribute('theme');
	if (mode == 'selectTheme')
		story.switchTheme(theme);
	else // selectPalette
		config.macros.selectTheme.updatePalette(theme);
	return false;
};

config.macros.selectTheme.updatePalette = function(title)
{
	if (title != "") {
		store.deleteTiddler("ColorPalette");
		if (title != "(default)")
			store.saveTiddler("ColorPalette","ColorPalette",store.getTiddlerText(title),
					config.options.txtUserName,undefined,"");
		refreshAll();
		if(config.options.chkAutoSave)
			saveChanges(true);
	}
};

config.macros.applyTheme = {
	label: "apply",
	prompt: "apply this theme or palette" // lazy
};

config.macros.applyTheme.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var btn = createTiddlyButton(place,this.label,this.prompt,config.macros.selectTheme.onClickTheme);
	btn.setAttribute('theme',tiddler.title);
	btn.setAttribute('mode',macroName=="applyTheme"?"selectTheme":"selectPalette"); // a bit messy
}

config.macros.selectPalette = config.macros.selectTheme;
config.macros.applyPalette = config.macros.applyTheme;


} //# end of 'install only once'
//}}}

