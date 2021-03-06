/***
|''Name:''|TiddlyWebAutoSavePlugin|
|''Description:''|Auto Save using the TiddlyWebAdaptorPlugin|
|''Author:''|Chris Dent (cdent (at) peermore (dot) com)|
|''Source:''|n/a|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/ChrisDent/....|
|''Version:''|0.0.1|
|''Status:''|Under Development|
|''Date:''|Mar 25, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''||
|''~CoreVersion:''||
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.TiddlyWebAutoSavePlugin) {
version.extensions.TiddlyWebAutoSavePlugin = {installed:true};


function TiddlyWebAutoSave()
{
    return this;
}


TiddlyWebAutoSave.putCallback = function(context, userParams)
{
    tiddler = context.tiddler;
    if (context.status) {
        displayMessage('Saved ' + tiddler.title + ' to '+context.uri);
        tiddler.clearChangeCount();
    } else {
        displayMessage('Error Saving ' + tiddler.title + ' ' + context.statusText);
        tiddler.incChangeCount();
    }
};

TiddlyWebAutoSave.put = function(tiddler,fields) {
	if(config.options.chkAutoSave) {
		var adaptor = new config.adaptors['tiddlyweb'];
	
		// put the tiddler and deal with callback
		context = {};
		if(config.options.txtUserName) {
			// bad hack to help with ease of demoing multiple workbooks at once
			fields['server.bag']=config.options.txtUserName;
		}
		tiddler.fields = fields;
		context.tiddler = tiddler;
		context.workspace = fields['server.workspace'];
		req = adaptor.putTiddler(tiddler, context, {}, TiddlyWebAutoSave.putCallback);
		return req ? tiddler : false;
	} else {
		return tiddler;
	}
};

// override save and write content to net immediately when done
// based on ccTiddly serverside.js
TiddlyWiki.prototype.orig_saveTiddler = TiddlyWiki.prototype.saveTiddler;         //hijack
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created)
{
    var tiddler = this.fetchTiddler(title);
    tiddler = store.orig_saveTiddler(title,newTitle,newBody,modifier,modified,tags,fields,false,created);
	if(tiddler.modifier==config.options.txtUserName) {
		if(config.options.chkTCCheckForUpdates) {
			TCQueue.add(function() { TiddlyWebAutoSave.put(tiddler,fields); });
		} else {
			TiddlyWebAutoSave.put(tiddler,fields);
		}
	}
};

} //# end of 'install only once'
//}}}
