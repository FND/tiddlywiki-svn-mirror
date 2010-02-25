//{{{

/*
 *  Theme
 */
if (!config.options.txtTheme) {
    config.options.txtTheme = "PresenterMode";
}

/*
 *  Faster fading messages!
 */
config.options.txtFadingMessagesTimeout = 100; 

/*
 *  Disable WikiLinks
 */
config.options.chkDisableWikiLinks = 1;

/*
 *  Animations
 */ 
config.options.chkAnimate = 0;

/*
 *  SinglePagedMode
 */
config.options.chkSinglePageMode = 1; //Display one tiddler at a time
config.options.chkSinglePagePermalink = 1; //Automatically permalink current tiddler
config.options.chkSinglePageKeepFoldedTiddlers = 0; //Don't close tiddlers that are folded
config.options.chkSinglePageKeepEditedTiddlers = 1; //Don't close tiddlers that are being edited
config.options.chkTopOfPageMode = 1; //Open tiddlers at the top of the page
//config.options.chkBottomOfPageMode = 0; //Open tiddlers at the bottom of the page
//config.options.chkSinglePageAutoScroll = 1; //Automatically scroll tiddler into view (if needed)


/*
 *  Lingo
 */
merge(config.macros.newTiddler,{
    label: "new slide",
    prompt: "Create a new slide",
    title: "New Slide",
    accessKey: "N"
});

merge(config.views.wikified,{
    defaultText: "The tiddler '%0' doesn't yet exist. Edit to create it."
});

merge(config.views.editor,{
	themePrompt: "Type a theme for the slide"
});

/*
 *  auto saving
 */
config.options.chkAutoSave = true;
config.options.txtBackupFolder = "backups";

/*
 *  disable read-only mode for demo
 */
config.options.chkHttpReadOnly = false;
readOnly = false;
showBackstage = true;

// key mappings
// config.macros.keybindings.keyCodes[32] = function() { story.nextTiddler(); }; 	//space
// config.macros.keybindings.keyCodes[46] = function() { story.nextTiddler(); };	//greater
// config.macros.keybindings.keyCodes[44] = function() { story.prevTiddler(); };	//less

config.macros.keybindings.keyCodes = {
	32 : function() { story.nextTiddler(); },
	46 : function() { story.nextTiddler(); },
	44 : function() { story.prevTiddler(); },
	104 : function() { config.macros.toggleLinearNavigation(); },
	110 : function() { config.macros.toggleLinearNavigation(); }
	
};

//}}}
