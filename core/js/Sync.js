//--
//-- Sync macro
//--

// Synchronisation handlers
config.syncers = {};

// Sync state.
//# Members:
//#	syncList - List of sync objects (title, tiddler, server, workspace, page, revision)
//#	wizard - reference to wizard object
//#	listView - DOM element of the listView table
//#	syncMachines - array of syncMachines
var currSync = null;

// sync macro
config.macros.sync.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(!wikifier.isStatic)
		this.startSync(place);
};

config.macros.sync.startSync = function(place)
{
	if(currSync)
		config.macros.sync.cancelSync();
	currSync = {};
	currSync.syncList = this.getSyncableTiddlers();
	this.createSyncMachines();
	this.preProcessSyncableTiddlers();
	var wizard = new Wizard();
	currSync.wizard = wizard;
	wizard.createWizard(place,this.wizardTitle);
	wizard.addStep(this.step1Title,this.step1Html);
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	currSync.listView = ListView.create(listWrapper,currSync.syncList,this.listViewTemplate);
	config.macros.sync.processSyncableTiddlers();
	wizard.setButtons([
			{caption: this.syncLabel, tooltip: this.syncPrompt, onClick: this.doSync}
		]);
};

config.macros.sync.getSyncableTiddlers = function ()
{
	var list = [];
	store.forEachTiddler(function(title,tiddler) {
		var syncItem = {};
		syncItem.serverType = tiddler.getServerType();
		syncItem.serverHost = tiddler.fields['server.host'];
		syncItem.serverWorkspace = tiddler.fields['server.workspace'];
		syncItem.tiddler = tiddler;
		syncItem.title = tiddler.title;
		syncItem.isTouched = tiddler.isTouched();
		syncItem.selected = syncItem.isTouched;
		syncItem.syncStatus = config.macros.sync.syncStatusList[syncItem.isTouched ? "changedLocally" : "none"];
		syncItem.status = syncItem.syncStatus.text;
		if(syncItem.serverType && syncItem.serverHost)
			list.push(syncItem);
		});
	list.sort(function(a,b) {return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1);});
	return list;
};

config.macros.sync.preProcessSyncableTiddlers = function()
{
	for(var t=0; t<currSync.syncList.length; t++) {
		si = currSync.syncList[t];
		var ti = si.syncMachine.adaptor.generateTiddlerInfo(si.tiddler);
		si.serverUrl = ti.uri;
	}
};

config.macros.sync.processSyncableTiddlers = function()
{
	for(var t=0; t<currSync.syncList.length; t++) {
		si = currSync.syncList[t];
		si.rowElement.style.backgroundColor = si.syncStatus.color;
	}
};

config.macros.sync.createSyncMachines = function()
{
	currSync.syncMachines = [];
	for(var t=0; t<currSync.syncList.length; t++) {
		var si = currSync.syncList[t];
		var r = null;
		for(var sm=0; sm<currSync.syncMachines.length; sm++) {
			var csm = currSync.syncMachines[sm];
			if(si.serverType == csm.serverType && si.serverHost == csm.serverHost && si.serverWorkspace == csm.serverWorkspace)
				r = csm;
		}
		if(r == null) {
			si.syncMachine = config.macros.sync.createSyncMachine(si);
			currSync.syncMachines.push(si.syncMachine);
		} else {
			si.syncMachine = r;
			r.syncItems.push(si);
		}
	}
};

config.macros.sync.createSyncMachine = function(syncItem)
{
	var sm = {};
	sm.serverType = syncItem.serverType;
	sm.serverHost = syncItem.serverHost;
	sm.serverWorkspace = syncItem.serverWorkspace;
	sm.syncItems = [syncItem];
	sm.adaptor = new config.adaptors[syncItem.serverType];
	var context = {};
	var r = sm.adaptor.openHost(sm.serverHost,context,sm,config.macros.sync.syncOnOpenHost);
	if(r !== true)
		displayMessage("Error from openHost: " + r);
	return sm;
};

config.macros.sync.syncOnOpenHost = function(context,syncMachine)
{
	if(!context.status)
		displayMessage("Error in sync.syncOnOpenHost: " + context.statusText);
	var r = syncMachine.adaptor.openWorkspace(syncMachine.serverWorkspace,context,syncMachine,config.macros.sync.syncOnOpenWorkspace);
	if(r !== true)
		displayMessage("Error from openWorkspace: " + r);
};

config.macros.sync.syncOnOpenWorkspace = function(context,syncMachine)
{
	if(!context.status)
		displayMessage("Error in sync.syncOnOpenWorkspace: " + context.statusText);
	var r = syncMachine.adaptor.getTiddlerList(context,syncMachine,config.macros.sync.syncOnGetTiddlerList);
	if(r !== true)
		displayMessage("Error from getTiddlerList: " + r);
};

config.macros.sync.syncOnGetTiddlerList = function(context,syncMachine)
{
	if(!context.status)
		displayMessage("Error in sync.syncOnGetTiddlerList: " + context.statusText + " " + syncMachine.serverHost);
	for(var t=0; t<syncMachine.syncItems.length; t++) {
		var si = syncMachine.syncItems[t];
		var f = context.tiddlers.findByField("title",si.title);
		if(f !== null) {
			if(context.tiddlers[f].fields['server.page.revision'] > si.tiddler.fields['server.page.revision']) {
				si.syncStatus = config.macros.sync.syncStatusList[si.isTouched ? 'changedBoth' : 'changedServer'];
			}
		} else {
			si.syncStatus = config.macros.sync.syncStatusList.notFound;
		}
		config.macros.sync.updateSyncStatus(si);
	}
};

