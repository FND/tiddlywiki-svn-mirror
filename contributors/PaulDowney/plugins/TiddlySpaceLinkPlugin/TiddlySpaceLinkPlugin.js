/***
|''Name:''|TiddlySpaceLinkPlugin|
|''Description:''|Formatter to reference other spaces in wikitext |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/TiddlySpaceLinkPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TiddlySpaceLinkPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation

{{{@space}}} -- external link to another [[space|Space]]
@space

{{{[@[Tiddler Name]space] -- external link to a tiddler on another [[space|Space]]}}}.
[@[Tiddler Name]space]

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config */
(function ($) {
    version.extensions.TiddlySpaceLinkPlugin = {installed: true};


}(jQuery));
//}}}
