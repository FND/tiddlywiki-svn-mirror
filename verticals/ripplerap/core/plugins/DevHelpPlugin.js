/***
|''Name:''|DevHelperPlugin |
|''Description:''|Provide debug help buttons |
|''Author:''|PaulDowney|
|''Version:''|0.0.3|
|''Date:''|Mon May 19 14:47:44 BST 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|
***/

//{{{
	
if(!version.extensions.DevHelpPlugin) {
version.extensions.DevHelpPlugin = {installed:true};

config.macros.SuspendNotifications = {};
config.macros.SuspendNotifications.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
                var button = createTiddlyButton(place,'SUSPEND NOTIFCATIONS','Click here to send TiddlyWiki to sleep',story.suspendNotifications);
};

config.macros.ResumeNotifications = {};
config.macros.ResumeNotifications.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
                var button = createTiddlyButton(place,'RESUME NOTIFCATIONS','Click here to wake TiddlyWiki',story.resumeNotifications);
};

config.macros.NotifyAll = {};
config.macros.NotifyAll.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
                var button = createTiddlyButton(place,'NOTIFY ALL','Click here to notify all',function() {store.notifyAll();refreshDisplay();return false;});
};

}
//}}}
