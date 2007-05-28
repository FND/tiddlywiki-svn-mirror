/***
|''Name:''|UploadToHomeMacro|
|''Description:''|Save TiddlyWiki using HomeParameters tiddler|
|''Version:''|0.0.2|
|''Date:''|May 19, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#UploadToHomeMacro|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0 (#2125)|
|''Requires:''|UploadPlugin|
|''Usage:''|{{{<<uploadToHome [HomeParameters]>>}}}<br>{{{HomeParameters:}}} optional - Tiddler with upload parameters in slices (see HomeParameters).|
***/
//{{{
version.extensions.UploadToHomeMacro = {
	major: 0, minor: 0, revision: 2,
	date: new Date("May 19, 2007"),
	source: 'http://tiddlywiki.bidix.info/#UploadToHomeMacro',
	author: 'BidiX (BidiX (at) bidix (dot) info',
	coreVersion: '2.2.0 (#3125)'
};

//
// Environment
//

if (!window.bidix) window.bidix = {}; // bidix namespace
bidix.debugMode = false;	// true to activate both in Plugin and UploadService
bidix.checkPlugin("UploadPlugin", 4, 1, 0);

//
// uploadUsing Macro
//

config.macros.uploadToHome = {
	handler: function(place,macroName,params) {
		if (readOnly)
			return;
		var label;
		if (document.location.toString().substr(0,4) == "http") 
			label = config.macros.upload.label.saveLabel;
		else
			label = config.macros.upload.label.uploadLabel;
		var prompt;
		var homeParams = (params[0] ? params[0]:this.messages.homeParamsTiddler);
		if (store.tiddlerExists(homeParams) || store.isShadowTiddler(homeParams)) {
			prompt = this.messages.prompt.toString().format([homeParams]);
		} else {
			throw(this.messages.tiddlerNotFound.toString().format([homeParams]));
		}
		var prompt = this.messages.prompt.toString().format([homeParams]);
		createTiddlyButton(place, label, prompt, function() {config.macros.uploadToHome.action(homeParams);}, null, null, this.accessKey);		
	},
	
	action: function(homeParams) {
		homeParams = (homeParams ? homeParams : config.macros.uploadToHome.messages.homeParamsTiddler);
		if (!store.tiddlerExists(homeParams) && !store.isShadowTiddler(homeParams)) {
			throw(config.macros.uploadToHome.messages.tiddlerNotFound.toString().format([homeParams]));
		}
		config.macros.upload.action(config.macros.uploadToHome.getParamsFromTiddler(homeParams));
	},
	
	getParamsFromTiddler: function(tiddlerTitle) {
		tiddlerTitle = (tiddlerTitle ? tiddlerTitle:this.messages.homeParamsTiddler);
		if (!store.tiddlerExists(tiddlerTitle) && !store.isShadowTiddler(tiddlerTitle)) {
			throw(config.macros.uploadToHome.messages.tiddlerNotFound.toString().format([tiddlerTitle]));
		}
		var sliceNames = [
			"UploadStoreUrl",
			"UploadFilename",
			"UploadBackupDir",
			"UploadDir",
			"UploadUserName"
			//"UploadPassword", // no password in tiddlers
		];
		var sliceValues = store.getTiddlerSlices(tiddlerTitle,sliceNames);
		var parameters = [];
		for(var i=0; i<sliceNames.length; i++) {
			parameters.push(sliceValues[sliceNames[i]]);
		}
		return parameters;
	},
	
	messages: {
		homeParamsTiddler: "HomeParameters",
		prompt: "Save and Upload this TiddlyWiki using parameters in  '%0' tiddler",
		tiddlerNotFound: "Tiddler %0 not found"
	},
	initAtLoad: function () {
		// install Shadowed HomeParameters
		var storeUrl;
		if ((document.location.toString().substr(0,4) == "http")) 
			storeUrl = bidix.dirname(document.location.toString())+'/'+config.macros.upload.defaultStoreScript;
		else
			storeUrl = config.macros.upload.defaultStoreScript;
		var shadowedHomeParameters = (config.shadowTiddlers['HomeParameters']?config.shadowTiddlers['HomeParameters']:'');
		shadowedHomeParameters += [
			"|UploadUserName:|"+config.options['txtUploadUserName']+"|",
			"|UploadStoreUrl:|"+storeUrl+"|",
			"|UploadDir:|.|",
			"|UploadFilename:|index.html|",
			"|UploadBackupDir:||"
			].join("\n");
		merge(config.shadowTiddlers,{'HomeParameters':	shadowedHomeParameters});
		// install Backstage uploadToHome
		merge(config.tasks,{
			uploadToHome: {text: "uploadToHome", tooltip: "Upload using '" + this.messages.homeParamsTiddler + "' tiddler", action: this.action}
		});
		config.backstageTasks.push("uploadToHome");
				
	}
};

config.macros.uploadToHome.initAtLoad();

//}}}