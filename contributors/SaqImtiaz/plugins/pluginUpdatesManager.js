/***
|''Name:''|PluginUpdatesManager|
|''Description:''|Centralized and automated updating for TiddlyWiki plugins|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|0.1|
|''Date:''|02/04/08|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.3.0|

***/
// /%
//!BEGIN-PLUGIN-CODE
if (!config.macros.pluginUpdatesManager){
    
currPluginUpdate = null;

config.macros.pluginUpdatesManager = {
    
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'selected', rowName: 'title', type: 'Selector'},
			{name: 'Plugin', field: 'tiddler', title: "Plugin", type: 'Tiddler'},
			{name: 'Version', field: 'Version', title:'Version', type: 'String'},
			{name: 'Status', field: 'statusText', title: "Update Status", type: 'String'},
			{name: 'Server URL', field: 'Source', title: "Server URL", text: "View", type: 'Link'}
			],
		rowClasses: [
			],
		buttons: [
			{caption: "Update these plugins", name: 'update'}
			]
    },
        
	wizardTitle: "Update plugins",
	step1Title: "Check for updates of currently installed plugins",
	step1Html: "<input type='hidden' name='markList'></input>", // DO NOT TRANSLATE
	syncLabel: "update",
	syncPrompt: "Update these plugins",
	updatedText: "This plugin has been updated since startup. Please reload",
	noPluginText: "There are no plugins installed that support automatic updating",
    doneLabel: "done",
	donePrompt: "Close this wizard",
    
	syncStatusList: {
		none: {text: "...", color: "transparent"},
		updateFound: {text: "Plugin update available", color: '#80ff80'},
		updateIncompatible: {text: "Plugin update needs newer TiddlyWiki", color: '#ff8080'},
		noUpdate: {text: "Plugin not found on server", color: '#ffff80'},
		gotFromServer: {text: "Plugin updated, please reload the file.", color: '#80ffff'}
	},
    
    updatesStatusList: {
        statusChecking:{text: 'Searching for plugin updates...'},
        statusFound:{text: '%0 plugin update(s) found:' },
        statusNotFound:{text: 'No plugin updates found.'},
        statusUpdated:{text: '%0 plugin(s) updated. Please reload the file.'},
        statusIncompatible: {text: '%0 plugin(s) found but some need a newer version of TiddlyWiki.'}
    },
    
    getPlugins : function(){
        currPluginUpdate = {};
        unsupportedPlugins = [];
        var c = currPluginUpdate.plugins = [];
        var tiddlers = store.getTaggedTiddlers('systemConfig');
        for (var i=0; i<tiddlers.length; i++){
            var p = getPluginInfo(tiddlers[i]);
            if (p.Version && p.Source){
                p.Server = p.Source.split('#')[0];
                p.title = p.Source.split('#')[1];
                p.updated = tiddlers[i].fields['temp.plugin.updated'];
                c.push(p);
            }
            else
                unsupportedPlugins.push(p);
        }
    },
    
    getUpdateBuckets : function(){
        var buckets = currPluginUpdate.updateBuckets = [];
        var p = currPluginUpdate.plugins;
        for (var i=0; i<p.length; i++){
            if(p[i].updated)
                continue;
            var f = buckets.findByField('Server',p[i].Server);
            var key = p[i].title;
            var pluginInfo = p[i];
            if (f == null){
                buckets.push({Server:p[i].Server, items:{}});
                buckets[buckets.length-1].items[key] = pluginInfo;
            }
            else
                buckets[f].items[key] = pluginInfo;
        }
    },
    
    getUpdates : function(){
        var buckets = currPluginUpdate.updateBuckets;
        currPluginUpdate.updates = [];
        currPluginUpdate.count = 0;
        currPluginUpdate.bucketsProcessed = 0;
        if(buckets.length == 0){
            this.updateStatusDisplay('statusNotFound');
            return;
        }
        for (var i=0; i<buckets.length; i++){
            (function(){
            var bucket = buckets[i];
            bucket.syncMachine = new SyncMachine('file',{
                start: function() {
                    return this.openHost(buckets[i].Server,"getTiddlerList");
                },
                getTiddlerList: function() {
                    return this.getTiddlerList("onGetTiddlerList");
                },
                onGetTiddlerList: function(context) {
                    var tiddlers = context.tiddlers;
                    for(var n in bucket.items){
                        var f = tiddlers.findByField("title",n);
                        var status = null;
                        if (f !== null){
                            var remote = tiddlers[f];
                            var remoteVersion = context.adaptor.store.getTiddlerSlice(remote.title,'Version').match(/(?:(\d|\.))*/)[0];
                            var coreNeeded = context.adaptor.store.getTiddlerSlice(remote.title,'CoreVersion');
                            
                            status = (remoteVersion > bucket.items[n].Version) ? "updateFound" : "noUpdate";
                            if (status == "updateFound"){
                                status = (coreNeeded && coreNeeded > [version.major,version.minor,version.revision].join(".")) ? "updateIncompatible" : "updateFound";
                                if (status == "updateIncompatible")
                                    currPluginUpdate.incompatible = true;
                                bucket.items[n]["status"] = config.macros.pluginUpdatesManager.syncStatusList[status];
                                bucket.items[n]["statusText"] = bucket.items[n]["status"].text;
                                
                                bucket.items[n].updateData = remote;
                                currPluginUpdate.updates.push(bucket.items[n]);
                                currPluginUpdate.count++;
                            }
                        }
                        //else
                        //    status = "notFound";
                    }
                    currPluginUpdate.bucketsProcessed ++;
                    config.macros.pluginUpdatesManager.showUpdates();
                }
            });
            bucket.syncMachine.go();}());  
        }   
    },
    
    handler : function(place,macroName,params){
        if(currPluginUpdate)
            currPluginUpdate = null;
        this.getPlugins();
        this.getUpdateBuckets();
        
        
        var wizard = currPluginUpdate.wizard = new Wizard();
        wizard.createWizard(place,this.wizardTitle);
        wizard.addStep(this.step1Title,this.step1Html);        
        var markList = wizard.getElement("markList");
        
        var container = document.createElement("div");
        currPluginUpdate.updatesDiv = createTiddlyElement(container,"div",null,"pluginUpdatesStatus");
        var listWrapper = currPluginUpdate.listWrapper = createTiddlyElement(container,"div",null,"pluginUpdatesManager");
        var up = createTiddlyElement(container,"div",null,"unsupportedplugins");
        wikify("<<unsupportedplugins>>",up);
        
        this.updateStatusDisplay('statusChecking');
        this.getUpdates();
        
        markList.parentNode.insertBefore(container,markList);
    },
    
    updateStatusDisplay : function(status){
        var updatesDiv = currPluginUpdate.updatesDiv;
        removeChildren(updatesDiv);
        createTiddlyText(updatesDiv,this.updatesStatusList[status].text.format([currPluginUpdate.count]));
        updatesDiv.className = status + " pluginUpdatesStatus";
    },

    showUpdates : function(){
        if(currPluginUpdate.bucketsProcessed < currPluginUpdate.updateBuckets.length)
            return;
        this.updateStatusDisplay(currPluginUpdate.updates.length == 0 ? 'statusNotFound': currPluginUpdate.incompatible? 'statusIncompatible':'statusFound');
        var wizard = currPluginUpdate.wizard;
        var listWrapper = currPluginUpdate.listWrapper;
        var updatesDiv = currPluginUpdate.updatesDiv;
        if(currPluginUpdate.updates.length == 0) {
            wizard.setButtons([]);
        }
        else
            currPluginUpdate.listView = ListView.create(listWrapper,currPluginUpdate.updates,this.listViewTemplate);
        this.updateRowColors('updates');
        wizard.setButtons([
                {caption: this.syncLabel, tooltip: this.syncPrompt, onClick: this.installUpdates}
            ]);        
    },
    
    installUpdates : function(){
        var rowNames = ListView.getSelectedRows(currPluginUpdate.listView);
        if (rowNames.length == 0)
            return false;
        currPluginUpdate.updated = [];
        for(var t=0; t<currPluginUpdate.updates.length; t++) {
        	var si = currPluginUpdate.updates[t];
            if(rowNames.indexOf(si.title) != -1) {
            	config.macros.pluginUpdatesManager.installUpdate(si);
            }
        }
        currPluginUpdate.count = currPluginUpdate.updated.length;
        config.macros.pluginUpdatesManager.updateStatusDisplay('statusUpdated');
        config.macros.pluginUpdatesManager.refreshListView();
        return false;        
    },
    
    refreshListView : function(){
        var listWrapper = currPluginUpdate.listWrapper;
        removeChildren(listWrapper);
        ListView.create(listWrapper,currPluginUpdate.updated,this.listViewTemplate);
        this.updateRowColors('updated');
        currPluginUpdate.wizard.setButtons([{caption: this.doneLabel, tooltip: this.donePrompt, onClick: this.onClose}]);
    },
    
    installUpdate: function(updateItem){
        var orig = updateItem.tiddler;
        var update = updateItem.updateData;
		
        store.saveTiddler(orig.title, orig.title, update.text, update.modifier, update.modified, orig.tags, merge(orig.fields,{'temp.plugin.updated':true}), true, update.created);
		var plugin = installedPlugins[installedPlugins.findByField("title",orig.title)];
		plugin.log.splice(0,0,config.macros.pluginUpdatesManager.updatedText);
        updateItem.Version = store.getTiddlerSlice(orig.title,'Version');
        updateItem.status = this.syncStatusList.gotFromServer;
        updateItem.statusText = this.syncStatusList.gotFromServer.text;
        currPluginUpdate.updated.push(updateItem);
    },
    
    updateRowColors : function(n){
        for(var t=0; t<currPluginUpdate[n].length; t++) {
            si = currPluginUpdate[n][t];
            si.rowElement.style.backgroundColor = si.status.color;
        }
    },
    
    onClose : function(){
        backstage.hidePanel();
        return false;
    }
};

