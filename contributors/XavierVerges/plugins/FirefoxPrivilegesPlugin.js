/***
|''Name''|FirefoxPrivilegesPlugin|
|''Description''|Create a backstage tab to manage Firefox url privileges|
|''Author''|Xavier Vergés (xverges at gmail dot com)|
|''Version''|1.0.2 ($Rev$)|
|''Date''|$Date$|
|''Status''|@@beta@@|
|''Source''|tbd|
|''CodeRepository''|http://trac.tiddlywiki.org/browser/Trunk/contributors/XavierVerges/plugins/FirefoxPrivilegesPlugin.js|
|''License''|BSD tbd|
|''CoreVersion''|2.2.4 (maybe 2.2+?)|
|''Feedback''|http://groups.google.com/group/TiddlyWiki|
|''BookmarkletReady''|http://icanhaz.com/firefoxprivileges|
|''Browser''|Mozilla. Tested under Firefox 2.0.0.12|
|''Documentation''|tbw|
/%
!Description
!Notes
!Usage
!Revision History
!!v1.0 (2008-03-23)
* First public version
%/
!To Do
* Avoid non lingo.js-able hardcoded strings
** Create a Catalan and/or Spanish FirefoxPrivilegesPluginLingoXX.js to 
* Have three pages
** --//Learn about the risks//--
** // Grant privileges//
** --//List (and optionally reset) privileges//--
!Code
***/
//{{{
if(window.Components) {
config.macros.firefoxPrivileges = {};
/*
//}}}
!!! Strings to translate
//{{{
*/
merge(config.macros.firefoxPrivileges ,{
	wizardTitle: "Manage Firefox Privileges",
	learnStepTitle: "1. Learn about the risks of giving privileges to file: urls",
	learnStepHtml: "<p>Firefox can be configured to grant the same security privileges to every html document loaded from disk (those <i>file:</i> urls), or to grant different privileges on a per file basis. Local TiddyWikis need some high security privileges in order to let you save changes to disk, or to import tiddlers from remote servers. Unfortunately, these same privileges can potentially be used by the bad guys to launch programs, get files from your disk and upload them somewhere, access your browsing history...</p><p>While it is more convenient to let Firefox give all your local files the same security privileges, and I'm not aware of any malware attack that tries to take advantage of privileged <i>file:</i> urls, an ounce of prevention is worth a pound of cure.</p><p>You can learn more blah bah...</p><p>This wizard will help you to grant the required privileges to your local TiddlyWiki, and warn you if you have enabled a dangerous default</p>",
	learnStepButton: "1. Learn about the risks",
	learnStepButtonTooltip: "Learn why 'Remember this' is an unsafe choice in security prompts",
	grantStepTitle: "2. Grant privileges to individual documents",
	grantStepHtml: "Asking for temporary privieges to list permanent privileges...",
	grantStepButton: "2. Grant privileges",
	grantStepButtonTooltip: "Grant privileges to this or other docs",
	viewStepTitle: "3. Granted privileges",
	viewStepHtml: "<input type='hidden' name='markList'></input>",
	viewStepButton: "3. List granted privileges",
	viewStepButtonTooltip: "List granted privileges, and optionally reset them",
	allowSaveLabel: "Grant rights required to save to disk (Run or install software on your machine - UniversalXPConnect)",
	allowImportLabel: "Grant rights required to import tiddlers from servers or access TiddlySpot (Read and upload local files - UniversalBrowserRead)",
	step2Title: "Privileged urls",
	step2Html: "<input type='hidden' name='markList'></input>",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Url', field: 'url', title: "Url", type: 'Link'},
			{name: 'Granted', field: 'granted', title: "Granted", type: 'StringList'},
			{name: 'Denied', field: 'denied', title: "Denied", type: 'StringList'},
			{name: 'Handle', field: 'handle', title: "Handle", type: 'String'},
            {name: 'Notes', field: 'notes', title: "Notes", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'thisUrl'},
			{className: 'error', field: 'warning'}
			]
		}
	});

