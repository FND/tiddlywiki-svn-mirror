/***
|''Name:''|ToCore|
|''Description:''|Candidates for moving into TiddlyWiki core|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|None|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/ToCore.js|
|''Version:''|0.2.0|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.ToCore) {
version.extensions.ToCore = {installed:true};

//# change in Utilities.js
//# onClickTiddlerLink has been tweeked to get missing links from host
function onClickTiddlerLink(e)
{
	if(!e) e = window.event;
	var theTarget = resolveTarget(e);
	var theLink = theTarget;
	var title = null;
	var fields = null;
	do {
		title = theLink.getAttribute("tiddlyLink");
		fields = theLink.getAttribute("tiddlyFields");
		theLink = theLink.parentNode;
	} while(title == null && theLink != null);
	if(!fields && !store.isShadowTiddler(title))
		fields = store.getDefaultCustomFields();
	if(title) {
		var toggling = e.metaKey || e.ctrlKey;
		if(config.options.chkToggleLinks)
			toggling = !toggling;
		var opening;
		if(toggling && document.getElementById("tiddler" + title)) {
			story.closeTiddler(title,true,e.shiftKey || e.altKey);
		} else {
			story.displayTiddler(theTarget,title,null,true,e.shiftKey || e.altKey,fields);
			if(fields) {
				var tiddlerElem = document.getElementById(story.idPrefix + title);
				tiddlerElem.setAttribute("tiddlyFields",fields);
				if(!store.tiddlerExists(title))
					store.getMissingTiddler(title,convertCustomFieldsToHash(fields));
			}
		}
	}
	clearMessage();
	return false;
}

function createTiddlyLink(place,title,includeText,theClass,isStatic,linkedFromTiddler,link)
{
	var text = includeText ? title : null;
	var i = getTiddlyLinkInfo(title,theClass);
	var btn = isStatic ? createExternalLink(place,"#" + title) : createTiddlyButton(place,text,i.subTitle,onClickTiddlerLink,i.classes);
	btn.setAttribute("refresh","link");
	btn.setAttribute("tiddlyLink",link ? link : title);
	if(linkedFromTiddler) {
		var fields = linkedFromTiddler.getInheritedFields();
		if(fields) {
			btn.setAttribute("tiddlyFields",fields);
		}
	}
	return btn;
}

config.macros.newTiddler.createNewTiddlerButton = function(place,title,params,label,prompt,accessKey,newFocus,isJournal)
{
	var tags = [];
	for(var t=1; t<params.length; t++) {
		if((params[t].name == "anon" && t != 1) || (params[t].name == "tag"))
			tags.push(params[t].value);
	}
	label = getParam(params,"label",label);
	prompt = getParam(params,"prompt",prompt);
	accessKey = getParam(params,"accessKey",accessKey);
	newFocus = getParam(params,"focus",newFocus);
	var customFields = getParam(params,"fields");
	if(!customFields && !store.isShadowTiddler(title))
		customFields = store.getDefaultCustomFields();
	var btn = createTiddlyButton(place,label,prompt,this.onClickNewTiddler,null,null,accessKey);
	btn.setAttribute("newTitle",title);
	btn.setAttribute("isJournal",isJournal);
	btn.setAttribute("params",tags.join("|"));
	btn.setAttribute("newFocus",newFocus);
	btn.setAttribute("newTemplate",getParam(params,"template",DEFAULT_EDIT_TEMPLATE));
	btn.setAttribute("customFields",customFields);
	var text = getParam(params,"text");
	if(text !== undefined) 
		btn.setAttribute("newText",text);
	return btn;
};

//# change in config.js
// function redirectors
config.adaptor = {};

//#
//# changes in TiddlyWiki.js
//#

//# Set default customFields in "field:value;field2:value2;" format
TiddlyWiki.prototype.setDefaultCustomFields = function(fields)
{
	this.defaultCustomFields = fields;
};

//# Return default customFields in "field:value;field2:value2;" format
TiddlyWiki.prototype.getDefaultCustomFields = function()
{
	return this.defaultCustomFields;
};

TiddlyWiki.prototype.getMissingTiddler = function(title,fields)
{
//#displayMessage("getMissingTiddler:"+title);
	var tiddler = new Tiddler(title);
	tiddler.fields = fields;
	return tiddler.callAdaptorFunction('getTiddler');
};

TiddlyWiki.prototype.getHostedTiddler = function(title)
{
//#displayMessage("getHostedTiddler:"+title);
	var tiddler = this.fetchTiddler(title);
	if(!tiddler) {
		tiddler = new Tiddler(title);
		tiddler.fields = convertCustomFieldsToHash(document.getElementById(story.idPrefix + title).getAttribute("tiddlyFields"));
	}
	return tiddler.callAdaptorFunction('getTiddler');
};

TiddlyWiki.prototype.putHostedTiddler = function(title,callback)
{
//#displayMessage("putHostedTiddler:"+title);
	var tiddler = this.fetchTiddler(title);
	if(!tiddler)
		return false;
	if(!tiddler.temp)
		tiddler.temp = {};
	tiddler.temp.callback = callback;
	return tiddler.callAdaptorFunction('putTiddler');
};

//#
//# changes in Tiddler.js follow
//#

//# Convenience wrapper to call an adaptor function
Tiddler.prototype.callAdaptorFunction = function(fnName)
{
//#displayMessage("callAdaptorFunction:"+fnName);
	var ret = false;
	var serverType = this.getServerType();
	if(!serverType || !this.fields['server.host'])
		return ret;
	var adaptor = new config.adaptor[serverType];
	if(adaptor) {
		adaptor.openHost(this.fields['server.host']);
		adaptor.openWorkspace(this.fields['server.workspace']);
		ret = adaptor[fnName](this);
		adaptor.close();
		delete adaptor;
	}
	return ret;
};

//# Get the server type used. If there is no server.type field, infer it from the
//# wikiformat. If no wikiformat use the Format tag to infer the server type.
Tiddler.prototype.getServerType = function()
{
	var serverType = this.fields['server.type'];
	if(!serverType)
		serverType = this.fields['wikiformat'];
	for(i in config.parsers) {
		var format = config.parsers[i].format;
		if(this.isTagged(format+'Format')) {
			serverType = format;
			break;
		}
	}
	return serverType ? serverType.toLowerCase() : null;
};

Tiddler.prototype.updateAndSave = function()
{
//#displayMessage("updateAndSave:"+tiddler.title);
	var downloaded = new Date();
	if(!this.created)
		this.created = downloaded;
	if(!this.modified)
		this.modified = this.created;
	if(!this.modifier)
		this.modifier = this.serverHost;
	this.fields['downloaded'] = downloaded.convertToYYYYMMDDHHMM();
	this.fields['changecount'] = -1;
	store.saveTiddler(this.title,this.title,this.text,this.modifier,this.modified,this.tags,this.fields);
	if(config.options.chkAutoSave)
		saveChanges();
};

} // end of 'install only once'
//}}}
