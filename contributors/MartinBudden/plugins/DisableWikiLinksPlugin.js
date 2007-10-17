/***
|''Name:''|DisableWikiLinksPlugin|
|''Description:''|Allows you to disable TiddlyWiki's automatic linking of WikiWords|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#DisableWikiLinksPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/DisableWikiLinksPlugin.js |
|''Version:''|0.1.3|
|''Date:''|Aug 5, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.1.0|

|''Disable WikiLinks''|<<option chkDisableWikiLinks>>|

***/

//{{{
// Ensure that the DisableWikiLinksPlugin is only installed once.
if(!version.extensions.DisableWikiLinksPlugin) {
version.extensions.DisableWikiLinksPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('DisableWikiLinksPlugin requires TiddlyWiki 2.1 or newer.');}

if (config.options.chkDisableWikiLinks==undefined)
	{config.options.chkDisableWikiLinks = false;}

Tiddler.prototype.autoLinkWikiWords = function()
{
	if(config.options.chkDisableWikiLinks==true)
		{return false;}
	return !this.isTagged('systemConfig') && !this.isTagged('excludeMissing');
};

} // end of 'install only once'
//}}}
