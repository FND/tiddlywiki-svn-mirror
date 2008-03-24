/***
|''Name''|FirefoxPrivilegesPlugin|
|''Description''|Create a backstage tab to manage Firefox url privileges|
|''Author''|Xavier Vergés (xverges at gmail dot com)|
|''Version''|1.0.1|
|''Date''|2008-03-24|
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
* Allow to delete privileged urls (specially file: !!!)
* Allow to manage privileges for arbitrary urls
* Bookmarkleteable version, getting the script from a trusted source
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
	step1Title: "Firefox, privileges and file: urls",
	step1Info: "<p>Firefox can be configured to grant the same security privileges to every html document loaded from disk (those <i>file:</i> urls), or to grant different privileges on a per file basis. Local TiddyWikis need some high security privileges in order to let you save changes to disk, or to import tiddlers from remote servers. Unfortunately, these same privileges can potentially be used by the bad guys to launch programs, get files from your disk and upload them somewhere, access your browsing history...</p><p>While it is more convenient to let Firefox give all your local files the same security privileges, and I'm not aware of any malware attack that tries to take advantage of privileged <i>file:</i> urls, an ounce of prevention is worth a pound of cure.</p><p>You can learn more blah bah...</p><p>This wizard will help you to grant the required privileges to your local TiddlyWiki, and warn you if you have enabled a dangerous default</p>",
	step1ButtonLabel: "Check privileges",
	step1ButtonTooltip: "List the domains and urls that have special security privileges",
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
			{name: 'Handle', field: 'handle', title: "Handle", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'thisUrl'},
			{className: 'error', field: 'warning'}
			]
		}
	});

merge(config.tasks,{
	firefoxPrivileges: {text: "security", tooltip: "Work with url privileges", content: '<<firefoxPrivileges>>'}
});
/*
//}}}
!!! Regular code
//{{{
*/
config.backstageTasks.pushUnique("firefoxPrivileges");

config.macros.firefoxPrivileges.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var wizard = new Wizard();
	wizard.createWizard(place,this.wizardTitle);
	this.firstWizardStep(wizard);
};
config.macros.firefoxPrivileges.firstWizardStep = function(wizard)
{
	var step1Html = this.step1Info 
		+ "<input type='checkbox' checked='true' name='chkUniversalXPConnect'>" 
		+ this.allowSaveLabel 
		+ "</input><br/><input type='checkbox' checked='true' name='chkUniversalBrowserRead'>"
		+ this.allowImportLabel + "</input>";
	wizard.addStep(this.step1Title,step1Html);
	wizard.setButtons([{caption: this.step1ButtonLabel, tooltip: this.step1ButtonTooltip, onClick: this.onSetPrivileges}]);
};
config.macros.firefoxPrivileges.onSetPrivileges= function(e)
{
	var wizard = new Wizard(this);
	var chkXPConnect = wizard.getElement("chkUniversalXPConnect").checked;
	var chkBrowserRead = wizard.getElement("chkUniversalBrowserRead").checked;
	config.macros.firefoxPrivileges.secondWizardStep(wizard, chkXPConnect, chkBrowserRead);
	return false;
};
config.macros.firefoxPrivileges.secondWizardStep = function(wizard, chkXPConnect, chkBrowserRead)
{
	wizard.addStep(this.step2Title, this.step2Html);
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);

	var needsReload = false;

	var html = [];
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect CapabilityPreferencesAccess");

		var urlRights = [];
		if (chkXPConnect) {
			urlRights.push("UniversalXPConnect");
		}
		if (chkBrowserRead) {
			urlRights.push("UniversalBrowserRead");
		}
		var thisUrl = document.location.toString();
		needsReload = this.setUrlPrivilege(false, thisUrl, urlRights);
		var privs = this.getPrivilegedUrls(false);
		var listItems = [];
		for (var handle in privs) {
			if (privs.hasOwnProperty(handle)) {
				if ((privs[handle].url === "file://") ||
					(privs[handle].url.indexOf(" ") != -1))
				{
					privs[handle].warning = true;
				} else if (privs[handle].url === thisUrl) {
					privs[handle].thisUrl = true;
				}
				listItems.push(privs[handle]);
			}
		}
		var listView = ListView.create(listWrapper, listItems, this.listViewTemplate);

		//var userJs = this.getUserJs(false);
		//html.push("user.js : " + userJs.path);
	} catch (ex) {
		listWrapper.innerHTML = "Error: " + ex;
	}
	wizard.setButtons([], needsReload? "Reload to take effect" : null);
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
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect CapabilityPreferencesAccess");
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
	var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
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
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect CapabilityPreferencesAccess");
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
config.macros.firefoxPrivileges.getPrefsBranch = function()
{
	var capsBase = "capability.principal.codebase.";
	var prefsService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService); 
	return prefsService.getBranch(capsBase); 
};
config.macros.firefoxPrivileges.getUserJs = function(reqAccess)
{
	if (reqAccess) {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	}
	var profileDir = Components.classes["@mozilla.org/file/directory_service;1"].getService( Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile).path;
	var sep = profileDir.lastIndexOf("\\") != -1? "\\" : "/";
	var filePath=profileDir + sep + "user.js";
	return {path: filePath, 
		contents: mozillaLoadFile(filePath)};
};
} // endif(window.Components)
//}}}