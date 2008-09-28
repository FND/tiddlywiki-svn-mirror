/***
|Name|SwitchThemePluginPatch|
|Source|http://www.TiddlyTools.com/#SwitchThemePluginPatch|
|Documentation|http://www.TiddlyTools.com/#SwitchThemePluginPatch|
|Version|5.2.1|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.3|
|Type|plugin|
|Requires||
|Overrides|Story.prototype.switchTheme|
|Description|Patch core switchTheme() function for backward-compatibility with TW2.3.0 and earlier|
!!!!!Usage
<<<
This "patch" plugin provides backward-compatibility needed to enable [[SwitchThemePlugin]] to operate correctly under TW2.3.x or earlier.
{{medium{You should not install this plugin if you are using TW2.4.0 or above}}}
<<<
!!!!!Revisions
<<<
2008.05.09 [5.2.1] Simplified patch code for use with TW230 ONLY - NOT NEEDED FOR TW240 or above
2008.04.13 [5.2.0] moved from SwitchThemePlugin and updated for TW240b1.  Patch code will be simplified further once TW240 final release is available.
<<<
!!!!!Code
***/
//{{{
// OVERRIDE OF CORE story.switchTheme()
// for use with TW230, which uses config.refreshers, while TW240 uses config.refresherData
// also provides fallback for existing Web* slice naming convention
if (!config.refresherData) { // DETECT TW2.3
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
		if(readOnly)
			var r = store.getTiddlerSlice(theme,slice+"ReadOnly")
		            || store.getTiddlerSlice(theme,"Web"+slice); // fallback naming convention
		var r = r || store.getTiddlerSlice(theme,slice);
		if(r && r.indexOf(config.textPrimitives.sectionSeparator)==0)
			r = theme + r;
		return isAvailable(r) ? r : slice;
	};

	replaceNotification = function(i,name,theme,slice) {
		var newName = getSlice(theme,slice);
		if(name!=newName && store.namedNotifications[i].name==name) {
			store.namedNotifications[i].name = newName;
			return newName;
		}
		return name;
	};

	var pt = config.refreshers.pageTemplate;
	var vi = DEFAULT_VIEW_TEMPLATE;
	var vt = config.tiddlerTemplates[vi];
	var ei = DEFAULT_EDIT_TEMPLATE;
	var et = config.tiddlerTemplates[ei];

	for(var i=0; i<config.notifyTiddlers.length; i++) {
		var name = config.notifyTiddlers[i].name;
		switch(name) {
		case "PageTemplate":
			config.refreshers.pageTemplate = replaceNotification(i,config.refreshers.pageTemplate,theme,name);
			break;
		case "StyleSheet":
			removeStyleSheet(config.refreshers.styleSheet);
			config.refreshers.styleSheet = replaceNotification(i,config.refreshers.styleSheet,theme,name);
			break;
		case "ColorPalette":
			config.refreshers.colorPalette = replaceNotification(i,config.refreshers.colorPalette,theme,name);
			break;
		default:
			break;
		}
	}
	config.tiddlerTemplates[vi] = getSlice(theme,"ViewTemplate");
	config.tiddlerTemplates[ei] = getSlice(theme,"EditTemplate");
	if(!startingUp) {
		var switchedTemplates=config.refreshers.pageTemplate!=pt || config.tiddlerTemplates[vi]!=vt || config.tiddlerTemplates[ei]!=et;
		if(switchedTemplates) {
			refreshAll();
			story.refreshAllTiddlers(true);
		} else {
			setStylesheet(store.getRecursiveTiddlerText(config.refreshers.styleSheet,"",10),config.refreshers.styleSheet);
		}
		config.options.txtTheme = theme;
		saveOptionCookie("txtTheme");
	}
};
} // end if (!config.refresherData) 
//}}}