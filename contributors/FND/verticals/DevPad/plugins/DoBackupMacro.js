/***
|''Name:''|DoBackupMacro|
|''Version:''|2.0 (9-Apr-2006)|
|''Author:''|[[Jack]]|
|''Type:''|Macro|
!Description
Creates a button which allows you to backup your TiddlyWiki on demand.
!Usage
Add the following command to your SideBarOptions tiddler:
{{{<<doBackup>>}}}
!Revision History
* Original by [[Jack]] 9-Apr-2006
!To Do
* List non-explicit links (e.g. from tagging macro)

!Code
***/
//{{{
version.extensions.doBackup= {major: 2, minor: 0, revision: 0, date: new Date("Apr 9, 2006")};
config.macros.doBackup={label: "backup", prompt: "Backup this TiddlyWiki"}
config.macros.doBackup.handler = function(place)
{
 if(!readOnly)
 createTiddlyButton(place,this.label,this.prompt,function ()
{doBackup(); return false;},null,null,this.accessKey);
}

doBackup = function() {
 var optSaveBackups = config.options.chkSaveBackups
 config.options.chkSaveBackups = true
 saveChanges()
 config.options.chkSaveBackups = optSaveBackups
}

//}}}