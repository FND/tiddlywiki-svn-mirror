/***
|''Name:''|SocialtextTweaksPlugin|
|''Description:''|Allows changes to be synchronised with a Socialtext server|
|''Source:''|http://stunplugged.tiddlywiki.com/#SocialtextTweaksPlugin|
|''Author:''|JeremyRuston (jeremy (at) osmosoft (dot) com)|
|''Version:''|1.0.1|
|''Date:''|Dec 4, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.2|

Make minor configuration tweaks specific to Socialtext Unplugged
***/

//{{{
// Ensure that the SocialtextTweaksPlugin is only installed once.
if(!version.extensions.SocialtextTweaksPlugin) {
version.extensions.SocialtextTweaksPlugin = {installed:true};
// Check version number of core code
if(version.major < 2 || (version.major == 2 && version.minor < 2))
	{alertAndThrow("SocialtextTweaksPlugin requires TiddlyWiki 2.2 or later.");}

merge(config.defaultCustomFields,{
	'server.type':'socialtext',
	wikiformat:'socialtext',
	'server.host':'[%default.server%]'
});

config.options.chkSinglePageMode = true;
config.options.chkEnableAnimations = true;

} // end of "install only once"
//}}}
