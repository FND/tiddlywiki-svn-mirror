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
		var container = createTiddlyElement(place, "div", this.importedTiddlersMessageId);
		container.appendChild(this.getImportedTiddlersView(tiddlersFromMediaWiki));
		container.appendChild(this.getImportMoreTiddlersButton());
		return;
	}
	if(readOnly) {
		createTiddlyElement(place, "div", null, "marked", this.readOnlyWarning);
		return;
	}
	this.resetWizard(place);
};

config.macros.importMediaWiki.resetWizard = function(place)
{
	var macro = config.macros.importMediaWiki;
	var w = new Wizard();
	w.createWizard(place, macro.wizardTitle);
	macro.restart(w);
	return w;
};

config.macros.importMediaWiki.getImportMoreTiddlersButton = function()
{
		var macro = config.macros.importMediaWiki;
		var action = function() {
			var container = document.getElementById(macro.importedTiddlersMessageId);
			var button = document.getElementById(macro.importeMoreTiddlersButtonId);
			if (container) {
				container.removeChild(button);
			}
			var w = macro.resetWizard(container);
			var feedTiddlers = store.getTaggedTiddlers(macro.mediaWikiFeedTag);
			if (feedTiddlers.length > 0) {
				w.getElement(macro.hostInputName).value =
				    store.getTiddlerSlice(feedTiddlers[0].title, macro.URLSlice);
				w.formElem.onsubmit();
			}
		}
		var button = createTiddlyButton(null, macro.importMoreTiddlersButtonLabel,
			macro.importMoreTiddlersButtonTooltip,action,null,macro.importeMoreTiddlersButtonId);
		button.style.background = '#FFEE88';
		return button;
}

