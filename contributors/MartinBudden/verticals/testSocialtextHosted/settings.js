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

store.setDefaultCustomFields('server.host:www.eu.socialtext.net;server.workspace:tiddlytext;wikiformat:Socialtext;');
//store.defaultCustomFields = 'server.host:www.eu.socialtext.net;server.workspace:tiddlytext;wikiformat:Socialtext;';

config.displayStartupTime = true;
//config.options.chkSinglePageMode = false;
//config.options.chkTopOfPageMode = false;
/*}}}*/
