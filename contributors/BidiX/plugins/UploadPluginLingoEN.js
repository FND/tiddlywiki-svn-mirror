/***
|''Name:''|UploadPluginLingoEN|
|''Description:''|English Translation|
|''Version:''|4.0.0|
|''Date:''|Mar 2, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#UploadPluginLingoEN|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0 (Changeset 1583)|
|''Require:''|[[UploadPlugin V4.0.0|http://tiddlywiki.bidix.info/#PasswordOptionPlugin]]<br>[[UploadService|http://tiddlywiki.bidix.info/#UploadPlugin]]|
***/
//{{{
config.macros.upload.label = {
	promptOption: "Save and Upload this TiddlyWiki with UploadOptions",
	promptParamMacro: "Save and Upload this TiddlyWiki in %0",
	saveLabel: "save to web", 
	saveToDisk: "save to disk",
	uploadLabel: "upload"	
};

config.macros.upload.messages = {
	noStoreUrl: "No store URL in parmeters or options",
	usernameOrPasswordMissing: "Username or password missing"
};

bidix.upload.messages = {
	//from saving
	invalidFileError: "The original file '%0' does not appear to be a valid TiddlyWiki",
	backupSaved: "Backup uploaded",
	backupFailed: "Failed to upload backup file",
	rssSaved: "RSS feed uploaded",
	rssFailed: "Failed to upload RSS feed file",
	emptySaved: "Empty template uploaded",
	emptyFailed: "Failed to upload empty template file",
	mainSaved: "Main TiddlyWiki file uploaded",
	mainFailed: "Failed to upload main TiddlyWiki file. Your changes have not been saved",
	//specific upload
	loadOriginalHttpPostError: "Can't get original file",
	aboutToSaveOnHttpPost: 'About to upload on %0 ...',
	storePhpNotFound: "The store script '%0' was not found."
};
//}}}