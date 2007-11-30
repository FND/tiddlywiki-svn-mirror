/***
|''Name:''|rippleRapTestPlugin|
|''Description:''|RippleRap test harness|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/RippleRapTestPlugin.js |
|''Version:''|0.0.3|
|''Date:''|Nov 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.RippleRapTestPlugin) {
version.extensions.RippleRapTestPlugin = {installed:true};

rssSynchronizer = null;

config.macros.rippleRapTest = {};

config.macros.rippleRapTest.init = function()
{
	rssSynchronizer = new RssSynchronizer();
	rssSynchronizer.init();
};

config.macros.rippleRapTest.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	createTiddlyButton(place,"Get notes from RSS","Get notes from RSS",config.macros.rippleRapTest.onClick);
};


config.macros.rippleRapTest.onClick = function()
{
	rssSynchronizer.doSync();
};

} //# end of 'install only once'
//}}}
