/***
|''Name:''|HostedCommands2Plugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#HostedCommands2Plugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/HostedCommands2Plugin.js|
|''Version:''|0.2.1|
|''Date:''|Jan 20, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.HostedCommands2Plugin) {
version.extensions.HostedCommands2Plugin = {installed:true};

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
/*config.macros.list.handler = function(place,macroName,params,wikifier,paramString,tiddler)
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
};*/

// Return an array of tiddler titles that are in the given workspace on the host
TiddlyWiki.prototype.getHostedTiddlers = function(host,workspace)
{
//#displayMessage("getHostedTiddlers:"+host+" ws:"+workspace);
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

config.macros.list.hostedTiddlers = {};
config.macros.list.hostedTiddlers.prompt = "Tiddlers on the host";
config.macros.list.hostedTiddlers.handler = function(params,wikifier,paramString,tiddler)
{
//#displayMessage("list.hostedTiddlers");
	var fields = convertCustomFieldsToHash(store.getDefaultCustomFields());
	return store.getHostedTiddlers(fields['server.host'],fields['server.workspace']);
};

config.macros.updateHostedTiddlerList = {};
merge(config.macros.updateHostedTiddlerList,{
	label: "update hosted list",
	prompt: "Update list of hosted tiddlers",
	done: "List updated"});

config.macros.updateHostedTiddlerList.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
//#displayMessage("updateHostedTiddlerList.handler");
	params = paramString.parseParams("anon",null,true,false,false);
	var customFields = getParam(params,"fields",false);
	if(!customFields)
		customFields = store.getDefaultCustomFields();
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute("customFields",customFields);
};

//# Convenience wrapper to call an adaptor function
callAdaptorFunction = function(fnName,params,fields)
{
	var ret = false;
	if(!fields)
		fields = params.fields;
	if(!fields)
		return ret;
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(!serverType || !config.adaptors[serverType] || !fields['server.host'])
		return ret;
	var adaptor = new config.adaptors[serverType];
	if(adaptor) {
		adaptor.openHost(fields['server.host']);
		adaptor.openWorkspace(fields['server.workspace']);
		ret = adaptor[fnName](params);
		adaptor.close();
		delete adaptor;
	}
	return ret;
};

config.macros.updateHostedTiddlerList.onClick = function(e)
{
	clearMessage();
//#displayMessage("updateHostedTiddlerList.onClick");
	var customFields = this.getAttribute("customFields");
	var fields = convertCustomFieldsToHash(customFields);
	var params = {host:fields['server.host'],workspace:fields['server.workspace'],callback:config.macros.updateHostedTiddlerList.callback};
	return callAdaptorFunction('getTiddlerList',params,fields);
};

config.macros.updateHostedTiddlerList.callback = function(params)
{
//#displayMessage("updateHostedTiddlerList.callback:"+params.host+" w:"+params.workspace);
	if(params.status) {
		if(!store.hostedTiddlers)
			store.hostedTiddlers = {};
		if(!store.hostedTiddlers[params.host])
			store.hostedTiddlers[params.host] = {};
		store.hostedTiddlers[params.host][params.workspace] = params.list;
		displayMessage(config.macros.updateHostedTiddlerList.done);
		story.displayTiddler(null,"ListHosted");// for debug
	} else {
		displayMessage(params.statusText);
	}
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
//#displayMessage("revisions.handler:"+title);
	var tiddler = store.fetchTiddler(title);
	tiddler['temp.callback'] = config.commands.revisions.callback;
	tiddler['temp.src'] = src;
	tiddler.callAdaptorFunction('getTiddlerRevisionList');
	event.cancelBubble = true;
	if(event.stopPropagation)
		event.stopPropagation();
	return true;
};

config.commands.revisions.callback = function(tiddler,revisions)
// The revisions are returned in the revisions array
//# revisions[i].modified
//# revisions[i].key
{
//#displayMessage("config.commands.revisions.callback");
	popup = Popup.create(tiddler['temp.src']);
	Popup.show(popup,false);
	if(revisions.length==0) {
		createTiddlyText(createTiddlyElement(popup,'li',null,'disabled'),config.commands.revisions.popupNone);
	} else {
		for(var i=0; i<revisions.length; i++) {
			var modified = revisions[i].modified;
			var key = revisions[i].key;
			var btn = createTiddlyButton(createTiddlyElement(popup,'li'),
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
};

} // end of 'install only once'
//}}}
