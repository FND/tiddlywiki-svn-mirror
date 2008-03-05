/***
|Name|SwitchThemePlugin|
|Source|http://www.TiddlyTools.com/#SwitchThemePlugin|
|Documentation|http://www.TiddlyTools.com/#SwitchThemePluginInfo|
|Version|5.1.3|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.3|
|Type|plugin|
|Requires||
|Overrides|Story.prototype.switchTheme |
|Description|Select alternative TiddlyWiki template/stylesheet 'themes' from a droplist|
!!!!!Usage
>see [[SwitchThemePluginInfo]]
!!!!!Example
>{{{<<switchTheme width:auto>>}}}
><<switchTheme width:auto>>
>{{{<<randomTheme>>}}}
><<randomTheme>>
!!!!!Revisions
<<<
2008.02.01 [5.1.3] in response to a change for core ticket #435 (see http://trac.tiddlywiki.org/changeset/3450) -- in switchTheme, use config.refresherData.* values (if defined), instead of config.refreshers.*  This change allows the plugin to work with both the current release (TW2.3.0) AND the upcoming release.
2008.02.01 [5.1.2] in switchTheme, replace hard-coded "StyleSheet" with config.refreshers.stylesheet (used as name of loaded styles)
2008.01.30 [5.1.1] changed tag-detection to use "systemTheme" instead of "theme" for compatibility with core theme switching mechanism.
2008.01.26 [5.1.0] added support for txtTheme="*" (applies random theme at startup) and {{{<<randomTheme>>}}} macro (selects/applies a random theme when a command link is clicked)
2008.01.25 [5.0.1] in refresh() and set(), removed use of ">" to indicate current theme 
2008.01.22 [5.0.0] Completely re-written and renamed from [[SelectStylesheetPlugin]] (now retired)
>//previous history for [[SelectStylesheetPlugin]] omitted//
2005.07.20 [1.0.0] Initial Release
<<<
!!!!!Code
***/
//{{{
version.extensions.switchTheme = {major: 5, minor: 1, revision: 3, date: new Date(2008,2,1)};

// define macro rendering handler
config.macros.switchTheme = {
	handler: function(place,macroName,params) {
		setStylesheet(".switchTheme {width:100%;font-size:8pt;margin:0em}","switchThemePlugin");
		if (params[0] && (params[0].substr(0,6)=="width:"))	var width=(params.shift()).substr(6);
		if (params[0] && (params[0].substr(0,6)=="label:"))	var label=(params.shift()).substr(6);
		if (params[0] && (params[0].substr(0,7)=="prompt:"))	var prompt=(params.shift()).substr(7);
		if (params[0] && params[0].trim().length) // create a link that sets a specific theme
			createTiddlyButton(place,label?label:params[0],prompt?prompt:params[0],
				function(){ config.macros.switchTheme.set(params[0]); return false;});
		else { // create a select list of available themes
			var theList=createTiddlyElement(place,"select",null,"switchTheme",null);
			theList.size=1;
			if (width) theList.style.width=width;
			theList.onchange=function() { config.macros.switchTheme.set(this.value); return true; };
			this.refresh(theList);
		}
	},
	refresh: function(list) {
		var indent = String.fromCharCode(160)+String.fromCharCode(160);
		while(list.length > 0){list.options[0]=null;} // clear list
		list.options[list.length] = new Option("select a theme:","",true,true);
		list.options[list.length] = new Option(indent+"[default]","StyleSheet");
		list.options[list.length] = new Option(indent+"[random]","*");
		var themes=store.getTaggedTiddlers("systemTheme");
		for (var i=0; i<themes.length; i++) if (themes[i].title!="StyleSheet")
			list.options[list.length]=new Option(indent+themes[i].title,themes[i].title);
		// show current selection
		for (var t=0; t<list.options.length; t++)
			if (list.options[t].value==config.options.txtTheme)
				{ list.selectedIndex=t; break; }
	},
	set: function(theme) {
		if (!theme||!theme.trim().length) return;
		if (theme=="[default]") theme="StyleSheet";
		if (theme=="[random]") theme="*";
		story.switchTheme(theme);
		// sync all theme droplists
		var elems=document.getElementsByTagName("select");
		var lists=[]; for (var i=0; i<elems.length; i++)
			if (hasClass(elems[i],"switchTheme")) lists.push(elems[i]);
		for (var k=0; k<lists.length; k++)
			for (var t=0; t<lists[k].options.length; t++)
				if (lists[k].options[t].value==theme)
					{ lists[k].selectedIndex=t; break; }
		return;
	}
}
//}}}

