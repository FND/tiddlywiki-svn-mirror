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
     *  newSlide
     */
    config.macros.newSlide = {};
    config.macros.newSlide.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
        var theme = params[0];
        var title = "New Slide";
        var tip = "Create a new " + theme + " Slide";

        var onClick = function() {
            console.log("click theme:",theme);
            var template = theme + "##EditTemplate";
            var tags = ['slide'];
            var customFields = {
                'theme': theme,
                //'subtitle': "subtitle text ..",
                //'url': "http://example.com"
            };
            var tiddler = store.createTiddler(title);
            merge(tiddler.fields, customFields);
            story.displayTiddler(null,title,template,false,null,customFields,false,place)
            return false;
        };

        return createTiddlyButton(place,theme,tip,onClick,null,null,"1");
    };

})();
//}}}
