/***
|''Name:''|DisableStrikeThroughPlugin|
|''Description:''|Allows you to disable TiddlyWiki's automatic linking of WikiWords|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Source:''|http://www.martinswiki.com/#DisableStrikeThroughPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/DisableStrikeThroughPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Feb 18, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.1.0|

***/

//{{{
// Ensure that the DisableStrikeThroughPlugin is only installed once.
if(!version.extensions.DisableStrikeThroughPlugin) {
version.extensions.DisableStrikeThroughPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('DisableStrikeThroughPlugin requires TiddlyWiki 2.1 or newer.');}

DisableStrikeThroughPlugin = {};

DisableStrikeThroughPlugin.replaceFormatters = function()
{
	for(var i=0; i<config.formatters.length; i++) {
		var name = config.formatters[i].name;
		if(name == 'characterFormat') {
			config.formatters[i].match = "''|//|__|\\^\\^|~~|\\{\\{\\{";
			break;
		} else if(name == 'strikeByChar') {
			config.formatters.splice(i,1);
			break;
		}
	}
};
DisableStrikeThroughPlugin.replaceFormatters();

} // end of 'install only once'
//}}}
