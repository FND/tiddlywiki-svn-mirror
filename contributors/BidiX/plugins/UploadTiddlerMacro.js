/***
|''Name:''|UploadTiddlerMacro|
|''Description:''|Define a macro to upload a tiddler using UploadTiddlerPlugin (see UploadTiddlerPlugin for details).|
|''Version:''|1.0.0|
|''Date:''|2008-09-30|
|''Source:''|http://tiddlywiki.bidix.info/#UploadToFileMacro|
|''Usage:''|{{{<<uploadTiddler [tiddlerTitle]>>}}}<br>{{{tiddlerTitle: if omitted the title of the current tiddler}}}|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''CoreVersion:''|2.2.0|
|''Requires:''|UploadTiddlerPlugin|
***/
//{{{
version.extensions.UploadTiddlerMacro = {
	major: 1, minor: 0, revision: 0, 
	date: new Date("2008-09-30"),
	source: 'http://tiddlywiki.bidix.info/#UploadTiddlerMacro',
	author: 'BidiX (BidiX (at) bidix (dot) info',
	coreVersion: '2.2.0'
};

config.macros.uploadTiddler = {
	label: "uploadTiddler",
	prompt: "upload tiddler '%0' using UploadTiddlerOptions ",
	warning: "Are you sure you want to upload '%0'?",
	messages: {
		fileUploaded: "tiddler '%0' uploaded to file '%1'",
		fileNotUploaded: "tiddler '%0' NOT uploaded"
	},

	handler: function(place, macroName, params, wikifier,paramString, tiddler) {
		var tiddlerTitle = params[0];
		if (!tiddlerTitle) { 
			tiddlerTitle = tiddler.title;
		} else {
			tiddler = store.getTiddler(tiddlerTitle);
		}
		createTiddlyButton(place, this.label, this.prompt.format([tiddlerTitle]), 
			function () {
				config.macros.uploadTiddler.upload(tiddlerTitle, tiddler); 
				return false;}, 
			null, null, null);
	},

	upload:  function(tiddlerTitle, tiddler) {
		var saved_chkUploadTiddler = config.options.chkUploadTiddler;
		config.options.chkUploadTiddler = true; 
		bidix.uploadTiddler.upload(tiddlerTitle, tiddler,tiddlerTitle);
		config.options.chkUploadTiddler = saved_chkUploadTiddler;
	}
};

//}}}
