/***
|''Name:''|SettingsPlugin|
|''Version:''|1.1.0 (2006-07-30)|
|''Type:''|plugin|
|''Source:''|http://tiddlywiki.abego-software.de/#SettingsPlugin|
|''Author:''|Udo Borkowski (ub [at] abego-software [dot] de)|
|''Documentation:''|[[SettingsPlugin Documentation]]|
|''~SourceCode:''|[[SettingsPlugin SourceCode]]|
|''Licence:''|[[BSD open source license (abego Software)]]|
|''~CoreVersion:''|2.0.7|
|''Browser:''|Firefox 1.5.0.2 or better; Internet Explorer 6.0|
^^This tiddler contains compressed source code. [[Full Source Code|SettingsPlugin SourceCode]].^^

***/
//{{{
// Ensure the Plugin is only installed once.
//
if (!version.extensions.SettingsPlugin) {

if (version.major < 2) {
	(function() {
		var s = "Use TiddlyWiki 2.0 or better to run the Settings Plugin.";
		alert(s);
		throw s;
	})();
}

version.extensions.SettingsPlugin = {
	major: 1, minor: 1, revision: 0,
	date: new Date(2006, 6, 30),
	type: 'plugin',
	source: "http://tiddlywiki.abego-software.de/#SettingsPlugin",
	documentation: "[[SettingsPlugin Documentation]]",
	sourcecode: "[[SettingsPlugin SourceCode]]",
	author: "Udo Borkowski (ub [at] abego-software [dot] de)",
	licence: "[[BSD open source license (abego Software)]]",
	coreVersion: "2.0.7",
	browser: "Firefox 1.5.0.2 or better; Internet Explorer 6.0"
};

// Ensure the global abego namespace is set up.
if (!window.abego) window.abego = {};


//}}}
/***
!Start of main code
***/
//{{{
// ========================================================================
// Utilities ==============================================================
// ========================================================================

if (!abego.setTiddlerText) {
// Set the text of the tiddler with the given title.
// 
// When the tiddler does not yet exist it is created with the given defaultTags.
// When withNotify is true notifications are send.
// When dontAutoSave is false and AutoSave is on changes are autoSaved.
//
abego.setTiddlerText = function(store,title,text,defaultTags,dontAutoSave,withNotify){
	var tiddler = store.getTiddler(title);
	
	// Shortcut: Do nothing when text hasn't changed.
	if (tiddler && (tiddler.text == text))
		return;
		
	var minorUpdate = config.options.chkForceMinorUpdate;
	var tags = !tiddler ? defaultTags : tiddler.tags;
	
	store.suspendNotifications();
	try {
		store.saveTiddler(
				title,
				title,
				text,
				minorUpdate ? undefined : config.options.txtUserName,
				minorUpdate ? undefined : new Date(),
				tags);
	} finally {
		store.resumeNotifications();
	}
	
	if (withNotify) 
		store.notify(title,true);

	if(!dontAutoSave && config.options.chkAutoSave)
		saveChanges();
};
}

// ========================================================================
// The Settings Core Code =================================================
// ========================================================================

(function() {
	// ====================================================================
	// Internal Part ======================================================
	// ====================================================================

	// ====================================================================
	// Constants ==========================================================
	// ====================================================================

	var TIDDLERNAME = "PrivateSettings";
	var USE_PRIVATE_SETTINGS_OPTION = "chkUsePrivateSettings";
	var MAKE_SETTING_PRIVATE_WHEN_CHANGED_OPTION = "chkMakeSettingPrivateWhenChanged";

	// ====================================================================
	// Variables ==========================================================
	// ====================================================================

	var privateSettingNames = null;
	var usePrivateSettings = false;

	// ====================================================================
	// Internal Functions =================================================
	// ====================================================================

	// Adds the settings defined in s to the result.
	//
	// A setting n with value v sets the property n with value v to result
	// Old values are overwritten.
	// 
	// Returns an object with the names of the added settings as boolean 
	// properties set to true (Attention: this is not the result object).
	//
	var addSettings = function(result, s) {
		var settings = s.split(";");
		var addedSettings = {};
		for(var c = 0; c < settings.length; c++) {
			var p = settings[c].indexOf("=");
			if(p != -1)	{
				var name = settings[c].substr(0,p).trim();
				var value = settings[c].substr(p+1).trim();
				result[name] = unescape(value);
				addedSettings[name] = true;
			}
		}
		return addedSettings;
	};
	
	// Adds the settings stored in the (private) Settings tiddler to the result
	//
	var addPrivateSettings = function(result) {
		var s = store.getTiddlerText(TIDDLERNAME);
		privateSettingNames = 
				s 
					? addSettings(result, s) 
					: {};
	};
	
	// Adds the settings stored in the cookies to the result
	//
	var addSharedSettings = function(result) {
		addSettings(result, document.cookie);
	};
	
	// Loads and returns the settings stored in the  cookies
	//
	var loadSharedSettings = function() {
		var result = {};
		addSharedSettings(result);
		return result;
	};
	
	// Returns the settings stored in the (private) Settings tiddler
	// 
	var loadPrivateSettings = function() {
		var result = {};
		addPrivateSettings(result);
		return result;
	};
	
	// Saving -----------------------------------------------------------------
	
	// Stores the setting in the cookies
	//
	var saveSharedSetting = function(name, value) {
		document.cookie = name + "=" + escape(value) + "; expires=Fri, 1 Jan 2038 12:00:00 UTC; path=/";
	};
	
	// Sets the private setting with the given name to s.
	//
	// When s is null the setting is removed.
	//
	var savePrivateSetting = function(name, s, dontAutoSave) {
		// get the private settings
		var privateSettings = loadPrivateSettings();
		
		// modify the private settings (i.e. set/change value, or delete)
		if (s === null) {
			// If there is no such setting we are done
			if (!privateSettingNames[name]) 
				return;
				
			// remove the setting (and the name from the private names list)
			delete privateSettings[name];
			delete privateSettingNames[name];
			
		} else {
			// When the value has not changed we are done.
			var oldValue = privateSettings[name];
			if (oldValue !== undefined && oldValue == s) 
				return;

			// Set the new value and ensure that this setting 
			// is remembered as a private setting.
			privateSettings[name] = s;
			privateSettingNames[name] = true;
		}
		
		// Convert to a "cookies string"
		var t = "";
		for (var i in privateSettings) {
			if (t) t += "; ";
			t += i + "=" + escape(privateSettings[i]);
		}
		
		// save to the tiddler
		abego.setTiddlerText(store,TIDDLERNAME,t,["excludeLists", "excludeSearch"],dontAutoSave);

		if(!dontAutoSave && config.options.chkAutoSave)
			saveChanges();
	};
	
	// ====================================================================
	// Initializations ====================================================
	// ====================================================================

	// ShadowTiddlers =====================================================
	
	config.shadowTiddlers["BSD open source license (abego Software)"] = "See [[Licence|http://tiddlywiki.abego-software.de/#%5B%5BBSD%20open%20source%20license%5D%5D]].";
	config.shadowTiddlers["SettingsPlugin Documentation"] = "[[Documentation on abego Software website|http://tiddlywiki.abego-software.de/#%5B%5BSettingsPlugin%20Documentation%5D%5D]].\n\n^^You may copy the documentation tiddler from the website to your TiddlyWiki.\nThen you don't need to access the internet to read the documentation.^^";
	config.shadowTiddlers["SettingsPlugin SourceCode"] = "Rightclick this [[link|http://tiddlywiki.abego-software.de/src/Plugin-Settings-src.js]] and choose 'Save target/link as...' to get the plugin source code from the abego Software website.";
	config.shadowTiddlers["Show Settings"] = "<<showSettings>>";
	
	// Options ============================================================

	if (config.options[USE_PRIVATE_SETTINGS_OPTION] === undefined) config.options[USE_PRIVATE_SETTINGS_OPTION] = false;
	if (config.options[MAKE_SETTING_PRIVATE_WHEN_CHANGED_OPTION] === undefined) config.options[MAKE_SETTING_PRIVATE_WHEN_CHANGED_OPTION] = false;

	config.shadowTiddlers.AdvancedOptions += "\n''Private Settings: ''<<option "+USE_PRIVATE_SETTINGS_OPTION+">> Use private settings.  <<option "+MAKE_SETTING_PRIVATE_WHEN_CHANGED_OPTION+">> Make setting private when changed.&#160;&#160;&#160;[[Show Settings]].\n^^(Private settings are stored in this ~TiddlyWiki, shared settings are stored as cookies. For more information see the [[Settings documentation|SettingsPlugin Documentation]].)^^";
	




	// ====================================================================
	// Public Part ========================================================
	// ====================================================================
	
	// Returns true if the "private settings" should be used, 
	// otherwise false is returned.
	//
	abego.usePrivateSettings = function() {
		return usePrivateSettings;
	};
	
	// Sets the usePrivateSettings flag
	//
	abego.setUsePrivateSettings = function(f) {
		if (f != abego.usePrivateSettings()) {
			usePrivateSettings = f;
			loadOptionsCookie();
		}
	};

	// Returns true if name is the name of the option/setting to hold
	// the "UsePrivateSettings" value, otherwise false is returned.
	//
	abego.isUsePrivateSettingsOption = function(name) {
		return name == USE_PRIVATE_SETTINGS_OPTION;
	};

	// Returns true if changing a setting should make it private,
	// otherwise false is returned.
	//
	abego.makeSettingPrivateWhenChanged = function() {
		return config.options[MAKE_SETTING_PRIVATE_WHEN_CHANGED_OPTION];
	};
	
	// Sets the makeSettingPrivateWhenChanged flag
	//
	abego.setMakeSettingPrivateWhenChanged = function(f) {
		config.options[MAKE_SETTING_PRIVATE_WHEN_CHANGED_OPTION] = f;
	};
	
	// Returns the current settings as the properties of the returned object.
	// 
	// This contains both shared and private settings, with the private settings
	// overwriting shared ones (if defined)
	//
	// When abego.usePrivateSettings() is false private settings are ignored.
	//
	// To access the value of an individual setting use
	//
	//     abego.getSettings()["aSettingName"]
	//
	// (may be undefined)
	//
	abego.getSettings = function() {
		var result = {};
		addSharedSettings(result);
		usePrivateSettings = result[USE_PRIVATE_SETTINGS_OPTION] == "true";
		if (abego.usePrivateSettings()) 
			addPrivateSettings(result);
		return result;
	};
	
	// Returns the value of the setting with the given name.
	//
	// Returns "" when no such setting exists.
	//
	// When multiple settings should be accessed at once use the
	// abego.getSettings() function instead to get the Settings 
	// object and access the individual setting values through
	// that object's properties.
	// 
	abego.getSetting = function(name) {
		var s = abego.getSettings()[name];
		return !s ? "" : s;
	};
	
	// Save the new setting value.
	//
	// This does not change the scope of the setting, 
	// a shared setting stays shared and a private setting stays private.
	// New settings are initially shared.
	//
	// When abego.usePrivateSettings() is false the shared setting is modified.
	//
	abego.saveSetting = function(name, value) {
		// Special case: The "UsePrivateSettings" is always a shared setting. 
		// Also: Changing it enforce the options to be reloaded.
		if (abego.isUsePrivateSettingsOption(name)) {
			saveSharedSetting(name, value);
			abego.setUsePrivateSettings(value == "true");
			loadOptionsCookie();
			window.alert("You changed the 'Use private settings' option.\nPlease reload your TiddlyWiki to update the settings.\n");
			return;
		}

		if (abego.usePrivateSettings() &&
				(abego.isSettingPrivate(name)||abego.makeSettingPrivateWhenChanged())) 
			savePrivateSetting(name, value);
		else
			saveSharedSetting(name, value);
	};
	
	// Returns true if the given setting is a private setting, 
	// otherwise false.
	//
	// The value of abego.usePrivateSettings() is has no effect 
	// on the outcome of this function.
	//
	abego.isSettingPrivate = function(name) {
		if (abego.isUsePrivateSettingsOption(name))
			return false;
			
		if (!privateSettingNames) {
			loadPrivateSettings();
		}
		return !!privateSettingNames[name];
	};
	
	// Returns true if the name refers to a "password" setting
	// (i.e. options starting with "pas" or "chkpas").
	//
	// Password settings should not be displayed and 
	// not be stored as a private setting.
	abego.isPasswordSetting = function(name) {
		return (name.substr(0,3) == "pas") || (name.substr(0,6) == "chkpas");
	};
	
	// Make the setting private or shared, depending on the value of makePrivate.
	//
	// When no such private setting is defined the function does nothing.
	//
	abego.makeSettingPrivate = function(name, makePrivate, dontAutoSavePrivateSettings) {
		if (abego.isPasswordSetting(name)) {
			// Don't save password settings as a private setting. 
			
			// Even remove it from the private settings in case the password was once 
			// stored with an older version of the plugin)
			savePrivateSetting(name, null, dontAutoSavePrivateSettings);
			return;
		}

		var privateSettings = loadPrivateSettings();
		var isPrivate = privateSettings[name] !== undefined;
		if (makePrivate == isPrivate) 
			// the setting needs no change. We are done.
			return;
	
		var sharedSettings = loadSharedSettings();
	
		if (makePrivate) {
			savePrivateSetting(name, sharedSettings[name], dontAutoSavePrivateSettings);
			
		} else {
			// make the setting shared, i.e. remove the private setting
				
			// if the setting is defined as a private setting but there is no
			// shared setting with that name save the current private value as
			// a shared value.
			if (sharedSettings[name] === undefined) {
				saveSharedSetting(name, privateSettings[name]);			
			}
			
			// Remove the private setting
			savePrivateSetting(name, null, dontAutoSavePrivateSettings);
		}
	};
	
	// Make all settings private or shared, depending on the value of makePrivate.
	//
	// tiddlerToRefresh [may be null/undefined] the name of the tiddler that 
	// should be refreshed after the  settings are changed.
	//
	abego.setAllSettingsPrivate = function(makePrivate, tiddlerToRefresh) {
		var settings = abego.getSettings();
		for (var s in settings) {
			abego.makeSettingPrivate(s, makePrivate, true);
		}
		if(config.options.chkAutoSave)
			saveChanges();
		if (tiddlerToRefresh) {
			story.refreshTiddler(tiddlerToRefresh,1, true);
		}
		return false;
	};
})();





// ========================================================================
// showSettings Macro =====================================================
// ========================================================================

// Macro to display a table with all current settings.
//
// Every setting is displayed with name and value and a checkbox that indicates
// if the setting is of private and shared scope. 
//
// The checkbox can be used to change the scope.
// 
config.macros.showSettings = {
     // Standard Properties
     label: "showSettings",
     prompt: "Display the current TiddlyWiki settings"
};

config.macros.showSettings.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	
	var isOptionName = function(a) {
		var s = a.substr(0,3);
		return s == "txt" || s == "chk";
	};
	
	var compareNoCase = function(a,b) {
		var s1 = a.toLowerCase();
		var s2 = b.toLowerCase();
		return (s1 < s2) ? -1 : (s1 == s2) ? 0 : 1;
	};
	
	var compareWithOptionsFirst = function(a, b) {
		var aIsOption = isOptionName(a);
		var bIsOption = isOptionName(b);
		if (aIsOption) {
			if (!bIsOption)
				return -1;
			else 
				return compareNoCase(a.substr(3), b.substr(3));
		} else if (bIsOption) {
			return 1;
		} else {
			return compareNoCase(a,b);
		}
	};
	
	var s = '<html><table><tr align="left"><th>Private</th><th>Name</th><th>Value</th></tr>';
	var c = abego.getSettings();
	var names = [];

	for (var i in c) {
		// Only show "non-password" settings
		if (!abego.isPasswordSetting(i))
			names.push(i);
	}
	
	names.sort(compareWithOptionsFirst);

	for (i = 0; i < names.length; i++) {
		var name = names[i];
		var label = isOptionName(name)
				? name.substr(3)+" ("+name.substr(0,3)+"...)"
				: name;
		var checkboxText = abego.isUsePrivateSettingsOption(name)
				? ''
				: '<input name="'+name+'" type="checkbox" onclick="abego.onPrivateSettingClick(this)"'+
						(abego.isSettingPrivate(name) ? " checked" : "")+'/>';
		s += '<tr><td align="right">'+ checkboxText +
				'</td><td>'+label+'</td><td>'+c[name]+'</td></tr>\n';
	}
	
	s += '</table>';
	s += '<a class="button" title="Make all current settings private" href="javascript:;" onclick="abego.setAllSettingsPrivate(true,\''+tiddler.title+'\',1);">Make all private</a>';
	s += '<a class="button" title="Make all current settings shared" href="javascript:;" onclick="abego.setAllSettingsPrivate(false,\''+tiddler.title+'\',1);">Make all shared</a>';
	s += '</html>';
	
	wikify(s, place);
};

