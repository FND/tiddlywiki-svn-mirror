/***

    Misc JavaScript hacks for TiddlySlidy

    These are here, ahead of being refactored into generic plugins

***/
//{{{
(function() {

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
            return false;
        };

        return createTiddlyButton(place,theme,tip,onClick,null,null,null);
    };

    config.macros.OffPiste = {
        ready: function () {
            console.log("here");
            $('#contentWrapper').animate({ backgroundColor: "#000" }, "slow");
        }
    };

})();
//}}}
