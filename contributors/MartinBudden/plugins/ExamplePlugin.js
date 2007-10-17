/***
|''Name:''|ExamplePlugin|
|''Description:''|My Description|
|''Author:''|My Name|
|''Source:''|http://www.MyWebSite.com/#ExamplePlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MyDirectory/plugins/ExamplePlugin.js |
|''Version:''|0.0.1|
|''Date:''|July 31, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

To make this example into a real TiddlyWiki adaptor, you need to:

# Globally search and replace ExamplePlugin with the name of your plugin
# Globally search and replace example with the name of your macro
# Update the header text above with your description, name etc
# Do the actions indicated by the !!TODO comments, namely:
## Write the code for the macro

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.ExamplePlugin) {
version.extensions.ExamplePlugin = {installed:true};

config.macros.example = {};
config.macros.example.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	//!!TODO write the code for the macro here
};

} //# end of 'install only once'
//}}}
