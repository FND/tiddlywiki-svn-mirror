/***
|''Name:''|HostedCommandsPlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#HostedCommandsPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/HostedCommandsPlugin.js|
|''Version:''|0.2.3|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.HostedCommandsPlugin) {
version.extensions.HostedCommandsPlugin = {installed:true};

config.macros.viewTiddlerFields = {};
config.macros.viewTiddlerFields.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(tiddler instanceof Tiddler) {
		var value = '';
		var comma = '';
		for(i in tiddler.fields) {
			if (!i.match(/^temp[\._]/)) {
				value += comma + i + '=' + tiddler.fields[i];
				comma = ', ';
			}
		}
		value += comma + 'created=' + tiddler.created.convertToYYYYMMDDHHMM();
		value += ', modified=' + tiddler.modified.convertToYYYYMMDDHHMM();
		value += ', modifier=' + tiddler.modifier;
		highlightify(value,place,highlightHack,tiddler);
	}
};

//# Returns true if function fnName is available for the tiddler's serverType
//# Used by (eg): config.commands.download.isEnabled
function isAdaptorFunctionSupported(fnName,fields)
{
//#displayMessage("Tiddler.prototype.isFunctionSupported:"+fnName);
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(serverType)
		serverType = serverType.toLowerCase();
	if(!fields['server.host'] || !serverType || !config.adaptors[serverType])
		return false;
	if(config.adaptors[serverType].name)
		return true;
	return false;
}

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

// download command definition
config.commands.download = {};
merge(config.commands.download,{
	text: "download",
	tooltip:"Download this tiddler",
	downloaded: "Tiddler downloaded",
	readOnlyText: "download",
	readOnlyTooltip: "Download this tiddler"}
);

config.commands.download.isEnabled = function(tiddler)
{
	return isAdaptorFunctionSupported('getTiddler',tiddler.fields);
};

config.commands.download.handler = function(event,src,title)
{
//#displayMessage("config.commands.download.handler:"+title);
	story.getHostedTiddler(title,config.commands.download.callback);
};

config.commands.download.callback = function(tiddler)
{
	if(tiddler.fields['temp.status']) {
		TiddlyWiki.updateTiddlerAndSave(tiddler);
		displayMessage(config.commands.downloaded.downloaded);
	} else {
		displayMessage(tiddler.fields['temp.statusText']);
	}
};

// upload command definition
config.commands.upload = {};
merge(config.commands.upload,{
	text: "upload",
	tooltip: "Upload this tiddler",
	uploaded: "Tiddler uploaded",
	readOnlyText: "upload",
	readOnlyTooltip: "Upload this tiddler"});

config.commands.upload.isEnabled = function(tiddler)
{
	return tiddler && tiddler.isTouched() && isAdaptorFunctionSupported('putTiddler',tiddler.fields);
};

config.commands.upload.handler = function(event,src,title)
{
	story.putHostedTiddler(title,config.commands.upload.callback);
};

config.commands.upload.callback = function(tiddler)
{
	if(tiddler.fields['temp.status']) {
		displayMessage(config.commands.upload.uploaded);
	} else {
		displayMessage(tiddler.fields['temp.statusText']);
	}
};

}//# end of 'install only once'
//}}}
