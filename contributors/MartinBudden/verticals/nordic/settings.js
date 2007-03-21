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
config.options.txtBackupFolder = "backup";
config.options.txtMaxEditRows = 20;

config.options.chkDisableWikiLinks = true;

config.usePreForStorage = true;
config.maxTiddlerImportCount = 10;

config.defaultCustomFields = {
	'server.type':'mediawiki',
	'server.host':'www.wikipedia.org/w',
	wikiformat:'mediawiki'
};

config.options.chkSinglePageMode = true;
config.options.chkTopOfPageMode = true;

config.displayStartupTime = false;
/*}}}*/
