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
//config.options.chkDisableWikiLinks = true;

store.setDefaultCustomFields('server.host:www.ziddlywiki.com;server.type:ziddlywiki;');

//config.options.chkSinglePageMode = false;
//config.options.chkTopOfPageMode = false;

//config.displayStartupTime = true;
config.usePreForStorage = true;

/*}}}*/
