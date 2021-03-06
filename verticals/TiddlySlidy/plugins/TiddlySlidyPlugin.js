/***
|''Name:''|TiddlySlidyPlugin|
|''Description:''|Misc hacks for TiddlySlidy |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/MainMenuOrderPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/MainMenuOrderPlugin/ |
|''Version:''|0.2|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
These are here, ahead of being refactored into generic plugins
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global console config jQuery createTiddlyButton store story Story createTiddlyDropDown merge */

// In the absence of a HistoryPlugin
var lastSlide = '';

(function ($) {

    // Enable keybindings only when we are in presenter mode.
    Story.prototype._keybindings_switchTheme = Story.prototype.switchTheme;
    Story.prototype.switchTheme = function(theme) {
        this._keybindings_switchTheme.apply(this,arguments);
        if(theme == 'PresenterMode') {
            config.macros.keybindings.enable();
        } else {
            config.macros.keybindings.disable();
        }
    };

	// expose a function for the navigation buttons toggle.
	config.macros.toggleLinearNavigation = function(){
		$('div.slide-bottom a').slideToggle(100);
	};
	
	

    var displayTiddler = Story.prototype.displayTiddler;
    Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle,animationSrc) {
        var r = displayTiddler.apply(this, arguments);
        tiddler = (tiddler instanceof Tiddler) ? tiddler : store.fetchTiddler(tiddler);

		// catch null tiddler exception in presentation mode
		if (!tiddler) {
			if ($('#presentation').length) {
				return false;
			}
		} 

        // refresh control panel
        refreshElements($('#footer')[0]);

        // update MainMenu
        config.macros.MainMenuOrder.refresh();

        if (tiddler.tags.indexOf('slide') != -1) {
            $('#fullframe').remove();
            $('#contentWrapper').show();
            lastSlide = tiddler.title;
            return r;
        }

        if ($('#presentation').length) {
			$('body').append("<div id='fullframe'></div>");
			$('#slide').clone().appendTo('#fullframe');
			$('body').trigger('tiddlyWiki.macro.fullframe.OnOpen');
			$('#fullframe')
				.click(function (e) {
					$('body').trigger('tiddlyWiki.macro.fullframe.OnClose');
					var link = $(e.target).attr("tiddlyLink");
					story.displayTiddler(null, link || lastSlide);
				});
        }

        return r;
    };

	// Setup "default" event listeners (to override simply .unbind())
	$('body').bind('tiddlyWiki.macro.fullframe.OnOpen', function(){
		$('#contentWrapper').hide();
		$('#fullframe')
			.css('display', 'block')
			.css('margin', 'auto')
			.css('position', 'absolute')
			.css('z-index', '999')
			.css('top', '0')
			.css('left', '0')
			.css('width', '100%')
			.css('height', Math.max($('#fullframe').height(), $(window).height()))
			.css('background-color', config.macros.imagezoom.color);
		
	});
	$('body').bind('tiddlyWiki.macro.fullframe.OnClose', function(){
		$('#contentWrapper').show();
	    $('#fullframe').remove();
	});


    /*
     *  newSlide button
     *  TBD := replace with selection from master slide thumbnails
     */
    config.macros.newSlide = {};
    config.macros.newSlide.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
        var theme = params[0];
        var title = "New Slide";
        var tip = "Create a new " + theme + " Slide";
        var tag = params[1] || "slide";

        return createTiddlyButton(place, theme, tip, function () {
                var template = theme + "##EditTemplate";
                var tags = [tag];
                var customFields = {
                    'theme': theme
                };
                var tiddler = store.createTiddler(title);
                merge(tiddler.fields, customFields);
                merge(tiddler.tags, tags);
                story.displayTiddler(null, title, template, false, null, null, false, place);
                story.focusTiddler(title,'title');
                return false;
            }, 
            null, 
            null, 
            null);
    };

    /*
     *  better CheckboxToggle
     */
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

Story.prototype.onTiddlerMouseOver = function(e)
{
    addClass(this, "mousey");
    return false;
};


})(jQuery);
//}}}