config.shadowTiddlers.PluginConfigurationManager = "<<plugins>>";
config.shadowTiddlers.PluginUpdatesManager = "<<pluginUpdatesManager>>";
config.shadowTiddlers.PluginManager = "<<tabs txtPluginManager 'Config' 'Plugin configuration' PluginConfigurationManager 'Update' 'Update plugins' PluginUpdatesManager>>";

config.tasks.plugins= {text: "plugins", tooltip: "Manage installed plugins", content: '<<tiddler PluginManager>>'};

setStylesheet("div.pluginUpdatesStatus {\n"+
 "    padding: 0.6em;\n"+
 "    font-weight: bold;\n"+
 "    font-size: 140%;\n"+
 "    margin-bottom:0.5em;\n"+
 "}\n"+
 "\n"+
 "div.pluginUpdatesManager {\n"+
 "    font-size:120%;\n"+
 "}\n"+
 "\n"+
 "div.pluginUpdatesManager table.listView td, div.pluginUpdatesManager table.listView th {\n"+
 "    padding:0.3em;\n"+
 "}\n"+
 "\n"+
 "div.pluginUpdatesStatus.statusChecking {\n"+
 "    background:#fe8;\n"+
 "}\n"+
 "\n"+
 "div.pluginUpdatesStatus.statusIncompatible {\n"+
 "    background:#ff8080;\n"+
 "}\n"+
 "\n"+
 "div.pluginUpdatesStatus.statusFound {\n"+
 "    background:#80ff80;\n"+
 "}\n"+
 "\n"+
 "div.pluginUpdatesStatus.statusNotFound {\n"+
 "    background:#ff8080;\n"+
 "}\n"+
 "\n"+
 "div.unsupportedplugins {\n"+
 "   margin-top:0.6em; padding:0.5em; background:#eee; border:1px solid #ccc; \n"+
 "}\n"+
 "div.pluginUpdatesStatus.statusUpdated {\n"+
 "    background:#80ffff;\n"+
 "}","PluginUpdatesManagerStyles");

