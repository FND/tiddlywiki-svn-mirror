/***
|''Name:''|SingleTiddlerPlugin|
|''Description:''|Display one tiddler at one time |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/SingleTiddlerPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SingleTiddlerPlugin/ |
|''Version:''|0.3|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin closes all tiddlers and displays one tiddler at one time. 
The URL is updated to point to the current tiddler.
Refuses to open a tiddler if one is already open for edit.
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery window config Story story Tiddler */
(function ($) {
    version.extensions.SingleTiddlerPlugin = {installed: true};

	var displayTiddler = Story.prototype.displayTiddler;
	Story.prototype.displayTiddler = function (src, t) {
		if ($('#'+story.container).find('.tiddler[dirty]').length) {
			return;
		}
        var title = t instanceof Tiddler ? t.title : t;
		story.closeAllTiddlers();
		displayTiddler.apply(this, arguments);
        window.location.hash = encodeURIComponent(String.encodeTiddlyLink(title));
	};

}(jQuery));
//}}}
