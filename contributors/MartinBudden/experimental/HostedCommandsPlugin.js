/***
|''Name:''|HostedCommandsPlugin|
|''Description:''|Commands to access hosted TiddlyWiki data|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/martinsprereleases.html#HostedCommandsPlugin|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental|
|''Version:''|0.0.7|
|''Date:''|Dec 30, 2006|
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

function onClickTiddlerLink(e)
{
	if (!e) e = window.event;
	var theTarget = resolveTarget(e);
	var theLink = theTarget;
	var title = null;
	var fields = null;
	do {
		title = theLink.getAttribute("tiddlyLink");
		fields = theLink.getAttribute("tiddlyFields");
		theLink = theLink.parentNode;
	} while(title == null && theLink != null);
//#displayMessage("lft0:"+linkedFromTitle);
	if(title) {
		var toggling = e.metaKey || e.ctrlKey;
		if(config.options.chkToggleLinks)
			toggling = !toggling;
		var opening;
		if(toggling && document.getElementById("tiddler" + title)) {
			//#displayMessage("oncTitle:"+title);
			story.closeTiddler(title,true,e.shiftKey || e.altKey);
		} else {
			//#var template = store.fetchTiddler(title) ? null : DEFAULT_EDIT_TEMPLATE;
			//#story.displayTiddler(theTarget,title,template,true,e.shiftKey || e.altKey,fields);
			story.displayTiddler(theTarget,title,null,true,e.shiftKey || e.altKey,fields);
			if(fields) {
				var tiddlerElem = document.getElementById(story.idPrefix + title);
				tiddlerElem.setAttribute("tiddlyFields",fields);
				//#var tiddler = store.getTiddler(title)
				//#tiddler.fields = convertCustomFieldsToHash(fields);
				//#displayMessage("tt:"+tiddler.fields["wikiformat"]);
			}
			if(nexus && !store.tiddlerExists(title))
				nexus.getMissingPage(title);
		}
	}
	//#clearMessage();
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
	return nexus.isFunctionSupported('getPage',tiddler);
};

config.commands.download.handler = function(event,src,title)
{
//#displayMessage("config.commands.getPage.handler:"+title);
	nexus.getPage(title);
};

// upload command definition
config.commands.upload = {};
merge(config.commands.upload,{
	text: "upload",
	tooltip: "Upload this tiddler",
	readOnlyText: "upload",
	readOnlyTooltip: "Upload this tiddler"});

config.commands.upload.isEnabled = function(tiddler)
{
	if(tiddler && tiddler.isTouched() && nexus.isFunctionSupported('putPage',tiddler))
		return true;
	return false;
};

config.commands.upload.handler = function(event,src,title)
{
//#displayMessage("config.commands.putPage.handler:"+title);
	nexus.putPage(title);
};

// revisions command definition
config.commands.revisions = {};
merge(config.commands.revisions,{
	text: "revisions",
	tooltip: "View another revision of this tiddler",
	revisionTooltip: "View this revision",
	popupNone: "No revisions"});

config.commands.revisions.isEnabled = function(tiddler)
{
	return nexus.isFunctionSupported('getPageRevisionList',tiddler);
};

config.commands.revisions.handler = function(event,src,title)
{
	var params = {};
	params.title = title;
	params.popup = Popup.create(src);
	Popup.show(params.popup,false);
	params.callback = config.commands.revisions.callback;
	nexus.getPageRevisionList(title,params);
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
			createTiddlyText(createTiddlyElement(params.popup,"li",null,"disabled"),config.commands.revisions.popupNone);
		} else {
			for(var i=0; i<params.revisions.length; i++) {
				var modified = params.revisions[i].modified;
				var key = params.revisions[i].key;
				var btn = createTiddlyButton(createTiddlyElement(params.popup,"li"),
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
