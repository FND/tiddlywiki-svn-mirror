/***
|''Name:''|UploadPluginLingoEN|
|''Description:''|English Translation|
|''Version:''|4.1.0|
|''Date:''|May 8, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#UploadPluginLingoEN|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''CoreVersion:''|2.2.0|
|''Requires:''|UploadPlugin UploadToHomeMacro|
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

merge(config.macros.uploadOptions, {
	wizardTitle: "Upload with options",
	step1Title: "These options are saved in cookies in your browser",
	step1Html: "<input type='hidden' name='markList'></input><br>",
	cancelButton: "Cancel",
	cancelButtonPrompt: "Cancel prompt",
	listViewTemplate: {
		columns: [
			{name: 'Description', field: 'description', title: "Description", type: 'WikiText'},
			{name: 'Option', field: 'option', title: "Option", type: 'String'},
			{name: 'Name', field: 'name', title: "Name", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'lowlight'} 
			]}
	});


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

merge(config.tasks,{
	uploadOptions: {text: "upload", tooltip: "Change UploadOptions and Upload", content: '<<uploadOptions>>'}
});

//}}}

//{{{
/*
 * UploadToHomeMacro Lingo
 */
if (config.macros.uploadToHome) {
	merge(config.macros.uploadToHome,{messages: {
			homeParamsTiddler: "HomeParameters",
			prompt: "Save and Upload this TiddlyWiki using parameters in  '%0' tiddler",
			tiddlerNotFound: "Tiddler %0 not found"
		}});
	merge(config.tasks,{
				uploadToHome: {text: "uploadToHome", tooltip: "Upload using '" + config.macros.uploadToHome.messages.homeParamsTiddler + "' tiddler",
				action: config.macros.uploadToHome.action}
		});
}

//}}}