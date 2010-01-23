/***
|''Name:''|RemoveTaggingLabelsPlugin|
|''Description:''|Removes the spurious tagging text frm the tagging macro |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/RemoveTaggingLabelsPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/RemoveTaggingLabelsPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config */
config.macros.tagging.label = "";
config.macros.tagging.labelNotTag = "";
//}}}
