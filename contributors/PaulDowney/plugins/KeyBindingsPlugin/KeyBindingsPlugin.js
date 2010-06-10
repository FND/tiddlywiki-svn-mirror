/***
|''Name:''|KeyBindingsPlugin|
|''Description:''| capture document keyboard events |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/KeyBindingsPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/KeyBindingsPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery document config */
(function ($) {
    version.extensions.KeyBindingsPlugin = {installed: true};

	jQuery(document).bind('keydown', function (e) {
		if (e.target.nodeName.toLowerCase() == "html") {
			var keyCode = e.keyCode || e.which;
			//console.log(keyCode);
			if (config.macros.keybindings.keyCode[keyCode]) {
				config.macros.keybindings.keyCode[keyCode].call(e);
			}
		}
	});
	
	// key mappings
	config.macros.keybindings = {
		keyCode: {
			32: function (e) { story.nextTiddler() },	//space
			39: function (e) { story.nextTiddler() },	//cursor-right
			37: function (e) { story.prevTiddler() },	//cursor-left
			49: function (e) { story.firstTiddler() },	//1
			61: function (e) { story.lastTiddler() }	//=
		}
	};

})(jQuery);
//}}}
