//{{{

/*
 *  Theme
 */
config.options.txtTheme = "PresenterTheme";

/*
 *  Faster fading messages!
 */
config.options.txtFadingMessagesTimeout = 1;

/*
 *  Lingo
 */
merge(config.macros.newTiddler,{
    label: "new slide",
    prompt: "Create a new slide",
    title: "New Slide",
    accessKey: "N"});


//}}}
