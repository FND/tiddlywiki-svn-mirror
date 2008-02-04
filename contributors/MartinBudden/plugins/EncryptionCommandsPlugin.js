/***
|''Name:''|EncryptionCommandsPlugin|
|''Description:''|Toolbar commands for cryptographic functions|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://martinswiki.com/#EncryptionCommandsPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/EncryptionCommandsPlugin.js |
|''Version:''|0.1.7|
|''Date:''|Feb 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.1.3|

{{{<<tiddler EncryptionCommandsPluginDocumentation>>}}}
***/

//{{{
// Ensure that the plugin is only installed once.
if(!version.extensions.EncryptionCommandsPlugin) {
version.extensions.EncryptionCommandsPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1) || (version.major == 2 && version.minor == 1 && version.revision <3 ))
	alertAndThrow("EncryptionCommandsPlugin requires TiddlyWiki 2.1.3 or later.");

config.commands.editTiddler.isEnabled = function(tiddler)
{
	return tiddler.fields.encryption ? false : true;
};

config.commands.encryptTiddler = {
	hideReadOnly: true,
	hideShadow: true,
	encryptableTag: 'encryptable',
	base64Tag: 'base64',
	base64encode: null,
	encryption: null
};

merge(config.commands.encryptTiddler,{
	text: "encrypt",
	tooltip: "Encrypt this tiddler",
	passphrasePrompt: "Enter encryption passphrase"
});

config.commands.encryptTiddler.isEnabled = function(tiddler)
{
	return this.encryption &&
			!tiddler.isTagged('systemConfig') && !store.getValue(tiddler,'encryption') &&
			(tiddler.isTagged(this.encryptableTag) || tiddler.isTagged(this.base64Tag));
};

config.commands.encryptTiddler.handler = function(event,src,title)
{
	var tiddler = store.fetchTiddler(title);
	if(!this.isEnabled(tiddler))
		return;
	if(tiddler.isTagged(this.base64Tag)) {
		tiddler.text = this.base64encode(tiddler.text);
		var name = 'base64';
	} else {
		if(!this.encryption || !this.encryption.encrypt)
			return;
		var passphrase = prompt(this.passphrasePrompt,'');
		if(!passphrase)
			return;
		if(this.encryption.encryptPassphrase) {
			store.setValue(tiddler,'passphrase',this.encryption.encryptPassphrase(passphrase));
		}
		var text = this.encryption.encrypt(tiddler.text,passphrase);
		tiddler.text = this.base64encode(text);
		name = this.encryption.name();
	}
	var i = tiddler.tags.indexOf(this.encryptableTag);
	if(i!=-1)
		tiddler.tags.splice(i,1);
	store.setValue(tiddler,'encryption',name);
	store.addTiddler(tiddler);
	story.saveTiddler(title,event.shiftKey);
	story.refreshTiddler(title,1,true);
};

config.commands.decryptTiddler = {
	hideReadOnly: true,
	hideShadow: true,
	encryptableTag: 'encryptable',
	base64Tag: 'base64',
	base64decode: null,
	encryption: null
};

// localization
merge(config.commands.decryptTiddler,{
	text: "decrypt",
	tooltip: "Decrypt this tiddler",
	passphrasePrompt: "Enter decryption passphrase",
	incorrectPassphrase: "Incorrect passphrase"
});

config.commands.decryptTiddler.isEnabled = function(tiddler)
{
	return store.getValue(tiddler,'encryption');
};

