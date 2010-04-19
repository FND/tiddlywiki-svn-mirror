/***
|''Name:''|ImageZoomMacroPlugin|
|''Description:''| macro to create a zoomable image using a tiddler field |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/ImageZoomMacroPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/ImageZoomMacroPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This macro was created to assist including images in a tiddler view template, where the source 
of an image is defined by a tiddler field:

&lt;&lt;imagezoom "http://tiddlywiki.com/fractalveg.jpg"&gt;&gt;

<<imagezoom "http://farm1.static.flickr.com/33/65468830_ef7d984ba2_o.jpg">>

&lt;&lt;imagezoom "@image"&gt;&gt;

<<imagezoom @image>>

Clicking on the image creates a display containing the full sized image.
Both the image and the fullframe version may be styled using CSS.

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config jQuery store window */
(function ($) {
	version.extensions.ImageZoomMacroPlugin = {installed: true};

	config.macros.imagezoom = {};
	config.macros.imagezoom.color = '#000';
	config.macros.imagezoom.handler = function (place, macroName, params, wikifier, paramString, tiddler) {

		var src = params[0].match(/^@/) ? store.getValue(tiddler, params[0].substring(1))
			: params[0];

		if (!src) {
			return;
		}

		$(place).append($("<img>")
			.attr("src", src)
			.css('cursor', 'pointer')
			.click(function () { 
			$('body').append("<div id='fullframe'><img src='" + this.src + "'></div>");

			$('#fullframe img')
				.css('display', 'block')
				.css('margin', 'auto');

			$('body').trigger('tiddlyWiki.macro.imageZoom.OnOpen');
		
			$('#fullframe')
				.click(function () {
					$(this).remove();
					$('body').trigger('tiddlyWiki.macro.imageZoom.OnClose');
                });
        }));

		$('body').bind('tiddlyWiki.macro.imageZoom.OnOpen', function() {
			$('#contentWrapper').hide();
			$('#fullframe')
				.css('position', 'absolute')
				.css('z-index', '999')
				.css('top', '0')
				.css('left', '0')
				.css('width', '100%')
				.css('height', Math.max($('#fullframe img').height(), $(window).height()))
				.css('background-color', config.macros.imagezoom.color);
		});

		$('body').bind('tiddlyWiki.macro.imageZoom.OnClose', function() {
			$('#contentWrapper').show();
		});

		// TO OVERRIDE in custom tiddler:
		/**
		$('body').unbind('tiddlyWiki.macro.imageZoom.OnOpen').bind('tiddlyWiki.macro.imageZoom.OnOpen', function() {
			// custom actions to go here
		});
		**/
	};
})(jQuery);
//}}}

