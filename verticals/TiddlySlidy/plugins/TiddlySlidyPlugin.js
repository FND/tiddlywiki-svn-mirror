/***

    Misc JavaScript hacks for TiddlySlidy

    These are here, ahead of being refactored into generic plugins

***/
//{{{
(function($) {

    // Enbale keybindings only when we are in presenter mode.
    Story.prototype._keybindings_switchTheme = Story.prototype.switchTheme;
    Story.prototype.switchTheme = function(theme) {
        this._keybindings_switchTheme.apply(this,arguments);
        if(theme == 'PresenterMode') {
            config.macros.keybindings.enable();
        } else {
            config.macros.keybindings.disable();
        }
    };

    // In the absence of a HistoryPlugin
    lastSlide = '';

    var displayTiddler = Story.prototype.displayTiddler;
    Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle,animationSrc) {
        var r = displayTiddler.apply(this, arguments);
        tiddler = (tiddler instanceof Tiddler) ? tiddler : store.fetchTiddler(tiddler);

        if (tiddler.tags.indexOf('slide') != -1) {
            $('#fullframe').remove();
            $('#contentWrapper').show();
            lastSlide = tiddler.title;
            return r;
        }

        if (!$('#presentation').length) {
            return r;
        }

        $('#contentWrapper').hide();

        $('body').append("<div id='fullframe'></div>");
        $('#slide').clone().appendTo('#fullframe');

        $('#fullframe')
            .css('display', 'block')
            .css('margin', 'auto')
            .css('position', 'absolute')
            .css('z-index', '999')
            .css('top', '0')
            .css('left', '0')
            .css('width', '100%')
            .css('height', Math.max($('#fullframe').height(), $(window).height()))
            .css('background-color', config.macros.imagezoom.color)

            .click(function () {
                $('#contentWrapper').show();
                story.displayTiddler(null, lastSlide);
                $('#fullframe').remove();
            });

        return r;
    };


    /*
     *  newSlide button
     *  TBD := replace with selection from master slide thumbnails
     */
    config.macros.newSlide = {};
    config.macros.newSlide.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
        var theme = params[0];
        var title = "New Slide";
        var tip = "Create a new " + theme + " Slide";
        var tag = params[1] || "slide";

        var onClick = function() {
            var template = theme + "##EditTemplate";
            var tags = [tag];
            var customFields = {
                'theme': theme
            };
            var tiddler = store.createTiddler(title);
            merge(tiddler.fields, customFields);
            merge(tiddler.tags, tags);
            story.displayTiddler(null,title,template,false,null,null,false,place)
            story.focusTiddler(title,'title');
            return false;
        };

        return createTiddlyButton(place,theme,tip,onClick,null,null,null);
    };


})(jQuery);
//}}}
