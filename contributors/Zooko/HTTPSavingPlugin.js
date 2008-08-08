/***
|''Name''|HTTPSavingPlugin|
|''Description''|<...>|
|''Author''|Zooko|
|''Contributors''|<...>|
|''Version''|<...>|
|''Date''|<...>|
|''Status''|@@experimental@@|
|''Source''|<...>|
|''CodeRepository''|<...>|
|''Copyright''|<...>|
|''License''|<...>|
|''CoreVersion''|<...>|
|''Requires''|<...>|
|''Overrides''|<...>|
|''Feedback''|<...>|
|''Documentation''|<...>|
|''Keywords''|<...>|
!Description
<...>
!Notes
<...>
!Usage
{{{
<<sampleMacro>>
}}}
!!Parameters
<...>
!!Examples
<<sampleMacro>>
!Configuration Options
<...>
!Revision History
!!v<#.#> (<yyyy-mm-dd>)
* <...>
!To Do
<...>
!Code
***/
//{{{
readOnly = false;
config.options.chkHttpReadOnly = false;
showBackstage = true;

function saveTest()
{
	var s = document.getElementById("saveTest");
//	if(s.hasChildNodes())
//		alert(config.messages.savedSnapshotError);
	s.appendChild(document.createTextNode("savetest"));
}

// Save this tiddlywiki with the pending changes
function saveChanges(onlyIfDirty,tiddlers)
{
	if(onlyIfDirty && !store.isDirty())
		return;
	clearMessage();
	// Get the URL of the document
	var originalPath = getPath(document.location.toString());
	// Load the original file
	var localCallback = function(status,context,original,url,xhr) {
//		alert("whee 2 ! loaded remote file from " + originalPath + ", got callback status " + status + ", context " + context + ", url " + url + ", xhr " + xhr);
		if(original == null) {
			alert(config.messages.cantSaveError);
			if(store.tiddlerExists(config.messages.saveInstructions))
				story.displayTiddler(null,config.messages.saveInstructions);
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
	}
	var result = loadRemoteFile(originalPath, localCallback);
//alert("whee 3 got result from loadRemoteFile, result: " + result);
return true;
}

function saveBackup(localPath,original)
{
	// removed
}

function getPath(origPath)
{
	var originalPath = convertUriToUTF8(origPath,config.options.txtFileSystemCharSet);
	// Remove any location or query part of the URL
	var argPos = originalPath.indexOf("?");
	if(argPos != -1)
		originalPath = originalPath.substr(0,argPos);
	var hashPos = originalPath.indexOf("#");
	if(hashPos != -1)
		originalPath = originalPath.substr(0,hashPos);
	// Convert file://localhost/ to file:///
	if(originalPath.indexOf("file://localhost/") == 0)
		originalPath = "file://" + originalPath.substr(16);
	// Convert to a native file format
	var resultPath;
	if(originalPath.indexOf("http://") == 0) // http file
                resultPath = originalPath
	else if(originalPath.charAt(9) == ":") // pc local file
		resultPath = unescape(originalPath.substr(8)).replace(new RegExp("/","g"),"\\");
	else if(originalPath.indexOf("file://///") == 0) // FireFox pc network file
		resultPath = "\\\\" + unescape(originalPath.substr(10)).replace(new RegExp("/","g"),"\\");
	else if(originalPath.indexOf("file:///") == 0) // mac/unix local file
		resultPath = unescape(originalPath.substr(7));
	else if(originalPath.indexOf("file:/") == 0) // mac/unix local file
		resultPath = unescape(originalPath.substr(5));
	else // pc network file
		resultPath = "\\\\" + unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\\");
	return resultPath;
}

function getLocalPath(origPath)
{
	// removed
}

function saveFile(fileUrl,content,callb)
{
//	alert("whee! about to save to " + fileUrl);
	var localCallback = function(status,params,responseText,url,xhr) {
//		alert("whee! got callback status " + status + ", params " + params + ", url " + url + ", xhr " + xhr);
	}
	return doHttp('PUT',fileUrl,content,"tahoe tiddly type",null,null,localCallback);
}
//}}}
