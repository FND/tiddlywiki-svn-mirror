/***
|''Name:''|ExternalAdaptorPlugin|
|''Description:''|Adaptor for keeping Tiddlers external to the TiddlyWiki|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#ExternalAdaptorPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ExternalAdaptorPlugin.js |
|''Version:''|0.0.2|
|''Date:''|Sep 10, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2.0|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ExternalAdaptorPlugin) {
version.extensions.ExternalAdaptorPlugin = {installed:true};

function ExternalAdaptor()
{
	return this;
}


ExternalAdaptor.restart = restart;
function restart()
{
//#displayMessage("restart");
	ExternalAdaptor.loadContent();
//	store.notifyAll();
	ExternalAdaptor.restart();
}

function getTiddlyLinkInfo(title,currClasses)
{
	var classes = currClasses ? currClasses.split(" ") : [];
	classes.pushUnique("tiddlyLink");
	var tiddler = store.fetchTiddler(title);
	var content = store.content ? store.content[title] : {};
	var subTitle;
	if(tiddler||content) {
		if(tiddler)
			subTitle = tiddler.getSubtitle();
		classes.pushUnique("tiddlyLinkExisting");
		classes.remove("tiddlyLinkNonExisting");
		classes.remove("shadow");
	} else {
		classes.remove("tiddlyLinkExisting");
		classes.pushUnique("tiddlyLinkNonExisting");
		if(store.isShadowTiddler(title)) {
			subTitle = config.messages.shadowedTiddlerToolTip.format([title]);
			classes.pushUnique("shadow");
		} else {
			subTitle = config.messages.undefinedTiddlerToolTip.format([title]);
			classes.remove("shadow");
		}
	}
	if(config.annotations[title])
		subTitle = config.annotations[title];
	return {classes: classes.join(" "),subTitle: subTitle};
}

// much faster than the built in version, since only one asynchronous call
Story.prototype.loadMissingTiddler = function(title,fields,tiddlerElem)
{
	var tiddler = new Tiddler(title);
	tiddler.fields = typeof fields == "string" ?  fields.decodeHashMap() : (fields ? fields : {});
	context = {};
	context.startTime = new Date();
	context.serverType = tiddler.getServerType();
	if(!context.serverType)
		return;
	context.host = tiddler.fields['server.host'];
	context.workspace = tiddler.fields['server.workspace'];
	var adaptor = new config.adaptors[context.serverType];
	adaptor.getTiddler(title,context,null,ExternalAdaptor.gotTiddler);
};

ExternalAdaptor.gotTiddler = function(context,userParams)
{
	var tiddler = context.tiddler;
	if(tiddler && tiddler.text) {
		var downloaded = new Date();
		if(!tiddler.created)
			tiddler.created = downloaded;
		if(!tiddler.modified)
			tiddler.modified = tiddler.created;
		if(tiddler && config.options.chkDisplayInstrumentation) {
			var t1 = new Date();
			displayMessage('loaded in "'+tiddler.title+'" in ' + (t1-context.startTime) + ' ms');
		}
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		autoSaveChanges();
	}
	context.adaptor.close();
	delete context.adpator;
};

ExternalAdaptor.loadContent = function()
{
	displayMessage("loadContent");
	var adaptor = new config.adaptors[LocalAdaptor.serverType];
	var context = adaptor.getTiddlerList();
	store.content = context.content;
	delete adaptor;
};

TiddlyWiki.prototype.getContent = function()
{
//#displayMessage("getContent");
	if(!this.content)
		ExternalAdaptor.loadContent();
	var results = [];
	for(var i in this.content) {
		var tiddler = this.content[i];
		if(tiddler.title.indexOf(':')==-1)
			results.push(tiddler.title);
	}
	results.sort();
	return results;
};


config.macros.list.content = {};
config.macros.list.content.handler = function(params)
{
	return store.getContent();
};
} //# end of 'install only once'
//}}}
