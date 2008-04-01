/***
|''Name:''|BackupTiddlerPlugin|
|''Description:''|Backs up tiddlers individually if chkAutoSave is set|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/BackupTiddlerPlugin.js |
|''Version:''|0.0.2|
|''Date:''|Oct 17, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.3.0|

***/

//{{{
//# Ensure that the BackupTiddlerPlugin is only installed once.
if(!version.extensions.BackupTiddlerPlugin) {
version.extensions.BackupTiddlerPlugin = {installed:true};

if(version.major < 2 || version.major < 3)
	{alertAndThrow('BackupTiddlerPlugin requires TiddlyWiki 2.3 or newer.');}

var saveBackupOriginal = saveBackup;
function saveBackup(localPath,original,tiddlers)
{
	if(tiddlers) {
		for(var i=0;i<tiddlers.length;i++) {
			var t = tiddlers[i];
			var backupPath = getBackupPath(localPath,t.title,"tiddler");
			saveFile(backupPath,store.getSaver().externalizeTiddler(store,t));
		}
	}
	saveBackupOriginal.apply(this,arguments);
}

} //# end of 'install only once'
//}}}
