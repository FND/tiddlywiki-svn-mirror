/***
|''Name:''|ThemeSwitchDirtyPlugin|
|''Description:''|Block a theme switch if a tiddler is dirty (open for edit) |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ThemeSwitchDirtyPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ThemeSwitchDirtyPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config */
(function ($) {
    version.extensions.ThemeSwitchDirtyPlugin = {installed: true};

	var switchTheme = Story.prototype.switchTheme;
	Story.prototype.switchTheme = function(theme)
	{
		if ($('#'+story.container).find('.tiddler[dirty]').length) {
			return;
		}
		return switchTheme.apply(this,arguments);
	};

}(jQuery));
//}}}
