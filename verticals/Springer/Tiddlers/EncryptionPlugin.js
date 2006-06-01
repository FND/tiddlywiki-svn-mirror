/***
<<tiddler EncryptionPluginDocumentation>>
!Code
***/
//{{{
version.extensions.EncryptionPlugin = { major: 1, minor: 0, revision: 1, date: new Date(2006,18,3),
 source: "http://yann.perrin.googlepages.com/twkd.html#EncryptionPlugin"
};
//}}}
/***
// // Encrypt Command Definition
***/
//{{{
config.macros.encrypt = {
    label: '§',
    tooltip: 'Encrypt this tiddler',
    getkeydialog: 'Enter encryption key',
    cryptedtag: 'crypted',
    donotcrypttag: 'EncryptionPlugin'
};
config.macros.encrypt.action = function(tiddler) {
    var key = prompt(this.getkeydialog,'');
    if (key)
    {
        tiddler.text = TEAencrypt(tiddler.text,key);
        tiddler.tags.push(this.cryptedtag);
        if (version.major < 2)
            store.tiddlers[tiddler.title] = tiddler;
        else
            store.addTiddler(tiddler);
        story.refreshTiddler(tiddler.title,1,true);
        store.notifyAll();
    }
};
config.macros.encrypt.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
if (tiddler.tags.find(this.cryptedtag)==null && tiddler.tags.find(this.donotcrypttag)==null)
createTiddlyButton(place, this.label, this.tooltip, function () {config.macros.encrypt.action(tiddler); return false;}, null, null, null);
}
//}}}
// // Decrypt Command Definition
//{{{
config.macros.decrypt = {
    label: '-§-',
    tooltip: 'Decrypt this tiddler',
    cryptedtag:'crypted',
    donotdecrypttag:'EncryptionPlugin',
    getkeydialog: 'Enter encryption key'
};
config.macros.decrypt.action = function(tiddler) {
    var key = prompt(this.getkeydialog,'');
    if (key)
    {
        tiddler.text = TEAdecrypt(tiddler.text,key);
        tiddler.tags.splice(tiddler.tags.find(this.cryptedtag),1);
        if (version.major < 2)
            store.tiddlers[tiddler.title] = tiddler;
        else
            store.addTiddler(tiddler);
        story.refreshTiddler(tiddler.title,1,true);
        store.notifyAll();
    }
};
config.macros.decrypt.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
if (tiddler.tags.find(this.cryptedtag)!=null && tiddler.tags.find(this.donotdecrypttag)==null)
createTiddlyButton(place, this.label, this.tooltip, function () {config.macros.decrypt.action(tiddler); return false;}, null, null, null);
}
//}}}
// //Shadow tiddlers definition
//{{{
config.shadowTiddlers.ViewTemplate="<div class='toolbar' macro='toolbar -closeTiddler closeOthers +editTiddler permalink references jump'><span macro='encrypt'></span><span macro='decrypt'></span></div>\sn<div class='title' macro='view title'></div>\sn<div class='subtitle'><span macro='view modifier link'></span>, <span macro='view modified date [[DD MMM YYYY]]'></span> (created <span macro='view created date [[DD MMM YYYY]]'></span>)</div>\sn<div class='tagging' macro='tagging'></div>\sn<div class='tagged' macro='tags'></div>\sn<div class='viewer' macro='view text wikified'></div>\sn<div class='tagClear'></div>";
config.shadowTiddlers.EncryptionPluginDocumentation="Documentation for this plugin is available [[here|" + version.extensions.EncryptionPlugin.source +"Documentation]]";
//}}}