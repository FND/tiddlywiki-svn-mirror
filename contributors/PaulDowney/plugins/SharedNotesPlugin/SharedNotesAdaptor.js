/***
|''Name:''|SharedNotesAdaptor|
|''Description:''|Adaptor to parse SharedNotes RSS 2.0 feeds|
|''Author''|Paul Downey|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SharedNotes|
|''Version:''|0.1.7|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|

***/

//{{{
if(!version.extensions.SharedNotesAdaptorPlugin) {
version.extensions.SharedNotesAdaptorPlugin = {installed:true};

function SharedNotesAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

/*
 *  parse SharedNotes RSS feed into tiddlers
 */
SharedNotesAdaptor.parse = function(responseText,modifier)
{
	log("parsing RSS from ",modifier);
	var tiddlers = [];

	// hack to work around patchy support for namespaces
	responseText = responseText.replace(/tw:wikitext/g,"wikitext");

	var r =  getXML(responseText);
	if (!r){
		log("no RSS XML to parse for ",modifier);
		return tiddlers;
	}

	t = r.getElementsByTagName('item');
	for(i=0;i<t.length;i++) {
		var node = t[i];
		var title = getFirstElementByTagNameValue(node, "title","");
		var text = getFirstElementByTagNameValue(node, "wikitext","","http://tiddlywiki.com/");

		//skip updating this tiddler is the user is currently editting.
		var tid = story.getTiddler(title);
		var editMode = false;
		if(tid) {
			template = tid.getAttribute('template');
			editMode = template.indexOf('Edit') != -1;
		}	
		if(editMode){
			log("Move on to the next - we are editing");
			continue;
		}
			
		// only create a tiddler if it will contain text
		if(text && text.length > 0) {
			if(!modifier){
				modifier = getFirstElementByTagNameValue(node, "author",undefined);
			}
			var pubDate = getFirstElementByTagNameValue(node, "pubDate",undefined);
			var tags = (modifier == config.options.txtSharedNotesUserName)?"notes":"discovered_notes";

			// title is "{session_id} from {user}"
			var fields = {};
			fields.rr_session_id = title.replace(/ from.*$/,"");

			var modified = new Date(pubDate);
			var created = modified;

			var tiddler = new Tiddler();
			tiddler.assign(title,text,modifier,modified,tags,created,fields);
			tiddlers.push(tiddler);
			log("tiddler:",tiddler );
		} else {
			log("Skipping blank note: " + title);
		}
	}
	return tiddlers;
};



SharedNotesAdaptor.serverType = 'sharednotes';
SharedNotesAdaptor.serverParsingErrorMessage = "Error parsing result from server";
SharedNotesAdaptor.errorInFunctionMessage = "Error in function SharedNotesAdaptor.%0";
SharedNotesAdaptor.emptyFeed = "";

SharedNotesAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = SharedNotesAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

SharedNotesAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	return host;
};

SharedNotesAdaptor.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

SharedNotesAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = host;
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {context.callback(context,userParams);},10);
	return true;
};

SharedNotesAdaptor.loadTiddlyWikiCallback = function(status,context,responseText,url,xhr)
{
	log("Context",context);
	context.status = status;
	context.count = 0;
	if(!status) {
		context.statusText = "Error getting notes file";
	} else {
		var tiddlers = SharedNotesAdaptor.parse(responseText,context.userCallbackParams);
		context.adaptor.store = new TiddlyWiki();
		for(var i=0;i<tiddlers.length;i++) {
			context.adaptor.store.addTiddler(tiddlers[i]);		
		}
	}
	if (context.complete)
	    context.complete(context,context.userParams);
};

SharedNotesAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.workspaces = [{title:"(default)"}];
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

SharedNotesAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

SharedNotesAdaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
{
	context = this.setContext(context,userParams,callback);
	if(!context.filter)
		context.filter = filter;
	context.complete = SharedNotesAdaptor.getTiddlerListComplete;
	if(this.store) {
		var ret = context.complete(context,context.userParams);
	} else {
		ret = doHttp('GET',context.host,null,null,null,null,SharedNotesAdaptor.loadTiddlyWikiCallback,context,{},true);
		if(typeof ret != "string")
			ret = true;
	}
	return ret;
};

SharedNotesAdaptor.getTiddlerListComplete = function(context,userParams)
{
	if(context.status) {
		if(context.filter) {
			context.tiddlers = context.adaptor.store.filterTiddlers(context.filter);
		} else {
			context.tiddlers = [];
			context.adaptor.store.forEachTiddler(function(title,tiddler) {context.tiddlers.push(tiddler);});
		}
		for(var i=0; i<context.tiddlers.length; i++) {
			context.tiddlers[i].fields['server.type'] = SharedNotesAdaptor.serverType;
			context.tiddlers[i].fields['server.host'] = SharedNotesAdaptor.minHostName(context.host);
			context.tiddlers[i].fields['server.page.revision'] = context.tiddlers[i].modified.convertToYYYYMMDDHHMM();
		}
		context.status = true;
	}
	if(context.callback) {
		window.setTimeout(function() {context.callback(context,userParams);},10);
	}
	return true;
};

SharedNotesAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	info.uri = tiddler.fields['server.host'] + "#" + tiddler.title;
	return info;
};

SharedNotesAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.complete = SharedNotesAdaptor.getTiddlerComplete;
	return context.adaptor.store ?
		context.complete(context,context.userParams) :
		alert(context.host); //loadRemoteFile(context.host,SharedNotesAdaptor.loadTiddlyWikiCallback,context);
};

SharedNotesAdaptor.getTiddlerComplete = function(context,userParams)
{
	var t = context.adaptor.store.fetchTiddler(context.title);
	t.fields['server.type'] = SharedNotesAdaptor.serverType;
	t.fields['server.host'] = SharedNotesAdaptor.minHostName(context.host);
	t.fields['server.page.revision'] = t.modified.convertToYYYYMMDDHHMM();
	context.tiddler = t;
	context.status = true;
	if(context.allowSynchronous) {
		context.isSynchronous = true;
		context.callback(context,userParams);
	} else {
		window.setTimeout(function() {context.callback(context,userParams);},10);
	}
	return true;
};

SharedNotesAdaptor.prototype.close = function()
{
	delete this.store;
	this.store = null;
};

config.adaptors[SharedNotesAdaptor.serverType] = SharedNotesAdaptor;

} //# end of 'install only once'
//}}}
