/***
|''Name:''|settings|
|''Description:''|set preferences|
|''~CoreVersion:''|2.1.0|
***/

/*{{{*/
config.views.editor.defaultText = '';
config.options.chkAnimate = false;
config.options.chkSaveBackups = false;
config.options.chkAutoSave = false;
config.options.txtBackupFolder = "backup",
config.options.txtMaxEditRows = 20;

config.options.chkImportWorkspaceOnStartup = true;
config.options.chkBackstage = true;

config.options.chkDisableWikiLinks = true;

config.usePreForStorage = true;
config.maxTiddlerImportCount = 10;

config.defaultCustomFields = {
	'server.type':'cctiddly',
	'server.host':'wiki.osmosoft.com/alpha',
};

config.options.chkSinglePageMode = false;
config.options.chkTopOfPageMode = false;

config.displayStartupTime = false;
/*}}}*/
