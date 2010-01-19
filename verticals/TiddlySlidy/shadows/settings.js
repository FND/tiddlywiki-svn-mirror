//{{{

/*
 *  Theme
 */
config.options.txtTheme = "PresenterMode";
//config.options.txtTheme = "AuthorMode";
//config.options.txtTheme = "TiddlyWikiMode";

/*
 *  Faster fading messages!
 */
config.options.txtFadingMessagesTimeout = 1; 

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
 *  KeyBindings
jQuery().bind("startup", function () {
    config.macros.keybindings.forward = story.nextTiddler;
    config.macros.keybindings.back = story.prevTiddler;
});
 */

/*
 *  Lingo
 */
merge(config.macros.newTiddler,{
    label: "new slide",
    prompt: "Create a new slide",
    title: "New Slide",
    accessKey: "N"});

merge(config.views.editor,{
    themePrompt: "Type a theme for the slide",
    });

//}}}
