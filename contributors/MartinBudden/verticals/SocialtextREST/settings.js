/***
|''Name:''|settings|
|''Description:''|set preferences|
|''~CoreVersion:''|2.2.0|
***/

/*{{{*/
config.views.editor.defaultText = '';
config.options.chkAnimate = false;
config.options.chkSaveBackups = false;
config.options.chkAutoSave = false;
config.options.txtBackupFolder = 'backup';
config.options.txtMaxEditRows = 20;
config.options.chkDisableWikiLinks = true;

config.maxTiddlerImportCount = 10;

merge(config.defaultCustomFields,{
	'server.type':'socialtext',
	'server.host':'www.eu.socialtext.net',
	'server.workspace':'st-rest-docs',
	wikiformat:'socialtext'
});

config.options.chkSinglePageMode = false;
config.options.chkTopOfPageMode = false;

//#config.displayStartupTime = true;
/*}}}*/
