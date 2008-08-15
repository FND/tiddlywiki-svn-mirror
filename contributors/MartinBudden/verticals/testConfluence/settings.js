/***
|''Name:''|settings|
|''Description:''|set preferences|
|''~CoreVersion:''|2.4.1|
***/

/*{{{*/
config.views.editor.defaultText = '';
config.options.chkAnimate = false;
config.options.chkSaveBackups = false;
config.options.chkAutoSave = false;
config.options.txtBackupFolder = 'backup';
config.options.txtMaxEditRows = 20;
config.options.chkDisableWikiLinks = true;

config.maxTiddlerImportCount = 500;

merge(config.defaultCustomFields,{
	'server.host':'try.atlassian.com',
	'server.workspace':'MartinTest',
	wikiformat:'confluence'
});

config.options.chkSinglePageMode = false;
config.options.chkTopOfPageMode = false;
config.options.chkUseHostImages = true;

//#config.displayInstrumentation = true;
/*}}}*/