// Event handler used by the checkboxes in the "showSettings" table to change the
// scope of a setting.
//
abego.onPrivateSettingClick = function(inputElem) {
	abego.makeSettingPrivate(inputElem.name, inputElem.checked);
	return false;
};




// ========================================================================
// TiddlyWiki Integration =================================================
// ========================================================================

// Overload the core "Options" functions to use the Settings feature

this.loadOptionsCookie = function()
{
	if(safeMode)
		return;
	var settings = abego.getSettings();
	for(var name in settings)
		{
			var value = settings[name];
			switch(name.substr(0,3))
				{
				case "txt":
					config.options[name] = unescape(value);
					break;
				case "chk":
					config.options[name] = value == "true";
					break;
				}
		}
};

this.saveOptionCookie = function(name)
{
	if(safeMode)
		return;
	var v = "";
	switch(name.substr(0,3))
		{
		case "txt":
			v = config.options[name].toString();
			break;
		case "chk":
			v = config.options[name] ? "true" : "false";
			break;
		}
	abego.saveSetting(name,v);
};

//------------------------------------------------------------------------------
// Since the plugin is loaded after the options are loaded we do a re-load now,
// allowing the options to hold private values.
loadOptionsCookie();
//}}}


/***
!End of main code
***/

	
//{{{
} // of single install
//}}}

//{{{
// Used Globals (for JSLint) ==============

// ... DOM
/*global 	document */
// ... TiddlyWiki Core
/*global 	Tiddler, loadOptionsCookie, safeMode, saveChanges, saveOptionCookie, store, story, wikify*/
//}}}
