/***
|''Name:''|HostedCommandsPlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#HostedCommandsPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/HostedCommandsPlugin.js|
|''Version:''|0.1.2|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.HostedCommandsPlugin) {
version.extensions.HostedCommandsPlugin = {installed:true};

//# Returns true if function fnName is available for the tiddler's serverType
//# Used by (eg): config.commands.download.isEnabled
Tiddler.prototype.isFunctionSupported = function(fnName)
{
	if(!this.fields['server.host'])
		return false;
	var serverType = this.getServerType();
	if(!serverType)
		return false;
	//if(config.newAdaptor[serverType][fnName])
	//if(config.hostFunctions[fnName][serverType])
		return true;
	return false;
};

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

TiddlyWiki.prototype.updatedOffline = function()
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(tiddler.fields['server.host'] && tiddler.isTouched())
			results.push(tiddler);
		});
	results.sort();
	return results;
};

config.macros.list.updatedOffline = {};
config.macros.list.updatedOffline.handler = function(params)
{
	return store.updatedOffline();
};

config.macros.viewTiddlerFields = {};
config.macros.viewTiddlerFields.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(tiddler instanceof Tiddler) {
		var value = '';
		var comma = '';
		for(i in tiddler.fields) {
			value += comma + i + '=' + tiddler.fields[i];
			comma = ', ';
		}
		value += comma + 'created=' + tiddler.created.convertToYYYYMMDDHHMM();
		comma = ', ';
		value += comma+ 'modified=' + tiddler.modified.convertToYYYYMMDDHHMM();
		highlightify(value,place,highlightHack,tiddler);
	}
};

// download command definition
config.commands.download = {};
merge(config.commands.download,{
	text: "download",
	tooltip:"Download this tiddler",
	readOnlyText: "download",
	readOnlyTooltip: "Download this tiddler"}
);

config.commands.download.isEnabled = function(tiddler)
{
	return tiddler.isFunctionSupported('getTiddler',tiddler);
};

config.commands.download.handler = function(event,src,title)
{
//#displayMessage("config.commands.download.handler:"+title);
	store.getHostedTiddler(title);
};

// upload command definition
config.commands.upload = {};
merge(config.commands.upload,{
	text: "upload",
	tooltip: "Upload this tiddler",
	uploaded: "uploaded",
	readOnlyText: "upload",
	readOnlyTooltip: "Upload this tiddler"});

config.commands.upload.isEnabled = function(tiddler)
{
	return tiddler && tiddler.isTouched() && tiddler.isFunctionSupported('putTiddler');
};

config.commands.upload.handler = function(event,src,title)
{
	store.putHostedTiddler(title,config.commands.upload.callback);
};

config.commands.upload.callback = function(tiddler)
{
	displayMessage(config.commands.upload.uploaded);
};

} // end of 'install only once'
//}}}
