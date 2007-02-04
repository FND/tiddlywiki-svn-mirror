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

|''Enable download article on click empty link''|<<option chkDownloadEmptyArticle>>|

////{{{<<tiddler HostedCommandsPluginDocumentation>>}}}

***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.HostedCommandsPlugin) {
version.extensions.HostedCommandsPlugin = {installed:true};

// params.wikiformat
// params.serverHost
// params.serverType
// params.serverWorkspace
// params.serverPageId
// params.serverPageName
// params.serverPageRevision
// params.token

//# Returns true if function fnName is available for the tiddler's serverType
//# Used by (eg): config.commands.download.isEnabled
Tiddler.prototype.isFunctionSupported = function(fnName)
{
	if(!this.fields['server.host'])
		return false;
	var serverType = this.getServerType();
	if(!serverType)
		return false;
	if(config.hostFunctions[fnName][serverType]) {
		return true;
	}
	return false;
};

Tiddler.prototype.updateFieldsAndContent = function(params,content)
{
	if(content)
		this.text = content;
	if(params.wikiformat)
		this.fields['wikiformat'] = params.wikiformat;
	this.fields['server.host'] = params.serverHost;
	if(params.serverType)
		this.fields['server.type'] = params.serverType;
	if(params.serverWorkspace)
		this.fields['server.workspace'] = params.serverWorkspace;
	if(params.serverPageId)
		this.fields['server.page.id'] = params.serverPageId;
	if(params.serverPageName)
		this.fields['server.page.name'] = params.serverPageName;
	if(params.serverPageRevision)
		this.fields['server.page.revision'] = params.serverPageRevision;
	var downloaded = new Date();
	this.created = params.created ? params.created : downloaded;
	this.modified = params.modified ? params.modified : this.created;
	this.modifier = params.modifier ? params.modifier : params.serverHost;
	if(params.tags)
		tiddler.tags = params.tags;
	this.fields['downloaded'] = downloaded.convertToYYYYMMDDHHMM();
	this.fields['changecount'] = -1;
	store.saveTiddler(this.title,this.title,this.text,this.modifier,this.modified,this.tags,this.fields);
	if(config.options.chkAutoSave)
		saveChanges();
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
//#displayMessage("config.commands.getPage.handler:"+title);
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
	var params = {server:{}};
	params.title = title;
	params.callback = config.commands.upload.callback;
	store.putHostedTiddler(title,params);
};

config.commands.upload.callback = function(params)
{
	displayMessage(config.commands.upload.uploaded);
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
	var params = {server:{}};
	params.title = title;
	params.callback = config.commands.revisions.callback;
	params.popup = Popup.create(src);
	Popup.show(params.popup,false);
	var tiddler = store.fetchTiddler(title);
	tiddler.getRevisionList(title,params);
	event.cancelBubble = true;
	if(event.stopPropagation)
		event.stopPropagation();
	return true;
};

config.commands.revisions.callback = function(params)
// The revisions are returned in the params.revisions array
//# params.revisions[i].modified
//# params.revisions[i].key
{
//#displayMessage("config.commands.revisions.callback");
	if(params.popup) {
		if(params.revisions.length==0) {
			createTiddlyText(createTiddlyElement(params.popup,'li',null,'disabled'),config.commands.revisions.popupNone);
		} else {
			for(var i=0; i<params.revisions.length; i++) {
				var modified = params.revisions[i].modified;
				var key = params.revisions[i].key;
				var btn = createTiddlyButton(createTiddlyElement(params.popup,'li'),
						modified.toLocaleString(),
						config.commands.revisions.revisionTooltip,
						function() {
							displayTiddlerRevision(this.getAttribute('tiddlerTitle'),this.getAttribute('revisionKey'),this);
							return false;
							},
						'tiddlyLinkExisting tiddlyLink');
				btn.setAttribute('tiddlerTitle',params.title);
				btn.setAttribute('revisionKey',key);
				var tiddler = store.fetchTiddler(params.title);
				if(tiddler.revisionKey == key || (!tiddler.revisionKey && i==0))
					btn.className = 'revisionCurrent';
			}
		}
	}
};

} // end of 'install only once'
//}}}
