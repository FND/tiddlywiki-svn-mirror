/***
|''Name:''|settings|
|''Description:''|Set preferences|
|''~CoreVersion:''|2.2.0|
***/

//{{{

config.commands.saveTiddler.oldHandler = config.commands.saveTiddler.handler;
config.commands.saveTiddler.handler = function(event,src,title)
{
	config.commands.saveTiddler.oldHandler(event,src,title);
	return config.commands.putTiddler.handler(event,src,title);
};

config.views.editor.defaultText = '';
config.options.chkAnimate = false;
config.options.chkSaveBackups = false;
config.options.chkAutoSave = false;
config.options.txtBackupFolder = "backup";
config.options.txtMaxEditRows = 20;
config.options.chkDisableWikiLinks = true;

config.maxTiddlerImportCount = 10;

merge(config.defaultCustomFields,{
	'server.host':'file://',
	'server.type':'local'
});

config.options.chkSinglePageMode = false;
config.options.chkTopOfPageMode = false;

//#config.displayStartupTime = true;
//}}}
