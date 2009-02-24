/***
|''Name:''|settings|
|''Description:''|set preferences|
|''~CoreVersion:''|2.2.0|
|''MediaWiki Host''|<<option txtServerHost>>|
***/

/*{{{*/
config.views.editor.defaultText = '';
config.options.chkAnimate = true;
config.options.chkSaveBackups = false;
config.options.chkAutoSave = false;
config.options.txtBackupFolder = "backup";
config.options.txtMaxEditRows = 20;
config.options.chkDisableWikiLinks = true;
config.maxTiddlerImportCount = 500;
config.options.chkSinglePageMode = false;
config.options.chkTopOfPageMode = false;

merge(config.defaultCustomFields,{
	wikiformat:'mediawiki'
});

merge(config.macros.option.onChangeHandler,{'txtServerHost':function() {
	updateHostOnAllWikiTiddlers();
}});

function updateHostOnAllWikiTiddlers() {
    store.forEachTiddler(function(title, tiddler){
        var host = tiddler.fields['server.host'];
        if (host) {
            tiddler.fields['server.host'] = config.options.txtServerHost;
        }
    });
    merge(config.defaultCustomFields, {
        'server.host': config.options.txtServerHost
    });
}
//#config.displayStartupTime = true;
/*}}}*/