config.macros.sync.updateSyncStatus = function(syncItem)
{
	var e = syncItem.colElements["status"];
	removeChildren(e);
	createTiddlyText(e,syncItem.syncStatus.text);
	syncItem.rowElement.style.backgroundColor = syncItem.syncStatus.color;
};

config.macros.sync.doSync = function(e)
{
	var rowNames = ListView.getSelectedRows(currSync.listView);
	for(var t=0; t<currSync.syncList.length; t++) {
		var si = currSync.syncList[t];
		if(rowNames.indexOf(si.title) != -1) {
			config.macros.sync.doSyncItem(si);
		}
	}
	return false;
};

config.macros.sync.doSyncItem = function(syncItem)
{
	var r = true;
	var context = {};
	var requestState = {syncMachine: syncItem.syncMachine, title: syncItem.title, syncItem: syncItem};
	switch(syncItem.syncStatus) {
		case config.macros.sync.syncStatusList.changedServer:
			if(syncItem.syncMachine.adaptor.getTiddler)
				r = syncItem.syncMachine.adaptor.getTiddler(syncItem.title,context,requestState,config.macros.sync.syncOnGetTiddler);
			break;
		case config.macros.sync.syncStatusList.notFound:
		case config.macros.sync.syncStatusList.changedLocally:
		case config.macros.sync.syncStatusList.changedBoth:
			if(syncItem.syncMachine.adaptor.putTiddler)
				r = syncItem.syncMachine.adaptor.putTiddler(syncItem.tiddler,context,requestState,config.macros.sync.syncOnPutTiddler);
			break;
		default:
			break;
	}
	if(r !== true)
		displayMessage("Error in doSyncItem: " + r);
};

config.macros.sync.syncOnGetTiddler = function(context,requestState)
{
	var syncMachine = requestState.syncMachine;
	var title = requestState.title;
	var syncItem = requestState.syncItem;
	var tiddler = context.tiddler;
	store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier, tiddler.modified, tiddler.tags, tiddler.fields);
	store.suspendNotifications();
	store.setValue(tiddler.title,'changecount',null);
	store.resumeNotifications();
	syncItem.syncStatus = config.macros.sync.syncStatusList.gotFromServer;
	config.macros.sync.updateSyncStatus(syncItem);
	if(!context.status)
		displayMessage("Error in sync.syncOnGetTiddler: " + context.statusText);
};

config.macros.sync.syncOnPutTiddler = function(context,requestState)
{
	var syncMachine = requestState.syncMachine;
	var title = requestState.title;
	var syncItem = requestState.syncItem;
	store.resetTiddler(title);
	syncItem.syncStatus = config.macros.sync.syncStatusList.putToServer;
	config.macros.sync.updateSyncStatus(syncItem);
	if(!context.status)
		displayMessage("Error in sync.syncOnPutTiddler: " + context.statusText);
};

config.macros.sync.cancelSync = function()
{
	currSync = null;
};

function SyncMachine(serverType,steps)
{
	this.serverType = serverType;
	this.adaptor = new config.adaptors[serverType];
	this.steps = steps;
}

SyncMachine.prototype.go = function(start)
{
	if(!start) start = "start";
	return this.invokeStep(start);
};

SyncMachine.prototype.invokeStep = function(step,varargs)
{
	var h = this.steps[step];
	if(!h)
		return null;
	var a = [];
	for(var t=1; t<arguments.length; t++)
		a.push(arguments[t]);
	var r = h.apply(this,a);
	if(typeof r == "string")
		this.invokeError(r);
	return r;
};

SyncMachine.prototype.invokeError = function(message)
{
	if(this.steps.error)
		this.steps.error(message);
};

SyncMachine.prototype.openHost = function(host,nextStep)
{
	var me = this;
	return me.adaptor.openHost(host,null,null,function(context) {
		if(typeof context.status == "string")
			me.invokeError(context.status);
		else
			me.invokeStep(nextStep);
	});
};

SyncMachine.prototype.getWorkspaceList = function(nextStep)
{
	var me = this;
	return me.adaptor.getWorkspaceList(null,null,function(context) {
		if(typeof context.status == "string")
			me.invokeError(context.status);
		else
			me.invokeStep(nextStep,context.workspaces);
	});
};

SyncMachine.prototype.openWorkspace = function(workspace,nextStep)
{
	var me = this;
	return me.adaptor.openWorkspace(workspace,null,null,function(context) {
		if(typeof context.status == "string")
			me.invokeError(context.status);
		else
			me.invokeStep(nextStep);
	});
};

SyncMachine.prototype.getTiddlerList = function(nextStep)
{
	var me = this;
	return me.adaptor.getTiddlerList(null,null,function(context) {
		if(typeof context.status == "string")
			me.invokeError(context.status);
		else
			me.invokeStep(nextStep,context.tiddlers);
	});
};

SyncMachine.prototype.generateTiddlerInfo = function(tiddler)
{
	return this.adaptor.generateTiddlerInfo(tiddler);
};

SyncMachine.prototype.getTiddler = function(title,nextStep)
{
	var me = this;
	return me.adaptor.getTiddler(title,null,null,function(context) {
		if(typeof context.status == "string")
			me.invokeError(context.status);
		else
			me.invokeStep(nextStep,context.tiddler);
	});
};

SyncMachine.prototype.putTiddler = function(tiddler,nextStep)
{
	var me = this;
	return me.adaptor.putTiddler(tiddler,null,null,function(context) {
		if(typeof context.status == "string")
			me.invokeError(context.status);
		else
			me.invokeStep(nextStep,context.tiddler);
	});
};


