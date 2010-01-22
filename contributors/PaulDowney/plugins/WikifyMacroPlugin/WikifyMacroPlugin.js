/***
|''Name:''|WikifyMacroPlugin|
|''Description:''|Macro to wikify parameter text, useful in templates |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/WikifyMacroPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/WikifyMacroPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
<<wikify hello>>
<<wikify hello ''world''>>
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config */
if (!version.extensions.WikifyMacroPlugin) {
    version.extensions.WikifyMacroPlugin = {installed: true};

    config.macros.wikify = {}
    config.macros.wikify.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
        wikify(paramString, place, null, tiddler);
    };
}
//}}}