config.macros.unsupportedplugins = {
    handler : function(place,macroName,params){
        if (unsupportedPlugins && unsupportedPlugins.length){
            var out = ["In order to support updating plugins must have the following slices: Source, ~CoreVersion and Version."];
            for (var i=0;i<unsupportedPlugins.length;i++)
                out.push("* [["+unsupportedPlugins[i].title+"]]");
            config.shadowTiddlers['Plugins that do not support updating']= out.join("\n");
            wikify("[[You have "+ unsupportedPlugins.length + " installed plugins that do not support updating.|Plugins that do not support updating]]",place);
        }
    }
};

FileAdaptor.getTiddlerComplete = function(context,userParams)
{
	var t = context.adaptor.store.fetchTiddler(context.title);
	t.fields['server.type'] = FileAdaptor.serverType;
	t.fields['server.host'] = FileAdaptor.minHostName(context.host);
	t.fields['server.page.revision'] = t.modified.convertToYYYYMMDDHHMM();
	context.tiddler = t;
	context.status = true;
	if(context.allowSynchronous) {
		context.isSynchronous = true;
		context.callback(context,userParams);
	} else {
		window.setTimeout(function() {context.callback(context,userParams);},10);
	}
	return true;
};

}

if (!startingUp  && store){
    config.options.txtPluginManager = "Update";
    backstage.switchTab('plugins');
}
//exclude systemConfig from regular sync
// what do do when online?
//dynamically load the entire thing when needed?
//compress
//!END-PLUGIN-CODE
// %/