config.macros.importMediaWiki.getImportedTiddlersView = function(tiddlers)
{
	var macro = config.macros.importMediaWiki;
	var view = document.createElement("div");
	view.innerHTML = macro.importedTiddlersTitle + "<br/>";
	for (var i=0; i<tiddlers.length && i < 10; i++) {
		insertSpacer(view);
		createTiddlyLink(view, tiddlers[i].title, true);
	};
	if (tiddlers.length >= 10) {
		insertSpacer(view);
		var message = macro.moreTiddlers.format([tiddlers.length - 10]);
		createTagButton(view,macro.mediaWikiTiddlersTag,null,message);
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
	macro.showMessage(wizard, macro.openingHost);
	wizard.setButtons([macro.getResetButton()]);
	handleAdaptorReturn(adaptor.openHost(host, null, wizard, macro.onOpen));
}

config.macros.importMediaWiki.onOpen = function(context, wizard)
{
	var macro = config.macros.importMediaWiki;
	if(context.status !== true) {
		macro.showErrorMessage(wizard,macro.errorOpeningHost);
		return;
	}
	macro.showMessage(wizard, macro.lookingUpPages);
	wizard.setButtons([macro.getResetButton()]);
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
			var message = macro.errorLookingForWiki.format([context.statusCode]);
			if (context.statusCode == 503) {
				message = macro.errorLookingForWikiHost;
			} else if (context.statusCode == 404) {
				message = macro.errorLookingForWikiApi;
			}
			macro.showErrorMessage(wizard,message);
			wizard.setButtons([macro.getResetButton(),
						{caption: macro.next,
						 tooltip: macro.nextTooltip,
						 onClick: macro.openHost}]);
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
	macro.hideWizardBody(wizard)
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

config.macros.importMediaWiki.filterAlreadyImportedTiddlers = function(tiddlers)
{
	var macro = config.macros.importMediaWiki;
	var filteredList = [];
	for (var i=0; i<tiddlers.length; i++) {
		var tiddler = tiddlers[i];
		var localTiddler = store.getTiddler(tiddler.title);
		if (localTiddler == null || !localTiddler.isTagged(macro.mediaWikiTiddlersTag)) {
			filteredList.push(tiddler);
		}
	};
	return filteredList;
};

// show the pages for the current workspace
config.macros.importMediaWiki.showPages = function(context, wizard)
{
	var macro = config.macros.importMediaWiki;
	macro.showWizardBody(wizard);
	var listedTiddlers = macro.getTiddlers(context.tiddlers);
	var retrievedTiddlers = listedTiddlers.length;
	listedTiddlers = macro.filterAlreadyImportedTiddlers(listedTiddlers);
	var filteredTiddlersCount = retrievedTiddlers - listedTiddlers.length;
	if (listedTiddlers.length == 0) {
		var errorMessage = macro.noTiddlerToImport;
		if (filteredTiddlersCount > 0) {
			errorMessage += macro.filteredTiddlers.format([filteredTiddlersCount]);
		}
		macro.showErrorMessage(wizard, errorMessage);
		return;
	}
	var markList = wizard.getElement(macro.markListName);
	var listWrapper = macro.getClearWikiPagesList();
	markList.parentNode.insertBefore(listWrapper, markList);
	var listView = PaginatedListView.create(listWrapper, listedTiddlers, macro.listViewTemplate, null, null, 3);
	wizard.setValue(macro.listViewField, listView);
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
	macro.showMessage(wizard, macro.statusOpenWorkspace);
	wizard.setButtons([macro.getResetButton()]);
	handleAdaptorReturn(adaptor.openWorkspace(workspace, context, wizard, macro.onOpenWorkspace));
};

config.macros.importMediaWiki.onOpenWorkspace = function(context, wizard, callback)
{
	var macro = config.macros.importMediaWiki;
	if(context.status !== true) {
		macro.showErrorMessage(wizard,"Error in importMediaWiki.onOpenWorkspace: " + context.statusText);
		return;
	}
	var adaptor = wizard.getValue(macro.adaptorField);
	macro.showProgressMessage(wizard, macro.statusGetTiddlerList);
	wizard.setButtons([macro.getResetButton()]);
	handleAdaptorReturn(adaptor.getTiddlerList(context, wizard, macro.onGetTiddlerList));
}

config.macros.importMediaWiki.onGetTiddlerList = function(context, wizard)
{
	var macro = config.macros.importMediaWiki;
	macro.removeProgressMessage(wizard);
	if(context.status !== true) {
		macro.getClearWikiPagesList();
		macro.showErrorMessage(wizard,macro.errorGettingTiddlerList);
		wizard.setButtons([macro.getResetButton()]);
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
		macro.doImport(wizard, [fullPageName], false);
	} else {
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
	var view = wizard.getValue(macro.listViewField);
	var tiddlerNames = view.getSelectedRows();
	if (!tiddlerNames || tiddlerNames.length == 0) {
		macro.showErrorMessage(wizard, macro.noPageSelected);
		return;
	}
	wizard.setValue(macro.keepTiddlersSyncField,
					wizard.getElement(macro.chkSyncFieldName).checked);
	macro.doImport(wizard, tiddlerNames, true);
}

config.macros.importMediaWiki.showMessage = function(wizard, message) {
	var macro = config.macros.importMediaWiki;
	var messageBar = document.getElementById(macro.wizardMessageBarId);
	if (!messageBar) {
		var container = createTiddlyElement(null,'div');
		container.align = 'center';
		messageBar = createTiddlyElement(container,'div',macro.wizardMessageBarId,'tiddler');
		wizard.bodyElem.firstChild.insertBefore(container,wizard.bodyElem.firstChild.firstChild);
		messageBar.style.background ='#FFEE88 none repeat scroll';
		messageBar.style.paddingTop = '0px';
		messageBar.style.paddingBottom = '0px';
		messageBar.align = 'center';
		messageBar.style.width = '300px';
		messageBar.appendChild(document.createTextNode(message));
	} else {
		messageBar.replaceChild(document.createTextNode(message),
		    messageBar.childNodes[0]);
	}
	return messageBar;
}
config.macros.importMediaWiki.showProgressMessage = function(wizard, message) {
	var messageBar = config.macros.importMediaWiki.showMessage(wizard, message);
	config.macros.importMediaWiki.progressAnimation.show(messageBar);
}

config.macros.importMediaWiki.removeProgressMessage = function(wizard) {
	config.macros.importMediaWiki.progressAnimation.stop();
	config.macros.importMediaWiki.removeMessage(wizard);
}

config.macros.importMediaWiki.removeMessage = function(wizard)
{
	var messageBar = document.getElementById(config.macros.importMediaWiki.wizardMessageBarId);
	if (messageBar) {
		messageBar.parentNode.removeChild(messageBar);
	}
};

config.macros.importMediaWiki.showErrorMessage = function(wizard, message)
{
	var messageBar = config.macros.importMediaWiki.showMessage(wizard, message);
	messageBar.style.background ='#FF0000 none repeat scroll';
};

config.macros.importMediaWiki.hideWizardBody = function(wizard)
{
	wizard.bodyElem.firstChild.lastChild.style.visibility = 'hidden';
	wizard.bodyElem.firstChild.lastChild.style.height = '0px';
	wizard.bodyElem.firstChild.lastChild.style.width = '0px';
	wizard.bodyElem.firstChild.firstChild.style.visibility = 'hidden';
	wizard.bodyElem.firstChild.firstChild.style.height = '0px';
	wizard.bodyElem.firstChild.firstChild.style.width = '0px';
};

config.macros.importMediaWiki.showWizardBody = function(wizard)
{
	wizard.bodyElem.firstChild.lastChild.style.visibility = '';
	wizard.bodyElem.firstChild.lastChild.style.height = '';
	wizard.bodyElem.firstChild.lastChild.style.width = '';
	wizard.bodyElem.firstChild.childNodes[1].style.visibility = '';
	wizard.bodyElem.firstChild.childNodes[1].style.height = '';
	wizard.bodyElem.firstChild.childNodes[1].style.width = '';
};

config.macros.importMediaWiki.doImport = function(wizard, tiddlerNames, selectedManually)
{
	var macro = config.macros.importMediaWiki;
	wizard.setValue(macro.importCompletedHandlerField, macro.onDone);
	wizard.setValue(macro.importTagsField, [macro.mediaWikiTiddlersTag]);
	var html;
	var generatedServerName = macro.generateSystemServerName(wizard);
	var feedTiddlers = store.getTaggedTiddlers(macro.mediaWikiFeedTag);
	if (feedTiddlers.length == 0) {
		if (selectedManually == true) {
			html = macro.lastStepHtml + macro.serverTiddlerInputHtml;
		} else {
			wizard.setValue(macro.serverTiddlerNameField, generatedServerName);
			html = macro.lastStepHtml;
		}
	} else {
		html = macro.lastStepHtml;
	}
	wizard.addStep(macro.lastStepTitle.format([tiddlerNames.length]), html);
	var servetName = wizard.getElement(macro.serverTiddlerNameTxtField);
	if (servetName) {
		servetName.value = generatedServerName;
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
		var link = document.createElement("span");
		createTiddlyLink(link, rowNames[t], true);
		place.parentNode.insertBefore(link, place);
		if (t +1 < rowNames.length) {
			createTiddlyText(link, ", ");
		}
	}
	macro.showProgressMessage(wizard, macro.importingTiddlers);
	wizard.setButtons([{caption: macro.cancelLabel,
						tooltip: macro.cancelPrompt,
			 			onClick: macro.onCancel}
		    		  ]);
	var wizardContext = wizard.getValue(macro.contextField);
	wizardContext[macro.keepTiddlersSyncField] = wizard.getValue(macro.keepTiddlersSyncField);
	var callback = function() {
		config.macros.importMediaWiki.progressAnimation.stop();
		config.macros.importMediaWiki.showMessage(wizard, macro.statusDoneImport);
		wizard.setButtons([{caption: macro.doneLabel,
							tooltip: macro.donePrompt,
							onClick: wizard.getValue(macro.importCompletedHandlerField)
						   }]);
		};
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
	if (!tiddlerContext.status) {
		macro.showErrorMessage(new Wizard(this), "Error in importMediaWiki.onGetTiddler: " + tiddlerContext.statusText);
		return;
	}
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
	var serverTiddlerName = wizard.getValue(macro.serverTiddlerNameField);
	var chkSave = wizard.getElement(macro.chkSaveName);
	if (chkSave && chkSave.checked) {
		serverTiddlerName = wizard.getElement(macro.serverTiddlerNameTxtField).value;
	}
	if (serverTiddlerName) {
		macro.saveServerTiddler(wizard, serverTiddlerName, [macro.mediaWikiFeedTag]);
	}
	config.macros.importMediaWiki.reinvoke(wizard);
}

config.macros.importMediaWiki.reinvoke = function(wizard)
{
	var macro = config.macros.importMediaWiki;
	var main = wizard.formElem.parentNode;
	main.removeChild(wizard.formElem);
	var place = document.getElementById(macro.importedTiddlersMessageId);
	if (place != null) {
		var parent = place.parentNode;
		parent.removeChild(place);
		macro.handler(parent);
	} else {
		macro.handler(main);
	}
}
config.macros.importMediaWiki.onReset = function()
{
	config.macros.importMediaWiki.reinvoke(new Wizard(this));
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
	wizard.addStep(macro.step1Title, macro.step1Html);
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
	//standard folders
	hosts.push('/wiki');
	hosts.push('/w');
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

config.macros.importMediaWikiSync = {};

config.macros.importMediaWikiSync.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var action = function() {
		config.macros.importMediaWiki.sync.doSync();
	}
	var macro = config.macros.importMediaWiki;
	createTiddlyButton(place, macro.syncNow, macro.syncNowTooltip,action,null,macro.syncButtonId);
}

config.macros.importMediaWiki.sync = {};

config.macros.importMediaWiki.sync.hijackedUpdateSyncStatus = config.macros.sync.updateSyncStatus;
config.macros.sync.updateSyncStatus = function(syncItem)
{
	var macro = config.macros.importMediaWiki.sync;
	if (syncItem.colElements) {
		macro.hijackedUpdateSyncStatus(syncItem);
	}
	else {
		var getTiddlerCallback = function(context, syncItem){
			if (syncItem) {
				var tiddler = context.tiddler;
				store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier,
					tiddler.modified, tiddler.tags, tiddler.fields, true, tiddler.created);
				syncItem.syncStatus = config.macros.sync.syncStatusList.gotFromServer;
			}
			macro.showResultIfFinished();
		};
		var sl = config.macros.sync.syncStatusList;
		var si = syncItem;
		var r = true;
		switch (si.syncStatus) {
			case sl.changedServer:
				macro.status.updated.push(si.title);
				r = si.adaptor.getTiddler(si.title, null, si, getTiddlerCallback);
				break;
			case sl.notFound:
			case sl.changedBoth:
				macro.status.conflics.push(si.title);
				macro.showResultIfFinished();
				break;
			default:
				macro.status.unchanged.push(si.title);
				macro.showResultIfFinished();
				break;
		}
		if (!r) {
			displayMessage("Error in doSync: " + r);
		}
	}
};

config.macros.importMediaWiki.sync.showResultIfFinished = function() {
	var status = config.macros.importMediaWiki.sync.status;
	var macro = config.macros.importMediaWiki;
	var totalStatus = status.count();
	if (totalStatus == currSync.syncList.length) {
		if (totalStatus > status.unchanged.length) {
			displayMessage(macro.syncedTiddlersMessage.format([status.updated.length]));
			if (status.conflics.length > 0) {
				var text = status.conflics[0];
				for (var i = 1; i < status.conflics.length; i++) {
					text += ', ' + status.conflics[0];
				};
				displayMessage(macro.conflictDetected + text);
			}
		}
		status.reset();
	} 
}

config.macros.importMediaWiki.sync.status = {};
config.macros.importMediaWiki.sync.status.count = function()
{
	var macro = config.macros.importMediaWiki.sync.status;
	return macro.updated.length + macro.conflics.length + macro.unchanged.length;
};

config.macros.importMediaWiki.sync.status.reset = function()
{
	var macro = config.macros.importMediaWiki.sync.status;	
	macro.updated = [];
	macro.conflics = [];
	macro.unchanged = [];
};

config.macros.importMediaWiki.sync.status.updated = [];
config.macros.importMediaWiki.sync.status.conflics = [];
config.macros.importMediaWiki.sync.status.unchanged = [];

// run at startup
jQuery().bind('startup', function() {
	config.macros.importMediaWiki.sync.check();
}); 

if (!config.options.txtMediawikiSyncIterval) {
	config.options.txtMediawikiSyncIterval = '' + 15;
}

config.macros.importMediaWiki.sync.check = function() {
	config.macros.importMediaWiki.sync.doSync();
	window.setTimeout(config.macros.importMediaWiki.sync.check, 1000 * 60 * parseInt(config.options.txtMediawikiSyncIterval));	
};

config.macros.importMediaWiki.sync.doSync = function()
{
	if(currSync)
		config.macros.sync.cancelSync();
	currSync = {};
	var macro = config.macros.importMediaWiki;
	var syncMacro = config.macros.sync;
	currSync.syncList = macro.sync.filterMediaWikiTiddlers(syncMacro.getSyncableTiddlers());
	syncMacro.preProcessSyncableTiddlers(currSync.syncList);
	currSync.syncTask = syncMacro.createSyncTasks(currSync.syncList);
	return false;
};

config.macros.importMediaWiki.sync.filterMediaWikiTiddlers = function(list)
{
	var filteredList = [];
	var tiddlersToSync = store.getTaggedTiddlers(
		config.macros.importMediaWiki.mediaWikiTiddlersTag);
	for (var i=0; i<list.length; i++) {
		var indx = tiddlersToSync.findByField('field', list[i].title);
		if (indx != -1 ) {
			filteredList.push(list[i]);
			list[i].adaptor.host = list[i].serverHost;
		}
	};
	return filteredList;
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
		if(!confirm(config.macros.importTiddlers.confirmOverwriteSaveTiddler.format([txtSaveTiddler])))
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
	store.saveTiddler(txtSaveTiddler,txtSaveTiddler,text,macro.serverSaveModifier,new Date(),tags);
};

config.macros.importMediaWiki.progressAnimation = {};

config.macros.importMediaWiki.progressAnimation.chars = ['•···','·•··','··•·','···•','··•·','·•··']
config.macros.importMediaWiki.progressAnimation.content;
config.macros.importMediaWiki.progressAnimation.place;
config.macros.importMediaWiki.progressAnimation.stopFlag = false;
config.macros.importMediaWiki.progressAnimation.currentChar = 0;
config.macros.importMediaWiki.progressAnimation.show = function(place) {
	this.content = place.textContent;
	this.place = place;
	config.macros.importMediaWiki.progressAnimation.stopFlag = false;
	window.setTimeout(config.macros.importMediaWiki.progressAnimation.nextChar,0);
}

config.macros.importMediaWiki.progressAnimation.nextChar = function() {
	var macro = config.macros.importMediaWiki.progressAnimation;
	if (macro.stopFlag == true) {
		return;
	}
	var nextChar = macro.chars[macro.currentChar];
	macro.place.textContent = nextChar + ' ' + macro.content;
	macro.currentChar++;
	if (macro.currentChar >= macro.chars.length) {
		macro.currentChar = 0;
	} else {
		macro.currentChar = macro.currentChar;//just for timing
	}
	if (!macro.stopFlag) {
		window.setTimeout(config.macros.importMediaWiki.progressAnimation.nextChar,300);
	}
}

config.macros.importMediaWiki.progressAnimation.stop = function() {
	var macro = config.macros.importMediaWiki.progressAnimation;
	macro.stopFlag = true;
	macro.place = null;
	macro.content = null;
}

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
	importedTiddlersMessageId : "importedTiddlersMessage",
	importeMoreTiddlersButtonId : "importeMoreTiddlersButton" ,
	wizardMessageBarId : "wizardMessageBar",
	serverSaveTemplate: "|''Description:''|%0|\n|''Type:''|%1|\n|''URL:''|%2|\n|''Workspace:''|%3|\n\nThis tiddler was automatically created to record the details of this server",
	URLSlice : "URL",
	serverTiddlerNameTxtField:"serverTiddlerNameTxtField",
	syncButtonId: 'syncButtonId',
	//User messages
	errorLookingForWiki:"Unable to connect to the wiki server. Unknown error (id:%0)",
	errorLookingForWikiHost: "Unable to connect to the wiki server, please check you are connected to the network and there is no typo.",
	errorLookingForWikiApi: "Error connecting to the wiki server, please make sure the wiki supports mediawiki api",
	errorGettingTiddler: "Error in importMediaWiki.onGetTiddler: ",
	importMoreTiddlersButtonLabel : "Import more tiddlers...",
	importMoreTiddlersButtonTooltip : "click here to import more tiddlers",
	lookingUpPages: "Looking up pages...",
	importingTiddlers: "importing tiddlers...",
	readOnlyWarning: "You cannot import into a read-only TiddlyWiki file. Try opening it from a file:// URL",
	wizardTitle: "Import content from your wiki",
	openingHost: "Opening host...",
	errorOpeningHost: "Error opening host",
	noTiddlerToImport: "No tiddler to import in this workspace.",
	filteredTiddlers: "(%0 tiddlers were filtered because they are already imported)",
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
	syncNow: "sync with wiki",
	syncNowTooltip: "click here to sync all the tiddlers",
	syncedTiddlersMessage: "Sync finished. %0 tiddlers updated.",
	conflictDetected: "conflic detected in the following tiddlers:",
	moreTiddlers: 'and %0 more...',
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
	lastStepHtml: "<br/><input type='hidden' name='" + config.macros.importMediaWiki.markReportFieldName + "'></input><br/><br/>",
	serverTiddlerInputHtml: "<input type='checkbox' checked='true' name='" + config.macros.importMediaWiki.chkSaveName + "'>Save the details of this wiki server for future operations, alias:</input>"
		 + "<input type='text' size=25 name='" + config.macros.importMediaWiki.serverTiddlerNameTxtField + "'>", // DO NOT TRANSLATE
	step2Title: "Select pages",
	step2Html: "workspace: <select name='" + config.macros.importMediaWiki.selWorkspaceName + "'></select><br>"
		 + "<input type='hidden' name='" + config.macros.importMediaWiki.markListName + "'><br>"
		 + "<input type='checkbox' checked='true' name='" + config.macros.importMediaWiki.chkSyncFieldName + "'>Keep these tiddlers linked to this server so that you can synchronise subsequent changes</input><br>",
 	step1Title: "Locate the server ",
	step1Html: "Enter the wiki server or page URL here: <input type='text' size=50 name='" + config.macros.importMediaWiki.hostInputName + "' ><br>"
	});
/*}}}*/