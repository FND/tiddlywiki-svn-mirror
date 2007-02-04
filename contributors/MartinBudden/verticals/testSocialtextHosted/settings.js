/***
|''Name:''|settings|
|''Description:''|Set preferences|
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

store.setDefaultCustomFields('server.host:www.eu.socialtext.net;server.workspace:stoss;wikiformat:Socialtext;');

config.options.chkSinglePageMode = false;
config.options.chkTopOfPageMode = false;

config.displayStartupTime = true;
config.usePreForStorage = true;

config.macros.updateHostedList.onDone = function(params)
{
	displayMessage(config.macros.updateHostedList.done);
	story.displayTiddler(null,'@ListHosted');// for demo
};

/*}}}*/
