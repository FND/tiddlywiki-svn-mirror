/***
|''Name:''|HostedCommands2Plugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#HostedCommands2Plugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/HostedCommands2Plugin.js|
|''Version:''|0.1.0|
|''Date:''|Jan 20, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.HostedCommands2Plugin) {
version.extensions.HostedCommands2Plugin = {installed:true};

Tiddler.prototype.getRevisionList = function(params)
{
	var serverType = this.getServerType();
	if(!serverType)
		return false;
	var fn = config.hostFunctions.getTiddlerRevisionList[serverType];
	if(fn) {
		if(!params)
			params = {};
		params.title = this.title;
		params.serverHost = this.fields['server.host'];
		params.serverWorkspace = this.fields['server.workspace'];
		fn(this.title,params);
	}
	return true;
};

/*TiddlyWiki.prototype.updateStory = function(tiddler)
{
//#displayMessage("updateStory");
	this.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields);
	//#story.refreshTiddler(tiddler.title,1,true);// not required, savetiddler refreshes
	if(config.options.chkAutoSave) {
		saveChanges();
	}
};*/

//# change in Macros.js
//# list.handler has been tweeked to pass additional parameters to list type handler and createTiddlyLink
config.macros.list.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var type = params[0] ? params[0] : "all";
	var list = document.createElement("ul");
	place.appendChild(list);
	if(this[type].prompt)
		createTiddlyElement(list,"li",null,"listTitle",this[type].prompt);
	var results;
	if(this[type].handler)
		results = this[type].handler(params,wikifier,paramString,tiddler);
	for(var t = 0; t < results.length; t++) {
		var li = document.createElement("li");
		list.appendChild(li);
		createTiddlyLink(li,typeof results[t] == "string" ? results[t] : results[t].title,true,null,false,tiddler);
	}
};

// Return an array of tiddler titles that are in the given workspace on the host
TiddlyWiki.prototype.getHosted = function(host,workspace)
{
//#displayMessage("host:"+host+" ws:"+workspace);
	var results = [];
	if(!this.hostedTiddlers || !this.hostedTiddlers[host])
		return results;
	var list = this.hostedTiddlers[host][workspace];
	if(list) {
		for(i=0; i<list.length; i++) {
			results.push(list[i].title);
		}
		results.sort();
	}
	return results;
};

config.macros.list.hosted = {};
config.macros.list.hosted.prompt = "Tiddlers on the host";
config.macros.list.hosted.handler = function(params,wikifier,paramString,tiddler)
{
//#displayMessage("listHosted:"+params);
	return store.getHosted(tiddler.fields['server.host'],tiddler.fields['server.workspace']);
};

config.macros.updateHostedList = {};
merge(config.macros.updateHostedList,{
	label: "update hosted list",
	prompt: "Update list of hosted tiddlers",
	done: "List updated"});

config.macros.updateHostedList.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var customFields = getParam(params,"fields",false);
	if(!customFields)
		customFields = store.getDefaultCustomFields();
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute("customFields",customFields);
};

config.macros.updateHostedList.onClick = function(e)
{
	var ret = false;
	clearMessage();
	var customFields = this.getAttribute("customFields");
	var fields = convertCustomFieldsToHash(customFields);
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(!serverType || !config.adaptors[serverType] || !this.fields['server.host'])
		return ret;
	var adaptor = new config.adaptors[serverType];
	if(adaptor) {
		adaptor.openHost(fields['server.host']);
		adaptor.openWorkspace(fields['server.workspace']);
		ret = adaptor[fnName](this);
		adaptor.close();
		delete adaptor;
	}
	return ret;
};

config.macros.updateHostedList.onDone = function(params)
{
	displayMessage(config.macros.updateHostedList.done);
};

// revisions command definition
config.commands.revisions = {};
merge(config.commands.revisions,{
	text: "revisions",
	tooltip: "View another revision of this tiddler",
	loading: "loading...",
	revisionTooltip: "View this revision",
	popupNone: "No revisions"});

config.commands.revisions.isEnabled = function(tiddler)
{
	return tiddler.isFunctionSupported('getTiddlerRevisionList');
};

config.commands.revisions.handler = function(event,src,title)
{
	var tiddler = store.fetchTiddler(title);
	tiddler['temp.callback'] = config.commands.revisions.callback;
	tiddler['temp.popup'] = Popup.create(src);
	Popup.show(tiddler['temp.popup'],false);
	tiddler.getRevisionList();
	event.cancelBubble = true;
	if(event.stopPropagation)
		event.stopPropagation();
	return true;
};

config.commands.revisions.callback = function(tiddler)
// The revisions are returned in the tiddler['temp.revisions'] array
//# tiddler['temp.revisions'][i].modified
//# tiddler['temp.revisions'][i].key
{
//#displayMessage("config.commands.revisions.callback");
	if(tiddler['temp.popup']) {
		var revisions = tiddler['temp.revisions'];
		if(revisions.length==0) {
			createTiddlyText(createTiddlyElement(tiddler.temp.popup,'li',null,'disabled'),config.commands.revisions.popupNone);
		} else {
			for(var i=0; i<revisions.length; i++) {
				var modified = revisions[i].modified;
				var key = revisions[i].key;
				var btn = createTiddlyButton(createTiddlyElement(params.temp.popup,'li'),
						modified.toLocaleString(),
						config.commands.revisions.revisionTooltip,
						function() {
							displayTiddlerRevision(this.getAttribute('tiddlerTitle'),this.getAttribute('revisionKey'),this);
							return false;
							},
						'tiddlyLinkExisting tiddlyLink');
				btn.setAttribute('tiddlerTitle',tiddler.title);
				btn.setAttribute('revisionKey',key);
				if(tiddler.revisionKey == key || (!tiddler.revisionKey && i==0))
					btn.className = 'revisionCurrent';
			}
		}
	}
};

} // end of 'install only once'
//}}}
