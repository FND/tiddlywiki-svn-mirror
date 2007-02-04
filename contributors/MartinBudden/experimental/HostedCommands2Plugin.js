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

config.macros.list.hosted = {};
config.macros.list.hosted.prompt = "Tiddlers on the host";
config.macros.list.hosted.handler = function(params,wikifier,paramString,tiddler)
{
//#displayMessage("listHosted:"+params);
	return store.getHosted(tiddler.fields['server.host'],tiddler.fields['server.workspace']);
};

// Return an array of tiddler titles  that are on the given workspace on the host
TiddlyWiki.prototype.getHosted = function(host,workspace)
{
//#displayMessage("host:"+host+" ws:"+workspace);
	var results = [];
	if(!this.hostedTiddlers)
		return results;
	if(!this.hostedTiddlers[host])
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
	clearMessage();
	var customFields = this.getAttribute("customFields");
	var fields = convertCustomFieldsToHash(customFields);
	var serverType = store.getServerType(fields);
	var fn = config.hostFunctions.getTiddlerList[serverType];
	if(fn) {
		if(!params)
			params = {};
		params.serverHost = fields['server.host'];
		params.serverWorkspace = fields['server.workspace'];
		params.callback = config.macros.updateHostedList.onDone;
		fn(params);
		return true;
	}
	return false;
};

config.macros.updateHostedList.onDone = function(params)
{
	displayMessage(config.macros.updateHostedList.done);
};

} // end of 'install only once'
//}}}
