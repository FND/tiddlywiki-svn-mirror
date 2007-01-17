/***
|''Name:''|NexusPlugin|
|''Description:''|Nexus - the central connection for moving data to and from alternative hosts|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#NexusPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental|
|''Version:''|0.0.7|
|''Date:''|Dec 30, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|

|''Enable download article on click empty link''|<<option chkDownloadEmptyArticle>>|

////{{{<<tiddler NexusPluginDocumentation>>}}}

***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.NexusPlugin) {
version.extensions.NexusPlugin = {installed:true};

function Nexus()
{
}

var nexus = new Nexus();

// function redirectors
Nexus.Functions = {};
Nexus.Functions.getPage = {};
Nexus.Functions.getPageList = {};
Nexus.Functions.getPageRevisionList = {};
Nexus.Functions.getPageRevision = {};
Nexus.Functions.putPage = {};
Nexus.Functions.lockPage = {};
Nexus.Functions.unlockPage = {};
Nexus.Functions.login = {};

// params.workspace
// params.wikiformat
// params.serverHost
// params.serverType
// params.serverPageId
// params.serverPageName
// params.serverPageRevision
// params.token

Nexus.prototype.createTiddler = function(params,content)
{
	tiddler = store.createTiddler(params.title);
	if(content)
		tiddler.text = content;
	if (!tiddler.fields) 
		tiddler.fields = {};
	tiddler.fields['server.host'] = params.serverHost;
	if(params.workspace)
		tiddler.fields['server.workspace'] = params.workspace;
	if(params.wikiformat)
		tiddler.fields['wikiformat'] = params.wikiformat;
	if(params.serverType)
		tiddler.fields['server.type'] = params.serverType;
	if(params.serverPageName)
		tiddler.fields['server.page.name'] = params.serverPageName;
	if(params.serverPageId)
		tiddler.fields['server.page.id'] = params.serverPageId;
	if(params.serverPageRevision)
		tiddler.fields['server.page.revision'] = params.serverPageRevision;
	tiddler.created = new Date();
	tiddler.modified = tiddler.created;
	tiddler.modifier = params.serverHost;
	tiddler.fields['downloaded'] = tiddler.modified.convertToYYYYMMDDHHMM();
	tiddler.fields['changecount'] = -1;
	return tiddler;
};

Nexus.prototype.updateStory = function(tiddler)
{
//#displayMessage("updateStory");
//#TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields)
	store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields);
	//#story.refreshTiddler(tiddler.title,1,true);// not required, savetiddler refreshes
	if(config.options.chkAutoSave) {
		saveChanges();
	}
};

Nexus.prototype.getFields = function(title)
{
	var tiddlerElem = document.getElementById(story.idPrefix + title);
	var customFields = tiddlerElem.getAttribute("tiddlyFields");
//#displayMessage("Fields:"+customFields);
	return convertCustomFieldsToHash(customFields);
};

Nexus.prototype.getServerType = function(fields,tiddler)
// Get the server type used. If there is no server.type field, infer the server type
// from the wikiformat. If no wikiformat and tiddler is specified use the Format tag to infer the
// server type.
{
	if(!fields)
		return null;
	var serverType = fields['server.type'];
	if(!serverType)
		serverType = fields['wikiformat'];
	if(!serverType && tiddler) {
		for(i in config.parsers) {
			var format = config.parsers[i].format;
			if(tiddler.isTagged(format+'Format')) {
				serverType = format;
				break;
			}
		}
	}
	return serverType ? serverType.toLowerCase() : null;
};

Nexus.prototype.isFunctionSupported = function(fn,tiddler)
//# Returns true if there is a function fn for the tiddler's serverType
{
	if(!tiddler)
		return false;
	if(!tiddler.fields['server.host'])
		return false;
	var serverType = this.getServerType(tiddler.fields,tiddler);
	if(!serverType)
		return false;
	if(Nexus.Functions[fn][serverType]) {
		return true;
	}
	return false;
};

Nexus.prototype.setParams = function(params,fields,serverType,title)
{
//#displayMessage("serverType:"+serverType);
	var defaultServer = config.options['txt'+serverType+'DefaultServer'];
	var defaultWorkspace = config.options['txt'+serverType+'DefaultWorkspace'];
	if(params.username=='')
		params.username = config.options['txt'+serverType+'Username'];
	if(params.password=='')
		params.password = config.options['txt'+serverType+'Password'];
	var passwordRequired = config.options['chk'+serverType+'PasswordRequired'];
	if(passwordRequired) {
		if(params.username=='')
			params.username = prompt('Enter your username','');
		if(params.password=='')
			params.password = prompt('Enter your password','');
	}
	params.title = title;
	params.serverHost = fields['server.host'] ? fields['server.host'] : defaultServer;
	params.workspace = fields['server.workspace'] ? fields['server.workspace'] : defaultWorkspace;
};

Nexus.prototype.getMissingPage = function(title)
{
//#displayMessage("getMissingPage");
	fields = this.getFields(title);
	if(!fields['server.host'])
		return false;
	var serverType = this.getServerType(fields);
	if(!serverType)
		return false;
	var fn = Nexus.Functions.getPage[serverType];
	if(fn) {
		var params = {};
		params.serverHost = fields['server.host'];
		params.workspace = fields['server.workspace'];
		fn(title,params);
	}
	return true;
};

Nexus.prototype.getPage = function(title,params)
{
	var tiddler = store.fetchTiddler(title);
	if(tiddler) {
		var fields = tiddler.fields;
		var serverType = this.getServerType(fields,tiddler);
	} else {
		fields = this.getFields(title);
		serverType = this.getServerType(fields);
	}
	if(!serverType)
		return false;
	var fn = Nexus.Functions.getPage[serverType];
	if(fn) {
		if(!params)
			params = {};
		this.setParams(params,fields,serverType,title);
		fn(title,params);
		return true;
	}
	return false;
};

Nexus.prototype.putPage = function(title,params)
{
	var tiddler = store.fetchTiddler(title);
	if(!tiddler)
		return false;
	var fields = tiddler.fields;
	var serverType = this.getServerType(fields,tiddler);
	if(!serverType)
		return false;
	var fn = Nexus.Functions.putPage[serverType];
	if(fn) {
		if(!params)
			params = {};
		this.setParams(params,fields,serverType,title);
		fn(title,params);
		return true;
	}
	return false;
};

Nexus.prototype.getPageRevisionList = function(title,params)
{
	var tiddler = store.fetchTiddler(title);
	if(!tiddler)
		return false;
	var fields = tiddler.fields;
	var serverType = this.getServerType(fields,tiddler);
	if(!serverType)
		return false;
	var fn = Nexus.Functions.getPageRevisionList[serverType];
	if(fn) {
		if(!params)
			params = {};
		params.serverHost = fields['server.host'];
		params.workspace = fields['server.workspace'];
		fn(title,params);
	}
	return true;
};

} // end of 'install only once'
//}}}
