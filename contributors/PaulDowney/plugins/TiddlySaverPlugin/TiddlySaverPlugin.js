/***
|''Name:''|TiddlySaverPlugin |
|''Description:''|Bundle the TiddlySaver.jar as a datauri with improved UI |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/TiddlySaverPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TiddlySaverPlugin/ |
|''Version:''|0.1 |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4 |
!!Documentation
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config */
(function ($) {
	version.extensions.TiddlySaverPlugin = {installed: true};

	jQuery(document).bind("startup", null, function () {
		if (useJavaSaver) {
			displayMessage("Before you can save changes, you need to download [[TiddlySaver.jar|http://tiddlywiki.com/TiddlySaver.jar]] into the same directory as this file");
		}
	});

}(jQuery));
//}}}
