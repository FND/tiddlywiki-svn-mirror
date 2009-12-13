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
