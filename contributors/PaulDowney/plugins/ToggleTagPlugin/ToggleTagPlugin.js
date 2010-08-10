/***
|''Name:''|ToggleTagPlugin|
|''Description:''|ToggleTag macro |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ToggleTagPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ToggleTagPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Provides a {{{<<toggleTag>>}}} macro which. By default this flips between the tags "slide" and "notes" as used by [[TiddlySlidy|http://tiddlyslidy.com]].
Toggle off and on <<toggleTag "on" "off">>
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config */
(function ($) {
	version.extensions.ToggleTagPlugin = {installed: true};

	config.macros.toggleTag = {};
	config.macros.toggleTag.handler = function (place, macroName, params, wikifier, paramString, tiddler) {
		var ontag = params[0] || "slide";
		var offtag = params[1] || "notes";
		var caption = params[2] || "";

		var title = tiddler.title;
		var checked = tiddler.isTagged(ontag);

		createTiddlyCheckbox(place, "", checked, function () {
			checked = this.checked;
			store.setTiddlerTag(title, checked, ontag);
			store.setTiddlerTag(title, !checked, offtag);
			config.extensions.MainMenuUpdate(title, checked ? title : null);
			return false;
		});

		var id = story.tiddlerId(title) + "Toggle" + ontag;
		$(place).find('input').attr('id', id);
		$('<label for=' + id + '>' + caption + '</label>').appendTo(place);
		return false;
	};

}(jQuery));
//}}}
