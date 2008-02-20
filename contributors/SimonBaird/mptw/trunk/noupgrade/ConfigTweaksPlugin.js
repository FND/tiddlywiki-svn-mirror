//{{{
readOnly = false;
config.options.chkHttpReadOnly = false; // means web visitors can experiment with your site by clicking edit
config.options.chkInsertTabs = true;    // tab inserts a tab when editing a tiddler
config.views.wikified.defaultText = ""; // don't need message when a tiddler doesn't exist
config.views.editor.defaultText = "";   // don't need message when creating a new tiddler 

if (config.options.txtTheme == '')
	config.options.txtTheme = 'MptwTheme';  // change this to set default theme

// used in MPTW ViewTemplate
config.mptwDateFormat = 'DD/MM/YY';
config.mptwJournalFormat = 'Journal DD/MM/YY';
//config.mptwDateFormat = 'MM/0DD/YY';
//config.mptwJournalFormat = 'Journal MM/0DD/YY';

config.shadowTiddlers.GettingStarted += "\n\nSee also MonkeyPirateTiddlyWiki.";

config.shadowTiddlers.OptionsPanel = "<<selectTheme>>\n<<selectPalette>>\n\n" + config.shadowTiddlers.OptionsPanel;

//}}}
