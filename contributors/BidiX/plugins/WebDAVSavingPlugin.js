/***
|''Name:''|WebDAVSavingPlugin|
|''Description:''|Saves on a WebDAV server without the need of any ServerSide script.<br>When TiddlyWiki is accessed over http, this plugin permits to save back to the server, using http PUT.|
|''Version:''|0.1.0|
|''Date:''|Feb 17, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#WebDAVSavingPlugin|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0 (Changeset 1583)|
|''Browser:''|http://www.tiddlywiki.com/#browsers|
|''Limitation:''|For now, backup folder must exist|
***/
//{{{
version.extensions.WebDAVSavingPlugin = {
	major: 0, minor: 1, revision: 0, 
	date: new Date(2007,17,1),
	source: 'http://tiddlywiki.bidix.info/#WebDAVSavingPlugin',
	author: 'BidiX (BidiX (at) bidix (dot) info',
	license: '[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D]]',
	coreVersion: '2.2.0 (Changeset 1316)',
	browser: 'Firefox 1.5; InternetExplorer 6.0; Safari'	
};

if (!window.bidix) window.bidix = {};
bidix.WebDAVSaving = {
	orig_saveChanges: saveChanges,
	defaultFilename: 'index.html',
	messages: {
		loadOriginalHttpDavError: "loadOriginalHttpDavError",
		notHTTPUrlError: "notHTTPUrlError",
		aboutToSaveOnHttpDav: 'About to save on %0 ...'		
	}
};

// Save this tiddlywiki with the pending changes
saveChanges = function(onlyIfDirty,tiddlers)
{
	var originalPath = document.location.toString();
	if (originalPath.substr(0,5) == "file:")
		return bidix.WebDAVSaving.orig_saveChanges(onlyIfDirty,tiddlers);
	else
		return bidix.WebDAVSaving.saveChanges(onlyIfDirty,tiddlers);
}


bidix.WebDAVSaving.saveChanges = function(onlyIfDirty,tiddlers)
{
	if(onlyIfDirty && !store.isDirty())
		return;
	clearMessage();
	// get original
	var callback = function(status,params,original,url,xhr) {
		if (!status) {
			displayMessage(config.messages.loadOriginalHttpDavError);
			return;
		}
		url = (url.indexOf("nocache=") < 0 ? url : url.substring(0,url.indexOf("nocache=")-1));
		// Locate the storeArea div's 
		var posDiv = locateStoreArea(original);
		if((posDiv[0] == -1) || (posDiv[1] == -1)) {
			alert(config.messages.invalidFileError.format([localPath]));
			return;
		}
		bidix.WebDAVSaving.saveBackup(params,original,posDiv);
	};
	var originalPath = document.location.toString();
	// Check we were loaded from a HTTP or HTTPS URL
	if(originalPath.substr(0,4) != "http")
		{
		alert(bidix.WebDAVSaving.messages.notHTTPUrlError);
		return;
		}	
	//FIXME: If url is a directory not sure we always could add index.html !
	if (originalPath.charAt(originalPath.length-1) == "/")
		originalPath = originalPath + bidix.WebDAVSaving.defaultFilename;
	displayMessage(bidix.WebDAVSaving.messages.aboutToSaveOnHttpDav.format([originalPath]));
	loadRemoteFile(originalPath,callback,originalPath);
};

// if backupFolder is used, for now backupFolder must exist 
bidix.WebDAVSaving.saveBackup = function(url,original,posDiv)
{
	var callback = function(status,params,responseText,url,xhr) {
		if (!status) {
			displayMessage(config.messages.backupFailed);
			return;
		}
		url = (url.indexOf("nocache=") < 0 ? url : url.substring(0,url.indexOf("nocache=")-1));
		displayMessage(config.messages.backupSaved,url);
		bidix.WebDAVSaving.saveRss(params[0],params[1],params[2]);
	};
	if(config.options.chkSaveBackups) {
		var backupPath = getBackupPath(url);
		bidix.httpPut(backupPath,original,callback,Array(url,original,posDiv));
	} else {
		bidix.WebDAVSaving.saveRss(url,original,posDiv);
	}
}

bidix.WebDAVSaving.saveRss = function(url,original,posDiv) 
{
	var callback = function(status,params,responseText,url,xhr) {
		if (!status) {
			displayMessage(config.messages.rssFailed);
			return;
		}
		url = (url.indexOf("nocache=") < 0 ? url : url.substring(0,url.indexOf("nocache=")-1));
		displayMessage(config.messages.rssSaved,url);
		bidix.WebDAVSaving.saveEmpty(params[0],params[1],params[2]);
	};
	if(config.options.chkGenerateAnRssFeed) {
		var rssPath = url.substr(0,url.lastIndexOf(".")) + ".xml";
		bidix.httpPut(rssPath,convertUnicodeToUTF8(generateRss()),callback,Array(url,original,posDiv));
	} else {
		bidix.WebDAVSaving.saveEmpty(url,original,posDiv);
	}
}

// Is empty.html still usefull ?
bidix.WebDAVSaving.saveEmpty = function(url,original,posDiv) 
{
	var callback = function(status,params,responseText,url,xhr) {
		if (!status) {
			displayMessage(config.messages.emptyFailed);
			return;
		}
		url = (url.indexOf("nocache=") < 0 ? url : url.substring(0,url.indexOf("nocache=")-1));
		displayMessage(config.messages.emptySaved,url);
		bidix.WebDAVSaving.saveMain(params[0],params[1],params[2]);
	};
	if(config.options.chkSaveEmptyTemplate) {
		var emptyPath,p;
		if((p = url.lastIndexOf("/")) != -1)
			emptyPath = url.substr(0,p) + "/empty.html";
		else
			emptyPath = url + ".empty.html";
		var empty = original.substr(0,posDiv[0] + startSaveArea.length) + original.substr(posDiv[1]);
		bidix.httpPut(emptyPath,empty,callback,Array(url,original,posDiv));
	} else {
		bidix.WebDAVSaving.saveMain(url,original,posDiv);
	}
}

bidix.WebDAVSaving.saveMain = function(url,original,posDiv) 
{
	var callback = function(status,params,responseText,url,xhr) {
		if(status) {
			url = (url.indexOf("nocache=") < 0 ? url : url.substring(0,url.indexOf("nocache=")-1));
			displayMessage(config.messages.mainSaved,url);
			store.setDirty(false);
		} else 
			alert(config.messages.mainFailed);
	};	
	// Save new file
	var revised = updateOriginal(original,posDiv);
	bidix.httpPut(url,revised,callback,null);
}

bidix.httpPut = function(url,data,callback,params)
{
	var r = doHttp("PUT",url,data,null,null,null,callback,params,null);
	if (typeof r == "string")
		displayMessage(r);
	return r;
}
//}}}