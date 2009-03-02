/***
|''Name:''|ImportMediaWikiWizard|
|''Description:''|Macro that displays a wizard to import content from a MediaWiki or the Alreay imported content|
|''Author:''|Nicolas Rusconi (nicolas.rusconi (at) globant (dot) com)|
|''Version:''|1.0.0|
|''Date:''|Feb 4, 2009|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
|''Type''|plugin|
|''Requires''|MediaWikiAdaptorPlugin|
|''Usage''|{{{<<importMediaWiki>>}}}|
***/
/*{{{*/
config.macros.importMediaWiki = {};

//displays a wizard to import content from a media wiki, or displays the already imported tiddlers
config.macros.importMediaWiki.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var tiddlersFromMediaWiki = store.getTaggedTiddlers(this.mediaWikiTiddlersTag);
	if (tiddlersFromMediaWiki && tiddlersFromMediaWiki.length > 0) {
		place.appendChild(this.getImportedTiddlersView(tiddlersFromMediaWiki));
		return;
	}
	if(readOnly) {
		createTiddlyElement(place, "div", null, "marked", this.readOnlyWarning);
		return;
	}
	var w = new Wizard();
	w.createWizard(place, this.wizardTitle);
	this.restart(w);
};

config.macros.importMediaWiki.getImportedTiddlersView = function(tiddlers)
{
	var macro = config.macros.importMediaWiki;
	var view = document.createElement("div");
	view.innerHTML = macro.importedTiddlersTitle + "<br/>";
	for (index in tiddlers) {
		createTiddlyText(view, " ");
		createTiddlyLink(view, tiddlers[index].title, true);
	}
	return view;
}

config.macros.importMediaWiki.openHost = function()
{
	var wizard = new Wizard(this);
	var macro = config.macros.importMediaWiki;
	var url = wizard.getElement(macro.hostInputName).value.trim();
	var host = macro.getHost(url);
	var serverType = "mediawiki";
	var adaptor = new config.adaptors[serverType]();
	wizard.setValue(macro.adaptorField, adaptor);
	wizard.setValue(macro.serverTypeField, serverType);
	wizard.setValue(macro.hostField, host);
	wizard.setValue(macro.originalUrlField, url);
	wizard.setValue(macro.possibleFoldersField, macro.getPossibleFolders(url.substring(host.length)));
	wizard.setValue(macro.pageField, macro.getPage(url));
	wizard.setButtons([macro.getResetButton()], macro.openingHost);
	handleAdaptorReturn(adaptor.openHost(host, null, wizard, macro.onOpen));
}

config.macros.importMediaWiki.onOpen = function(context, wizard)
{
	var macro = config.macros.importMediaWiki;
	if(context.status !== true) {
		wizard.setButtons([macro.getResetButton()], macro.errorOpeningHost);
		return;
	}
	wizard.setButtons([macro.getResetButton()],macro.lookingUpPages);
	handleAdaptorReturn(wizard.getValue(macro.adaptorField)
		.getWorkspaceList(context, wizard, macro.onGetWorkspaceList));
}

config.macros.importMediaWiki.tryNextFolder = function (context, wizard)
{
	var macro = config.macros.importMediaWiki;
	var nextFolder = wizard.getValue(macro.possibleFoldersField).pop();
	var adaptor = wizard.getValue(macro.adaptorField);
	context.host = wizard.getValue(macro.hostField).concat(nextFolder);
	handleAdaptorReturn(adaptor.getWorkspaceList(context, wizard, macro.onGetWorkspaceList));
}

config.macros.importMediaWiki.onGetWorkspaceList = function(context, wizard)
{
	var macro = config.macros.importMediaWiki;
	if(context.status !== true) {
		if (wizard.getValue(macro.possibleFoldersField).length > 0) {
			macro.tryNextFolder(context, wizard);
		} else {
			wizard.setButtons([macro.getResetButton()], macro.errorLookingForWikiHost);
		}
		return;
	}
	var workspaces = context.workspaces;
	wizard.setValue(macro.hostField,context.host);
	wizard.setValue(macro.contextField,context);
	wizard.setValue(macro.workspacesField, workspaces);
	var url = wizard.getValue(macro.originalUrlField);
	if (url) {
		var workspaceName = macro.getWorkspace(url.substring(context.host.length));
		var workspaceIndex = workspaces.findByField(macro.titleField, workspaceName);
		if (workspaceIndex != null) {
			macro.selectedWorkspace(wizard, workspaces[workspaceIndex].title);
			return;
		}
	}
	macro.showWorkspacesAndPages(context, wizard);
}

