/***
|''Name:''|DisableWikiLinksPlugin|
|''Description:''|Pre-release allows you to disable TiddlyWiki's automatic linking of WikiWords|
|''Source:''|http://martinswiki.com/martinsprereleases.html#DisableWikiLinksPlugin - for pre-release|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.2|
|''Status:''|beta pre-release|
|''Date:''|Aug 5, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|
***/

//{{{

// Ensure that the DisableWikiLinksPlugin is only installed once.
if(!version.extensions.DisableWikiLinksPlugin) {
version.extensions.DisableWikiLinksPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow("DisableWikiLinksPlugin requires TiddlyWiki 2.1 or newer.");}

if (config.options.chkDisableWikiLinks==undefined)
	{config.options.chkDisableWikiLinks = false;}

Tiddler.prototype.autoLinkWikiWords = function()
{
	if(config.options.chkDisableWikiLinks==true)
		{return false;}
	return !this.isTagged("systemConfig") && !this.isTagged("excludeMissing");
};

} // end of "install only once"
//}}}