merge(config.tasks,{
	firefoxPrivileges: {text: "security", tooltip: "Work with Firefox url privileges", content: '<<firefoxPrivileges>>'}
});
/*
//}}}
!!! Regular code
//{{{
*/
config.backstageTasks.pushUnique("firefoxPrivileges");

config.macros.firefoxPrivileges.privAccessCapabilities = "UniversalXPConnect CapabilityPreferencesAccess";
config.macros.firefoxPrivileges.stepNames = ["learn", "grant", "view"];
config.macros.firefoxPrivileges.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var wizard = new Wizard();
	wizard.createWizard(place,this.wizardTitle);
	this.step(wizard, 0);
};
config.macros.firefoxPrivileges.buttons = (function(){
	var that = config.macros.firefoxPrivileges;
	var _buttons = [];
	for (var ii=0; ii<that.stepNames.length; ii++) {
		var name = that.stepNames[ii];
		var onclick = (function() {
			var index = ii;
			var handler = function(e) {
				that.step(new Wizard(resolveTarget(e)), index);
				return false;
			};
			return handler;
		})();
		_buttons.push({caption: that[name+"StepButton"], 
					   tooltip: that[name+"StepButtonTooltip"],
					   onClick: onclick});
	}
	var getButtons = function(index) {
		var buttons = [];
		for (var ii= 0; ii<_buttons.length; ii++) {
			if (ii != index) {
				buttons.push(_buttons[ii]);
			}
		}
		return buttons;
	};
	return getButtons;
})();

