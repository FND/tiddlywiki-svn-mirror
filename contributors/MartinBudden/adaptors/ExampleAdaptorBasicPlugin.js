/***
|''Name:''|ExampleAdaptorPlugin|
|''Description:''|Example Adaptor which can be used as a basis for creating a new Adaptor|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#ExampleAdaptorPlugin|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/ExampleAdaptorPlugin.js |
|''Version:''|0.5.6|
|''Status:''|Not for release - this is a template for creating new adaptors|
|''Date:''|Mar 11, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.4.1|

To make this example into a real TiddlyWiki adaptor, you need to:

# Globally search and replace ExampleAdpator with the name of your adaptor
# Delete any functionality not supported by you host (for example, putTiddler may not be supported)
# Do the actions indicated by the !!TODO comments, namely:
## Set the values of the main variables, eg ExampleAdaptor.serverType etc
## Fill in the uri templates in the .prototype functions
## Parse the responseText returned in the Callback functions and put the results in the appropriate variables

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ExampleAdaptorPlugin) {
version.extensions.ExampleAdaptorPlugin = {installed:true};

function ExampleAdaptor()
{
}

ExampleAdaptor.prototype = new AdaptorBase();

// !!TODO set the variables below
ExampleAdaptor.serverType = 'example'; // MUST BE LOWER CASE
ExampleAdaptor.serverParsingErrorMessage = "Error parsing result from server";
ExampleAdaptor.errorInFunctionMessage = "Error in function ExampleAdaptor.%0";

// Convert a page title to the normalized form used in uris
ExampleAdaptor.normalizedTitle = function(title)
{
	var n = title.toLowerCase();
	n = n.replace(/\s/g,'_').replace(/\//g,'_').replace(/\./g,'_').replace(/:/g,'').replace(/\?/g,'');
	if(n.charAt(0)=='_')
		n = n.substr(1);
	return String(n);
};

ExampleAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0';
	var uri = uriTemplate.format([context.host]);
	var req = httpReq('GET',uri,ExampleAdaptor.getWorkspaceListCallback,context);
	return typeof req == 'string' ? req : true;
};

ExampleAdaptor.getWorkspaceListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ExampleAdaptor.errorInFunctionMessage.format(['getWorkspaceListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var item = {
				title:'exampleTitle',
				name:'exampleName'
				};
			list.push(item);
		} catch(ex) {
			context.statusText = exceptionText(ex,ExampleAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.workspaces = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ExampleAdaptor.prototype.getTiddlerList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
// !!TODO set the uriTemplate
	var uriTemplate = '%0%1';
	var uri = uriTemplate.format([context.host,context.workspace]);
	var req = httpReq('GET',uri,ExampleAdaptor.getTiddlerListCallback,context);
	return typeof req == 'string' ? req : true;
};

ExampleAdaptor.getTiddlerListCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ExampleAdaptor.errorInFunctionMessage.format(['getTiddlerListCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
			var list = [];
			var tiddler = new Tiddler('example');
			list.push(tiddler);
		} catch(ex) {
			context.statusText = exceptionText(ex,ExampleAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.tiddlers = list;
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

ExampleAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	var host = this && this.host ? this.host : ExampleAdaptor.fullHostName(tiddler.fields['server.host']);
	var workspace = this && this.workspace ? this.workspace : tiddler.fields['server.workspace'];
// !!TODO set the uriTemplate
	uriTemplate = '%0%1%2';
	info.uri = uriTemplate.format([host,workspace,tiddler.title]);
	return info;
};

ExampleAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	if(title)
		context.title = title;
// !!TODO set the uriTemplate
	uriTemplate = '%0%1%2';
	uri = uriTemplate.format([context.host,context.workspace,ExampleAdaptor.normalizedTitle(title),context.revision]);

	context.tiddler = new Tiddler(title);
	context.tiddler.fields.wikiformat = 'exampleformat';
	context.tiddler.fields['server.type'] = ExampleAdaptor.serverType;
	context.tiddler.fields['server.host'] = ExampleAdaptor.minHostName(context.host);
	context.tiddler.fields['server.workspace'] = context.workspace;
	var req = httpReq('GET',uri,ExampleAdaptor.getTiddlerCallback,context);
	return typeof req == 'string' ? req : true;
};

ExampleAdaptor.getTiddlerCallback = function(status,context,responseText,uri,xhr)
{
	context.status = false;
	context.statusText = ExampleAdaptor.errorInFunctionMessage.format(['getTiddlerCallback']);
	if(status) {
		try {
// !!TODO: parse the responseText here
// !!TODO: fill in tiddler fields as available
			//context.tiddler.tags = ;
			//context.tiddler.fields['server.page.id'] = ;
			//context.tiddler.fields['server.page.name'] = ;
			//context.tiddler.fields['server.page.revision'] = String(...);
			//context.tiddler.modifier = ;
			//context.tiddler.modified = ExampleAdaptor.dateFromEditTime(...);
		} catch(ex) {
			context.statusText = exceptionText(ex,ExampleAdaptor.serverParsingErrorMessage);
			if(context.callback)
				context.callback(context,context.userParams);
			return;
		}
		context.status = true;
	} else {
		context.statusText = xhr.statusText;
	}
	if(context.callback)
		context.callback(context,context.userParams);
};

config.adaptors[ExampleAdaptor.serverType] = ExampleAdaptor;
} //# end of 'install only once'
//}}}
