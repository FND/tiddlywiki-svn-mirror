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

<<imagezoom "http://farm1.static.flickr.com/12/18357715_e919b8eea6_b.jpg">>

&lt;&lt;imagezoom "@image"&gt;&gt;

<<imagezoom @image>>

Clicking on the image creates a full sized image which may be styled as a lightbox using CSS.

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config jQuery store */
(function ($) {
    version.extensions.ImageZoomMacroPlugin = {installed: true};

	config.macros.imagezoom = {};
	config.macros.imagezoom.handler = function (place, macroName, params, wikifier, paramString, tiddler) {
        
        var src = params[0].match(/^@/) ? store.getValue(tiddler, params[0].substring(1))
			: params[0];

        $(place).append($("<img>").attr("src", src).click(function () { 
            $('body').append("<div id='fullframe'><img src='" + this.src + "'></div>");
            $('#contentWrapper').hide();

            $('#fullframe img')
                .css('display', 'block')
                .css('margin', 'auto');

            $('#fullframe')
                .css('position', 'absolute')
                .css('z-index', '999')
                .css('top', '0')
                .css('left', '0')
                .css('width', '100%')
                .css('height', $('#fullframe img').height())
                .css('background-color', '#000')

                .click(function () {
                    $(this).remove();
                    $('#contentWrapper').show();
                });
        }));
	};
})(jQuery);
//}}}
