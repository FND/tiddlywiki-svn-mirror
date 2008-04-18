/***
|''Name:''|UploadTextMacro |
|''Description:'' |Allows you to upload text strings as files to TiddlyHome |
|''Author:'' |JonLister (based heavily on Bidix's UploadToFileMacro) |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/verticals/TiddleShop/plugins/UploadTextMacro.js |
|''Dependencies:'' |TemplatePlugin, UploadPlugin |
|''Version:''|1 |
|''Date:''|25/3/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3 |

!Usage:
{{{
<<uploadText filename template>>
}}}

Parameters:
filename - the name of the file to be saved on the server
template - the name of the tiddler containing the template to be used

***/

config.macros.uploadText = {
	defaultFilename: "blog.html",
	defaultTemplate: null,
	label: "save",
	fileUploaded: "Success using %0 to upload to %1",
	fileNotUploaded: "Fail using %0 to upload to %1"
};

config.macros.uploadText.handler = function(place,macroName,params) {
		// parameters initialization
		var toFilename = params[0];
		var template = params[1];
		if (!toFilename) 
			toFilename = this.defaultFilename;
		if (!template) 
			template = this.defaultTemplate;
		config.macros.uploadText.upload(template, null, toFilename);
		return false;
};

config.macros.uploadText.upload = function(template, storeUrl, toFilename, uploadDir, backupDir, username, password) {
	config.messages.remoteFileSaved = "file successfully saved";
	config.messages.remoteFileFailed = "file save failed";

	// upload parameters initialization
	// NB: should check existence of defaults!
	storeUrl = (storeUrl ? storeUrl : config.options.txtUploadStoreUrl);
	toFilename = (toFilename ? toFilename : this.defaultFileName);
	backupDir = (backupDir ? backupDir : config.options.txtUploadBackupDir);
	uploadDir = (uploadDir ? uploadDir : config.options.txtUploadDir);
	username = (username ? username : config.options.txtUploadUserName);
	password = (password ? password :config.options.pasUploadPassword);
	
	// create string to save
	var toSave = expandTemplate(template);	

	var uploadParams = Array(storeUrl,toFilename,uploadDir,backupDir,username,password,template);
	var callback = function(status,params,responseText,url,xhr) {
		if (status) { 
			if (responseText.substring(0,1) == '0') {
				// if backupDir specified
				if ((params[3]) && (responseText.indexOf("backupfile:") > -1))  {
					var backupfile = responseText.substring(responseText.indexOf("backupfile:")+11,
						responseText.indexOf("\n", responseText.indexOf("backupfile:")));
					displayMessage(bidix.upload.messages.backupSaved,bidix.dirname(url)+'/'+backupfile);
				}
				var destfile = responseText.substring(responseText.indexOf("destfile:")+9,
					responseText.indexOf("\n", responseText.indexOf("destfile:")));
				if (destfile.substring(0,2) == './') 
					destfile = destfile.substring(2);
				displayMessage(config.macros.uploadText.fileUploaded.format([params[6],destfile]),
					bidix.dirname(url)+'/'+destfile);
			} else {
				alert(responseText);
				displayMessage(config.macros.uploadText.fileNotUploaded.format([params[1]]));
			}
		} else {
			displayMessage("HTTP Error " + xhr.status + " in accessing " + url);
		}
	};
	return bidix.upload.httpUpload(uploadParams,convertUnicodeToUTF8(toSave),callback,uploadParams);
};