// display the workspaces and pages for the current host
config.macros.importMediaWiki.showWorkspacesAndPages = function(context, wizard)
{
	var macro = config.macros.importMediaWiki;
	wizard.addStep(macro.step2Title, macro.step2Html);
	var workspaceSelector = wizard.getElement(macro.selWorkspaceName);
	var defaultWorkspaceTitle = macro.defaultWorkspaceTitle;
	var workspaces = wizard.getValue(macro.workspacesField);
	// add all the workspaces to the select combo
	for(var t=0; t<workspaces.length; t++) {
		var title = workspaces[t].title;
		if (title == defaultWorkspaceTitle) {
			title = macro.defaultWorkspaceLabel;
		}
		var e = createTiddlyElement(workspaceSelector,"option",null,null,title);
		e.value = context.workspaces[t].title;
	}
	// list workspaces
	var selectedWorkspace = wizard.getValue(macro.workspaceField);
	defaultWorkspaceTitle = selectedWorkspace? selectedWorkspace : defaultWorkspaceTitle;
	// if workspaces inferred from url, then select it
	workspaceIndex = workspaces.findByField(macro.titleField, defaultWorkspaceTitle);
	if (workspaceIndex != null) {
		workspaceSelector.value = workspaces[workspaceIndex].title;
	}
	macro.selectedWorkspace(wizard, workspaceSelector.value);
	workspaceSelector.onchange = function (e) {
		macro.selectedWorkspace(new Wizard(this),e.currentTarget.value);
	};
}

// show the pages for the current workspace
config.macros.importMediaWiki.showPages = function(context, wizard)
{
	var macro = config.macros.importMediaWiki;
	var listedTiddlers = macro.getTiddlers(context.tiddlers);
	var markList = wizard.getElement(macro.markListName);
	var listWrapper = macro.getClearWikiPagesList();
	markList.parentNode.insertBefore(listWrapper, markList);
	var listView = ListView.create(listWrapper, listedTiddlers, macro.listViewTemplate);
	wizard.setValue(macro.listViewField, listView);
	wizard.getElement(macro.serverTiddlerNameField).value = macro.generateSystemServerName(wizard);
	wizard.setButtons([macro.getResetButton(),
					   {caption: macro.importLabel,
					    tooltip: macro.importPrompt,
						onClick: macro.doImportSelectedPages}]);
};

// select the specified workspace
config.macros.importMediaWiki.selectedWorkspace = function(wizard, workspace)
{
	var macro = config.macros.importMediaWiki;
	wizard.setValue(macro.workspaceField, workspace);
	var listWrapper = macro.getClearWikiPagesList();
	listWrapper.innerHTML = macro.loadingTiddlersMessage;
	var adaptor = wizard.getValue(macro.adaptorField);
	var context = wizard.getValue(macro.contextField);
	handleAdaptorReturn(adaptor.openWorkspace(workspace, context, wizard, macro.onOpenWorkspace));
	wizard.setButtons([macro.getResetButton()], macro.statusOpenWorkspace);
};

config.macros.importMediaWiki.onOpenWorkspace = function(context, wizard, callback)
{
	var macro = config.macros.importMediaWiki;
	if(context.status !== true) {
		displayMessage("Error in importMediaWiki.onOpenWorkspace: " + context.statusText);
	}
	var adaptor = wizard.getValue(macro.adaptorField);
	handleAdaptorReturn(adaptor.getTiddlerList(context, wizard, macro.onGetTiddlerList));
	wizard.setButtons([macro.getResetButton()], macro.statusGetTiddlerList);
}

