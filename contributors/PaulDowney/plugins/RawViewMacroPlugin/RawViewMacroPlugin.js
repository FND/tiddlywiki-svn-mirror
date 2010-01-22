/***
|''Name:''|RawViewMacroPlugin|
|''Description:''|Extend the view macro to display raw, unwikified HTML markup |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/RawViewMacroPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/RawViewMacroPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Include raw HTML in a template, etc:

&lt;&lt;view text raw&gt;&gt;

<<view text raw>>

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config createTiddlyElement */
if (!version.extensions.RawViewMacroPlugin) {
    version.extensions.RawViewMacroPlugin = {installed: true};

    config.macros.view.views.raw = function (value, place, params, wikifier, paramString, tiddler) {
        createTiddlyElement(place, "span", null, null).innerHTML = value;
    };
}
//}}}
