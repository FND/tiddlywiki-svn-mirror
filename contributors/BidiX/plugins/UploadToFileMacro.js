/***
|''Name:''|UploadToFileMacro|
|''Description:''|Upload a tiddler as a file using UploadPlugin context. Used with the SimonBaird's HideWhenPlugin ViewTemplate provides a new command in the tiddler toolbar.|
|''Version:''|2.0.1|
|''Date:''|Apr 21, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#UploadToFileMacro|
|''Usage:''|{{{<<uploadTofile [filename [tiddlerTitle]]>>}}}<br>{{{tiddlerTitle, filename: if omitted the title of the current tiddler}}}|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''CoreVersion:''|2.2.0|
|''Requires:''|UploadPlugin|
***/
//{{{
version.extensions.UploadToFileMacro = {
	major: 2, minor: 0, revision: 1, 
	date: new Date("Apr 21, 2007"),
	source: 'http://tiddlywiki.bidix.info/#UploadToFilePlugin',
	author: 'BidiX (BidiX (at) bidix (dot) info',
	coreVersion: '2.2.0'
};

// require UploadPlugin 4.0.0 or better
config.macros.uploadToFile = {
	label: "upload %0 to file %1",
	prompt: "upload tiddler '%0' to file '%1' ",
	warning: "Are you sure you want to upload '%0'?",
	messages: {
		fileUploaded: "tiddler '%0' uploaded to file '%1'",
		fileNotUploaded: "tiddler '%0' NOT uploaded"
	},

	handler: function(place, macroName, params, wikifier,paramString, tiddler) {
		// parameters initialization
		var toFilename = params[0];
		var tiddlerTitle = params[1];
		if (!tiddlerTitle) { 
			tiddlerTitle = tiddler.title;
		} else {
			tiddler = store.getTiddler(tiddlerTitle);
		}
		if (!toFilename) { 
			toFilename = tiddlerTitle;
		} 
		var prompt = this.prompt.format([tiddlerTitle, toFilename]);
		createTiddlyButton(place, this.label.format([params[1], params[0]]), this.prompt.format([tiddlerTitle, toFilename]), 
			function () {
				config.macros.uploadToFile.upload(tiddler, null, toFilename); 
				return false;}, 
			null, null, null);
	},

	upload:  function(tiddler, storeUrl, toFilename, uploadDir, backupDir, username, password) {
		if (!tiddler)	{
			alert("Tiddler not found.");
			return false;
		}
		var uploadIt = true; 
		if ((this.warning) && (!confirm(this.warning.format([tiddler.title])))) 
			return false;
		// parameters initialization
		storeUrl = (storeUrl ? storeUrl : config.options.txtUploadStoreUrl);
		toFilename = (toFilename ? toFilename : tiddler.title);
		backupDir = (backupDir ? backupDir : config.options.txtUploadBackupDir);
		uploadDir = (uploadDir ? uploadDir : config.options.txtUploadDir);
		username = (username ? username : config.options.txtUploadUserName);
		password = (password ? password :config.options.pasUploadPassword);
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
					displayMessage(config.macros.uploadToFile.messages.fileUploaded.format([params[6],destfile]),
						bidix.dirname(url)+'/'+destfile);
				} else {
					alert(responseText);
					displayMessage(config.macros.uploadToFile.messages.fileNotUploaded.format([params[1]]));
				}
			} else {
				displayMessage("HTTP Error " + xhr.status + " in accessing " + url);
			}
		};
		var uploadParams = Array(storeUrl,toFilename,uploadDir,backupDir,username,password, tiddler.title);
		return bidix.upload.httpUpload(uploadParams,tiddler.text,callback,uploadParams);
		
	}
};

bidix.checkPlugin = function(plugin, major, minor, revision) {
	var ext = version.extensions[plugin];
	if (!
		(ext  && 
			((ext.major > major) || 
			((ext.major == major) && (ext.minor > minor))  ||
			((ext.major == major) && (ext.minor == minor) && (ext.revision >= revision))))) {
			// write error in PluginManager
			if (pluginInfo)
				pluginInfo.log.push("Requires " + plugin + " " + major + "." + minor + "." + revision);
			eval(plugin); // generate an error : "Error: ReferenceError: xxxx is not defined"
	}
};

//
// Initializations
//

// require PasswordOptionPlugin 1.0.1 or better
bidix.checkPlugin("UploadPlugin", 4, 0, 0);

//}}}