config.macros.importMediaWiki.onGetTiddlerList = function(context, wizard)
{
	var macro = config.macros.importMediaWiki;
	if(context.status !== true) {
		macro.getClearWikiPagesList();
		wizard.setButtons([macro.getResetButton()], macro.errorGettingTiddlerList);
		return;
	}
	var listedTiddlers = macro.getTiddlers(context.tiddlers);
	var workspace = wizard.getValue(macro.workspaceField);
	var page = wizard.getValue(macro.pageField);
	fullPageName = page;
	if (workspace && workspace.length > 0 ) {
		fullPageName = workspace + ":" + fullPageName;
	}
	if (listedTiddlers.findByField(macro.titleField, fullPageName) != null) {
		wizard.setValue(macro.keepTiddlersSyncField, true);
		macro.doImport(wizard, [fullPageName], macro.generateSystemServerName(wizard));
	}else {
		var markList = wizard.getElement(macro.markListName);
		if (markList) {
			macro.showPages(context, wizard);
		} else {
			macro.showWorkspacesAndPages(context, wizard);
		}
	}
}

config.macros.importMediaWiki.doImportSelectedPages = function(e)
{
	var macro = config.macros.importMediaWiki;
	var wizard = new Wizard(this);
	var tiddlerNames = ListView.getSelectedRows(wizard.getValue(macro.listViewField));
	if (!tiddlerNames || tiddlerNames.length == 0) {
		wizard.setButtons([macro.getResetButton()], macro.noPageSelected);
		return;
	}
	var chkSave = wizard.getElement(macro.chkSaveName);
	var serverTiddlerName;
	if (chkSave.checked) {
		serverTiddlerName = wizard.getElement(macro.serverTiddlerNameField).value;
	}
	wizard.setValue(macro.keepTiddlersSyncField,
					wizard.getElement(macro.chkSyncFieldName).checked);
	macro.doImport(wizard, tiddlerNames, serverTiddlerName);
}

config.macros.importMediaWiki.doImport = function(wizard, tiddlerNames, serverTiddlerName)
{
	var macro = config.macros.importMediaWiki;
	wizard.setValue(macro.importCompletedHandlerField, macro.onDone);
	wizard.setValue(macro.importTagsField, [macro.mediaWikiTiddlersTag]);
	wizard.addStep(macro.lastStepTitle.format([tiddlerNames.length]), macro.lastStepHtml);
	if (serverTiddlerName) {
		wizard.setValue(macro.serverTiddlerNameField, serverTiddlerName);
	}
	config.macros.importMediaWiki.doImportWithWizard(wizard, tiddlerNames);
	// set the default host(used for new tiddlers)
	merge(config.defaultCustomFields, {
        'server.host': wizard.getValue(macro.hostField)
    });
};

config.macros.importMediaWiki.doImportWithWizard = function(wizard, rowNames)
{
	var macro = config.macros.importMediaWiki;
	var place = wizard.getElement(macro.markReportFieldName);
	for(t=0; t<rowNames.length && place; t++) {
		var link = document.createElement("div");
		createTiddlyLink(link, rowNames[t], true);
		place.parentNode.insertBefore(link, place);
	}
	wizard.setButtons([{caption: macro.cancelLabel,
						tooltip: macro.cancelPrompt,
			 			onClick: macro.onCancel}
		    		  ], macro.statusDoingImport);
	var wizardContext = wizard.getValue(macro.contextField);
	wizardContext[macro.keepTiddlersSyncField] = wizard.getValue(macro.keepTiddlersSyncField);
	var serverTiddlerName = wizard.getValue(macro.serverTiddlerNameField);
	if (serverTiddlerName) {
		macro.saveServerTiddler(wizard, serverTiddlerName, [macro.mediaWikiFeedTag]);
	}
	var callback = function(){
		wizard.setButtons([{caption: macro.doneLabel,
							tooltip: macro.donePrompt,
							onClick: wizard.getValue(macro.importCompletedHandlerField)
						   }], macro.statusDoneImport)};
	macro.doImportTiddlers(wizard.getValue(macro.adaptorField), wizardContext, rowNames, callback);
	return false;
};