//{{{
config.macros.randomTheme = {
	label: "randomize",
	tooltip: "select another theme at random",
	handler: function(place,macroName,params) {
		createTiddlyButton(place,this.label,this.tooltip,this.set);
	},
	set: function() {
		var themes=store.getTaggedTiddlers("systemTheme"); if (!themes.length) return false;
		var which=Math.floor(Math.random()*themes.length);
		while (themes[which].title==config.options.txtTheme||themes[which].isTagged("noRandom"))
			which=Math.floor(Math.random()*themes.length);
		config.macros.switchTheme.set(themes[which].title);
		return false;
	}
}
//}}}

//{{{
// OVERRIDE CORE FUNCTION: story.switchTheme()
// * If templates have not changed, only refresh CSS.   Prevent re-rendering of content unless needed.
// * if (readOnly), use Web* template slice definitions (when present)
Story.prototype.switchTheme = function(theme)
{
	if(safeMode) 
		return;
		
	isAvailable = function(title) { 
		var s = title ? title.indexOf(config.textPrimitives.sectionSeparator) : -1; 
		if(s!=-1) 
			title = title.substr(0,s); 
		return store.tiddlerExists(title) || store.isShadowTiddler(title); 
 	};

	getSlice = function(theme,slice) {
		if (readOnly) var r = store.getTiddlerSlice(theme,'Web'+slice); //ELS
		var r = r || store.getTiddlerSlice(theme,slice); // ELS
		if(r && r.indexOf(config.textPrimitives.sectionSeparator)==0)
			r = theme + r;
		return isAvailable(r) ? r : slice;
	};

	replaceNotification = function(i,name,newName) {
		if(name==newName)
			return name;
		if(store.namedNotifications[i].name == name) {
			store.namedNotifications[i].name = newName;
			return newName;
		}
		return name;
	};

	// ELS: select a random theme (excluding themes tagged with "noRandom")
	var randomize=theme=="*";
	if (randomize) { 
		var themes=store.getTaggedTiddlers("systemTheme");
		var which=Math.floor(Math.random()*themes.length);
		while (themes[which].isTagged("noRandom"))
			which=Math.floor(Math.random()*themes.length);
		theme=themes[which].title;
	}

	// remember current templates
	var pt=config.refresherData?config.refresherData.pageTemplate:config.refreshers.pageTemplate; //ELS
	var vt=config.tiddlerTemplates[DEFAULT_VIEW_TEMPLATE]; //ELS
	var et=config.tiddlerTemplates[DEFAULT_EDIT_TEMPLATE] //ELS

	for(var i=0; i<config.notifyTiddlers.length; i++) {
		var name = config.notifyTiddlers[i].name;
		switch(name) {
		case "PageTemplate":
			config.refreshers.pageTemplate = replaceNotification(i,config.refreshers.pageTemplate,getSlice(theme,name));
			break;
		case "StyleSheet":
			removeStyleSheet(config.refresherData?config.refresherData.styleSheet:config.refreshers.styleSheet);
			config.refreshers.styleSheet = replaceNotification(i,config.refreshers.styleSheet,getSlice(theme,name));
			break;
		case "ColorPalette":
			config.refreshers.colorPalette = replaceNotification(i,config.refreshers.colorPalette,getSlice(theme,name));
			break;
		default:
			break;
		}
	}
	config.tiddlerTemplates[DEFAULT_VIEW_TEMPLATE] = getSlice(theme,"ViewTemplate");
	config.tiddlerTemplates[DEFAULT_EDIT_TEMPLATE] = getSlice(theme,"EditTemplate");

	// check to see if templates have changed
	var switchTemplate=((config.refresherData?config.refresherData.pageTemplate:config.refreshers.pageTemplate)!=pt) //ELS
		||(config.tiddlerTemplates[DEFAULT_VIEW_TEMPLATE]!=vt) //ELS
		||(config.tiddlerTemplates[DEFAULT_EDIT_TEMPLATE]!=et); //ELS

	var ss=config.refresherData?config.refresherData.styleSheet:config.refreshers.styleSheet;
	if(!window.startingUp) {
		if (switchTemplate) { refreshAll(); story.refreshAllTiddlers(true); }
		else setStylesheet(store.getRecursiveTiddlerText(ss,"",10),ss);
		config.options.txtTheme=randomize?"*":theme;
		saveOptionCookie("txtTheme");
	}
};
//}}}