/***
|''Name:''|MediaWikiAdaptorPlugin|
|''Description:''|Adaptor for moving and converting data from MediaWikis|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#MediaWikiAdaptorPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/MediaWikiAdaptorPlugin.js |
|''Version:''|0.8.6|
|''Date:''|Jul 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.4.1|

|''Max number of tiddlers to download''|<<option txtMediaAdaptorLimit>>|


MediaWiki REST documentation is at:
http://meta.wikimedia.org/w/api.php
http://meta.wikimedia.org/w/query.php

''For debug:''
|''Default MediaWiki username''|<<option txtMediaWikiUsername>>|
|''Default MediaWiki password''|<<option txtMediaWikiPassword>>|

***/
//{{{
//# Ensure that the plugin is only installed once.
if(!config.adaptors.mediawiki.getTemplatesForPage) {

(function(adaptor) {

//# Override this to do postprocessing on tiddler after it is retrieved from the server
adaptor.prototype.getTiddlerPostProcess = function(context)
{
	context.tiddler.tags.push(config.macros.importTiddlers.mediaWikiPageTag);
	if (context.tiddler.title.indexOf("Template:") == 0) {
		context.tiddler.tags.push("mediaWikiTemplate");
	}
	if (!(context.userParams && context.userParams.template)) {
		var adaptor = context.adaptor;
		var callback = context.callback;
		context.callback = null;
		context.status = true;
		adaptor.getTemplatesForPage.call(adaptor,context.tiddler.title, context, context.userParams, callback);
	}
	return context.tiddler;
};

adaptor.prototype.getTemplatesForPage = function (page, context, userParams, callback)
{
	var newContext = {};
	newContext = this.setContext(newContext,userParams,context.adaptor.getTemplateTiddlersCallback);
	newContext.nestedCallback = callback;
	newContext.nestedContext = context;
	var title = adaptor.normalizedTitle(page);
	var uriTemplate = '%0/api.php?format=json&action=query&generator=templates&titles=%1&prop=info';
	var host = this.fullHostName(context.host);
	var uri = uriTemplate.format([host,title]);
	var req = adaptor.doHttpGET(uri,this.onGetTemplatesForPages,newContext);
	return typeof req == 'string' ? req : true;
};

adaptor.prototype.onGetTemplatesForPages = function (status,context,responseText,uri,xhr)
{
	context.status = false;
	if(status) {
		var content = null;
		try {
			//# convert the downloaded data into a javascript object
			eval('var info=' + responseText);
			var titles = [];
			if (info.query) {
				for (var key in info.query.pages) {
					titles.push(info.query.pages[key].title);
				}
			}
			context.templates = titles;
		} catch (ex) {
			context.statusText = exceptionText(ex,adaptor.serverParsingErrorMessage);
			if(context.callback) {
				context.callback(context,context.userParams);
			}
			return;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback) {
		context.callback(context,context.userParams);
	}
}

adaptor.prototype.getTemplateTiddlersCallback = function(context, wizard) {
	var macro = config.macros.importMediaWiki;
	var templateNames = [];
	for (t = 0; t < context.templates.length; t++) {
		if (!store.tiddlerExists(context.templates[t])) {
			templateNames.push(context.templates[t]);
		}
	}
	var callback = function() {
		var callback = context.nestedCallback;
		if (callback) {
			callback.call(this, context.nestedContext, wizard);
		}
	};
	if (templateNames.length == 0) {
		callback();
	} else {
		var adaptor = context.adaptor;
		var templateContext = {
			host: context.nestedContext.host,
			adaptor: adaptor,
			template:true
		}
		templateContext[macro.keepTiddlersSyncField] = wizard && wizard[macro.keepTiddlersSyncField];
		macro.doImportTiddlers(adaptor, templateContext, templateNames, callback);
	}
};

})(config.adaptors.mediawiki);

} // end of 'install only once'

config.macros.importTiddlers.mediaWikiPageTag = "mediaWikiPage";
//}}}
