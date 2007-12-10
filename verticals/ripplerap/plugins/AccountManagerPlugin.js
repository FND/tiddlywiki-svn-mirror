/***
|''Name:''|AccountManagerPlugin|
|''Description:''|Create a tiddlylink pragramtically|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/AccountManagerPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Dec 03, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|


Usage:
<<accountManager TiddlerToDisplayIfSignedIn TiddlerToDisplayIfNotSignedIn>>

***/

//{{{
if(!version.extensions.AccountManagerPlugin) {
version.extensions.AccountManagerPlugin = {installed:true};
	
config.macros.accountManager = {};
config.macros.accountManager.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	if(params.length < 2) {
		return;
	}
	var ps = [];
	var ready = config.options['chkRipplerapReadyToUse'+config.options.txtUserName];
	if(ready) {
		ps.push(params[0]);
		config.macros.tiddler.handler(place,'tiddler',ps,wikifier,ps.join(','),tiddler);
		if(rssSynchronizer && config.options.chkRipplerapShare) {
			rssSynchronizer.makeRequest();
		}
	}
	else {
		ps.push(params[1]);
		config.macros.tiddler.handler(place,'tiddler',ps,wikifier,ps.join(','),tiddler);
	}
};
} //# end of 'install only once'
//}}}