config.commands.decryptTiddler.handler = function(event,src,title)
{
	var tiddler = store.fetchTiddler(title);
	if(!this.isEnabled(tiddler))
		return;
	if(store.getValue(tiddler,'encryption') == 'base64') {
		tiddler.text = this.base64decode(tiddler.text);
		var tag = 'base64';
	} else {
		var encryption = Crypto[store.getValue(tiddler,'encryption')];
		if(!encryption || !encryption.decrypt || !encryption.base64decode)
			return;
		var passphrase = prompt(this.passphrasePrompt,'');
		if(!passphrase)
			return;
		if(store.getValue(tiddler,'passphrase') && encryption.encryptPassphrase) {
			if(encryption.encryptPassphrase(passphrase)!=store.getValue(tiddler,'passphrase')) {
				displayMessage(config.commands.displayDecryptedTiddler.incorrectPassphrase);
				return;
			}
		}
		tiddler.text = encryption.decrypt(encryption.base64decode(tiddler.text),passphrase);
		tag = this.encryptableTag;
	}
	tiddler.tags.pushUnique(tag);
	store.setValue(tiddler,'encryption',null);
	store.setValue(tiddler,'passphrase',null);
	store.addTiddler(tiddler);
	story.saveTiddler(title,event.shiftKey);
	story.refreshTiddler(tiddler.title,1,true);
	//#store.notifyAll();
};

config.commands.displayDecryptedTiddler = {
	encryptedTag: 'encryption',
	base64Tag: 'base64',
	base64decode: null,
	encryption: null
};

// localization
merge(config.commands.displayDecryptedTiddler,{
	text: "display",
	tooltip: "Display this tiddler decrypted",
	passphrasePrompt: "Enter decryption passphrase",
	incorrectPassphrase: "Incorrect passphrase"
});

config.commands.displayDecryptedTiddler.isEnabled = function(tiddler)
{
	return this.base64decode && store.getValue(tiddler,'encryption');
};

config.commands.displayDecryptedTiddler.handler = function(event,src,title)
{
	var tiddler = store.fetchTiddler(title);
	if(!this.isEnabled(tiddler))
		return;
	if(tiddler.isTagged(this.base64Tag)) {
		var text = this.base64decode(tiddler.text);
	} else {
		var encryption = Crypto[store.getValue(tiddler,'encryption')];
		if(!encryption || !encryption.decrypt || !encryption.base64decode)
			return;
		var passphrase = prompt(this.passphrasePrompt,'');
		if(!passphrase)
			return;
		if(store.getValue(tiddler,'passphrase') && encryption.encryptPassphrase) {
			if(encryption.encryptPassphrase(passphrase)!=store.getValue(tiddler,'passphrase')) {
				displayMessage(config.commands.displayDecryptedTiddler.incorrectPassphrase);
				return;
			}
		}
		text = encryption.decrypt(encryption.base64decode(tiddler.text),passphrase);
	}
	var oldText = tiddler.text;
	tiddler.text = text;
	story.refreshTiddler(tiddler.title,DEFAULT_VIEW_TEMPLATE,true);
	tiddler.text = oldText;
};
//}}}

// //Setup
//{{{
encryptionCommandPluginUpdateViewTemplate = function()
{
	var title = 'ViewTemplate';
	var tiddler = store.fetchTiddler(title);
	if(!tiddler) {
		tiddler = new Tiddler();
		tiddler.title = title;
		tiddler.text = config.shadowTiddlers[title];
		tiddler.tags.pushUnique('excludeLists');
	}
	if(tiddler.text.indexOf('encryptTiddler') == -1) {
		tiddler.text = tiddler.text.replace("<div class='toolbar' macro='toolbar ","<div class='toolbar' macro='toolbar encryptTiddler displayDecryptedTiddler decryptTiddler ");
		store.addTiddler(tiddler);  
		store.setDirty(true);
	}
};

encryptionCommandPluginSetFunctions = function()
{
	config.commands.encryptTiddler.base64encode = Crypto.base64armor;
	config.commands.encryptTiddler.encryption = Crypto.TEA;
	config.commands.decryptTiddler.base64decode = Crypto.base64decode;
	config.commands.displayDecryptedTiddler.base64decode = Crypto.base64decode;
};

encryptionCommandPluginUpdateViewTemplate();
encryptionCommandPluginSetFunctions();
//}}}
} // end of 'install only once'
//}}}
 
