/***
|''Name''|FirefoxPrivilegesPlugin|
|''Description''|Create a backstage tab to manage Firefox url privileges|
|''Author''|Xavier Vergés (xverges at gmail dot com)|
|''Version''|1.0.9 ($Rev$)|
|''Date''|$Date$|
|''Status''|@@beta@@|
|''Source''|http://firefoxprivileges.tiddlyspot.com/|
|''CodeRepository''|http://trac.tiddlywiki.org/browser/Trunk/contributors/XavierVerges/plugins/FirefoxPrivilegesPlugin.js|
|''License''|BSD tbd|
|''CoreVersion''|2.2.4 (maybe 2.2+?)|
|''Feedback''|http://groups.google.com/group/TiddlyWiki|
|''BookmarkletReady''|http://icanhaz.com/firefoxprivileges|
|''Browser''|Mozilla. Tested under Firefox 2.0.0.12 and Firefox 3.0b4|
|''Documentation''|http://firefoxprivileges.tiddlyspot.com/#HowTo|
/%
!Description
!Notes
!Usage
!Revision History
!!v1.0 (2008-03-23)
* First public version
%/
!Usage
The wizard can be opened from the backstage or using the macro {{{<<firefoxPrivileges>>}}}
The step to show when opening the wizard can be set with the {{{txtPrivWizardDefaultStep}}} option: <<option txtPrivWizardDefaultStep>>
!To Do
* Avoid non lingo.js-able hardcoded strings
** Create a Catalan and/or Spanish FirefoxPrivilegesPluginLingoXX.js
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
	learnStepHtml: "<h3>Local files</h3><p>Firefox can be configured to grant the same security privileges to every html document loaded from disk (those <i>file:</i> urls), or to grant different privileges on a per file basis. Local TiddyWikis need some high security privileges in order to let you save changes to disk, or to import tiddlers from remote servers. Unfortunately, these same privileges can potentially be used by the bad guys to launch programs, get files from your disk and upload them somewhere, access your browsing history...</p><p>While it is more convenient to let Firefox give all your local files the same security privileges, and I'm not aware of any malware attack that tries to take advantage of privileged <i>file:</i> urls, an ounce of prevention is worth a pound of cure.</p><p>You can learn more about this by reading <a href='http://www.mozilla.org/projects/security/components/per-file.html' class='externalLink'>Per-File Permissions</a> and <a href='http://www.mozilla.org/projects/security/components/signed-scripts.html#privs-list' class='externalLink'>JavaScript Security: Signed Script</a> at mozilla.org.</p><h3>Remote files</h3><p>When a remote document (<i>http:</i> urls) requests especial privileges, Firefox <ul><li>checks the value of <code>signed.applets.codebase_principal_support</code>, a preference that can be configured from the page that is loaded when you type <code>about:config</code> in the address bar</li><li>if the previous value is set to false, Firefox denies silently the request</li><li>if the previous value is set to true, Firefox looks for the document's domain in the list of privileges urls that can be configured from this wizard, and, if not there, asks the user to grant the privilege</li></ul><p>Note that, in this case, and unlike when dealing with local files, Firefox will only take into account the document's domain instead of performing an exact match of the url.</p><p>Take a look at <a href='http://messfromabove.tiddlyspot.com' class='externalLink'>http://messfromabove.tiddlyspot.com</a> to learn more about the nice and nasty possibilities that this setting provides.</p><h3>This Wizard</h3><p>This wizard will help you to grant the required privileges to your TiddlyWikis, local or remote, and warn you if you have enabled a dangerous default. To do so, Firefox will probably prompt you to grant it some special privileges in order to list and modify the list of privileged urls.</p>",
	learnStepButton: "1. Learn about the risks",
	learnStepButtonTooltip: "Learn why 'Remember this' is an unsafe choice in security prompts",
	grantStepTitle: "2. Grant privileges to individual documents",
	grantStepHtml: "Url: <input type='text' size=80 name='txtUrl'><br/><br/><input type='checkbox' checked='true' name='chkUniversalXPConnect'>Grant rights required to save to disk (Run or install software on your machine - UniversalXPConnect)</input><br/><input type='checkbox' checked='true' name='chkUniversalBrowserRead'>Grant rights required to import tiddlers from servers or access TiddlySpot (Read and upload local files - UniversalBrowserRead)</input><br/><input type='checkbox' name='chkUniversalBrowserWrite'>Modify any open window - UniversalBrowserWrite</input><br/><input type='checkbox' name='chkUniversalFileRead'>Read and upload local files - UniversalFileRead</input><br/><input type='checkbox' name='chkCapabilityPreferencesAccess'>By-pass core security settings - CapabilityPreferencesAccess</input><br/><input type='checkbox' name='chkUniversalPreferencesRead'>Read program settings - UniversalPreferencesRead</input><br/><input type='checkbox' name='chkUniversalPreferencesWrite'>Modify program settings - UniversalPreferencesWrite</input><br/><input type='button' class='button' name='btnGrant' value='Set privileges'/>",
	grantStepButton: "2. Grant privileges",
	grantStepButtonTooltip: "Grant privileges to this or other docs",
	viewStepTitle: "3. Granted privileges",
	viewStepHtml: "<input type='hidden' name='markList'></input>",
	viewStepButton: "3. List granted privileges",
	viewStepButtonTooltip: "List granted privileges, and optionally reset them",
	viewStepEmptyMsg: "Asking for temporary privileges to list permanent privileges...",
	allowSaveLabel: "Grant rights required to save to disk (Run or install software on your machine - UniversalXPConnect)",
	allowImportLabel: "Grant rights required to import tiddlers from servers or access TiddlySpot (Read and upload local files - UniversalBrowserRead)",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'url', type: 'Selector'},
			{name: 'Url', field: 'url', title: "Url", type: 'LongLink'},
			{name: 'Granted', field: 'granted', title: "Granted", type: 'StringList'},
			{name: 'Denied', field: 'denied', title: "Denied", type: 'StringList'},
			{name: 'Handle', field: 'handle', title: "Handle", type: 'String'},
            {name: 'Notes', field: 'notes', title: "Notes", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'highlight'},
			{className: 'error', field: 'warning'}
			]
		}
});
merge(config.optionsDesc,{
	txtPrivWizardDefaultStep: "Step to show when opening the 'Manage Firefox Privileges' wizard"
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
config.options.txtPrivWizardDefaultStep = "1";

(function(){

var plugin = config.macros.firefoxPrivileges;
plugin.privAccessCapabilities = "UniversalXPConnect CapabilityPreferencesAccess";
plugin.stepNames = ["learn", "grant", "view"];
plugin.lastUrl = document.location.toString();

plugin.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var wizard = new Wizard();
	wizard.createWizard(place,plugin.wizardTitle);
	var step = parseInt(config.options.txtPrivWizardDefaultStep);
	step = (isNaN(step)||(step<=0)||(step>3))? 0 : step-1;
	plugin.step(wizard, step);
};
plugin.buttons = (function(){
	var _buttons = [];
	for (var ii=0; ii<plugin.stepNames.length; ii++) {
		var name = plugin.stepNames[ii];
		var onclick = (function() {
			var index = ii;
			var handler = function(e) {
				plugin.step(new Wizard(resolveTarget(e)), index);
				return false;
			};
			return handler;
		})();
		_buttons.push({caption: plugin[name+"StepButton"], 
					   tooltip: plugin[name+"StepButtonTooltip"],
					   onClick: onclick});
	}
	var getButtons = function(index) {
		var buttons = [];
		for (var ii= 0; ii<_buttons.length; ii++) {
			if (ii !== index) {
				buttons.push(_buttons[ii]);
			}
		}
		return buttons;
	};
	return getButtons;
})();
plugin.step = function(wizard, stepIndex, extraParams)
{
	var name = plugin.stepNames[stepIndex];
	var stepResult = {};
	wizard.addStep(plugin[name+"StepTitle"],plugin[name+"StepHtml"]);
	wizard.setButtons(plugin.buttons(stepIndex));
	if (plugin[name+"StepProcess"]) {
		plugin[name+"StepProcess"](wizard, extraParams);
	}
};
plugin.grantStepProcess = function(wizard)
{
	wizard.getElement("btnGrant").onclick = plugin.btnSetPrivileges;
	wizard.getElement("txtUrl").value = plugin.lastUrl;
};
plugin.viewStepProcess = function(wizard, extraParams)
{
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	listWrapper.innerHTML = plugin.viewStepEmptyMsg;

	var html = [];
	try {
		if (!extraParams || extraParams.reqAcccess) {
			netscape.security.PrivilegeManager.enablePrivilege(plugin.privAccessCapabilities);
		}

		var thisUrl = document.location.toString();
		var privs = plugin.getPrivilegedUrls(false);
		var listItems = [];
		for (var handle in privs) {
			if (privs.hasOwnProperty(handle)) {
				var priv = privs[handle];
				if ((priv.url === "file://") ||
					(priv.url.indexOf(" ") !== -1))
				{
					priv.warning = true;
					priv.notes = (priv.url === "file://")? "This is dangerous" : "This has no effect";
				} else if ((priv.url === thisUrl) || 
				           (priv.url === plugin.lastUrl)) {
					priv.highlight = true;
					priv.notes = (priv.url === thisUrl)? "This document's url" : "The url you just updated";
				} 
				listItems.push(priv);
			}
		}
		var sortFunc = function(a,b) {
			if(a.url > b.url) {return 1;}
			if(a.url < b.url) {return -1;}
			return 0;
		};
		listItems.sort(sortFunc);
		listWrapper.innerHTML = "";
		var listView = ListView.create(listWrapper, listItems, plugin.listViewTemplate);
		wizard.setValue("listView",listView);

		createTiddlyButton(listWrapper, "Reset selected privileges", "", plugin.btnResetPrivileges);
	} catch (ex) {
		listWrapper.innerHTML = "Error: " + ex;
	}
};
plugin.btnSetPrivileges = function(ev)
{
	var wizard = new Wizard(this);
	var checkboxes = wizard.bodyElem.getElementsByTagName("input");
	var grant = [];
	for(var t=0; t<checkboxes.length; t++) {
		var cb = checkboxes[t];
		if((cb.getAttribute("type") === "checkbox")&&cb.checked) {
			grant.push(cb.name.substring(3));
		}
	}
	var url = wizard.getElement("txtUrl").value;
	if (!url) {
		alert("The url is required");
	} else {
		plugin.lastUrl = url;
		var viewStepExtraParams = {reqAcccess: false};
		var gotPrivileges = false;
		try {
			netscape.security.PrivilegeManager.enablePrivilege(config.macros.firefoxPrivileges.privAccessCapabilities);
			gotPrivileges = true;
		} catch(ex) {}
		if (gotPrivileges) {
			var needsReload = plugin.setUrlPrivilege(false, url, grant, false);
			if (needsReload) {
				viewStepExtraParams.status = "Reload to take effect";
			}
			plugin.step(wizard, 2, viewStepExtraParams);
		} else {
			alert("Not enough privileges. Maybe you are trying this from a tiddlywiki loaded from a server?");
		}
	}
	return false;
};
plugin.btnResetPrivileges = function(ev)
{
	var wizard = new Wizard(this);
	var listView = wizard.getValue("listView");
	var urls = ListView.getSelectedRows(listView);
	if(urls.length === 0) {
		alert(config.messages.nothingSelected);
	} else {
		netscape.security.PrivilegeManager.enablePrivilege(config.macros.firefoxPrivileges.privAccessCapabilities);
		for (var ii=0; ii<urls.length; ii++) {
			plugin.setUrlPrivilege(false, urls[ii], [], true);
		}
		plugin.step(wizard, 2, {reqAcccess: false});
	}
	return false;
};
plugin.setUrlPrivilege = function(reqAccess, url, rights, reset)
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
		netscape.security.PrivilegeManager.enablePrivilege(plugin.privAccessCapabilities);
	}
	var isUpdate = true;
	var urlHandle = "";
	var urls = plugin.getPrivilegedUrls(false);
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
			displayMessage("Updating privileges for " + url, url);
			denied = urls[urlHandle].denied.slice();
			granted = urls[urlHandle].granted.slice();
		} else {
			displayMessage("Reseting privileges for " + url, url);
		}
	} else {
		displayMessage("Setting privileges for " + url, url);
		urlHandle = getFreeHandle(urls, "FirefoxPrivilegesPlugin");
		isUpdate = false;
	}
	for (var ii=0; ii<rights.length; ii++) {
		denied.remove(rights[ii]);
		granted.pushUnique(rights[ii]);
	}
	var prefs = plugin.getPrefsBranch();
	var idStr = urlHandle + ".id";
	var deniedStr = urlHandle + ".denied";
	var grantedStr = urlHandle + ".granted";
	function clearPref(str) {
		if (prefs.prefHasUserValue(str)) {
			prefs.clearUserPref(str);
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
		prefs.deleteBranch(urlHandle + ".");
	} else {
		setOrClearPref(idStr, url);
		setOrClearPref(deniedStr, denied);
		setOrClearPref(grantedStr , granted);
		setOrClearPref(idStr, url);
	}
	var prefService = plugin.getPrefsService();
	prefService.savePrefFile(null);

	return !isUpdate;
};
plugin.getPrivilegedUrls = function(reqAccess)
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
		netscape.security.PrivilegeManager.enablePrivilege(plugin.privAccessCapabilities);
	}
	var prefs = plugin.getPrefsBranch(); 
	var capsEntries = prefs.getChildList("", { value: 0 }); 

	for (var ii=0; ii < capsEntries.length; ii++) 
	{ 
		var matches = capsEntries[ii].match(/([^\.]*)[\.]id/); 
		if (matches && (2 === matches.length)) 
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
plugin.getPrefsService = function()
{
	return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
};
plugin.getPrefsBranch = function()
{
	var prefsService = plugin.getPrefsService();
	return prefsService.getBranch("capability.principal.codebase."); 
};


ListView.columnTypes.LongLink = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var v = listObject[field];
			var c = columnTemplate.text;
			if(v != undefined) {
				var link = createExternalLink(place,v);
				if(!c) {
					c = v.replace(/#|\.|\/|(\%..)|\?|\&/g, config.browser.isIE? "$&<wbr>": "$&&#8203;");
					link.innerHTML = c;
				} else {
					createTiddlyText(link, c);
				}
			}
		}
};


})();	// scope hiding

} // endif(window.Components)
//}}}