config.macros.importMediaWiki.doImportTiddlers = function (adaptor, importContext, tiddlersNames, callback)
{
	var macro = config.macros.importMediaWiki;
	var overwrite = [];
	var t;
	for(t=0; t<tiddlersNames.length; t++) {
		if (store.tiddlerExists(tiddlersNames[t])) {
			overwrite.push(tiddlersNames[t]);
		}
	}
	if(overwrite.length > 0) {
		if (!confirm(macro.confirmOverwriteText.format([overwrite.join(", ")]))) {
			return false;
		}
	}
	importContext[macro.remainingImports] = tiddlersNames.length;
	var tiddlers = importContext && importContext.tiddlers ? importContext.tiddlers : [];
	importContext.callback = callback;
	for(t=0; t<tiddlersNames.length; t++) {
		var tiddlerContext = {
			allowSynchronous:true,
			tiddler:tiddlers[tiddlers.findByField(macro.titleField, tiddlersNames[t])],
			host: importContext.host
		};
		adaptor.getTiddler(tiddlersNames[t],tiddlerContext,importContext,macro.onGetTiddler);
	}
}

config.macros.importMediaWiki.onGetTiddler = function(tiddlerContext, importContext)
{
	var macro = config.macros.importMediaWiki;
	if(!tiddlerContext.status)
		displayMessage("Error in importTiddlers.onGetTiddler: " + tiddlerContext.statusText);
	var tiddler = tiddlerContext.tiddler;
	store.suspendNotifications();
	tags = tiddler.tags;
	merge(tags,importContext.tags);
	store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier,
					  tiddler.modified, tags, tiddler.fields, true, tiddler.created);
	if(!importContext[macro.keepTiddlersSyncField]) {
		store.setValue(tiddler.title,'server',null);
	}
	store.resumeNotifications();
	if(!tiddlerContext.isSynchronous)
		store.notify(tiddler.title,true);
	var remainingImports = importContext[macro.remainingImports] - 1;
	importContext[macro.remainingImports] = remainingImports;
	if(remainingImports == 0) {
		if(tiddlerContext.isSynchronous) {
			store.notifyAll();
			refreshDisplay();
		}
		autoSaveChanges();
		importContext.callback();
	}
};

config.macros.importMediaWiki.onDone = function (e)
{
	var macro = config.macros.importMediaWiki;
	var wizard = new Wizard(this);
	var main = wizard.formElem.parentNode;
	main.removeChild(wizard.formElem);
	macro.handler(main);
}

config.macros.importMediaWiki.onReset = function()
{
	var macro = config.macros.importMediaWiki;
	var wizard = new Wizard(this);
	var place = wizard.clear();
	macro.restart(wizard);
	return false;
};

config.macros.importMediaWiki.onCancel = function(e)
{
	var wizard = new Wizard(this);
	var place = wizard.clear();
	config.macros.importMediaWiki.restart(wizard);
	return false;
};

config.macros.importMediaWiki.getResetButton = function()
{
	var macro = config.macros.importMediaWiki;
	return {
		caption: macro.reset,
		tooltip: macro.resetTooltip,
		onClick: macro.onReset
	};
}

config.macros.importMediaWiki.restart = function(wizard)
{
	var macro = config.macros.importMediaWiki;
	wizard.addStep(this.step1Title, this.step1Html);
	wizard.setButtons([macro.getResetButton(),
					   {caption: macro.next,
						tooltip: macro.nextTooltip,
						onClick: macro.openHost}]);
	wizard.formElem.action = "javascript:;";
	wizard.formElem.onsubmit = function() {
		if (this.txtWikiHost.value.length) {
			this.lastChild.childNodes[2].onclick();
			this.onsubmit = null;
		}
	};
}

config.macros.importMediaWiki.getPage = function(url)
{
	var page;
	var index = url.lastIndexOf("/");
	if (index !== -1) {
		page = url.substr(index + 1);
		var categoryIndex = page.indexOf(":");
		if (categoryIndex !== -1 ) {
			page = page.substr(categoryIndex + 1);
		}
		page = page.replace("_"," ");
	}
 	return page;
}

