/***
|''Name''|TaggedBackupsPlugin|
|''Source''|[[FND's DevPad|http://devpad.tiddlyspot.com/#TableHighlightMacro]]|
|''Version''|0.1|
|''Author''|FND|
|''License''|[[Creative Commons Attribution-Share Alike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|N/A|
|''Overrides''|N/A|
|''Description''|allows the creation of backup files with an edit summary|
!Usage Notes
<<taggedBackup>>
!Revision History
!!v0.1 (2007-08-11)
* initial proof-of-concept implementation
!To Do
* rename plugin(?)
* ensure that full backup path does not exceed OS limits (256 chars?)
!Code
***/
//{{{
config.macros.taggedBackup = {}
config.macros.taggedBackup.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var originalPath = document.location.toString();
	var localPath = getLocalPath(originalPath);
	var original = loadFile(localPath);
	var backupPath = getBackupPath(localPath);
	alert(originalPath + "\n" + localPath + "\n" + backupPath) // DEBUG
	// insert edit summary ("tag")
	var backupFileName = backupPath.substring(0, backupPath.lastIndexOf("."));
	var backupFileExt = backupPath.substring(backupPath.lastIndexOf("."));
	//prompt("Please enter a concise edit summary"); // DEBUG'd
	alert(backupPath) // DEBUG
	//var backup = saveFile(backupPath, original); // DEBUG'd
	if(backup)
		displayMessage(config.messages.backupSaved, "file://" + backupPath);
	else
		alert(config.messages.backupFailed);
}

// getBackupPath() -- DEBUG: needs to be hijacked/overwritten
function getBackupPath(localPath)
{
	var backSlash = true;
	var dirPathPos = localPath.lastIndexOf("\\");
	if(dirPathPos == -1)
		{
		dirPathPos = localPath.lastIndexOf("/");
		backSlash = false;
		}
	var backupFolder = config.options.txtBackupFolder;
	if(!backupFolder || backupFolder == "")
		backupFolder = ".";
	var backupPath = localPath.substr(0,dirPathPos) + (backSlash ? "\\" : "/") + backupFolder + localPath.substr(dirPathPos);
	backupPath = backupPath.substr(0,backupPath.lastIndexOf(".")) + "." + (new Date()).convertToYYYYMMDDHHMMSSMMM() + ".html"; // DEBUG: replace YYYYMMDDHHMMSSMMM with ISO 8601 and add edit summary
	return backupPath;
}
//}}}