config.macros.firefoxPrivileges.step = function(wizard, stepIndex, extraParams)
{
	var name = this.stepNames[stepIndex];
	var stepResult = {};
	wizard.addStep(this[name+"StepTitle"],this[name+"StepHtml"]);
	wizard.setButtons(this.buttons(stepIndex));
	if (this[name+"StepProcess"]) {
		stepResult = this[name+"StepProcess"](wizard, extraParams);
	}
	var buttonIndex = typeof(stepResult.buttonIndex)!=="undefined"? stepResult.buttonIndex : stepIndex;
	wizard.setButtons(this.buttons(buttonIndex), 
	                  stepResult.status);
};
config.macros.firefoxPrivileges.grantStepProcess = function(wizard)
{
	var viewStepExtraParams = {reqAcccess: false};
	netscape.security.PrivilegeManager.enablePrivilege(this.privAccessCapabilities);

	var urlRights = [];
	//if (chkXPConnect) {
		urlRights.push("UniversalXPConnect");
	//}
	//if (chkBrowserRead) {
		urlRights.push("UniversalBrowserRead");
	//}
	var thisUrl = document.location.toString();
	needsReload = this.setUrlPrivilege(false, thisUrl, urlRights);
	if (needsReload) {
		viewStepExtraParams.status = "Reload to take effect";
	}
	this.step(wizard, 2, viewStepExtraParams);
	return {buttonIndex: 2,
	        status: needsReload? "Reload to take effect":null};
};
config.macros.firefoxPrivileges.viewStepProcess = function(wizard, extraParams)
{
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	listWrapper.innerHTML = "Asking for temporary privieges to list permanent privileges...";

	var html = [];
	try {
		if (!extraParams || extraParams.reqAcccess) {
			netscape.security.PrivilegeManager.enablePrivilege(this.privAccessCapabilities);
		}

		var thisUrl = document.location.toString();
		var privs = this.getPrivilegedUrls(false);
		var listItems = [];
		for (var handle in privs) {
			if (privs.hasOwnProperty(handle)) {
				priv = privs[handle];
				if ((priv.url === "file://") ||
					(priv.url.indexOf(" ") != -1))
				{
					priv.warning = true;
					priv.notes = (priv.url === "file://")? "This is dangerous" : "This has no effect";
				} else if (priv.url === thisUrl) {
					priv.thisUrl = true;
                    priv.notes = "This document's url";
				}
				listItems.push(priv);
			}
		}
		listWrapper.innerHTML = "";
		var listView = ListView.create(listWrapper, listItems, this.listViewTemplate);
	} catch (ex) {
		listWrapper.innerHTML = "Error: " + ex;
	}
	return {};
};
config.macros.firefoxPrivileges.setUrlPrivilege = function(reqAccess, url, rights, reset)
{
	function getFreeHandle(dict, prefix) {
		var handle = prefix;
		var ii = 0;
		while("undefined" !== typeof(dict[handle])) {
			ii++;
			handle = prefix + ii;
		}
		return handle;
	}
	if (reqAccess) {
		netscape.security.PrivilegeManager.enablePrivilege(this.privAccessCapabilities);
	}
	var isUpdate = true;
	var urlHandle = "";
	var urls = this.getPrivilegedUrls(false);
	for (var handle in urls) {
		if (urls[handle].url === url) {
			urlHandle = handle;
			break;
		}
	}
	var denied = [];
	var granted = [];
	if (urlHandle) {
		if (!reset) {
			displayMessage("Updating privileges for " + url);
			denied = urls[urlHandle].denied.slice();
			granted = urls[urlHandle].granted.slice();
		} else {
			displayMessage("Reseting privileges for " + url);
		}
	} else {
		displayMessage("Setting privileges for " + url);
		urlHandle = getFreeHandle(urls, "FirefoxPrivilegesPlugin");
		isUpdate = false;
	}
	for (var ii=0; ii<rights.length; ii++) {
		denied.remove(rights[ii]);
		granted.pushUnique(rights[ii]);
	}
	var prefs = this.getPrefsBranch();
	var idStr = urlHandle + ".id";
	var deniedStr = urlHandle + ".denied";
	var grantedStr = urlHandle + ".granted";
	function clearPref(str) {
		if (prefs.prefHasUserValue(str)) {
			prefs.clearUserValue(str);
		}		
	}
	function setOrClearPref(str, val) {
		if (val.length) {
			val = ("string" === typeof(val))? val : val.join(" ");
			prefs.setCharPref(str, val);
			// why oh why?!
			if (!prefs.prefHasUserValue(str)) {
				prefs.setCharPref(str, val);
			}
		} else {
			clearPref(str);
		}
	}
	if (!denied.length && !granted.length) {
		clearPref(idStr);
		clearPref(deniedStr);
		clearPref(grantedStr);
	} else {
		setOrClearPref(idStr, url);
		setOrClearPref(deniedStr, denied);
		setOrClearPref(grantedStr , granted);
		setOrClearPref(idStr, url);
	}
	var prefService = this.getPrefsService();
	prefService.savePrefFile(null);

	return !isUpdate;
};
config.macros.firefoxPrivileges.getPrivilegedUrls = function(reqAccess)
{
	function Privileged(url, granted, denied, handle) {
		this.url = url;
		this.granted = granted;
		this.denied = denied;
		this.handle = handle;
	}
	function getPermissions(branch, handle, type) {
		var permissions = [];
		var pref = handle + "." + type;
		if (branch.prefHasUserValue(pref)) {
			permissions = branch.getCharPref(pref).split(/\s+/);
			permissions.sort();
		}
		return permissions;
	}
	var privileged = {};
	if (reqAccess) {
		netscape.security.PrivilegeManager.enablePrivilege(this.privAccessCapabilities);
	}
	var prefs = this.getPrefsBranch(); 
	var capsEntries = prefs.getChildList("", { value: 0 }); 

	for (var ii=0; ii < capsEntries.length; ii++) 
	{ 
		var matches = capsEntries[ii].match(/([^\.]*)[\.]id/); 
		if (matches && (2 == matches.length)) 
		{ 
			var handle = matches[1];
			var url = prefs.prefHasUserValue(capsEntries[ii])? prefs.getCharPref(capsEntries[ii]) : "Error getting " + capsEntries[ii]; 
			var granted = getPermissions(prefs, handle, "granted");
			var denied = getPermissions(prefs, handle, "denied");
			privileged[handle] = new Privileged(url, granted, denied, handle);
		}
	}
	return privileged;
};
config.macros.firefoxPrivileges.getPrefsService = function()
{
	return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
};
config.macros.firefoxPrivileges.getPrefsBranch = function()
{
	var prefsService = this.getPrefsService();
	return prefsService.getBranch("capability.principal.codebase."); 
};

} // endif(window.Components)
//}}}