/***
|''Name:''|UploadPluginLingoEN|
|''Description:''|English Translation|
|''Version:''|4.0.2|
|''Date:''|Apr 21, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#UploadPluginLingoEN|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''CoreVersion:''|2.2.0|
|''Requires:''|UploadPlugin|
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
	backupSaved: "Backup saved on web",
	backupFailed: "Failed to save backup file on web",
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

merge(config.optionsDesc,{
	txtUploadStoreUrl: "Url of the UploadService script (default: store.php)",
	txtUploadFilename: "Filename of the uploaded file (default: in index.html)",
	txtUploadDir: "Relative Directory where to store the file (default: . (downloadService directory))",
	txtUploadBackupDir: "Relative Directory where to backup the file. If empty no backup. (default: ''(empty))",
	txtUploadUserName: "Upload Username",
	pasUploadPassword: "Upload Password",
	chkUploadLog: "do Logging in UploadLog (default: true)",
	txtUploadLogMaxLine: "Maximum of lines in UploadLog (default: 10)"
});

//}}}