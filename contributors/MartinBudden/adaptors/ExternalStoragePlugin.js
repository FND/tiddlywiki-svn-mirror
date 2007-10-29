/***
|''Name:''|ExternalStoragePlugin|
|''Description:''|Adaptor for keeping Tiddlers external to the TiddlyWiki|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ExternalStoragePlugin.js |
|''Version:''|0.0.3|
|''Date:''|Sep 10, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2.0|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ExternalStoragePlugin) {
version.extensions.ExternalStoragePlugin = {installed:true};

function ExternalStorage()
{
	return this;
}


ExternalStorage.restart = restart;
function restart()
{
//#displayMessage("restart");
	ExternalStorage.loadContent();
//#store.notifyAll();
	ExternalStorage.restart();
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
	context.serverType = tiddler.getServerType();
	if(!context.serverType)
		return;
	context.host = tiddler.fields['server.host'];
	context.workspace = tiddler.fields['server.workspace'];
	context.startTime = new Date();
	var adaptor = new config.adaptors[context.serverType];
	adaptor.getTiddler(title,context,null,ExternalStorage.getTiddlerCallback);
};

ExternalStorage.getTiddlerCallback = function(context,userParams)
{
	var tiddler = context.tiddler;
	if(tiddler && tiddler.text) {
		var downloaded = new Date();
		if(!tiddler.created)
			tiddler.created = downloaded;
		if(!tiddler.modified)
			tiddler.modified = tiddler.created;
		if(tiddler && config.options.chkDisplayInstrumentation && context.startTime) {
			var t1 = new Date();
			displayMessage('loaded in "'+tiddler.title+'" in ' + (t1-context.startTime) + ' ms');
		}
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
		autoSaveChanges();
	}
	context.adaptor.close();
	delete context.adpator;
};

ExternalStorage.loadContent = function()
{
//#displayMessage("loadContent");
	var adaptor = new config.adaptors[LocalAdaptor.serverType];
	var context = adaptor.getTiddlerList();
	delete adaptor;
	return context.content;
};

TiddlyWiki.prototype.getContent = function(key)
{
//#displayMessage("getContent");
	if(!this.content)
		this.content = ExternalStorage.loadContent();
	var results = [];
	for(var i in this.content) {
		var title = this.content[i].title;
		if(key) {
			if(title.indexOf(key)==0)
				results.push(title);
		} else {
		//#if(tiddler.title.indexOf(':')==-1)
		results.push(title);
		}
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
