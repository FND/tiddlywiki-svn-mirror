/***
|''Name''|HTTPSavingPlugin|
|''Description''|<...>|
|''Author''|Zooko|
|''Contributors''|FND|
|''Version''|0.1.2|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/Zooko/HTTPSavingPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/Zooko/HTTPSavingPlugin.js|
|''License''|<...>|
|''Keywords''|<...>|
!Description
<...>
!Notes
This plugin is being developed for [[Tiddly on Tahoe|http://allmydata.org/trac/tiddly_on_tahoe]].
!Revision History
!!v0.1 (2008-08-08)
* initial release
!To Do
* optional logging (retaining link to previous versions)
!Code
***/
//{{{
if(!version.extensions.HTTPSavingPlugin) { //# ensure that the plugin is only installed once
version.extensions.HTTPSavingPlugin = { installed: true };

readOnly = false;
config.options.chkHttpReadOnly = false;
showBackstage = true;

saveTest = function() {
	var s = document.getElementById("saveTest");
	/*if(s.hasChildNodes()) {
		alert(config.messages.savedSnapshotError);
	}*/
	s.appendChild(document.createTextNode("savetest"));
};

// Save this TiddlyWiki with the pending changes
saveChanges = function(onlyIfDirty,tiddlers) {
	if(onlyIfDirty && !store.isDirty()) {
		return;
	}
	clearMessage();
	// Get the URL of the document
	var originalPath = getPath(document.location.toString());
	// Load the original file
	var localCallback = function(status,context,original,url,xhr) {
		//log("loaded remote file from ", originalPath);
		/*log("got callback status ", status, "\n", context: ", context, "\n",
			URL: ", url, "\n", XHR: ", xhr);*/
		if(original === null) {
			alert(config.messages.cantSaveError);
			if(store.tiddlerExists(config.messages.saveInstructions)) {
				story.displayTiddler(null,config.messages.saveInstructions);
			}
			return;
		}
		// Locate the storeArea div's
		var posDiv = locateStoreArea(original);
		if(!posDiv) {
			alert(config.messages.invalidFileError.format([originalPath]));
			return;
		}
		saveRss(originalPath);
		saveEmpty(originalPath,original,posDiv);
		saveMain(originalPath,original,posDiv);
	};
	var result = loadRemoteFile(originalPath, localCallback);
	//log("result from loadRemoteFile: ", result);
	return true;
};

// override and disable saveBackup()
saveBackup = function(localPath,original) {};

// override and disable getLocalPath()
getLocalPath = function(origPath) {};

// override getPath()
getPath = function(origPath) {
	var originalPath = convertUriToUTF8(origPath,config.options.txtFileSystemCharSet);
	// Remove any location or query part of the URL
	var argPos = originalPath.indexOf("?");
	if(argPos != -1) {
		originalPath = originalPath.substr(0,argPos);
	}
	var hashPos = originalPath.indexOf("#");
	if(hashPos != -1) {
		originalPath = originalPath.substr(0,hashPos);
	}
	// Convert file://localhost/ to file:///
	if(originalPath.indexOf("file://localhost/") === 0) {
		originalPath = "file://" + originalPath.substr(16);
	}
	// Convert to a native file format
	var resultPath;
	if(originalPath.indexOf("http://") === 0) { // HTTP file
		resultPath = originalPath;
	} else if(originalPath.charAt(9) == ":") { // PC local file
		resultPath = unescape(originalPath.substr(8)).replace(new RegExp("/","g"),"\\");
	} else if(originalPath.indexOf("file://///") === 0) { // Firefox PC network file
		resultPath = "\\\\" + unescape(originalPath.substr(10)).replace(new RegExp("/","g"),"\\");
	} else if(originalPath.indexOf("file:///") === 0) { // *nix local file
		resultPath = unescape(originalPath.substr(7));
	} else if(originalPath.indexOf("file:/") === 0) { // *nix local file
		resultPath = unescape(originalPath.substr(5));
	} else { // PC local file
		resultPath = "\\\\" + unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\\");
	}
	return resultPath;
};

// override saveFile()
saveFile = function(fileUrl,content,callb) {
	//alert("whee! about to save to " + fileUrl);
	var localCallback = function(status,params,responseText,url,xhr) {
		//alert("whee! got callback status " + status + ", params " + params + ", url " + url + ", xhr " + xhr);
	};
	return doHttp('PUT',fileUrl,content,"tahoe tiddly type",null,null,localCallback);
};

} //# end of "install only once"
//}}}