config.macros.importMediaWiki.getWorkspace = function(url)
{
	var workspace;
	var index = url.lastIndexOf("/");
	if (index !== -1) {
		var page = url.substr(index + 1);
		if (page.length > 0) {
			var categoryIndex = page.indexOf(":");
			if (categoryIndex !== -1) {
				workspace = page.substr(0, categoryIndex);
			} else {
				workspace = "";
			}
		}
	}
 	return workspace;
}

config.macros.importMediaWiki.getHost = function(url) 
{
	var host = url;
	var fromIndex = 0;
	if (url.search("https?://") != -1) {
		fromIndex = url.indexOf("://") + 3;
	}
	var index = url.indexOf("/", fromIndex + 1);
	if (index !== -1) {
		host = url.substring(0,index);
	}
	return host;
}

// returns the posible folders on wich the api.php could be located.
//#   urlWithoutHost- the url without the host (e.g. for http://domain.com/wiki/index.php the would be /wiki/index.php)
config.macros.importMediaWiki.getPossibleFolders = function(urlWithoutHost) {
	var url = urlWithoutHost;
	var hosts = [];
	var index = url.lastIndexOf("/");
	var last = url.substring(index);
	if (last) {
		hosts.push(last);
	}
	while (index != -1) {
		url = url.substring(0,index);
		if (url !== "") {
			hosts.push(url);
		}
		index = url.lastIndexOf("/");
	}
	return hosts;
}

config.macros.importMediaWiki.getTiddlers = function(tiddlers) {
	// Extract data for the listview
	var listedTiddlers = [];
	if(tiddlers) {
		for(var n=0; n<tiddlers.length; n++) {
			var tiddler = tiddlers[n];
			listedTiddlers.push({
				title: tiddler.title,
				modified: tiddler.modified,
				modifier: tiddler.modifier,
				text: tiddler.text ? wikifyPlainText(tiddler.text,100) : "",
				tags: tiddler.tags,
				size: tiddler.text ? tiddler.text.length : 0,
				tiddler: tiddler
			});
		}
	}
	listedTiddlers.sort(function(a,b) {return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1);});
	return listedTiddlers;
};

config.macros.importMediaWiki.getClearWikiPagesList = function()
{
	var id = "pagesList";
	var listWrapper = document.getElementById(id);
	if (listWrapper == null) {
		listWrapper = document.createElement("div");
		listWrapper.id = id;
	} else {
		listWrapper.innerHTML = "";
	}
	return listWrapper;
}

config.macros.importMediaWiki.generateSystemServerName = function(wizard)
{
	var macro = config.macros.importMediaWiki;
	var serverType = wizard.getValue(macro.serverTypeField);
	var host = wizard.getValue(macro.hostField);
	var workspace = wizard.getValue(macro.workspaceField);
	var pattern = config.macros.importTiddlers[workspace ? "systemServerNamePattern" : "systemServerNamePatternNoWorkspace"];
	return pattern.format([serverType,host,workspace]);
};

config.macros.importMediaWiki.saveServerTiddler = function(wizard, serverTiddlerName, extraTags)
{
	var macro = config.macros.importMediaWiki;
	var serverType = wizard.getValue(macro.serverTypeField);
	var host = wizard.getValue(macro.hostField);
	var workspace = wizard.getValue(macro.workspaceField);
	this.saveServerTiddlerWithDetails(serverTiddlerName, serverType, host, workspace, null, extraTags);
};

config.macros.importMediaWiki.saveServerTiddlerWithDetails = function(txtSaveTiddler, serverType, host, workspace, description, extraTags)
{
	var macro = config.macros.importMediaWiki;
	if(store.tiddlerExists(txtSaveTiddler)) {
		if(!confirm(macro.confirmOverwriteSaveTiddler.format([txtSaveTiddler])))
			return;
		store.suspendNotifications();
		store.removeTiddler(txtSaveTiddler);
		store.resumeNotifications();
	}
	var text = macro.serverSaveTemplate.format([txtSaveTiddler,serverType,host,workspace]);
	var tags = ["systemServer", "excludeLists", "excludeSearch"];
	if (extraTags) {
		for(var n=0; n<extraTags.length; n++) {
			tags.push(extraTags[n]);
		}
	}
	store.saveTiddler(txtSaveTiddler,txtSaveTiddler,text,config.macros.importMediaWiki.serverSaveModifier,new Date(),tags);
};

