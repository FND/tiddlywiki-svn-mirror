/***
|Name:|MopiConfigPlugin|
|Description:|Miscellaneous tweaks used by Mopi|
|Version:|1.0 ($Rev: 3646 $)|
|Date:|$Date: 2008-02-27 02:34:38 +1000 (Wed, 27 Feb 2008) $|
|Source:|http://mopi.tiddlyspot.com/#MopiConfigPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License:|http://mopi.tiddlyspot.com/#MopiConfigPlugin|
!Note: instead of editing this consider putting overrides in MopiUserConfigPlugin
***/
//{{{
var originalReadOnly = readOnly;
readOnly = false;
config.options.chkHttpReadOnly = false; // means web visitors can experiment with your site by clicking edit
config.options.chkInsertTabs = true;    // tab inserts a tab when editing a tiddler
config.views.wikified.defaultText = ""; // don't need message when a tiddler doesn't exist
config.views.editor.defaultText = "";   // don't need message when creating a new tiddler 

if (config.options.txtTheme == '')
	config.options.txtTheme = 'MopiTheme';  // change this to set default theme

config.shadowTiddlers.GettingStarted += "\n\nSee also [[Mopi]].";
config.shadowTiddlers.OptionsPanel = config.shadowTiddlers.OptionsPanel.replace(/(\n\-\-\-\-\nAlso see AdvancedOptions)/, "{{select{<<selectTheme>>\n<<selectPalette>>}}}$1");

// used in ViewTemplate
config.mopiDateFormat = 'DD/MM/YY';
config.mopiJournalFormat = 'Journal DD/MM/YY';
//config.mopiDateFormat = 'MM/0DD/YY';
//config.mopiJournalFormat = 'Journal MM/0DD/YY';

//}}}
