/***
|''Name:''|LocalAdaptorSettings|
|''Description:''|Settings for the LocalAdaptor|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/adaptors/LocalAdaptorSettings.js |
|''Version:''|0.0.1|
|''Date:''|Jul 30, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
***/

//{{{

config.commands.saveTiddler.handler = function(event,src,title)
{
	return config.commands.saveTiddlerAndPut.handler(event,src,title);
};

merge(config.defaultCustomFields,{
	'server.host':'file://',
	'server.type':'local'
});
//}}}
