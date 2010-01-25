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


})();
//}}}