function handleAdaptorReturn(returnValue) {
	if (returnValue !== true) {
		displayMessage(returnValue);
	}
}

merge(config.macros.importMediaWiki, {
	//fields in the wizard
	adaptorField: "adaptor",
	hostField: "host",
	serverTypeField: "serverType",
	titleField: "title",
	workspaceField: "workspace",
	contextField: "context",
	keepTiddlersSyncField: "sync",
	importCompletedHandlerField: "doneHandler",
	serverTiddlerNameField: "txtSaveTiddler",
	originalUrlField: "originalUrl",
	workspacesField: "workspaces",
	possibleFoldersField: "possibleFolders",
	pageField: "page",
	listViewField: "listView",
	importTagsField: "importTags",
	markReportFieldName: "markReport",
	remainingImportsField: "remainingImports",
	//HTML
	markListName: "markList",
	chkSyncFieldName: "chkSync",
	selWorkspaceName: "selWorkspace",
	chkSaveName: "chkSave",
	hostInputName: "txtWikiHost",
	serverSaveTemplate: "|''Description:''|%0|\n|''Type:''|%1|\n|''URL:''|%2|\n|''Workspace:''|%3|\n\nThis tiddler was automatically created to record the details of this server",
	//User messages
	errorLookingForWikiHost: "Unable to connect to the wiki server, please check you are connected to the network, the wiki supports api.php and there is no typo.",
	errorGettingTiddler: "Error in importMediaWiki.onGetTiddler: ",
	lookingUpPages: "Looking up pages...",
	readOnlyWarning: "You cannot import into a read-only TiddlyWiki file. Try opening it from a file:// URL",
	wizardTitle: "Import content from your wiki",
	openingHost: "Opening host...",
	errorOpeningHost: "Error opening host",
	next: "next",
	nextTootltip: "click to go to the next step",
	reset: "reset",
	resetTooltip: "Clear the form and start again",
	doneLabel: "done",
	statusDoneImport: "All tiddlers imported",
	defaultWorkspaceTitle: "",
	defaultWorkspaceLabel: "Default",
	loadingTiddlersMessage: "<i>loading tiddlers...</i>",
	statusOpenWorkspace: "Opening the workspace",
	statusGetTiddlerList: "Getting the list of available tiddlers",
	noPageSelected: "You must select at least one page to import.",
	errorGettingTiddlerList: "Error getting list of tiddlers, click Cancel to try again",
	importLabel: "import",
	importPrompt: "Import these tiddlers",
	importedTiddlersTitle: "Imported tiddlers:",
	confirmOverwriteText: "Are you sure you want to overwrite these tiddlers:\n\n%0",
	mediaWikiFeedTag: "mediaWikiFeed",
	mediaWikiTiddlersTag: "mediaWikiPage",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler'}
			],
		rowClasses: []}
	});

merge(config.macros.importMediaWiki,{
	lastStepTitle: "Importing %0 tiddler(s)",
	lastStepHtml: "<input type='hidden' name='" + config.macros.importMediaWiki.markReportFieldName
	              + "'></input>", // DO NOT TRANSLATE
	step2Title: "Select pages",
	step2Html: "workspace: <select name='" + config.macros.importMediaWiki.selWorkspaceName + "'></select><br>"
		 + "<input type='hidden' name='" + config.macros.importMediaWiki.markListName + "'><br>"
		 + "<input type='checkbox' checked='true' name='" + config.macros.importMediaWiki.chkSyncFieldName + "'>Keep these tiddlers linked to this server so that you can synchronise subsequent changes</input><br>"
		 + "<input type='checkbox' name='" + config.macros.importMediaWiki.chkSaveName + "'>Save the details of this wiki server for future operations, alias:</input>"
		 + "<input type='text' size=25 name='" + config.macros.importMediaWiki.serverTiddlerNameField + "'>",
 	step1Title: "Locate the server ",
	step1Html: "Enter the wiki server or page URL here: <input type='text' size=50 name='" + config.macros.importMediaWiki.hostInputName + "' ><br>"
	});
/*}}}*/